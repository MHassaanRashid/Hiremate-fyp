"use client";

import { Switch } from "@/components/ui/switch";

interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function ToggleSwitch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-0.5">
        {label && <p className="text-sm font-medium text-gray-900">{label}</p>}
        {description && <p className="text-xs text-gray-500 max-w-md">{description}</p>}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
}
