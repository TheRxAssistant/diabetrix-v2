import React, { ReactNode, useState, createContext, useContext } from 'react';

interface TabsContextType {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
    children: ReactNode;
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}

export function Tabs({ children, defaultValue, value: controlledValue, onValueChange, className = '' }: TabsProps) {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleValueChange = (newValue: string) => {
        if (!isControlled) {
            setInternalValue(newValue);
        }
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
            <div className={`flex flex-col gap-4 ${className}`}>{children}</div>
        </TabsContext.Provider>
    );
}

interface TabsListProps {
    children: ReactNode;
    className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
    return (
        <div className={`inline-flex h-9 w-fit items-center justify-center rounded-lg bg-gray-100 p-1 ${className}`} role="tablist">
            {children}
        </div>
    );
}

interface TabsTriggerProps {
    children: ReactNode;
    value: string;
    className?: string;
}

export function TabsTrigger({ children, value, className = '' }: TabsTriggerProps) {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('TabsTrigger must be used within Tabs');
    }

    const isActive = context.value === value;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => context.onValueChange(value)}
            className={`
                inline-flex h-[calc(100%-2px)] flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all
                ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}
                ${className}
            `}>
            {children}
        </button>
    );
}

interface TabsContentProps {
    children: ReactNode;
    value: string;
    className?: string;
}

export function TabsContent({ children, value, className = '' }: TabsContentProps) {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('TabsContent must be used within Tabs');
    }

    if (context.value !== value) {
        return null;
    }

    return (
        <div className={`flex-1 outline-none ${className}`} role="tabpanel">
            {children}
        </div>
    );
}
