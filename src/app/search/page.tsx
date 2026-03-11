"use client";

import { useState, useEffect } from "react";
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { ScoreBadge } from "@/components/ScoreVisuals";
import { Search as SearchIcon, Loader2, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial fetch of top users
    fetchUsers();
  }, []);

  const fetchUsers = async (searchQuery?: string) => {
    setLoading(true);
    try {
      const queries = searchQuery 
        ? [Query.contains("name", searchQuery)]
        : [Query.orderDesc("score"), Query.limit(10)];
        
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        queries
      );
      setUsers(response.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(query);
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto min-h-[70vh]">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black">Find Trusted People</h1>
        <p className="text-xl text-muted-foreground">Search the directory by name to view credibility scores.</p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-x-0 -bottom-2 h-4 bg-violet-400/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <div className="relative flex gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input 
              type="text" 
              className="w-full bg-white border border-border rounded-[2rem] py-6 pl-16 pr-6 focus:ring-4 focus:ring-violet-200 focus:border-violet-300 outline-none transition-all text-xl font-medium shadow-sm"
              placeholder="Search for a name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="px-8 py-6 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold rounded-[2rem] shadow-xl shadow-violet-500/15 hover:scale-[1.02] active:scale-95 transition-all text-xl"
          >
            Search
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-sm px-4">
          {query ? `Results for "${query}"` : "Top Credible Users"}
        </h3>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
          </div>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {users.map((u, i) => (
              <motion.div 
                key={u.$id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link 
                  href={`/profile/${u.$id}`}
                  className="group flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl bg-white border border-border/60 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/30 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl font-black text-white group-hover:scale-110 transition-transform shadow-md">
                      {u.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold group-hover:text-violet-600 transition-colors">{u.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">{u.bio || "No bio provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <ScoreBadge score={u.score} />
                    <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-violet-600 group-hover:translate-x-2 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center p-20 bg-white rounded-[3rem] border-dashed border-2 border-violet-200">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-xl text-muted-foreground">No users found match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
