"use client";

import { Laptop2, Smartphone, Globe2, Clock } from "lucide-react";
import type { ProfileSessionItem } from "@/lib/api/settings";

interface SecuritySessionsListProps {
  sessions?: ProfileSessionItem[];
}

export function SecuritySessionsList({ sessions }: SecuritySessionsListProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <p className="text-xs text-gray-500">No recent login activity found.</p>
    );
  }

  const iconForType = (type?: string) => {
    if (!type) return Globe2;
    if (type.includes("mobile")) return Smartphone;
    return Laptop2;
  };

  return (
    <ul className="space-y-2 text-xs text-gray-700">
      {sessions.map((s) => {
        const Icon = iconForType(s.type);
        return (
          <li
            key={s.id}
            className="flex items-start justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                <Icon className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {s.title || "Login from new device"}
                </p>
                {s.description && (
                  <p className="text-[11px] text-gray-500 max-w-xs">
                    {s.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{s.timestamp}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
