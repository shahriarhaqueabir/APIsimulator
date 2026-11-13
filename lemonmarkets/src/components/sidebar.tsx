"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/orders", label: "Orders", icon: "📋" },
  { href: "/accounts", label: "Accounts", icon: "👤" },
  { href: "/events", label: "Events", icon: "🔌" },
  { href: "/architecture", label: "Architecture", icon: "🏗️" },
  { href: "/triage", label: "Triage Center", icon: "🔍" },
]

export function Sidebar() {
  const pathname = usePathname()

  const { data, isLoading } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch("/api/lemon/health")
      if (!res.ok) throw new Error("Health check failed")
      return res.json()
    },
    refetchInterval: 30_000,
  })

  const status = data?.status
  const healthDotClass = isLoading
    ? "bg-gray-400"
    : status === "connected"
      ? "bg-green-500"
      : "bg-amber-500"
  const healthLabel = isLoading
    ? "Checking..."
    : status === "connected"
      ? "API Connected"
      : "Demo Mode"

  return (
    <aside className="w-56 border-r bg-muted/30 flex flex-col p-4 gap-1 h-screen sticky top-0">
      <div className="font-bold text-lg mb-6 px-3">Lemon Ops</div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                pathname === item.href && "font-medium"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${healthDotClass}`} />
          {healthLabel}
        </div>
      </div>
    </aside>
  )
}
