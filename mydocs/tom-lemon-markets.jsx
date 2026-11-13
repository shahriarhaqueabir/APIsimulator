import { useState } from "react";

const OWNER = {
  customer: { label: "End User",            color: "#F97316", bg: "#FFF7ED", text: "#9A3412" },
  fintech:  { label: "FinTech (NestVest)",  color: "#3B82F6", bg: "#EFF6FF", text: "#1E40AF" },
  lemon:    { label: "lemon.markets",       color: "#D97706", bg: "#FFFBEB", text: "#78350F" },
  dwpbank:  { label: "dwpbank Group",       color: "#7C3AED", bg: "#F5F3FF", text: "#4C1D95" },
  external: { label: "Regulators / Market", color: "#059669", bg: "#ECFDF5", text: "#064E3B" },
};

const LAYERS = [
  {
    id: "customer", num: "01",
    title: "Customer Layer",
    subtitle: "What the retail investor sees, experiences, and controls",
    owner: "customer",
    caps: [
      { name: "KYC / Onboarding",    detail: "Self-service ID verification, suitability questionnaire, account activation" },
      { name: "Portfolio Dashboard", detail: "Real-time holdings, P&L, NAV, asset allocation breakdown" },
      { name: "Order Placement",     detail: "Buy/sell ETFs, equities, fractional shares via FinTech app UI" },
      { name: "Cash Management",     detail: "SEPA deposits and withdrawals, wallet balance, transfer history" },
      { name: "Documents & Tax",     detail: "Annual statements, trade confirmations, tax certificates on demand" },
    ],
    flow: "User interactions via FinTech app",
  },
  {
    id: "fintech", num: "02",
    title: "FinTech Operating Layer",
    subtitle: "NestVest's internal product, operations and business functions — owned and operated by the FinTech",
    owner: "fintech",
    caps: [
      { name: "Web / Mobile App",   detail: "Custom investment UX built on top of lemon.markets API responses" },
      { name: "Customer Ops",       detail: "Account queries, transaction disputes — managed via lemon.markets Ops Portal" },
      { name: "L1 Support",         detail: "Front-line customer support; API/platform issues escalated to lemon.markets" },
      { name: "AML Policy",         detail: "AML policy ownership; KYC execution and transaction screening delegated" },
      { name: "Product & GTM",      detail: "Feature roadmap, pricing strategy, user acquisition, partner integrations" },
      { name: "Finance & Revenue",  detail: "Fee model (flat / per-trade), investor reporting, P&L management" },
    ],
    flow: "Single REST API integration point",
  },
  {
    id: "lemon", num: "03",
    title: "lemon.markets Brokerage API Layer",
    subtitle: "Core BaaS surface — single well-documented API abstracting all brokerage, custody, and regulatory complexity",
    owner: "lemon",
    shield: "FinTech never directly interfaces with custody, clearing, settlement or BaFin reporting. lemon.markets abstracts all of this behind a single API.",
    caps: [
      { name: "Account & ID+V API",     detail: "Account creation, identity verification, KYC/AML status endpoints" },
      { name: "Securities Account API", detail: "Depot opening, management, custody allocation, account configuration" },
      { name: "Order Management API",   detail: "Place, modify, cancel orders; real-time status; execution reports" },
      { name: "Market Data API",        detail: "Instruments, real-time + historical prices, full ETF/equity universe" },
      { name: "Portfolio & Positions",  detail: "Live holdings, P&L, valuations, complete transaction history" },
      { name: "Corporate Actions API",  detail: "Dividends, stock splits, rights issues, reorg events, proxy voting" },
      { name: "Statements & Tax API",   detail: "Annual statements, trade confirmations, tax certificates, audit trail" },
      { name: "Self-Service Ops Portal",detail: "Partner-facing dashboard for day-to-day account and operations management" },
    ],
    flow: "Settlement & custody instructions",
  },
  {
    id: "dwpbank", num: "04",
    title: "dwpbank Infrastructure Layer",
    subtitle: "Institutional-grade securities custody, settlement and clearing — operated by dwpbank Group",
    owner: "dwpbank",
    caps: [
      { name: "WP3 Securities Platform", detail: "Core securities custody infrastructure — established German market standard" },
      { name: "wpNex Digital Assets",    detail: "Digital asset and tokenised securities custody layer" },
      { name: "Settlement Engine",       detail: "T+2 settlement; multilateral netting and clearing across venues" },
      { name: "Omnibus Custody",         detail: "Full-custody model; partner client assets ring-fenced per BaFin rules" },
    ],
    flow: "Market access & regulatory filings",
  },
  {
    id: "regulatory", num: "05",
    title: "Regulatory & Market Infrastructure",
    subtitle: "Managed on behalf of the FinTech by lemon.markets and dwpbank — the FinTech is shielded from direct engagement",
    owner: "external",
    caps: [
      { name: "BaFin / KWG",           detail: "German FSA — BaFin securities licence held by lemon.markets; FinTech operates under it" },
      { name: "MiFID II Reporting",    detail: "Transaction reporting, best execution, suitability — orchestrated by lemon.markets" },
      { name: "Xetra / Tradegate",     detail: "Primary execution venues for equity & ETF orders" },
      { name: "SEPA Payment Rails",    detail: "Deposits & withdrawals via SEPA credit transfer / core direct debit" },
      { name: "KYC / AML Provider",   detail: "Third-party identity verification integrated through lemon.markets ID+V API" },
    ],
    flow: null,
  },
];

