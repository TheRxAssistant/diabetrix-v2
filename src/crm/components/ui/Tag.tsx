import React, { ReactNode } from 'react';

interface TagProps {
    children: ReactNode;
    color?: string;
    icon?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export default function Tag({ children, color, icon, className = '', style }: TagProps) {
    // Map color names to Tailwind classes
    const colorMap: Record<string, string> = {
        green: 'bg-green-100 text-green-800 border-green-200',
        orange: 'bg-orange-100 text-orange-800 border-orange-200',
        red: 'bg-red-100 text-red-800 border-red-200',
        blue: 'bg-blue-100 text-blue-800 border-blue-200',
        default: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    // If color is a hex code, use inline style
    const isHexColor = color && color.startsWith('#');
    const colorClasses = isHexColor ? '' : colorMap[color || 'default'] || colorMap.default;

    const inlineStyle = isHexColor ? { backgroundColor: `${color}20`, color, borderColor: `${color}40`, ...style } : style;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${colorClasses} ${className}`} style={inlineStyle}>
            {icon && <span>{icon}</span>}
            {children}
        </span>
    );
}
