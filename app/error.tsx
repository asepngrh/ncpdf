"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-ink p-6">
      <div className="max-w-md w-full bg-surface border border-rule rounded-lg p-8 shadow-sm text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-normal text-ink">
            Terjadi Kesalahan
          </h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            Maaf, terjadi gangguan saat memproses tindakan Anda. Dokumen atau memori browser mungkin membutuhkan refresh.
          </p>
          {error?.message && (
            <div className="mt-2 p-2 bg-paper-muted border border-rule rounded text-[11px] font-mono text-ink-muted text-left overflow-auto max-h-24">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => reset()}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Coba Lagi
          </Button>
          <Button asChild className="flex-1 text-xs">
            <Link href="/">
              <Home className="w-3.5 h-3.5 mr-1.5" /> Ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
