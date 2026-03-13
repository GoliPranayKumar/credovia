"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function HeroSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalFrames = 170;
  const frames = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    let loadedCount = 0;
    const initialBatch = 20; 
    let hasStarted = false;
    
    // Preload images
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedNumber = i.toString().padStart(3, '0');
      img.src = `/hero-frames/ezgif-frame-${paddedNumber}.png`;
      
      img.onload = () => {
        loadedCount++;
        setProgress(Math.round((loadedCount / totalFrames) * 100));
        
        if (loadedCount >= initialBatch && !hasStarted) {
          hasStarted = true;
          setLoaded(true);
        }
      };
      
      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= initialBatch && !hasStarted) {
          hasStarted = true;
          setLoaded(true);
        }
      };
      
      frames.current[i - 1] = img;
    }
  }, []);

  useEffect(() => {
    if (!loaded || !canvasRef.current || frames.current.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas resolution strictly to match frame resolution for perfect quality
    if (frames.current[0]) {
      canvas.width = frames.current[0].width || 1280;
      canvas.height = frames.current[0].height || 720;
    }

    let currentFrame = 0;
    let animationFrameId: number;
    let lastTime = 0;
    const interval = 1000 / 30; // 30 FPS for smooth playback
    let isFinished = false;

    const render = (time: number) => {
      if (isFinished) return;
      const deltaTime = time - lastTime;

      if (deltaTime > interval) {
        lastTime = time - (deltaTime % interval);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const img = frames.current[currentFrame];
        if (img && img.complete && img.naturalHeight !== 0) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            if (currentFrame >= totalFrames - 1) {
              isFinished = true;
              return;
            }
            
            currentFrame++;
        }
      }

      if (!isFinished) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);
    
    return () => {
      isFinished = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [loaded]);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl glass bg-white dark:bg-black/20 flex flex-col items-center justify-center">
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-black/80 z-10 p-6 space-y-6">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">Initializing Interface</div>
          <div className="w-full max-w-[160px] h-[1px] bg-blue-100 dark:bg-blue-900 relative">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover scale-[1.02] transition-opacity duration-700"
        style={{ opacity: loaded ? 1 : 0 }}
      />
      
      {/* Subtle glow/shadow overlay */}
      <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-black/5 dark:ring-white/5 pointer-events-none" />
    </div>
  );
}
