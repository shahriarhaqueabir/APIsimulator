"use client"

import { useQuery } from "@tanstack/react-query"
import type { LemonOrder } from "@/types/lemon"

async function fetchOrders(): Promise<LemonOrder[]> {
  const res = await fetch("/api/lemon/orders")
  if (!res.ok) throw new Error("Failed to fetch orders")
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data.results
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchInterval: 10_000, // poll every 10s
  })
}
