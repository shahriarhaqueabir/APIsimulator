"use client"

import { useQuery } from "@tanstack/react-query"
import type { LemonEvent } from "@/types/lemon"

async function fetchEvents(): Promise<LemonEvent[]> {
  const res = await fetch("/api/lemon/events")
  if (!res.ok) throw new Error("Failed to fetch events")
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data.results
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    refetchInterval: 10_000,
  })
}
