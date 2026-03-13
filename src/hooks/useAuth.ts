import { useState, useEffect } from "react";
import { account, DATABASE_ID, USERS_COLLECTION_ID, databases } from "@/lib/appwrite";
import { ID, Query, OAuthProvider } from "appwrite";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const session = await account.get();
      setUser(session);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal("userId", session.$id)]
      );
      
      if (response.documents.length > 0) {
        let currentProfile = response.documents[0];
        
        // Check for newly linked identities to sync the profile data accurately
        try {
          const identities = await account.listIdentities();
          const githubId = identities.identities.find(i => i.provider === "github");
          
          if (githubId) {
             // ... GitHub sync logic remains same ...
             // Fetch actual handle and detailed stats from GitHub API
             const ghRes = await fetch(`https://api.github.com/user/${githubId.providerUid}`);
             const ghData = await ghRes.json();
             
             if (ghData.login) {
                const verifiedUrl = `https://github.com/${ghData.login}`;
                
                // Fetch repo stats for stars (GitHub API user object doesn't have total stars)
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

                // Merge with existing profile data if anything changed
                if (
                  currentProfile.github !== verifiedUrl || 
                  currentProfile.githubRepoCount !== ghData.public_repos ||
                  currentProfile.githubStarCount !== totalStars ||
                  currentProfile.githubContributionCount !== totalCommits
                ) {
                  const updateData = {
                    github: verifiedUrl,
                    githubRepoCount: ghData.public_repos,
                    githubFollowerCount: ghData.followers,
                    githubFollowingCount: ghData.following,
                    githubGistCount: ghData.public_gists,
                    githubContributionCount: totalCommits,
                    githubStarCount: totalStars,
                    githubCreatedAt: ghData.created_at
                  };

                  currentProfile = await databases.updateDocument(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    currentProfile.$id,
                    updateData
                  );
                }
             }
          }

          const linkedinId = identities.identities.find(i => i.provider === "linkedin");
          if (linkedinId && !currentProfile.linkedin) {
             // Basic sync: Mark as verified via SSO
             currentProfile = await databases.updateDocument(
               DATABASE_ID,
               USERS_COLLECTION_ID,
               currentProfile.$id,
               { linkedin: `https://linkedin.com/appwrite-verified-user` }
             );
          }
        } catch (e) {
          // Failure in identity sync is non-blocking
        }

        setProfile(currentProfile);
      } else {
        // ... rest of logic ...
        // We'll also apply the same logic for new users below
        const newProfile = await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          ID.unique(),
          {
            userId: session.$id,
            name: session.name || "User",
            email: session.email || "",
            bio: "Joined via SSO",
            github: "", // Will be filled by the identity sync next tick or updated here
            linkedin: "",
            portfolio: "",
            walletAddress: "",
            score: 0
          }
        );
        setProfile(newProfile);
      }
    } catch (error: any) {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, pass: string) {
    if (email === "demo@credovia.com") {
      localStorage.setItem("demo_mode", "true");
      setUser({ $id: "demo_user", name: "Demo User", email: "demo@credovia.com" });
      setProfile({
        $id: "demo_profile",
        userId: "demo_user",
        name: "Demo User",
        bio: "This is a demo account. You can explore the dashboard and search features.",
        github: "https://github.com/demo",
        linkedin: "https://linkedin.com/in/demo",
        portfolio: "https://demo.com",
        walletAddress: "0x1234...5678",
        score: 85,
        $createdAt: new Date().toISOString()
      });
      router.push("/dashboard");
      return;
    }

    try {
      await account.createEmailPasswordSession(email, pass);
      await checkAuth();
      router.push("/dashboard");
    } catch (err: any) {
      throw err;
    }
  }

  async function loginWithGithub() {
    try {
      account.createOAuth2Session(
        OAuthProvider.Github,
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/login`
      );
    } catch (err) {
      console.error("GitHub OAuth failed", err);
    }
  }

  async function loginWithLinkedin() {
    try {
      account.createOAuth2Session(
        OAuthProvider.Linkedin,
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/login`
      );
    } catch (err) {
      console.error("LinkedIn OAuth failed", err);
    }
  }

  async function signup(email: string, pass: string, name: string) {
    try {
      // 1. Create the account
      await account.create(ID.unique(), email, pass, name);
      
      // 2. Create the session (sign in)
      await account.createEmailPasswordSession(email, pass);
      
      // 3. Get the fresh user session for the ID
      const session = await account.get();
      setUser(session);
      
      // 4. Create initial profile in database with absolute minimum valid fields
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
      
      // 5. Send verification email automatically
      try {
        await account.createVerification(`${window.location.origin}/verify-email`);
      } catch (e) {
        console.error("Auto-verification email failed", e);
      }

      // 6. Navigate to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      throw err;
    }
  }

  async function sendVerificationEmail() {
    console.log("DEBUG: sendVerificationEmail initiated");
    try {
      const url = `${window.location.origin}/verify-email`;
      console.log("DEBUG: Verification URL:", url);
      const response = await account.createVerification(url);
      console.log("DEBUG: Appwrite response:", response);
      return response;
    } catch (err: any) {
      console.error("DEBUG: Appwrite error details:", err);
      throw err;
    }
  }

  async function verifyEmail(userId: string, secret: string) {
    try {
      await account.updateVerification(userId, secret);
      await checkAuth(); // Refresh user state
    } catch (err: any) {
      throw err;
    }
  }

  async function logout() {
    localStorage.removeItem("demo_mode");
    try {
      await account.deleteSession("current");
    } catch (e) {}
    setUser(null);
    setProfile(null);
    router.push("/");
  }

  return { user, profile, loading, login, loginWithGithub, loginWithLinkedin, signup, logout, refresh: checkAuth, sendVerificationEmail, verifyEmail };
}
