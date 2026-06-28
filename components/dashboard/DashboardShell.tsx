import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardPageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export function DashboardPageHeader({
  title,
  subtitle,
  children,
  className,
}: DashboardPageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">CallGrabbr</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  tone?: "default" | "danger"
}) {
  return (
    <div className="glass-card group rounded-xl p-5 transition-shadow hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "rounded-xl p-3 transition-colors",
            tone === "danger" ? "bg-destructive/10" : "bg-primary/10 group-hover:bg-primary/15"
          )}
        >
          <Icon className={cn("h-5 w-5", tone === "danger" ? "text-destructive" : "text-primary")} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p
            className={cn(
              "text-2xl font-bold tracking-tight",
              tone === "danger" && "text-destructive"
            )}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

export function DashboardSection({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function DashboardBackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm text-primary hover:underline">
      {children}
    </Link>
  )
}
