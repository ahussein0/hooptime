import { cn } from "@/lib/utils"
import type React from "react"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export function Container({ children, className, size = "xl", ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 w-full",
        {
          "max-w-screen-sm": size === "sm",
          "max-w-screen-md": size === "md",
          "max-w-screen-lg": size === "lg",
          "max-w-screen-xl": size === "xl",
          "max-w-none": size === "full",
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
