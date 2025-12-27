"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Activity, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      {/* Back Button */}
      <div className="relative z-10 p-4 sm:p-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </Button>
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="p-2 rounded-lg glass-panel teal-glow-sm">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold">
                <span className="text-primary">Clini</span>Sense
              </span>
            </Link>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <div className="glass-panel rounded-xl p-8 gradient-border">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full mt-6" />
              </div>
            ) : (
              <LoginForm />
            )}
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>

          {/* Demo Access */}
          <div className="glass-panel rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Want to try without signing up?</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Access Demo Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
