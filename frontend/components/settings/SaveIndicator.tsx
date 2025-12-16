"use client";

import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface SaveIndicatorProps {
  state: SaveState;
  message?: string;
}

export function SaveIndicator({ state, message }: SaveIndicatorProps) {
  if (state === "idle") return null;

  const base = "inline-flex items-center gap-1 text-xs";

  if (state === "saving") {
    return (
      <div className={`${base} text-blue-600`} aria-live="polite">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (state === "saved") {
    return (
      <div className={`${base} text-emerald-600`} aria-live="polite">
        <CheckCircle2 className="w-3 h-3" />
        <span>Saved</span>
      </div>
    );
  }

  return (
    <div className={`${base} text-red-600`} aria-live="polite">
      <AlertCircle className="w-3 h-3" />
      <span>{message || "Save failed"}</span>
    </div>
  );
}
