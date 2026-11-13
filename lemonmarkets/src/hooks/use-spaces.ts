"use client"

import { useQuery } from "@tanstack/react-query"
import type { LemonSpace } from "@/types/lemon"

async function fetchSpaces(): Promise<LemonSpace[]> {
  const res = await fetch("/api/lemon/spaces")
  if (!res.ok) throw new Error("Failed to fetch spaces")
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data.results
}

export function useSpaces() {
  return useQuery({
    queryKey: ["spaces"],
    queryFn: fetchSpaces,
  })
}
