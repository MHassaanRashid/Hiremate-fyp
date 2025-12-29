import React, { useState } from 'react'

export const TechIconImage = ({
    icon,
    original = true,
    className = "w-12 h-12"
}: {
    icon: string;
    original?: boolean;
    className?: string;
}) => {
    const [error, setError] = useState(false)

    // Official SVG paths for stable fallbacks
    const FALLBACK_ICONS: Record<string, React.ReactNode> = {
        python: (
            <svg className={className} viewBox="0 0 256 255" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet">
                <path d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z" fill="#3776AB" />
                <path d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z" fill="#FFD43B" />
            </svg>
        ),
        typescript: (
            <svg className={className} viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h256v256H0z" fill="#3178C6" />
                <path d="M149.3 113.7v48h-16v-48h-16v-16h48v16h-16zm26.7 36c0-6.7 3.3-10.7 9.3-13.3-4-2.7-6-6.7-6-11.3 0-8.7 6.7-14 18.7-14 12.7 0 18.7 6 18.7 15.3h-16c0-3.3-1.3-4.7-4-4.7-2.7 0-4 1.3-4 4 0 2.7 1.3 4 5.3 5.3l4 1.3c10.7 4 16 9.3 16 17.3 0 9.3-7.3 15.3-20 15.3-12.7 0-20-6-20-16h16c0 3.3 2 5.3 5.3 5.3 3.3 0 5.3-1.3 5.3-4 0-3.3-2-4.7-6-6l-3.3-1.3c-8.7-3.3-13.3-8.7-13.3-17.3z" fill="#FFF" />
            </svg>
        ),
        rust: (
            <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm.5 4h-2.5v12h2.5v-1l1.5 1h3l-2.5-4c1.5-.5 2.5-2 2.5-3.5 0-2-1.5-3.5-3.5-3.5h-1v-1zm0 2h1c1 0 1.5.5 1.5 1.5s-.5 1.5-1.5 1.5h-1v-3z" fill="#000" />
            </svg>
        )
    }

    // Fallback if image fails to load
    if (error) {
        // Try specific SVG fallback first, then generic database icon
        return (FALLBACK_ICONS[icon] as React.ReactElement) || (
            <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="12" cy="5" rx="9" ry="3" stroke="#94A3B8" strokeWidth="2" fill="#94A3B8" fillOpacity="0.1" />
                <path d="M3 5v6c0 1.657 4.03 3 9 3s9-1.343 9-3V5" stroke="#94A3B8" strokeWidth="2" />
                <path d="M3 11v6c0 1.657 4.03 3 9 3s9-1.343 9-3v-6" stroke="#94A3B8" strokeWidth="2" />
            </svg>
        )
    }

    // Devicon hosted on jsDelivr - we use the 'original' version for full color logos
    const baseUrl = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons"
    const variant = original ? "original" : "plain"
    // Some icons might need the 'plain' variant if original doesn't exist, but 'original' is standard for colored logos
    const url = `${baseUrl}/${icon}/${icon}-${variant}.svg`

    return (
        <img
            src={url}
            alt={`${icon} logo`}
            className={className}
            onError={() => {
                console.warn(`Failed to load icon: ${icon}, switching to fallback`)
                setError(true)
            }}
            loading="lazy"
        />
    )
}

export const getTechIcon = (code: string) => {
    const normalizedCode = code.toLowerCase().trim()

    // Map internal codes to Devicon slugs
    // See https://devicon.dev/ for available icons
    const iconMap: Record<string, string> = {
        python: 'python',
        python3: 'python', // Handle python3 explicitly
        py: 'python',
        javascript: 'javascript',
        js: 'javascript',
        typescript: 'typescript',
        ts: 'typescript',
        react: 'react',
        reactjs: 'react',
        node: 'nodejs',
        nodejs: 'nodejs',
        java: 'java',
        csharp: 'csharp',
        'c#': 'csharp',
        cpp: 'cplusplus',
        'c++': 'cplusplus',
        go: 'go',
        golang: 'go',
        rust: 'rust',
        sql: 'postgresql',
    }

    const deviconSlug = iconMap[normalizedCode]

    // Return a component wrapper that renders the image
    return ({ className }: { className?: string }) => {
        // Special case: Embed Python logo directly to ensure it always displays
        // (User reported issues with the CDN version)
        // Check if code contains 'python' to capture 'python3', 'python-2', etc.
        if (normalizedCode.includes('python') || normalizedCode === 'py') {
            return (
                <svg className={className} viewBox="0 0 256 255" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet">
                    <path d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z" fill="#3776AB" />
                    <path d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z" fill="#FFD43B" />
                </svg>
            )
        }

        if (!deviconSlug) {
            // For SQL or unknown, use the fallback SVG directly
            if (normalizedCode === 'sql') {
                return (
                    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="12" cy="5" rx="9" ry="3" stroke="#00758F" strokeWidth="2" fill="#00758F" fillOpacity="0.1" />
                        <path d="M3 5v6c0 1.657 4.03 3 9 3s9-1.343 9-3V5" stroke="#00758F" strokeWidth="2" />
                        <path d="M3 11v6c0 1.657 4.03 3 9 3s9-1.343 9-3v-6" stroke="#00758F" strokeWidth="2" />
                    </svg>
                )
            }
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="12" cy="5" rx="9" ry="3" stroke="#94A3B8" strokeWidth="2" fill="#94A3B8" fillOpacity="0.1" />
                    <path d="M3 5v6c0 1.657 4.03 3 9 3s9-1.343 9-3V5" stroke="#94A3B8" strokeWidth="2" />
                    <path d="M3 11v6c0 1.657 4.03 3 9 3s9-1.343 9-3v-6" stroke="#94A3B8" strokeWidth="2" />
                </svg>
            )
        }

        return <TechIconImage icon={deviconSlug} className={className} />
    }
}