const KPI = [
  { icon: "⚡", label: "Time to Market",    value: "8 weeks",                desc: "No custody build, no BaFin licence required" },
  { icon: "🛡️", label: "Regulatory Cover",  value: "BaFin via lemon.markets", desc: "FinTech operates under lemon.markets licence" },
  { icon: "🏦", label: "Custody Grade",     value: "dwpbank institutional",   desc: "WP3 platform — established German standard" },
];

export default function TOM() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: "#F1F5F9", minHeight: "100vh", padding: "32px 20px 48px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#D97706", textTransform: "uppercase", marginBottom: 6 }}>
                Target Operating Model · v1.0
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: "0 0 4px", lineHeight: 1.25 }}>
                FinTech Investment Product Launch
              </h1>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                NestVest (Neobank) × lemon.markets Brokerage-as-a-Service · dwpbank Group
              </p>
            </div>
            {/* KPIs */}
            <div style={{ display: "flex", gap: 10 }}>
              {KPI.map((k, i) => (
                <div key={i} style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 120 }}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>{k.icon}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>{k.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", marginBottom: 2 }}>{k.value}</div>
                  <div style={{ fontSize: 10, color: "#64748B", lineHeight: 1.3 }}>{k.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rainbow divider */}
          <div style={{ height: 3, borderRadius: 2, margin: "16px 0 14px", background: "linear-gradient(90deg, #F97316 0%, #3B82F6 25%, #D97706 50%, #7C3AED 75%, #059669 100%)" }} />

          {/* Legend */}
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {Object.entries(OWNER).map(([key, v]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#475569", fontWeight: 500 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: v.color, flexShrink: 0 }} />
                {v.label}
              </div>
            ))}
            <div style={{ marginLeft: "auto", fontSize: 10, color: "#94A3B8", fontStyle: "italic" }}>Click any layer to expand details</div>
          </div>
        </div>

        {/* ── Layer Stack ── */}
        {LAYERS.map((layer, idx) => {
          const o = OWNER[layer.owner];
          const isOpen = active === layer.id;

          return (
            <div key={layer.id}>
              <div
                onClick={() => setActive(isOpen ? null : layer.id)}
                style={{
                  background: o.bg,
                  border: `2px solid ${o.color}`,
                  borderTop: idx === 0 ? `2px solid ${o.color}` : `2px solid ${o.color}`,
                  borderBottom: idx === LAYERS.length - 1 ? `2px solid ${o.color}` : "none",
                  borderRadius: idx === 0 ? "12px 12px 0 0" : idx === LAYERS.length - 1 ? "0 0 12px 12px" : "0",
                  padding: "16px 20px 18px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {/* Row: number + title + owner badge + chevron */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 900, letterSpacing: "0.12em",
                      color: "white", background: o.color,
                      padding: "3px 8px", borderRadius: 4, textTransform: "uppercase",
                      whiteSpace: "nowrap", marginTop: 2, flexShrink: 0,
                    }}>{layer.num}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: o.text, lineHeight: 1.3 }}>{layer.title}</div>
                      <div style={{ fontSize: 11, color: o.text, opacity: 0.75, marginTop: 2, lineHeight: 1.4, maxWidth: 640 }}>{layer.subtitle}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: o.text,
                      background: `${o.color}1A`, border: `1px solid ${o.color}50`,
                      padding: "2px 10px", borderRadius: 20,
                    }}>{o.label}</span>
                    <span style={{ color: o.color, fontSize: 14, display: "inline-block", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                  </div>
                </div>

                {/* Capability grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 8,
                }}>
                  {layer.caps.map((cap, ci) => (
                    <div key={ci} style={{
                      background: "rgba(255,255,255,0.75)",
                      border: `1px solid ${o.color}25`,
                      borderRadius: 8,
                      padding: "9px 12px",
                      transition: "background 0.15s",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: o.text, marginBottom: isOpen ? 4 : 0 }}>
                        {cap.name}
                      </div>
                      {isOpen && (
                        <div style={{ fontSize: 10, color: "#64748B", lineHeight: 1.5 }}>{cap.detail}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Complexity shield callout (lemon.markets layer only) */}
                {layer.shield && (
                  <div style={{
                    marginTop: 12,
                    background: `${o.color}12`,
                    border: `1px dashed ${o.color}`,
                    borderRadius: 6,
                    padding: "7px 12px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>🛡</span>
                    <span style={{ fontSize: 11, color: o.text, lineHeight: 1.5 }}>
                      <strong>Complexity Shield</strong> — {layer.shield}
                    </span>
                  </div>
                )}
              </div>

              {/* Flow connector pill */}
              {layer.flow && (
                <div style={{ display: "flex", justifyContent: "center", padding: "5px 0", background: "#F1F5F9" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "white", border: "1px solid #E2E8F0",
                    borderRadius: 20, padding: "3px 14px",
                    fontSize: 10, color: "#94A3B8", fontWeight: 600,
                    letterSpacing: "0.03em",
                  }}>
                    ↓ {layer.flow}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Responsibility Matrix ── */}
        <div style={{ marginTop: 24, background: "white", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#64748B", textTransform: "uppercase" }}>
              Responsibility Summary — Who owns what
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
            {[
              {
                owner: "FinTech (NestVest)",
                color: "#3B82F6",
                items: ["Product UX & mobile app", "L1 customer support", "AML compliance policy", "GTM & user acquisition", "Revenue model & pricing"],
              },
              {
                owner: "lemon.markets",
                color: "#D97706",
                items: ["BaFin licence & regulatory compliance", "KYC / ID+V execution", "Custody allocation", "MiFID II transaction reporting", "Partner ops portal", "API documentation & SLA"],
              },
              {
                owner: "dwpbank Group",
                color: "#7C3AED",
                items: ["Securities custody (WP3)", "Settlement & clearing", "Digital asset custody (wpNex)", "Market venue connectivity"],
              },
            ].map((col, i) => (
              <div key={i} style={{ padding: "14px 16px", borderRight: i < 2 ? "1px solid #E2E8F0" : "none" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: col.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{col.owner}</div>
                {col.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: col.color, marginTop: 5, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#374151", lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14, textAlign: "center", fontSize: 10, color: "#94A3B8" }}>
          lemon.markets Brokerage-as-a-Service · dwpbank Group · Target Operating Model for pre-sales partner qualification
        </div>
      </div>
    </div>
  );
}
