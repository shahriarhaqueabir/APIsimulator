"use client"

import { useQuery } from "@tanstack/react-query"
import type { LemonDocument } from "@/types/lemon"

async function fetchDocuments(): Promise<LemonDocument[]> {
  const res = await fetch("/api/lemon/documents")
  if (!res.ok) throw new Error("Failed to fetch documents")
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data.results
}

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
  })
}
