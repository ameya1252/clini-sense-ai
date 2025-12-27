"use client"

import Link from "next/link"
import { Activity, Bell, Settings, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardHeaderProps {
  userName: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border/50 glass-panel-solid sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative p-2.5 rounded-xl glass-panel teal-glow-sm group-hover:teal-glow transition-all duration-300">
            <Activity className="h-6 w-6 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-glow-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-primary">Clini</span>
              <span className="text-foreground">Sense</span>
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">AI Clinical Assistant</span>
          </div>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* AI Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">AI Ready</span>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary/10 px-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:inline font-medium">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-panel-solid w-48">
              <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem className="hover:bg-destructive/10 text-destructive cursor-pointer">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
