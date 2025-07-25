"use client"

import * as React from "react"
import {
  Dialog as AriaDialog,
  type DialogProps as AriaDialogProps,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
  composeRenderProps,
} from "react-aria-components"
import { cn } from "@/lib/utils"

const PopoverTrigger = AriaDialogTrigger

const Popover = ({ className, offset = 4, ...props }: AriaPopoverProps) => (
  <AriaPopover
    offset={offset}
    className={composeRenderProps(className, (className) =>
      cn(
        "z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
        "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95",
        "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
        "data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2",
        className,
      ),
    )}
    {...props}
  />
)

// ✅ Fixed: now forwards the ref properly
const PopoverDialog = React.forwardRef<
  React.ElementRef<typeof AriaDialog>,
  React.ComponentPropsWithoutRef<typeof AriaDialog>
>(({ className, ...props }, ref) => (
  <AriaDialog ref={ref} className={cn("p-4 outline outline-0", className)} {...props} />
))

PopoverDialog.displayName = "PopoverDialog"

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof AriaDialog>,
  React.ComponentPropsWithoutRef<typeof AriaDialog>
>(({ className, ...props }, ref) => (
  <PopoverDialog ref={ref} className={cn("p-4 outline outline-0", className)} {...props} />
))

PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverDialog, PopoverContent }
