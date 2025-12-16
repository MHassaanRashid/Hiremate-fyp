"use client";

import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (!password) return { score: 0, label: "" };
  if (score <= 1) return { score, label: "Weak" };
  if (score === 2) return { score, label: "Fair" };
  if (score === 3) return { score, label: "Good" };
  return { score, label: "Strong" };
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label } = getStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1 mt-1" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full bg-gray-200",
              i < score &&
                (score <= 1
                  ? "bg-red-500"
                  : score === 2
                  ? "bg-amber-500"
                  : score === 3
                  ? "bg-blue-500"
                  : "bg-emerald-500")
            )}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">Password strength: {label}</p>
    </div>
  );
}
