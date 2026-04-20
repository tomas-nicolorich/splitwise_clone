import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";

/**
 * A standardized card wrapper for group detail sections.
 * @param {Object} props
 * @param {string} props.title - The title of the section.
 * @param {React.ReactNode} props.icon - The icon to display next to the title.
 * @param {React.ReactNode} props.actions - Optional actions to display in the header.
 * @param {boolean} props.loading - Whether to display a loading overlay.
 * @param {string} props.className - Additional class names for the card.
 * @param {string} props.contentClassName - Additional class names for the card content.
 * @param {React.ReactNode} props.children - The content of the section.
 */
export default function SectionCard({ 
    title, 
    icon: Icon, 
    actions, 
    loading, 
    className, 
    contentClassName,
    children 
}) {
    return (
        <Card className={cn("border-slate-200 dark:border-slate-700 dark:bg-slate-800 relative overflow-hidden", className)}>
            <CardHeader className="p-4 sm:pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 dark:text-white">
                        {Icon && (React.isValidElement(Icon) ? Icon : React.createElement(Icon, { className: "w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" }))}
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
