"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Owner = "customer" | "fintech" | "lemon" | "dwpbank" | "regulatory"

interface LayerData {
  id: string
  title: string
  subtitle: string
  owner: Owner
  capabilities: { name: string; detail: string }[]
  flowDescription: string
  shieldDescription?: string
}

const layers: LayerData[] = [
  {
    id: "01",
    title: "Customer Layer",
    subtitle: "Retail investor's experience",
    owner: "customer",
    capabilities: [
      { name: "KYC Onboarding", detail: "Identity verification, document upload, and compliance screening for new investors" },
      { name: "Portfolio Dashboard", detail: "Real-time portfolio performance, P&L tracking, and position overview" },
      { name: "Order Placement", detail: "Buy/sell order entry with market, limit, stop and other order types" },
      { name: "Cash Management", detail: "Deposits, withdrawals, and balance tracking across accounts" },
    ],
    flowDescription: "User actions and requests flow down to the FinTech operating layer via API calls and web SDK integration.",
  },
  {
    id: "02",
    title: "FinTech Operating Layer",
    subtitle: "NestVest's product & operations",
    owner: "fintech",
    capabilities: [
      { name: "Mobile & Web App", detail: "Customer-facing application managing UX, onboarding flows, and support interfaces" },
      { name: "Customer Support", detail: "Ticket management, dispute resolution, and user assistance workflows" },
      { name: "AML & Compliance", detail: "Transaction monitoring, sanction screening, and regulatory reporting" },
      { name: "GTM & Marketing", detail: "Campaign management, referrals, and customer acquisition funnels" },
    ],
    flowDescription: "Processed instructions are forwarded to the lemon.markets brokerage API for execution and account management.",
  },
  {
    id: "03",
    title: "lemon.markets Brokerage API Layer",
    subtitle: "The BaaS surface — Complexity Shield",
    owner: "lemon",
    shieldDescription:
      "The Complexity Shield abstracts all dwpbank and regulatory complexity behind a single, unified REST API. FinTech partners interact with simple resources (accounts, orders, documents) without needing to understand custody, settlement, or market infrastructure.",
    capabilities: [
      { name: "Account Management", detail: "Create and manage brokerage accounts, sub-accounts, and beneficiary structures" },
      { name: "Order Execution", detail: "Route, validate, and execute orders across connected exchanges and venues" },
      { name: "Market Data", detail: "Real-time and historical pricing, corporate actions, and instrument reference data" },
      { name: "Portfolio Sync", detail: "Automated position reconciliation, transaction history, and reporting" },
      { name: "Ops Portal", detail: "Operational dashboard for monitoring, compliance, and settlement oversight" },
    ],
    flowDescription: "Normalized instructions pass to the dwpbank infrastructure layer for custody, clearing, and settlement.",
  },
  {
    id: "04",
    title: "dwpbank Infrastructure Layer",
    subtitle: "Custody & settlement backbone",
    owner: "dwpbank",
    capabilities: [
      { name: "WP3 Securities Processing", detail: "Core securities settlement engine handling trade matching, clearing, and delivery-vs-payment" },
      { name: "Settlement Operations", detail: "End-of-day settlement, fails management, and corporate actions processing" },
      { name: "Omnibus Custody", detail: "Pooled custody structure for efficient asset servicing and multi-entity segregation" },
    ],
    flowDescription: "Settled trades and position data flow upward. Regulatory reports are submitted to market authorities.",
  },
  {
    id: "05",
    title: "Regulatory & Market Infrastructure",
    subtitle: "BaFin, MiFID II, Xetra, SEPA",
    owner: "regulatory",
    capabilities: [
      { name: "BaFin Supervision", detail: "German Federal Financial Supervisory Authority oversight and licensing framework" },
      { name: "MiFID II Compliance", detail: "Markets in Financial Instruments Directive — transaction reporting, best execution, and client categorization" },
      { name: "Xetra Trading", detail: "Deutsche Börse's electronic trading platform for cash market securities" },
      { name: "SEPA Payments", detail: "Single Euro Payments Area for cash transfers, direct debits, and payouts" },
    ],
    flowDescription: "Regulatory directives, market rules, and payment infrastructure constrain and guide all layers above.",
  },
]

