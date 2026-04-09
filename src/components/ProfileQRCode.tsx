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
        className="flex items-center gap-2 px-5 py-3 bg-neutral-900 border border-white/20 text-white hover:bg-neutral-800 font-black text-xs rounded-2xl shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all uppercase tracking-widest"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] rounded-[2rem] border border-white/10 shadow-2xl p-8 w-full max-w-sm space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Share Profile</h3>
                  <p className="text-xs text-neutral-400">Scan to view {name}&apos;s Protocol identity</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-xl bg-neutral-800/50 flex items-center justify-center hover:bg-neutral-800 transition-colors border border-neutral-700/50"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* QR Code */}
              <div
                ref={qrRef}
                className="flex items-center justify-center p-6 bg-white rounded-2xl border border-neutral-200 shadow-inner"
              >
                <QRCode
                  value={profileUrl}
                  size={200}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  level="M"
                />
              </div>

              {/* URL */}
              <div className="flex items-center gap-2 p-3 bg-neutral-900/40 rounded-xl border border-white/10">
                <p className="flex-1 text-[10px] font-mono text-neutral-400 truncate">{profileUrl}</p>
                <button
                  onClick={copyUrl}
                  className="shrink-0 p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors text-white"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={downloadQR}
                className="w-full py-3 bg-white text-black hover:bg-neutral-200 font-black text-xs rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all"
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
