"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  title?: string;
  description?: string;
  showAvailability?: boolean; // currently unused
  className?: string;
  children?: React.ReactNode;
}

export function GridBackground({
  title,
  description,
  showAvailability = true,
  className,
  children,
}: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "px-30 py-5 rounded-md relative flex items-center justify-center",
        className
      )}
      style={{
        backgroundColor: "white",
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      <div
        className="absolute inset-0 border-2 rounded-md"
        style={{ animation: "border-color-change 6s linear infinite" }}
      />

      <div className="relative z-20 text-center max-w-7xl">
        {children ? (
          children
        ) : (
          <>
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {description && (
              <p className="text-md mt-3 text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                {description}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
