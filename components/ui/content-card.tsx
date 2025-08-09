import { cn } from "@/lib/utils"
import type React from "react"

interface ContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ContentCard({ children, className, ...props }: ContentCardProps) {
  return (
    <div className={cn("bg-white rounded-xl p-8 shadow-sm border border-neutral-100", className)} {...props}>
      {children}
    </div>
  )
}

interface ContentCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
}

export function ContentCardHeader({ title, description, className, ...props }: ContentCardHeaderProps) {
  return (
    <div className={cn("mb-6", className)} {...props}>
      <h3 className="text-2xl font-medium text-neutral-900">{title}</h3>
      {description && <p className="mt-1 text-neutral-500">{description}</p>}
    </div>
  )
}

interface ContentCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ContentCardFooter({ children, className, ...props }: ContentCardFooterProps) {
  return (
    <div className={cn("mt-6 pt-6 border-t border-neutral-100", className)} {...props}>
      {children}
    </div>
  )
}
