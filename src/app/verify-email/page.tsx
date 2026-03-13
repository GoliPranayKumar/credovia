"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();
  
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    if (userId && secret) {
      handleVerify(userId, secret);
    } else {
      setStatus("error");
      setErrorMessage("Invalid verification link.");
    }
  }, [searchParams]);

  const handleVerify = async (userId: string, secret: string) => {
    try {
      await verifyEmail(userId, secret);
      setStatus("success");
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Email verification failed.");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white border border-border/60 shadow-xl shadow-violet-100/20 text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-violet-50 rounded-2xl flex items-center justify-center">
            {status === "verifying" && <Loader2 className="w-10 h-10 text-primary animate-spin" />}
            {status === "success" && <CheckCircle2 className="w-10 h-10 text-emerald-500" />}
            {status === "error" && <XCircle className="w-10 h-10 text-red-500" />}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black">
            {status === "verifying" && "Verifying Email"}
            {status === "success" && "Verification Successful!"}
            {status === "error" && "Verification Failed"}
          </h1>
          <p className="text-muted-foreground">
            {status === "verifying" && "Please wait while we confirm your email address..."}
            {status === "success" && "Your email has been successfully verified. Redirecting you to the dashboard..."}
            {status === "error" && errorMessage}
          </p>
        </div>

        {status === "error" && (
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-violet-600 transition-all"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        
        {status === "success" && (
          <div className="pt-4">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
                className="bg-emerald-500 h-full"
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-border/60 shadow-xl shadow-violet-100/20 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-violet-50 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black">Initializing Verification</h1>
            <p className="text-muted-foreground">Preparing secure connection...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
