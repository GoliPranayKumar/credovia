"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { account, DATABASE_ID, USERS_COLLECTION_ID, databases } from "@/lib/appwrite";
import { ID, Query, OAuthProvider } from "appwrite";
import { withRetry } from "@/lib/app-utils";

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithLinkedin: () => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<string>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  sendVerificationEmail: () => Promise<any>;
  verifyEmail: (userId: string, secret: string) => Promise<void>;
  sendEmailToken: (email: string) => Promise<string>;
  loginWithToken: (userId: string, secret: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const checkAuth = useCallback(async (forceSync = false) => {
    try {
      // Use retry logic for main auth calls
      const session = await withRetry(() => account.get());
      setUser(session);
      
      const response = await withRetry(() => 
        databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal("userId", session.$id)]
        )
      );
      
      if (response.documents.length > 0) {
        let currentProfile = response.documents[0];
        
        // Optimize: Only sync identities if specifically requested or if it's been a while
        // This prevents massive API hit on every page load/refresh
        const syncParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('sync') === 'true';
        const lastSync = localStorage.getItem(`last-sync-${session.$id}`);
        const shouldSync = forceSync || syncParam || !lastSync || Date.now() - parseInt(lastSync) > 1000 * 60 * 60; // once an hour

        if (shouldSync) {
          console.log("DEBUG: Initiating identity synchronization...");
          try {
            const identities = await account.listIdentities();
            console.log("DEBUG: Identities found:", identities.identities.length);
            
            const githubId = identities.identities.find(i => i.provider === "github");
            if (githubId) {
              console.log("DEBUG: Found GitHub identity, fetching stats...");
              const ghRes = await withRetry(() => fetch(`https://api.github.com/user/${githubId.providerUid}`));
              const ghData = await ghRes.json();
              
              if (ghData.login) {
                const verifiedUrl = `https://github.com/${ghData.login}`;
                
                let totalStars = 0;
                let totalCommits = 0;
                let totalPRs = 0;
                try {
                  const [repos, commuteData, prData] = await Promise.all([
                    withRetry(() => fetch(`https://api.github.com/users/${ghData.login}/repos?per_page=100`).then(r => r.json())),
                    withRetry(() => fetch(`https://api.github.com/search/commits?q=author:${ghData.login}`).then(r => r.json())),
                    withRetry(() => fetch(`https://api.github.com/search/issues?q=author:${ghData.login}+type:pr`).then(r => r.json()))
                  ]);
                  
                  if (Array.isArray(repos)) {
                    totalStars = repos.reduce((acc: number, repo: any) => acc + (repo.stargazers_count || 0), 0);
                  }
                  totalCommits = commuteData.total_count || 0;
                  totalPRs = prData.total_count || 0;
                } catch (ghApiErr) {
                  console.warn("DEBUG: GitHub secondary stats fetch failed:", ghApiErr);
                }

                // Prepare update data
                const updateData: any = {
                  github: verifiedUrl,
                  githubRepoCount: ghData.public_repos || 0,
                  githubFollowerCount: ghData.followers || 0,
                  githubFollowingCount: ghData.following || 0,
                  githubGistCount: ghData.public_gists || 0,
                  githubContributionCount: totalCommits,
                  githubPRCount: totalPRs,
                  githubStarCount: totalStars,
                  githubCreatedAt: ghData.created_at
                };

                // CRITICAL: Recalculate score with new data!
                const { calculateCredibilityScore } = await import("@/lib/score");
                const { total: newScore } = calculateCredibilityScore({ ...currentProfile, ...updateData });
                updateData.score = newScore;

                if (
                  currentProfile.github !== verifiedUrl || 
                  currentProfile.githubRepoCount !== updateData.githubRepoCount ||
                  currentProfile.score !== newScore
                ) {
                  console.log("DEBUG: Updating profile with new GitHub stats and score:", newScore);
                  currentProfile = await withRetry(() => 
                    databases.updateDocument(
                      DATABASE_ID,
                      USERS_COLLECTION_ID,
                      currentProfile.$id,
                      updateData
                    )
                  );
                }
              }
            }

            const linkedinId = identities.identities.find(i => i.provider === "linkedin");
            if (linkedinId && !currentProfile.linkedin) {
              console.log("DEBUG: Found LinkedIn identity, marking as verified.");
              const updateData: any = { linkedin: `https://linkedin.com/appwrite-verified-user` };
              
              const { calculateCredibilityScore } = await import("@/lib/score");
              const { total: newScore } = calculateCredibilityScore({ ...currentProfile, ...updateData });
              updateData.score = newScore;

              currentProfile = await withRetry(() => 
                databases.updateDocument(
                  DATABASE_ID,
                  USERS_COLLECTION_ID,
                  currentProfile.$id,
                  updateData
                )
              );
            }
            
            localStorage.setItem(`last-sync-${session.$id}`, Date.now().toString());
            console.log("DEBUG: Sync completed successfully.");
          } catch (e) {
            console.error("DEBUG: Sync failed:", e);
          }
        }

        setProfile(currentProfile);
      } else {
        // Create profile if missing
        const newProfile = await withRetry(() => 
          databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            ID.unique(),
            {
              userId: session.$id,
              name: session.name || "User",
              email: session.email || "",
              bio: "Joined via SSO",
              github: "",
              linkedin: "",
              portfolio: "",
              walletAddress: "",
              score: 0
            }
          )
        );
        setProfile(newProfile);
      }
    } catch (error: any) {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      checkAuth();
      initialized.current = true;
    }
  }, [checkAuth]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await account.createEmailPasswordSession(email, pass);
      await checkAuth(true); // Force sync on login
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithub = async () => {
    account.createOAuth2Session(
      OAuthProvider.Github,
      `${window.location.origin}/dashboard?sync=true`,
      `${window.location.origin}/login`
    );
  };

  const loginWithLinkedin = async () => {
    account.createOAuth2Session(
      OAuthProvider.Linkedin,
      `${window.location.origin}/dashboard?sync=true`,
      `${window.location.origin}/login`
    );
  };

  const signup = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      // 1. Create the account
      const newUser = await account.create(ID.unique(), email, pass, name);
      const userId = newUser.$id;
      
      // 2. Create the profile document (can be done before login if permissions allow, 
      // or we can wait until after OTP. Let's do it now so the record exists)
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          name: name || "Anonymous User",
          email: email,
          bio: "Protocol initialization...",
          github: "",
          linkedin: "",
          portfolio: "",
          walletAddress: "",
          score: 0
        }
      );

      // 3. Trigger the email OTP/Token
      await account.createEmailToken(userId, email);
      
      return userId;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const sendVerificationEmail = async () => {
    return await account.createVerification(`${window.location.origin}/verify-email`);
  };

  const verifyEmail = async (userId: string, secret: string) => {
    await account.updateVerification(userId, secret);
    await checkAuth(true);
  };
  
  const sendEmailToken = async (email: string) => {
    // Deterministic ID for guest verification (sanitized email)
    const sanitizedEmail = email.toLowerCase().replace(/[^a-z0-9]/g, "");
    const deterministicId = "v" + sanitizedEmail.substring(0, 30);
    
    try {
      try {
        // Try creating guest user first (to ensure ID exists if it doesn't)
        await account.create(deterministicId, email, ID.unique());
      } catch (e) { /* Ignore if exists */ }

      const token = await account.createEmailToken(deterministicId, email);
      return token.userId;
    } catch (err: any) {
      // If 409, it exists, just send the token
      if (err.code === 409) {
        const token = await account.createEmailToken(deterministicId, email);
        return token.userId;
      }
      throw err;
    }
  };

  const loginWithToken = async (userId: string, secret: string) => {
    setLoading(true);
    try {
      // Important: Appwrite client-side only supports one active session easily.
      // We attempt to create the session. If it says 'session already active', we delete 'current' and retry.
      try {
        const session = await account.createSession(userId, secret);
        setUser(session);
        await checkAuth(true); // Sync profile
      } catch (err: any) {
        if (err.code === 401 || err.message?.includes("active")) {
           await account.deleteSession("current");
           const session = await account.createSession(userId, secret);
           setUser(session);
           await checkAuth(true);
        } else {
          throw err;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, 
      login, loginWithGithub, loginWithLinkedin, 
      signup, logout, refresh: () => checkAuth(true),
      sendVerificationEmail, verifyEmail,
      sendEmailToken, loginWithToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
