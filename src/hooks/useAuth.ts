import { useState, useEffect } from "react";
import { account, DATABASE_ID, USERS_COLLECTION_ID, databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const isDemo = localStorage.getItem("demo_mode") === "true";
    if (isDemo) {
      setUser({ $id: "demo_user", name: "Demo User", email: "demo@credovia.com" });
      setProfile({
        $id: "demo_profile",
        userId: "demo_user",
        name: "Demo User",
        email: "demo@credovia.com",
        bio: "This is a demo account. You can explore the dashboard and search features.",
        github: "https://github.com/demo",
        linkedin: "https://linkedin.com/in/demo",
        portfolio: "https://demo.com",
        walletAddress: "0x1234...5678",
        score: 85,
        $createdAt: new Date().toISOString()
      });
      setLoading(false);
    } else {
      checkAuth();
    }
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
        setProfile(response.documents[0]);
      }
    } catch (error) {
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

  async function signup(email: string, pass: string, name: string) {
    await account.create(ID.unique(), email, pass, name);
    await login(email, pass);
    
    // Create initial profile in database
    const session = await account.get();
    const newProfile = await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      {
        userId: session.$id,
        name: name,
        email: email,
        bio: "",
        github: "",
        linkedin: "",
        portfolio: "",
        walletAddress: "",
        score: 0
      }
    );
    setProfile(newProfile);
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

  return { user, profile, loading, login, signup, logout, refresh: checkAuth };
}
