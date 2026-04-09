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

  // Synchronize identities with external platforms
  const performSync = useCallback(async (session: any, currentProfile: any) => {
    try {
      let identities;
      try {
        identities = await account.listIdentities();
      } catch (idErr) {
        return currentProfile;
      }
      
      const githubId = identities.identities.find(i => i.provider === "github");
      const linkedinId = identities.identities.find(i => i.provider === "linkedin");
      
      let updateData: any = {};
      let needsUpdate = false;

      if (githubId) {
        if (!currentProfile.github) {
          updateData.github = `https://github.com/appwrite-verified-user-${githubId.providerUid}`;
          needsUpdate = true;
        }

        try {
          const ghRes = await withRetry(() => fetch(`https://api.github.com/user/${githubId.providerUid}`));
          if (ghRes.ok) {
            const ghData = await ghRes.json();
            if (ghData.login) {
              const verifiedUrl = `https://github.com/${ghData.login}`;
              
              let totalStars = 0;
              let totalCommits = 0;
              let totalPRs = 0;
              
              try {
                const [repos, commuteData, prData] = await Promise.all([
                  fetch(`https://api.github.com/users/${ghData.login}/repos?per_page=100`).then(r => r.json()),
                  fetch(`https://api.github.com/search/commits?q=author:${ghData.login}`).then(r => r.json()),
                  fetch(`https://api.github.com/search/issues?q=author:${ghData.login}+type:pr`).then(r => r.json())
                ]);
                
                if (Array.isArray(repos)) {
                  totalStars = repos.reduce((acc: number, repo: any) => acc + (repo.stargazers_count || 0), 0);
                }
                totalCommits = commuteData.total_count || 0;
                totalPRs = prData.total_count || 0;
              } catch (err) {
                // Silently skip detailed stats if rate-limited
              }

              Object.assign(updateData, {
                github: verifiedUrl,
                githubRepoCount: ghData.public_repos || 0,
                githubFollowerCount: ghData.followers || 0,
                githubFollowingCount: ghData.following || 0,
                githubGistCount: ghData.public_gists || 0,
                githubContributionCount: totalCommits,
                githubPRCount: totalPRs,
                githubStarCount: totalStars,
                githubCreatedAt: ghData.created_at
              });
              needsUpdate = true;
            }
          }
        } catch (e) {
          console.error("GitHub sync error:", e);
        }
      }

      if (linkedinId && !currentProfile.linkedin) {
        updateData.linkedin = `https://linkedin.com/appwrite-verified-user`;
        needsUpdate = true;
      }

      if (needsUpdate) {
        const { calculateCredibilityScore } = await import("@/lib/score");
        const { total: newScore } = calculateCredibilityScore({ ...currentProfile, ...updateData });
        updateData.score = newScore;

        return await withRetry(() => 
          databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            currentProfile.$id,
            updateData
          )
        );
      }
      return currentProfile;
    } catch (e) {
      console.error("performSync error:", e);
      return currentProfile;
    }
  }, []);

  const checkAuth = useCallback(async (forceSync = false) => {
    try {
      const isOauthReturn = typeof window !== 'undefined' && 
        (window.location.search.includes('sync=') || window.location.search.includes('oauth'));
      
      if (isOauthReturn && !forceSync) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      let session;
      try {
        session = await account.get();
      } catch (err: any) {
        if (isOauthReturn && (err.code === 401 || err.code === 403)) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          session = await account.get();
        } else {
          throw err;
        }
      }
      
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
        const syncParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('sync') === 'true';
        const lastSync = localStorage.getItem(`last-sync-${session.$id}`);
        const shouldSync = forceSync || syncParam || !lastSync || Date.now() - parseInt(lastSync) > 300000;

        if (shouldSync) {
          currentProfile = await performSync(session, currentProfile);
          localStorage.setItem(`last-sync-${session.$id}`, Date.now().toString());
        }
        setProfile(currentProfile);
      } else {
        const newProfile = await withRetry(() => 
          databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            ID.unique(),
            {
              userId: session.$id,
              name: session.name || "User",
              email: session.email || "",
              bio: "Inaugural login via SSO",
              github: "",
              linkedin: "",
              portfolio: "",
              walletAddress: "",
              score: 0
            }
          )
        );
        
        const syncedProfile = await performSync(session, newProfile);
        setProfile(syncedProfile);
      }
    } catch (error: any) {
      if (error.code !== 401 && error.code !== 403) {
        console.error("Auth check failed:", error);
      }
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [performSync]);

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
      await checkAuth(true);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithub = async () => {
    try {
      account.createOAuth2Session(
        OAuthProvider.Github,
        `${window.location.origin}/dashboard?sync=true`,
        `${window.location.origin}/login?error=github_failed`
      );
    } catch (err) {
      alert("Failed to start GitHub login.");
    }
  };

  const loginWithLinkedin = async () => {
    try {
      account.createOAuth2Session(
        OAuthProvider.Linkedin,
        `${window.location.origin}/dashboard?sync=true`,
        `${window.location.origin}/login`
      );
    } catch (err) {
      alert("Failed to start LinkedIn login.");
    }
  };

  const signup = async (email: string, pass: string, name: string) => {
    setLoading(true);
    const sanitizedEmail = email.toLowerCase().replace(/[^a-z0-9]/g, "");
    const userId = "u" + sanitizedEmail.substring(0, 30);
    
    try {
      try {
        await account.create(userId, email, pass, name);
      } catch (err: any) {
        if (err.code !== 409) throw err;
      }
      await account.createEmailToken(userId, email);
      return userId;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } catch (e) { 
      // Safe fail
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
    const sanitizedEmail = email.toLowerCase().replace(/[^a-z0-9]/g, "");
    const userId = "u" + sanitizedEmail.substring(0, 30);
    
    try {
      const token = await account.createEmailToken(userId, email);
      return token.userId;
    } catch (err: any) {
      if (err.code === 404) throw new Error("Account not found. Please sign up first.");
      throw err;
    }
  };

  const loginWithToken = async (userId: string, secret: string) => {
    setLoading(true);
    try {
      try {
        const session = await account.createSession(userId, secret);
        setUser(session);
        await checkAuth(true);
      } catch (err: any) {
        if (err.code === 401 || err.code === 403 || err.message?.includes("active")) {
           try {
             await account.deleteSession("current");
           } catch (e) {}
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
