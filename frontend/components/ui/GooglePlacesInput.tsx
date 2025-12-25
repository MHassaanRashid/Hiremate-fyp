"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { MapPin, X, Loader2 } from "lucide-react"

interface GeoapifyPlacesInputProps {
    value: string
    onChange: (location: string) => void
    placeholder?: string
    className?: string
}

interface LocationSuggestion {
    properties: {
        formatted: string
        city?: string
        state?: string
        country?: string
    }
}

export function GeoapifyPlacesInput({
    value,
    onChange,
    placeholder = "City, Country",
    className = ""
}: GeoapifyPlacesInputProps) {
    const [query, setQuery] = useState(value)
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined)

    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY

    useEffect(() => {
        setQuery(value)
    }, [value])

    const searchLocations = useCallback(async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 2 || !apiKey) {
            setSuggestions([])
            return
        }

        setIsSearching(true)

        try {
            const apiUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
                searchQuery
            )}&apiKey=${apiKey}&limit=8&type=city&format=json`

            const response = await fetch(apiUrl)
            if (!response.ok) throw new Error("Geoapify API request failed")

            const data = await response.json()
            const results: LocationSuggestion[] = data.results?.map((result: any) => ({
                properties: {
                    formatted:
                        result.formatted ||
                        [result.city, result.state, result.country]
                            .filter(Boolean)
                            .join(", "),
                    city: result.city,
                    state: result.state,
                    country: result.country,
                },
            })) || []

            setSuggestions(results)
        } catch (error) {
            console.error("Failed to fetch locations:", error)
            setSuggestions([])
        } finally {
            setIsSearching(false)
        }
    }, [apiKey])

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setQuery(newValue)
        onChange(newValue)
        setShowDropdown(true)

        // Debounce API calls
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }

        debounceTimer.current = setTimeout(() => {
            searchLocations(newValue)
        }, 300)
    }

    const handleSelect = (location: string) => {
        setQuery(location)
        onChange(location)
        setShowDropdown(false)
        setSuggestions([])
    }

    const handleClear = () => {
        setQuery("")
        onChange("")
        setSuggestions([])
        setShowDropdown(false)
        inputRef.current?.focus()
    }

    return (
        <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500 z-10" />
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInput}
                onFocus={() => query && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder={placeholder}
                className={`w-full h-11 pl-10 pr-10 rounded-md border bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            />

            {/* Loading or Clear button */}
            <div className="absolute right-3 top-3">
                {isSearching ? (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                ) : query ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                ) : null}
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelect(suggestion.properties.formatted)}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-start gap-3 border-b border-slate-100 last:border-b-0"
                        >
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-900">
                                    {suggestion.properties.city || suggestion.properties.formatted}
                                </div>
                                {suggestion.properties.city && (
                                    <div className="text-xs text-slate-500 truncate">
                                        {[suggestion.properties.state, suggestion.properties.country]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
