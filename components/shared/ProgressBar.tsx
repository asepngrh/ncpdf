"use client";

import React, { useEffect, useState, useRef } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ProgressBarProps {
  progress?: number; // 0 to 100
  label?: string;
  sublabel?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  label = "Sedang Memproses Dokumen...",
  sublabel = "Mohon tunggu sejenak, sistem sedang menyelesaikan file Anda...",
  className = "",
}: ProgressBarProps) {
  const [displayPercent, setDisplayPercent] = useState<number>(() => {
    if (typeof progress === "number" && progress > 0) return Math.min(100, Math.max(1, Math.round(progress)));
    return 1;
  });

  const targetProgress = typeof progress === "number" ? progress : null;
  const isComplete = displayPercent >= 100;

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (targetProgress === null) {
      // Indeterminate mode: smoothly simulate progress 1% -> 92%
      timer = setInterval(() => {
        setDisplayPercent((prev) => {
          if (prev < 30) return prev + Math.floor(Math.random() * 3 + 2); // 1% -> 30% fast
          if (prev < 70) return prev + Math.floor(Math.random() * 2 + 1); // 30% -> 70% steady
          if (prev < 92) return prev + 1; // 70% -> 92% slow crawl
          return prev;
        });
      }, 120);
    } else if (targetProgress >= 100) {
      // Complete state: quickly rush to 100%
      timer = setInterval(() => {
        setDisplayPercent((prev) => {
          if (prev < 100) {
            const next = prev + Math.max(2, Math.ceil((100 - prev) / 2));
            return Math.min(100, next);
          }
          if (timer) clearInterval(timer);
          return 100;
        });
      }, 40);
    } else {
      // Determinate mode: smoothly advance towards target or tick upward
      timer = setInterval(() => {
        setDisplayPercent((prev) => {
          const effectiveTarget = Math.max(targetProgress, prev);
          if (prev < effectiveTarget) {
            return prev + Math.max(1, Math.ceil((effectiveTarget - prev) / 4));
          } else if (prev < 94 && targetProgress < 100) {
            // Natural micro-ticks so it doesn't stay frozen
            return prev + (Math.random() > 0.6 ? 1 : 0);
          }
          return prev;
        });
      }, 100);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [targetProgress]);

  return (
    <div
      className={`w-full max-w-md mx-auto p-5 rounded-lg bg-surface border border-rule shadow-subtle text-center transition-all ${className}`}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        {isComplete ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <Loader2 className="w-4 h-4 text-[#24406B] animate-spin shrink-0" />
        )}
        <p className="text-sm font-semibold text-ink">
          {isComplete ? "Selesai! File Siap Diunduh" : label}
        </p>
      </div>

      {sublabel && (
        <p className="text-xs text-ink-muted leading-relaxed">
          {isComplete ? "Proses konversi telah selesai dengan sukses." : sublabel}
        </p>
      )}

      {/* Modern Progress Track with Active Glowing Bar */}
      <div className="mt-4 w-full bg-rule/70 h-2 rounded-full overflow-hidden relative shadow-inner">
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full relative overflow-hidden ${
            isComplete
              ? "bg-emerald-600"
              : "bg-gradient-to-r from-[#24406B] via-[#3b67a8] to-[#24406B] shadow-sm"
          }`}
          style={{ width: `${displayPercent}%` }}
        >
          {/* Animated active shimmer light */}
          {!isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full" />
          )}
        </div>
      </div>

      {/* Percentage Counter Badge */}
      <div className="mt-3 flex items-center justify-between text-xs text-ink-muted font-mono px-1">
        <span className="text-[11px] font-sans font-medium text-ink-muted">
          {isComplete ? "Status: Sukses" : "Memproses..."}
        </span>
        <span
          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
            isComplete
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-paper text-[#24406B] border border-rule"
          }`}
        >
          {displayPercent}%
        </span>
      </div>
    </div>
  );
}
