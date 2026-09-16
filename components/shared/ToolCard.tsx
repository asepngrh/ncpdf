"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Minimize2,
  Maximize2,
  Layers,
  Scissors,
  RotateCw,
  Trash2,
  FileSpreadsheet,
  Presentation as FilePresentation,
  Image as ImageIcon,
  Stamp,
  Hash,
  Crop,
  PenTool,
  Highlighter,
  ArrowRightLeft,
  Sparkles,
  ShieldCheck,
  Edit3,
} from "lucide-react";
import { ToolItem } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  Minimize2,
  Maximize2,
  Layers,
  Scissors,
  RotateCw,
  Trash2,
  FileSpreadsheet,
  FilePresentation,
  ImageIcon,
  Stamp,
  Hash,
  Crop,
  PenTool,
  Highlighter,
  ArrowRightLeft,
  FileText,
  Edit3,
};

interface ToolCardProps {
  tool: ToolItem;
}

export function ToolCard({ tool }: ToolCardProps) {
  const IconComponent = iconMap[tool.icon] || FileText;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.isClientSide ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                <ShieldCheck className="w-3 h-3" />
                Browser Only
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                <Sparkles className="w-3 h-3" />
                Office Engine
              </span>
            )}
            {tool.popular && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                Popular
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {tool.name}
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
          {tool.description}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
        Open Tool &rarr;
      </div>
    </Link>
  );
}
