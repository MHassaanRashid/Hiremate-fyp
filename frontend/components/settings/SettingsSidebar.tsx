"use client";

import { cn } from "@/lib/utils";
import {
  User,
  Shield,
  Eye,
  Bell,
  SlidersHorizontal,
  Database,
} from "lucide-react";

export type SettingsTabKey =
  | "profile"
  | "security"
  | "privacy"
  | "notifications"
  | "applications"
  | "data";

const items: { key: SettingsTabKey; label: string; icon: any }[] = [
  { key: "profile", label: "Profile Settings", icon: User },
  { key: "security", label: "Account Security", icon: Shield },
  { key: "privacy", label: "Privacy & Visibility", icon: Eye },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "applications", label: "Application Preferences", icon: SlidersHorizontal },
  { key: "data", label: "Data & Export", icon: Database },
];

interface SettingsSidebarProps {
  active: SettingsTabKey;
  onChange: (tab: SettingsTabKey) => void;
}

export function SettingsSidebar({ active, onChange }: SettingsSidebarProps) {
  return (
    <nav className="hidden md:block w-64 flex-shrink-0">
      <div className="rounded-2xl bg-white/90 border border-blue-100 shadow-sm p-3">
        <p className="px-2 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Settings
        </p>
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onChange(item.key)}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                      : "text-gray-700 hover:bg-blue-50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-blue-600")} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
