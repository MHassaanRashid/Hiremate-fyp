"use client"

import { GeoapifyPlacesInput } from "@/components/ui/GooglePlacesInput"

interface LocationSearchProps {
  value: string
  onChange: (location: string) => void
  error?: string
}

export function LocationSearch({ value, onChange, error }: LocationSearchProps) {
  return (
    <div>
      <GeoapifyPlacesInput
        value={value}
        onChange={onChange}
        placeholder="City, Country"
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
