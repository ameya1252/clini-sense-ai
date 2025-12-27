"use client"

import { FileText, Settings, BookOpen, History, Shield, Home, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const actions = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: History,
    label: "History",
    href: "#",
  },
  {
    icon: FileText,
    label: "Templates",
    href: "#",
  },
  {
    icon: BookOpen,
    label: "Guides",
    href: "#",
  },
  {
    icon: Shield,
    label: "Safety",
    href: "#",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "#",
  },
]

export function QuickActions() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-16 xl:w-56 bg-background/50 backdrop-blur-xl border-r border-border/50 shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center xl:justify-start xl:px-4 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Home className="h-4 w-4 text-primary" />
          </div>
          <span className="hidden xl:inline text-lg font-bold">
            <span className="text-primary">Clini</span>Sense
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 xl:px-3 space-y-1 overflow-y-auto">
        {actions.map((action) => {
          const isActive = pathname === action.href
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
              }`}
              title={action.label}
            >
              <action.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
              <span className="hidden xl:inline text-sm font-medium truncate">{action.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom - Logout */}
      <div className="p-2 xl:p-3 border-t border-border/50">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="hidden xl:inline text-sm font-medium">Sign Out</span>
        </Link>
      </div>
    </aside>
  )
}
