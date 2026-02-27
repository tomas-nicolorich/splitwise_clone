"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

/**
 * @type {React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLButtonElement> & { children: React.ReactNode } & React.RefAttributes<any>>}
 */
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
    const chevronDown = React.createElement(ChevronDown, { className: "h-4 w-4 opacity-50" });
    return React.createElement(
        SelectPrimitive.Trigger,
        {
            ref,
            className: cn(
                "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
                className
            ),
            ...props
        },
        children,
        React.createElement(
            SelectPrimitive.Icon,
            { asChild: true },
            chevronDown
        )
    );
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<any>>}
 */
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => {
    const chevronUp = React.createElement(ChevronUp, { className: "h-4 w-4" });
    return React.createElement(
        SelectPrimitive.ScrollUpButton,
        {
            ref,
            className: cn("flex cursor-default items-center justify-center py-1", className),
            ...props
        },
        chevronUp
    );
})
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<any>>}
 */
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => {
    const chevronDown = React.createElement(ChevronDown, { className: "h-4 w-4" });
    return React.createElement(
        SelectPrimitive.ScrollDownButton,
        {
            ref,
            className: cn("flex cursor-default items-center justify-center py-1", className),
            ...props
        },
        chevronDown
    );
})
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode; position?: string } & React.RefAttributes<any>>}
 */
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
    const scrollUpButton = React.createElement(SelectScrollUpButton);
    const viewport = React.createElement(
        SelectPrimitive.Viewport,
        {
            className: cn(
                "p-1",
                position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
            )
        },
        children
    );
    const scrollDownButton = React.createElement(SelectScrollDownButton);

    const content = React.createElement(
        SelectPrimitive.Content,
        {
            ref,
            className: cn(
                "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                position === "popper" &&
                "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                className
            ),
            position,
            ...props
        },
        scrollUpButton,
        viewport,
        scrollDownButton
    );

    return React.createElement(
        SelectPrimitive.Portal,
        {},
        content
    );
})
SelectContent.displayName = SelectPrimitive.Content.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<any>>}
 */
const SelectLabel = React.forwardRef(({ className, ...props }, ref) =>
    React.createElement(
        SelectPrimitive.Label,
        {
            ref,
            className: cn("px-2 py-1.5 text-sm font-semibold", className),
            ...props
        }
    )
)
SelectLabel.displayName = SelectPrimitive.Label.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode; value?: string | number } & React.RefAttributes<any> & { value?: string | number }>}
 */
const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
    const itemIndicator = React.createElement(
        SelectPrimitive.ItemIndicator,
        {},
        React.createElement(Check, { className: "h-4 w-4" })
    );
    const checkSpan = React.createElement(
        "span",
        { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center" },
        itemIndicator
    );
    const itemText = React.createElement(
        SelectPrimitive.ItemText,
        {},
        children
    );

    return React.createElement(
        SelectPrimitive.Item,
        {
            ref,
            value,
            className: cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            ),
            ...props
        },
        checkSpan,
        itemText
    );
})
SelectItem.displayName = SelectPrimitive.Item.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<any>>}
 */
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) =>
    React.createElement(
        SelectPrimitive.Separator,
        {
            ref,
            className: cn("-mx-1 my-1 h-px bg-muted", className),
            ...props
        }
    )
)
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
}