const ownerConfig: Record<Owner, { label: string; borderClass: string; bgClass: string; textClass: string; badgeClass: string }> = {
  customer: {
    label: "Customer",
    borderClass: "border-orange-500",
    bgClass: "bg-orange-50 dark:bg-orange-950/20",
    textClass: "text-orange-700 dark:text-orange-400",
    badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  },
  fintech: {
    label: "FinTech",
    borderClass: "border-blue-500",
    bgClass: "bg-blue-50 dark:bg-blue-950/20",
    textClass: "text-blue-700 dark:text-blue-400",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  lemon: {
    label: "lemon.markets",
    borderClass: "border-amber-600",
    bgClass: "bg-amber-50 dark:bg-amber-950/20",
    textClass: "text-amber-700 dark:text-amber-400",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  dwpbank: {
    label: "dwpbank",
    borderClass: "border-purple-600",
    bgClass: "bg-purple-50 dark:bg-purple-950/20",
    textClass: "text-purple-700 dark:text-purple-400",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
  regulatory: {
    label: "Regulatory",
    borderClass: "border-emerald-600",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
    textClass: "text-emerald-700 dark:text-emerald-400",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
}

export default function ArchitecturePage() {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set(["03"]))

  const toggleLayer = (id: string) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Architecture</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Target Operating Model
        </p>
      </div>

      {/* Layer Stack */}
      <div className="space-y-1">
        {layers.map((layer, index) => {
          const config = ownerConfig[layer.owner]
          const isExpanded = expandedLayers.has(layer.id)

          return (
            <div key={layer.id} className="relative">
              {/* Vertical connector between layers */}
              {index < layers.length - 1 && (
                <div className="absolute left-9 top-full h-4 w-px bg-border z-0" />
              )}

              <Card
                className={cn(
                  "relative z-10 border-l-4 cursor-pointer transition-shadow hover:shadow-md",
                  config.borderClass
                )}
                onClick={() => toggleLayer(layer.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold shrink-0",
                          config.bgClass,
                          config.textClass
                        )}
                      >
                        {layer.id}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {layer.title}
                          <Badge variant="outline" className={config.badgeClass}>
                            {config.label}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{layer.subtitle}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground -mr-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLayer(layer.id)
                      }}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4">
                    {/* Capabilities Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {layer.capabilities.map((cap) => (
                        <div
                          key={cap.name}
                          className="rounded-lg border bg-card p-3 space-y-1"
                        >
                          <div className="text-sm font-medium">{cap.name}</div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            {cap.detail}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Complexity Shield (lemon.markets only) */}
                    {layer.shieldDescription && (
                      <Card
                        className={cn(
                          "border-2 border-dashed border-amber-600/50",
                          "bg-amber-50/50 dark:bg-amber-950/10"
                        )}
                      >
                        <CardContent className="py-3">
                          <div className="flex items-start gap-2">
                            <span className="text-lg shrink-0 mt-0.5">🛡️</span>
                            <div>
                              <div className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                Complexity Shield
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {layer.shieldDescription}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Flow Description */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="h-px flex-1 bg-border" />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                        <span>↓</span>
                        <span className="hidden sm:inline">{layer.flowDescription}</span>
                        <span className="sm:hidden">Data flows to next layer ↓</span>
                      </div>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )
        })}
      </div>

      {/* Responsibility Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Responsibility Summary</CardTitle>
          <CardDescription>Layer ownership and role overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(Object.entries(ownerConfig) as [Owner, typeof ownerConfig[Owner]][]).map(([key, config]) => {
              const layer = layers.find((l) => l.owner === key)
              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-lg border p-3 space-y-2 border-l-4",
                    config.borderClass
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded text-xs font-bold shrink-0",
                        config.bgClass,
                        config.textClass
                      )}
                    >
                      {layer?.id}
                    </div>
                    <div className="text-sm font-medium">{config.label}</div>
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {layer?.capabilities.map((c) => c.name).join(" · ")}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
