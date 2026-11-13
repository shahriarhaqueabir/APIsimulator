import { describe, it, expect } from "vitest"
import { detectIssues, getGuide, getAllGuides } from "../triage-engine"
import type { LemonOrder } from "@/types/lemon"

const makeOrder = (overrides: Partial<LemonOrder> = {}): LemonOrder => ({
  id: "10000000-0000-0000-0000-000000000001",
  space_id: "00000000-0000-0000-0000-000000000001",
  isin: "US0378331005",
  side: "buy",
  quantity: "10.00000",
  limit_price: null,
  status: "open",
  created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

describe("triage-engine", () => {
  describe("getGuide", () => {
    it("returns the correct guide for stuck_order", () => {
      const guide = getGuide("stuck_order")
      expect(guide).toBeDefined()
      expect(guide?.title).toBe("Order Stuck in 'open'")
      expect(guide?.steps.length).toBeGreaterThan(0)
    })

    it("returns undefined for unknown issue type", () => {
      const guide = getGuide("unknown" as any)
      expect(guide).toBeUndefined()
    })
  })

  describe("getAllGuides", () => {
    it("returns all guides", () => {
      const guides = getAllGuides()
      expect(guides.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe("detectIssues", () => {
    it("detects stuck orders (open > 5 min)", () => {
      const order = makeOrder({
        status: "open",
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      })
      const issues = detectIssues([order])
      expect(issues).toHaveLength(1)
      expect(issues[0].type).toBe("stuck_order")
    })

    it("does not flag recent open orders", () => {
      const order = makeOrder({
        status: "open",
        created_at: new Date().toISOString(),
      })
      const issues = detectIssues([order])
      expect(issues).toHaveLength(0)
    })

    it("detects failed orders", () => {
      const order = makeOrder({ status: "failed" })
      const issues = detectIssues([order])
      expect(issues).toHaveLength(1)
      expect(issues[0].type).toBe("trade_failed")
    })

    it("ignores filled and canceled orders", () => {
      const orders: LemonOrder[] = [
        makeOrder({ id: "1", status: "filled" }),
        makeOrder({ id: "2", status: "canceled" }),
      ]
      const issues = detectIssues(orders)
      expect(issues).toHaveLength(0)
    })
  })
})
