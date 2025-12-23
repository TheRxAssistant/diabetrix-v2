import React, { ReactNode } from 'react';

interface StatisticProps {
    title?: string;
    value: string | number;
    prefix?: ReactNode;
    suffix?: string;
    valueStyle?: React.CSSProperties;
    className?: string;
}

export default function Statistic({ title, value, prefix, suffix, valueStyle, className = '' }: StatisticProps) {
    const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

    return (
        <div className={className}>
            {title && <div className="text-sm text-gray-600 mb-2">{title}</div>}
            <div className="flex items-baseline gap-2" style={valueStyle}>
                {prefix && <span className="text-xl">{prefix}</span>}
                <span className="text-2xl font-semibold">{formattedValue}</span>
                {suffix && <span className="text-lg">{suffix}</span>}
            </div>
        </div>
    );
}
