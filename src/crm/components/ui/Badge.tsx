import React, { ReactNode } from 'react';

interface BadgeProps {
    status?: 'success' | 'processing' | 'default' | 'error' | 'warning';
    text?: ReactNode;
    children?: ReactNode;
    className?: string;
}

export default function Badge({ status = 'default', text, children, className = '' }: BadgeProps) {
    const statusColors = {
        success: 'bg-green-500',
        processing: 'bg-blue-500 animate-pulse',
        default: 'bg-gray-400',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
    };

    if (text !== undefined) {
        return (
            <span className={`inline-flex items-center gap-2 ${className}`}>
                <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                <span>{text}</span>
            </span>
        );
    }

    return <span className={`inline-flex items-center ${className}`}>{children}</span>;
}
