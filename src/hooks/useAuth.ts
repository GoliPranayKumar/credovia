"use client";

import { useAuthContext } from "@/context/AuthContext";

/**
 * useAuth hook (Proxy to AuthContext)
 * This ensures all components share the same Auth state and initialization logic,
 * preventing redundant checkAuth() calls and Appwrite rate limits.
 */
export function useAuth() {
  return useAuthContext();
}
