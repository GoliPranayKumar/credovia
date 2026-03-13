"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { QrCode, X, Copy, Check, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileQRCodeProps {
  profileId: string;
  name: string;
}

export function ProfileQRCode({ profileId, name }: ProfileQRCodeProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/profile/${profileId}`
      : `https://credovia.io/profile/${profileId}`;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 300, 300);
        ctx.drawImage(img, 0, 0, 300, 300);
      }
      const link = document.createElement("a");
      link.download = `Credovia_QR_${name.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-xs rounded-2xl shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all border border-emerald-500/20 uppercase tracking-widest"
      >
        <QrCode className="w-4 h-4" />
        Share QR
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-card rounded-[2rem] border border-border shadow-2xl p-8 w-full max-w-sm space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-foreground">Share Profile</h3>
                  <p className="text-xs text-muted-foreground">Scan to view {name}&apos;s Credovia profile</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* QR Code */}
              <div
                ref={qrRef}
                className="flex items-center justify-center p-6 bg-white rounded-2xl border border-border shadow-inner"
              >
                <QRCode
                  value={profileUrl}
                  size={200}
                  fgColor="#1e1b4b"
                  bgColor="#ffffff"
                  level="M"
                />
              </div>

              {/* URL */}
              <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl border border-border">
                <p className="flex-1 text-[10px] font-mono text-muted-foreground truncate">{profileUrl}</p>
                <button
                  onClick={copyUrl}
                  className="shrink-0 p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 transition-colors text-violet-600"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={downloadQR}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-black text-xs rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
