import React from 'react';

interface ProgressProps {
    percent: number;
    size?: 'small' | 'default';
    showInfo?: boolean;
    strokeColor?: string;
    className?: string;
}

export default function Progress({ percent, size = 'default', showInfo = true, strokeColor = '#0078D4', className = '' }: ProgressProps) {
    const height = size === 'small' ? 'h-1' : 'h-2';

    return (
        <div className={`w-full ${className}`}>
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height}`}>
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                        width: `${Math.min(100, Math.max(0, percent))}%`,
                        backgroundColor: strokeColor,
                    }}
                />
            </div>
            {showInfo && <div className="mt-1 text-xs text-gray-600">{percent.toFixed(0)}%</div>}
        </div>
    );
}
