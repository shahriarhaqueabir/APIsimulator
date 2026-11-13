import { z } from "zod"

export const IssueSeverity = z.enum(["low", "medium", "high", "critical"])
export type IssueSeverity = z.infer<typeof IssueSeverity>

export const IssueStatus = z.enum(["open", "investigating", "resolved"])
export type IssueStatus = z.infer<typeof IssueStatus>

export const IssueType = z.enum([
  "stuck_order",
  "onboarding_incomplete",
  "trade_failed",
  "document_rejected",
  "webhook_delivery_failed",
])
export type IssueType = z.infer<typeof IssueType>

export interface TriageStep {
  id: string
  label: string
  description: string
  apiCheck?: string
  hint?: string
}

export interface TriageGuide {
  issueType: IssueType
  title: string
  description: string
  severity: IssueSeverity
  steps: TriageStep[]
}
