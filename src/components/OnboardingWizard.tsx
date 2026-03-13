"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Github, Wallet, Globe, CheckCircle, ArrowRight, X, Zap } from "lucide-react";

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Welcome to Credovia",
    subtitle: "Your Trust Protocol",
    description:
      "Credovia builds a verifiable digital identity for you by aggregating on-chain activity, developer history, and social presence into a single Trust Score.",
    color: "from-violet-600 to-cyan-500",
    tip: "Your score ranges from 0–100 and updates as you link more accounts.",
  },
  {
    icon: Github,
    title: "Connect GitHub",
    subtitle: "Dev Activity Score",
    description:
      "Link your GitHub profile to earn up to 25 points. We evaluate your public repos, commit frequency, followers, and collaboration activity.",
    color: "from-violet-600 to-fuchsia-500",
    tip: "Active GitHub users with 50+ repos typically score 20+ points.",
  },
  {
    icon: Wallet,
    title: "Connect Web3 Wallet",
    subtitle: "On-Chain Score",
    description:
      "Add your Ethereum wallet address to earn up to 35 points — the largest category. We analyse token diversity, transaction history, and on-chain age.",
    color: "from-cyan-500 to-emerald-500",
    tip: "Wallets with 6+ months of history score significantly higher.",
  },
  {
    icon: Zap,
    title: "You're All Set!",
    subtitle: "Start Building Trust",
    description:
      "Edit your profile, link all verification sources, and earn achievement badges. Share your score card on social media or embed your QR code anywhere.",
    color: "from-emerald-500 to-cyan-400",
    tip: "Fully verified profiles appear higher in the public Leaderboard.",
  },
];

export function OnboardingWizard() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem("credovia-onboarded");
    if (!done) setShow(true);
  }, []);

  const close = () => {
    localStorage.setItem("credovia-onboarded", "true");
    setShow(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      close();
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -24 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="bg-white dark:bg-card rounded-[2.5rem] border border-border shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Top gradient band */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${current.color}`} />

            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden ${step === 0 ? "bg-white border border-border" : `bg-gradient-to-br ${current.color}`}`}>
                  {step === 0 ? (
                    <img src="/logo.png" alt="logo" className="w-10 h-10 object-contain" />
                  ) : (
                    <Icon className="w-7 h-7 text-white" />
                  )}
                </div>
                <button
                  onClick={close}
                  className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{current.subtitle}</p>
                <h2 className="text-2xl font-black text-foreground">{current.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
              </div>

              {/* Tip */}
              <div className="flex items-start gap-3 p-4 bg-violet-50 dark:bg-violet-500/10 rounded-2xl border border-violet-100 dark:border-violet-500/15">
                <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-violet-700 dark:text-violet-300 font-medium leading-relaxed">{current.tip}</p>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === step ? "w-6 bg-violet-600" : "w-1.5 bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {step < STEPS.length - 1 && (
                    <button
                      onClick={close}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium px-3 py-2"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    onClick={next}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-black bg-gradient-to-r ${current.color} hover:-translate-y-0.5 active:scale-95 transition-all shadow-sm`}
                  >
                    {step < STEPS.length - 1 ? (
                      <>Next <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <>Get Started <Zap className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
