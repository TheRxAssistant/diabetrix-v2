import React from 'react';

interface DiabetrixIconProps {
    size?: number;
    className?: string;
}

export default function DiabetrixIcon({ size = 32, className = '' }: DiabetrixIconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Outer circle with gradient */}
            <circle cx="16" cy="16" r="15" fill="url(#gradient)" stroke="#0078D4" strokeWidth="1.5" />

            {/* Pill capsule shape */}
            <rect x="10" y="12" width="12" height="8" rx="4" fill="white" />
            <rect x="10" y="12" width="6" height="8" rx="4" fill="#0078D4" opacity="0.2" />

            {/* Medical cross in the center */}
            <rect x="14.5" y="10" width="3" height="12" rx="1.5" fill="#0078D4" />
            <rect x="10" y="14.5" width="12" height="3" rx="1.5" fill="#0078D4" />

            {/* Small molecular dots */}
            <circle cx="8" cy="8" r="1.5" fill="#0078D4" opacity="0.6" />
            <circle cx="24" cy="8" r="1.5" fill="#0078D4" opacity="0.6" />
            <circle cx="8" cy="24" r="1.5" fill="#0078D4" opacity="0.6" />
            <circle cx="24" cy="24" r="1.5" fill="#0078D4" opacity="0.6" />

            {/* Gradient definition */}
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0078D4" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#0078D4" stopOpacity="0.3" />
                </linearGradient>
            </defs>
        </svg>
    );
}
