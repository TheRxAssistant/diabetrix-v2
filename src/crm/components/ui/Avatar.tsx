import React, { ReactNode } from 'react';

interface AvatarProps {
    icon?: ReactNode;
    src?: string;
    size?: number | 'large' | 'small' | 'default';
    style?: React.CSSProperties;
    className?: string;
}

export default function Avatar({ icon, src, size = 'default', style, className = '' }: AvatarProps) {
    const sizeMap = {
        small: 24,
        default: 32,
        large: 40,
    };

    const sizeValue = typeof size === 'number' ? size : sizeMap[size];

    return (
        <div
            className={`
        rounded-full bg-[#0078D4] text-white
        flex items-center justify-center overflow-hidden
        ${className}
      `}
            style={{
                width: sizeValue,
                height: sizeValue,
                ...style,
            }}>
            {src ? <img src={src} alt="User avatar" className="w-full h-full object-cover" /> : icon}
        </div>
    );
}
