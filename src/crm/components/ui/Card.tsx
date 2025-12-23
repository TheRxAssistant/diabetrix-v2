import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    title?: string | ReactNode;
    extra?: ReactNode;
    className?: string;
    bodyStyle?: React.CSSProperties;
    bordered?: boolean;
    hoverable?: boolean;
    onClick?: () => void;
}

export default function Card({ children, title, extra, className = '', bodyStyle, bordered = true, hoverable = false, onClick }: CardProps) {
    return (
        <div
            className={`
        bg-white rounded-lg shadow-sm
        ${bordered ? 'border border-gray-200' : ''}
        ${hoverable ? 'transition-all hover:shadow-md cursor-pointer' : ''}
        ${className}
      `}
            onClick={onClick}>
            {(title || extra) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    {title && (typeof title === 'string' ? <h3 className="text-lg font-semibold text-gray-900">{title}</h3> : <div>{title}</div>)}
                    {extra && <div>{extra}</div>}
                </div>
            )}
            <div className="p-6" style={bodyStyle}>
                {children}
            </div>
        </div>
    );
}
