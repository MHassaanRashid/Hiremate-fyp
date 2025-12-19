"use client"

import { useState, useCallback, useEffect } from "react"
import { MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"

const GEOAPIFY_API_KEY =
    process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "your_geoapify_api_key_here"

interface LocationInputProps {
    value: string
    onChange: (location: string) => void
    error?: string
    placeholder?: string
    className?: string
}

interface LocationSuggestion {
    properties: {
        formatted: string
    }
}

const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.length < 2) return []

    try {
        const apiUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            query
        )}&apiKey=${GEOAPIFY_API_KEY}&limit=8&format=json`

        if (GEOAPIFY_API_KEY === "your_geoapify_api_key_here") {
            // Silent fail or console warn if key is missing, to avoid breaking ui
            console.warn("Invalid Geoapify API key")
            return []
        }

        const response = await fetch(apiUrl)
        if (!response.ok) throw new Error("Geoapify API request failed")

        const data = await response.json()
        return data.results?.map((result: any) => ({
            properties: {
                formatted:
                    result.properties?.formatted ||
                    [result.city, result.state, result.country]
                        .filter(Boolean)
                        .join(", "),
            },
        }))
    } catch (error) {
        console.error("Failed to fetch locations:", error)
        return []
    }
}

export function LocationInput({ value, onChange, error, placeholder, className }: LocationInputProps) {
    const [query, setQuery] = useState(value)
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        setQuery(value)
    }, [value])

    const handleSearch = useCallback(async (q: string) => {
        setQuery(q)
        onChange(q)
        setShowDropdown(true)

        if (q.length < 2) {
            setSuggestions([])
            return
        }

        setIsSearching(true)
        const results = await searchLocations(q)
        setSuggestions(results)
        setIsSearching(false)
    }, [onChange])

    const handleSelect = (location: string) => {
        onChange(location)
        setQuery(location)
        setShowDropdown(false)
        setSuggestions([])
    }

    return (
        <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={placeholder || "Type to search for locations..."}
                className={`pl-10 ${error ? "border-red-500" : ""} ${className}`}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
                id="location-input"
                name="location"
            />
            {isSearching && (
                <div className="absolute right-3 top-3">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {showDropdown && query.length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {isSearching ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">Searching...</div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSelect(s.properties.formatted)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center border-b border-gray-100 last:border-b-0"
                            >
                                <MapPin className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
                                <span className="text-gray-800 text-sm truncate">{s.properties.formatted}</span>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-gray-500 text-sm">
                            No locations found
                        </div>
                    )}
                </div>
            )}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    )
}
