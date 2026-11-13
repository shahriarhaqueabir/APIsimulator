import guidesData from "./triage-guides.json"
import type { TriageGuide, IssueType } from "@/types/triage"
import type { LemonOrder } from "@/types/lemon"

const guides = guidesData as TriageGuide[]

export function getGuide(issueType: IssueType): TriageGuide | undefined {
  return guides.find((g) => g.issueType === issueType)
}

export function getAllGuides(): TriageGuide[] {
  return guides
}

export interface DetectedIssue {
  type: IssueType
  description: string
}

export function detectIssues(orders: LemonOrder[]): DetectedIssue[] {
  const issues: DetectedIssue[] = []

  // Detect stuck orders: open for more than 5 minutes
  const now = Date.now()
  for (const order of orders) {
    if (order.status === "open") {
      const created = new Date(order.created_at).getTime()
      if (now - created > 5 * 60 * 1000) {
        issues.push({
          type: "stuck_order",
          description: `Order ${order.id.slice(0, 8)} for ${order.isin} has been open since ${new Date(order.created_at).toLocaleTimeString()}`,
        })
      }
    }
    if (order.status === "failed") {
      issues.push({
        type: "trade_failed",
        description: `Order ${order.id.slice(0, 8)} for ${order.isin} failed`,
      })
    }
  }

  return issues
}
