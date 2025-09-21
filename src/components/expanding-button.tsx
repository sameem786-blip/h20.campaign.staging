// components/ui/expanding-icon-button.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

type ExpandingIconButtonProps = {
  icon: React.ReactNode;
  label: string;
  expandDirection?: "right" | "left";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function ExpandingIconButton({
  icon,
  label,
  className,
  expandDirection = "right",
  ...props
}: ExpandingIconButtonProps) {
  const isRight = expandDirection === "right";

  return (
    <button
      {...props}
      // `group` drives the hover/focus reveal
      className={cn(
        "group inline-flex items-center rounded-full h-12",
        "px-3",                       // compact when collapsed
        "text-white shadow-md hover:shadow-lg",
        "transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-p500",
        className
      )}
      title={label}
    >
      {/* Icon "pill" keeps the button circular when collapsed */}
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full">
        {icon}
      </span>

      {/* Label that expands in/out */}
      <span
        className={cn(
          "overflow-hidden whitespace-nowrap text-sm font-medium",
          "transition-all duration-300 opacity-0",
          "group-hover:opacity-100 group-focus-within:opacity-100",
          // width & spacing animation
          "max-w-0 group-hover:max-w-[160px] group-focus-within:max-w-[160px]",
          isRight ? "ml-0 group-hover:ml-2 group-focus-within:ml-2" : "mr-0 group-hover:mr-2 group-focus-within:mr-2",
          // flip order to expand left
          !isRight && "order-first"
        )}
      >
        {label}
      </span>
    </button>
  );
}
