"use client";

import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ACCENT_COLORS = [
  { id: "violet", label: "Violet", from: "#8b5cf6", to: "#7c3aed", tw: "from-violet-500 to-violet-700" },
  { id: "cyan", label: "Cyan", from: "#06b6d4", to: "#0891b2", tw: "from-cyan-400 to-cyan-600" },
  { id: "emerald", label: "Emerald", from: "#10b981", to: "#059669", tw: "from-emerald-400 to-emerald-600" },
  { id: "rose", label: "Rose", from: "#f43f5e", to: "#e11d48", tw: "from-rose-400 to-rose-600" },
  { id: "amber", label: "Amber", from: "#f59e0b", to: "#d97706", tw: "from-amber-400 to-amber-600" },
  { id: "blue", label: "Blue", from: "#3b82f6", to: "#2563eb", tw: "from-blue-400 to-blue-600" },
  { id: "fuchsia", label: "Fuchsia", from: "#d946ef", to: "#c026d3", tw: "from-fuchsia-400 to-fuchsia-600" },
  { id: "orange", label: "Orange", from: "#f97316", to: "#ea580c", tw: "from-orange-400 to-orange-600" },
];

interface ProfileCustomizerProps {
  currentAccent?: string;
  onSave: (accent: string) => void;
  saving?: boolean;
}

export function ProfileCustomizer({ currentAccent = "violet", onSave, saving }: ProfileCustomizerProps) {
  const [selected, setSelected] = useState(currentAccent);
  const [open, setOpen] = useState(false);

  const selectedColor = ACCENT_COLORS.find((c) => c.id === selected) || ACCENT_COLORS[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-widest text-violet-700 dark:text-violet-300 ml-1">
          Profile Accent Color
        </label>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-violet-600 transition-colors"
        >
          <Palette className="w-3 h-3" />
          Customize
        </button>
      </div>

      {/* Current colour preview */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-all"
      >
        <div
          className="w-8 h-8 rounded-lg shadow-sm"
          style={{ background: `linear-gradient(135deg, ${selectedColor.from}, ${selectedColor.to})` }}
        />
        <span className="text-sm font-bold text-foreground">{selectedColor.label}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-2 pt-2">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelected(c.id);
                    setOpen(false);
                    onSave(c.id);
                  }}
                  title={c.label}
                  className="relative group flex flex-col items-center gap-1.5 p-2 rounded-xl border border-border hover:border-border/80 hover:scale-105 transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-xl shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                  />
                  <span className="text-[8px] font-bold text-muted-foreground">{c.label}</span>
                  {selected === c.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
                      <Check className="w-2.5 h-2.5 text-gray-800" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to get gradient style for a given accent
export function getAccentGradient(accent?: string): string {
  const c = ACCENT_COLORS.find((a) => a.id === accent) || ACCENT_COLORS[0];
  return `linear-gradient(135deg, ${c.from}, ${c.to})`;
}

export { ACCENT_COLORS };
