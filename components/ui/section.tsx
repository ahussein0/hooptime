import { cn } from "@/lib/utils"
import type React from "react"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Section({ children, className, ...props }: SectionProps) {
  return (
    <section className={cn("py-12", className)} {...props}>
      {children}
    </section>
  )
}

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
}

export function SectionHeader({ title, description, className, ...props }: SectionHeaderProps) {
  return (
    <div className={cn("mb-8 text-center", className)} {...props}>
      <h2 className="text-3xl font-bold tracking-tight text-neutral-900">{title}</h2>
      {description && <p className="mt-2 text-lg text-neutral-500">{description}</p>}
    </div>
  )
}
