"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2, Github, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"info" | "verify">("info");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const { signup, loginWithGithub, user, loading: authLoading, loginWithToken, sendEmailToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && step === "info") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router, step]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const id = await signup(email, password, name);
      setUserId(id);
      setStep("verify");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!userId) throw new Error("Session expired. Please sign up again.");
      await loginWithToken(userId, otp);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid or expired code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    try {
      await sendEmailToken(email);
      alert("A new code has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white border border-border/60 shadow-xl shadow-violet-100/20 space-y-8"
      >
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Credovia Logo" 
              className="h-24 w-auto object-contain brightness-110"
            />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            {step === "info" ? "Create Account" : "Verify Email"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === "info" ? "Start building your digital reputation" : `We've sent a 6-digit code to ${email}`}
          </p>
        </div>

        {step === "info" ? (
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text" 
                  required
                  className="w-full bg-white border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="email" 
                  required
                  className="w-full bg-white border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  className="w-full bg-white border border-border rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-violet-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-500/15 transition-all active:scale-95 flex items-center justify-center gap-2 border border-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Get Started <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1 text-center block">Verification Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  className="w-full bg-white border border-border rounded-2xl py-5 pl-12 pr-4 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition-all text-center text-2xl font-black tracking-[0.5em]"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-center text-muted-foreground">Please check your inbox (and spam) for the protocol access code.</p>
            </div>

            <div className="space-y-3">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-violet-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-500/15 transition-all active:scale-95 flex items-center justify-center gap-2 border border-primary/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Complete <ArrowRight className="w-5 h-5" /></>}
              </button>
              <button 
                type="button"
                onClick={() => setStep("info")}
                className="w-full py-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Wrong email? Go back
              </button>
              <button 
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="w-full py-1 text-[10px] text-primary hover:underline font-bold uppercase tracking-widest disabled:opacity-50"
              >
                Resend Verification Code
              </button>
            </div>
          </form>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={loginWithGithub}
          className="w-full bg-[#24292e] hover:bg-[#2f363d] text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Github className="w-6 h-6" /> GitHub
        </button>

        <p className="text-center text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </p>
      </motion.div>

    </div>
  );
}
