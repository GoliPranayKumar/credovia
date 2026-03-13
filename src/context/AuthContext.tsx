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
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  sendVerificationEmail: () => Promise<any>;
  verifyEmail: (userId: string, secret: string) => Promise<void>;
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
        const lastSync = localStorage.getItem(`last-sync-${session.$id}`);
        const shouldSync = forceSync || !lastSync || Date.now() - parseInt(lastSync) > 1000 * 60 * 60; // once an hour

        if (shouldSync) {
          try {
            const identities = await account.listIdentities();
            const githubId = identities.identities.find(i => i.provider === "github");
            
            if (githubId) {
              const ghRes = await fetch(`https://api.github.com/user/${githubId.providerUid}`);
              const ghData = await ghRes.json();
              
              if (ghData.login) {
                const verifiedUrl = `https://github.com/${ghData.login}`;
                
                let totalStars = 0;
                let totalCommits = 0;
                try {
                  const [starsRes, commitRes] = await Promise.all([
                    fetch(`https://api.github.com/users/${ghData.login}/repos?per_page=100`),
                    fetch(`https://api.github.com/search/commits?q=author:${ghData.login}`)
                  ]);
                  
                  const repos = await starsRes.json();
                  if (Array.isArray(repos)) {
                    totalStars = repos.reduce((acc: number, repo: any) => acc + (repo.stargazers_count || 0), 0);
                  }

                  const commuteData = await commitRes.json();
                  totalCommits = commuteData.total_count || 0;
                } catch (e) {}

                if (
                  currentProfile.github !== verifiedUrl || 
                  currentProfile.githubRepoCount !== ghData.public_repos ||
                  currentProfile.githubStarCount !== totalStars ||
                  currentProfile.githubContributionCount !== totalCommits
                ) {
                  currentProfile = await withRetry(() => 
                    databases.updateDocument(
                      DATABASE_ID,
                      USERS_COLLECTION_ID,
                      currentProfile.$id,
                      {
                        github: verifiedUrl,
                        githubRepoCount: ghData.public_repos,
                        githubFollowerCount: ghData.followers,
                        githubFollowingCount: ghData.following,
                        githubGistCount: ghData.public_gists,
                        githubContributionCount: totalCommits,
                        githubStarCount: totalStars,
                        githubCreatedAt: ghData.created_at
                      }
                    )
                  );
                }
              }
            }

            const linkedinId = identities.identities.find(i => i.provider === "linkedin");
            if (linkedinId && !currentProfile.linkedin) {
              currentProfile = await withRetry(() => 
                databases.updateDocument(
                  DATABASE_ID,
                  USERS_COLLECTION_ID,
                  currentProfile.$id,
                  { linkedin: `https://linkedin.com/appwrite-verified-user` }
                )
              );
            }
            
            localStorage.setItem(`last-sync-${session.$id}`, Date.now().toString());
          } catch (e) {
            console.warn("Identity sync failed, skipping auto-sync", e);
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
      `${window.location.origin}/dashboard`,
      `${window.location.origin}/login`
    );
  };

  const loginWithLinkedin = async () => {
    account.createOAuth2Session(
      OAuthProvider.Linkedin,
      `${window.location.origin}/dashboard`,
      `${window.location.origin}/login`
    );
  };

  const signup = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      await account.create(ID.unique(), email, pass, name);
      await account.createEmailPasswordSession(email, pass);
      const session = await account.get();
      setUser(session);
      
      const newProfile = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          userId: session.$id,
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
      setProfile(newProfile);
      await account.createVerification(`${window.location.origin}/verify-email`);
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

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, 
      login, loginWithGithub, loginWithLinkedin, 
      signup, logout, refresh: () => checkAuth(true),
      sendVerificationEmail, verifyEmail 
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
