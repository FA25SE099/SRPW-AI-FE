"use client"

import * as React from "react"
import { cn } from "@/utils/cn"

interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

interface TabsProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    children?: React.ReactNode;
}

const Tabs = ({ defaultValue, value, onValueChange, className, children }: TabsProps) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")

    const currentValue = value !== undefined ? value : internalValue
    const handleValueChange = React.useCallback((newValue: string) => {
        if (onValueChange) {
            onValueChange(newValue)
        } else {
            setInternalValue(newValue)
        }
    }, [onValueChange])

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div className={className}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

interface TabsListProps {
    className?: string;
    children?: React.ReactNode;
}

const TabsList = ({ className, children }: TabsListProps) => (
    <div
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400",
            className
        )}
    >
        {children}
    </div>
)

interface TabsTriggerProps {
    value: string;
    className?: string;
    children?: React.ReactNode;
}

const TabsTrigger = ({ value, className, children }: TabsTriggerProps) => {
    const context = React.useContext(TabsContext)

    if (!context) {
        throw new Error("TabsTrigger must be used within Tabs")
    }

    const isActive = context.value === value

    return (
        <button
            onClick={() => context.onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                isActive
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700",
                className
            )}
        >
            {children}
        </button>
    )
}

interface TabsContentProps {
    value: string;
    className?: string;
    children?: React.ReactNode;
}

const TabsContent = ({ value, className, children }: TabsContentProps) => {
    const context = React.useContext(TabsContext)

    if (!context) {
        throw new Error("TabsContent must be used within Tabs")
    }

    if (context.value !== value) {
        return null
    }

    return (
        <div
            className={cn(
                "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                className
            )}
        >
            {children}
        </div>
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }