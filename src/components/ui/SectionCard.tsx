import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";

interface SectionCardProps {
    title: string;
    icon?: React.ElementType | React.ReactNode;
    actions?: React.ReactNode;
    loading?: boolean;
    className?: string;
    contentClassName?: string;
    children: React.ReactNode;
}

/**
 * A standardized card wrapper for group detail sections.
 */
export default function SectionCard({ 
    title, 
    icon: Icon, 
    actions, 
    loading, 
    className, 
    contentClassName,
    children 
}: SectionCardProps) {
    return (
        <Card className={cn("border-slate-200 dark:border-slate-700 dark:bg-slate-800 relative overflow-hidden", className)}>
            <CardHeader className="p-4 sm:pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 dark:text-white">
                        {Icon && (React.isValidElement(Icon) ? Icon : React.createElement(Icon as React.ElementType, { className: "w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" }))}
                        {title}
                    </CardTitle>
                    {actions}
                </div>
            </CardHeader>
            <CardContent className={cn("p-4 pt-0 min-h-[100px]", contentClassName)}>
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                )}
                {children}
            </CardContent>
        </Card>
    );
}
