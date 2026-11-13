import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env["DATABASE_URL"] ?? "file:./dev.db",
});
const db = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Shorthand: `Date.now() - minutes * 60_000` */
function ago(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Deterministic IDs
// ---------------------------------------------------------------------------

// Spaces
const S_A = "00000000-0000-0000-0000-000000000001";
const S_B = "00000000-0000-0000-0000-000000000002";
const S_C = "00000000-0000-0000-0000-000000000003";
const S_ACME = "00000000-0000-0000-0000-000000000004";
const S_FINTECH = "00000000-0000-0000-0000-000000000005";
const S_SANDBOX = "00000000-0000-0000-0000-000000000006";

// Orders (namespace 1000…)
// Keep existing 001–003
const O_A_OPEN = "10000000-0000-0000-0000-000000000001";
const O_A_FILLED = "10000000-0000-0000-0000-000000000002";
const O_B_FAILED = "10000000-0000-0000-0000-000000000003";
// New 004–012
const O_A_FILLED2 = "10000000-0000-0000-0000-000000000004";
const O_B_OPEN = "10000000-0000-0000-0000-000000000005";
const O_B_FILLED = "10000000-0000-0000-0000-000000000006";
const O_C_OPEN = "10000000-0000-0000-0000-000000000007";
const O_C_CANCELED = "10000000-0000-0000-0000-000000000008";
const O_ACME_FILLED = "10000000-0000-0000-0000-000000000009";
const O_ACME_CANCELED = "10000000-0000-0000-0000-000000000010";
const O_ACME_OPEN = "10000000-0000-0000-0000-000000000011";
const O_FINTECH_FAILED = "10000000-0000-0000-0000-000000000012";
// Batch 2 – more test data for CRUD (013–020)
const O_SB_TODAY_FILLED = "10000000-0000-0000-0000-000000000013";
const O_SB_TODAY_OPEN = "10000000-0000-0000-0000-000000000014";
const O_SB_YESTERDAY_CANCELED = "10000000-0000-0000-0000-000000000015";
const O_SB_TODAY_FAILED = "10000000-0000-0000-0000-000000000016";
const O_SB_LASTWEEK_FILLED = "10000000-0000-0000-0000-000000000017";
const O_FINTECH_OPEN = "10000000-0000-0000-0000-000000000018";
const O_FINTECH_FILLED = "10000000-0000-0000-0000-000000000019";
const O_ACME_FILLED2 = "10000000-0000-0000-0000-000000000020";

// Trades
const T_A = "30000000-0000-0000-0000-000000000001";
const T_A2 = "30000000-0000-0000-0000-000000000002";
const T_B = "30000000-0000-0000-0000-000000000003";
const T_ACME = "30000000-0000-0000-0000-000000000004";
const T_SB_TODAY = "30000000-0000-0000-0000-000000000005";
const T_SB_LASTWEEK = "30000000-0000-0000-0000-000000000006";
const T_FINTECH = "30000000-0000-0000-0000-000000000007";
const T_ACME2 = "30000000-0000-0000-0000-000000000008";

// Documents
const D_A_TERMS = "40000000-0000-0000-0000-000000000001";
const D_A_IDENTITY = "40000000-0000-0000-0000-000000000002";
const D_B_RISK = "40000000-0000-0000-0000-000000000003";
const D_B_ADDRESS = "40000000-0000-0000-0000-000000000004";
const D_C_IDENTITY = "40000000-0000-0000-0000-000000000005";
const D_C_ADDRESS = "40000000-0000-0000-0000-000000000006";

// Events (namespace 2000… keep existing 001–003)
const E_A_ORDER_CREATED = "20000000-0000-0000-0000-000000000001";
const E_A_ORDER_FILLED = "20000000-0000-0000-0000-000000000002";
const E_B_ORDER_FAILED = "20000000-0000-0000-0000-000000000003";
const E_B_ORDER_CREATED = "20000000-0000-0000-0000-000000000004";
const E_ACME_ORDER_FILLED = "20000000-0000-0000-0000-000000000005";
const E_FINTECH_ORDER_FAILED = "20000000-0000-0000-0000-000000000006";
const E_C_ORDER_CANCELED = "20000000-0000-0000-0000-000000000007";
const E_ACME_ORDER_CREATED = "20000000-0000-0000-0000-000000000008";
const E_FINTECH_ACCOUNT = "20000000-0000-0000-0000-000000000009";
const E_A_DOC_UPDATED = "20000000-0000-0000-0000-000000000010";
const E_SB_ORDER_FILLED = "20000000-0000-0000-0000-000000000011";
const E_SB_ORDER_FAILED = "20000000-0000-0000-0000-000000000012";
const E_FINTECH_ORDER_CREATED = "20000000-0000-0000-0000-000000000013";
const E_FINTECH_FILLED = "20000000-0000-0000-0000-000000000014";
const E_ACME_ORDER_FILLED2 = "20000000-0000-0000-0000-000000000015";

// Webhooks
const W_SB_ORDER_FAILED = "50000000-0000-0000-0000-000000000004";
const W_FINTECH_ORDER_FILLED = "50000000-0000-0000-0000-000000000005";
const W_A = "50000000-0000-0000-0000-000000000001";
const W_B = "50000000-0000-0000-0000-000000000002";
const W_ACME = "50000000-0000-0000-0000-000000000003";

// Issues
const I_STUCK = "60000000-0000-0000-0000-000000000001";
const I_FAILED = "60000000-0000-0000-0000-000000000002";
const I_WEBHOOK = "60000000-0000-0000-0000-000000000003";

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding database with demo data…");

  // ---- Spaces -----------------------------------------------------------
  const spaces = await Promise.all([
    db.space.upsert({
      where: { id: S_A },
      create: { id: S_A, name: "Demo Client A" },
      update: { name: "Demo Client A" },
    }),
    db.space.upsert({
      where: { id: S_B },
      create: { id: S_B, name: "Demo Client B" },
      update: { name: "Demo Client B" },
    }),
    db.space.upsert({
      where: { id: S_C },
      create: { id: S_C, name: "Demo Client C" },
      update: { name: "Demo Client C" },
    }),
    db.space.upsert({
      where: { id: S_ACME },
      create: { id: S_ACME, name: "Acme Wealth GmbH" },
      update: { name: "Acme Wealth GmbH" },
    }),
    db.space.upsert({
      where: { id: S_FINTECH },
      create: { id: S_FINTECH, name: "FinTech Startup KG" },
      update: { name: "FinTech Startup KG" },
    }),
    db.space.upsert({
      where: { id: S_SANDBOX },
      create: { id: S_SANDBOX, name: "Sandbox Dev Corp" },
      update: { name: "Sandbox Dev Corp" },
    }),
  ]);
  console.log(`  ✓ ${spaces.length} spaces`);

  // ---- Orders -----------------------------------------------------------
  const orders = await Promise.all([
    // [1] Demo Client A — open / stuck (10 min > 5 min threshold)
    db.order.upsert({
      where: { id: O_A_OPEN },
      create: {
        id: O_A_OPEN,
        spaceId: S_A,
        isin: "XF0000000046",
        side: "buy",
        quantity: "10.00000",
        limitPrice: null,
        status: "open",
        createdAt: ago(10),
      },
      update: {
        status: "open",
        createdAt: ago(10),
      },
    }),
    // [2] Demo Client A — filled
    db.order.upsert({
      where: { id: O_A_FILLED },
      create: {
        id: O_A_FILLED,
        spaceId: S_A,
        isin: "US0378331005",
        side: "sell",
        quantity: "5.00000",
        limitPrice: "150.00",
        status: "filled",
        createdAt: ago(60),
      },
      update: {
        status: "filled",
        createdAt: ago(60),
      },
    }),
    // [3] Demo Client B — failed
    db.order.upsert({
      where: { id: O_B_FAILED },
      create: {
        id: O_B_FAILED,
        spaceId: S_B,
        isin: "DE000BASF111",
        side: "buy",
        quantity: "20.00000",
        limitPrice: null,
        status: "failed",
        createdAt: ago(30),
      },
      update: {
        status: "failed",
        createdAt: ago(30),
      },
    }),
    // [4] Demo Client A — filled (second)
    db.order.upsert({
      where: { id: O_A_FILLED2 },
      create: {
        id: O_A_FILLED2,
        spaceId: S_A,
        isin: "US5949181045",
        side: "buy",
        quantity: "15.00000",
        limitPrice: "320.00",
        status: "filled",
        createdAt: ago(90),
      },
      update: {
        status: "filled",
        createdAt: ago(90),
      },
    }),
    // [5] Demo Client B — open / stuck (7 min > 5)
    db.order.upsert({
      where: { id: O_B_OPEN },
      create: {
        id: O_B_OPEN,
        spaceId: S_B,
        isin: "DE0007100000",
        side: "sell",
        quantity: "8.00000",
        limitPrice: "42.00",
        status: "open",
        createdAt: ago(7),
      },
      update: {
        status: "open",
        createdAt: ago(7),
      },
    }),
    // [6] Demo Client B — filled
    db.order.upsert({
      where: { id: O_B_FILLED },
      create: {
        id: O_B_FILLED,
        spaceId: S_B,
        isin: "LU1681045371",
        side: "buy",
        quantity: "50.00000",
        limitPrice: "85.00",
        status: "filled",
        createdAt: ago(120),
      },
      update: {
        status: "filled",
        createdAt: ago(120),
      },
    }),
    // [7] Demo Client C — open / recent (2 min — NOT stuck)
    db.order.upsert({
      where: { id: O_C_OPEN },
      create: {
        id: O_C_OPEN,
        spaceId: S_C,
        isin: "FR0000120271",
        side: "buy",
        quantity: "3.00000",
        limitPrice: null,
        status: "open",
        createdAt: ago(2),
      },
      update: {
        status: "open",
        createdAt: ago(2),
      },
    }),
    // [8] Demo Client C — canceled
    db.order.upsert({
      where: { id: O_C_CANCELED },
      create: {
        id: O_C_CANCELED,
        spaceId: S_C,
        isin: "US0378331005",
        side: "buy",
        quantity: "10.00000",
        limitPrice: "155.00",
        status: "canceled",
        createdAt: ago(45),
      },
      update: {
        status: "canceled",
        createdAt: ago(45),
      },
    }),
    // [9] Acme Wealth — filled
    db.order.upsert({
      where: { id: O_ACME_FILLED },
      create: {
        id: O_ACME_FILLED,
        spaceId: S_ACME,
        isin: "IE00BYX8XB24",
        side: "buy",
        quantity: "100.00000",
        limitPrice: "42.50",
        status: "filled",
        createdAt: ago(180),
      },
      update: {
        status: "filled",
        createdAt: ago(180),
      },
    }),
    // [10] Acme Wealth — canceled
    db.order.upsert({
      where: { id: O_ACME_CANCELED },
      create: {
        id: O_ACME_CANCELED,
        spaceId: S_ACME,
        isin: "DE000BASF111",
        side: "sell",
        quantity: "25.00000",
        limitPrice: null,
        status: "canceled",
        createdAt: ago(50),
      },
      update: {
        status: "canceled",
        createdAt: ago(50),
      },
    }),
    // [11] Acme Wealth — open / stuck (15 min > 5)
    db.order.upsert({
      where: { id: O_ACME_OPEN },
      create: {
        id: O_ACME_OPEN,
        spaceId: S_ACME,
        isin: "US0378331005",
        side: "sell",
        quantity: "30.00000",
        limitPrice: "180.00",
        status: "open",
        createdAt: ago(15),
      },
      update: {
        status: "open",
        createdAt: ago(15),
      },
    }),
    // [12] FinTech Startup — failed
    db.order.upsert({
      where: { id: O_FINTECH_FAILED },
      create: {
        id: O_FINTECH_FAILED,
        spaceId: S_FINTECH,
        isin: "XF0000000046",
        side: "buy",
        quantity: "1.00000",
        limitPrice: null,
        status: "failed",
        createdAt: ago(20),
      },
      update: {
        status: "failed",
        createdAt: ago(20),
      },
    }),
    // [13] Sandbox — today filled (dashboard test)
    db.order.upsert({
      where: { id: O_SB_TODAY_FILLED },
      create: {
        id: O_SB_TODAY_FILLED,
        spaceId: S_SANDBOX,
        isin: "US0378331005",
        side: "buy",
        quantity: "25.00000",
        limitPrice: "145.00",
        status: "filled",
        createdAt: ago(0.5),
      },
      update: {
        status: "filled",
        createdAt: ago(0.5),
      },
    }),
    // [14] Sandbox — today open (recent)
    db.order.upsert({
      where: { id: O_SB_TODAY_OPEN },
      create: {
        id: O_SB_TODAY_OPEN,
        spaceId: S_SANDBOX,
        isin: "DE000BASF111",
        side: "sell",
        quantity: "12.00000",
        limitPrice: "52.00",
        status: "open",
        createdAt: ago(0.1),
      },
      update: {
        status: "open",
        createdAt: ago(0.1),
      },
    }),
    // [15] Sandbox — yesterday canceled
    db.order.upsert({
      where: { id: O_SB_YESTERDAY_CANCELED },
      create: {
        id: O_SB_YESTERDAY_CANCELED,
        spaceId: S_SANDBOX,
        isin: "US5949181045",
        side: "buy",
        quantity: "8.00000",
        limitPrice: "310.00",
        status: "canceled",
        createdAt: ago(1440),
      },
      update: {
        status: "canceled",
        createdAt: ago(1440),
      },
    }),
    // [16] Sandbox — today failed
    db.order.upsert({
      where: { id: O_SB_TODAY_FAILED },
      create: {
        id: O_SB_TODAY_FAILED,
        spaceId: S_SANDBOX,
        isin: "XF0000000046",
        side: "sell",
        quantity: "5.00000",
        limitPrice: null,
        status: "failed",
        createdAt: ago(0.3),
      },
      update: {
        status: "failed",
        createdAt: ago(0.3),
      },
    }),
    // [17] Sandbox — last week filled
    db.order.upsert({
      where: { id: O_SB_LASTWEEK_FILLED },
      create: {
        id: O_SB_LASTWEEK_FILLED,
        spaceId: S_SANDBOX,
        isin: "IE00BYX8XB24",
        side: "buy",
        quantity: "200.00000",
        limitPrice: "44.00",
        status: "filled",
        createdAt: ago(10080),
      },
      update: {
        status: "filled",
        createdAt: ago(10080),
      },
    }),
    // [18] FinTech Startup — open
    db.order.upsert({
      where: { id: O_FINTECH_OPEN },
      create: {
        id: O_FINTECH_OPEN,
        spaceId: S_FINTECH,
        isin: "LU1681045371",
        side: "buy",
        quantity: "3.00000",
        limitPrice: "90.00",
        status: "open",
        createdAt: ago(1),
      },
      update: {
        status: "open",
        createdAt: ago(1),
      },
    }),
    // [19] FinTech Startup — filled
    db.order.upsert({
      where: { id: O_FINTECH_FILLED },
      create: {
        id: O_FINTECH_FILLED,
        spaceId: S_FINTECH,
        isin: "FR0000120271",
        side: "sell",
        quantity: "7.00000",
        limitPrice: "210.00",
        status: "filled",
        createdAt: ago(100),
      },
      update: {
        status: "filled",
        createdAt: ago(100),
      },
    }),
    // [20] Acme Wealth — filled (second)
    db.order.upsert({
      where: { id: O_ACME_FILLED2 },
      create: {
        id: O_ACME_FILLED2,
        spaceId: S_ACME,
        isin: "XF0000000046",
        side: "buy",
        quantity: "60.00000",
        limitPrice: "15.50",
        status: "filled",
        createdAt: ago(200),
      },
      update: {
        status: "filled",
        createdAt: ago(200),
      },
    }),
  ]);
  console.log(`  ✓ ${orders.length} orders`);

  // ---- Trades (linked to filled orders) ---------------------------------
  const trades = await Promise.all([
    db.trade.upsert({
      where: { id: T_A },
      create: {
        id: T_A,
        orderId: O_A_FILLED,
        isin: "US0378331005",
        side: "sell",
        price: "150.25",
        quantity: "5.00000",
        createdAt: ago(58),
      },
      update: {
        price: "150.25",
        quantity: "5.00000",
        createdAt: ago(58),
      },
    }),
    db.trade.upsert({
      where: { id: T_A2 },
      create: {
        id: T_A2,
        orderId: O_A_FILLED2,
        isin: "US5949181045",
        side: "buy",
        price: "320.10",
        quantity: "15.00000",
        createdAt: ago(88),
      },
      update: {
        price: "320.10",
        quantity: "15.00000",
        createdAt: ago(88),
      },
    }),
    db.trade.upsert({
      where: { id: T_B },
      create: {
        id: T_B,
        orderId: O_B_FILLED,
        isin: "LU1681045371",
        side: "buy",
        price: "85.00",
        quantity: "50.00000",
        createdAt: ago(118),
      },
      update: {
        price: "85.00",
        quantity: "50.00000",
        createdAt: ago(118),
      },
    }),
    db.trade.upsert({
      where: { id: T_ACME },
      create: {
        id: T_ACME,
        orderId: O_ACME_FILLED,
        isin: "IE00BYX8XB24",
        side: "buy",
        price: "42.50",
        quantity: "100.00000",
        createdAt: ago(178),
      },
      update: {
        price: "42.50",
        quantity: "100.00000",
        createdAt: ago(178),
      },
    }),
    // Sandbox today fill
    db.trade.upsert({
      where: { id: T_SB_TODAY },
      create: {
        id: T_SB_TODAY,
        orderId: O_SB_TODAY_FILLED,
        isin: "US0378331005",
        side: "buy",
        price: "145.00",
        quantity: "25.00000",
        createdAt: ago(0.4),
      },
      update: {
        price: "145.00",
        quantity: "25.00000",
        createdAt: ago(0.4),
      },
    }),
    // Sandbox last week fill
    db.trade.upsert({
      where: { id: T_SB_LASTWEEK },
      create: {
        id: T_SB_LASTWEEK,
        orderId: O_SB_LASTWEEK_FILLED,
        isin: "IE00BYX8XB24",
        side: "buy",
        price: "44.00",
        quantity: "200.00000",
        createdAt: ago(10078),
      },
      update: {
        price: "44.00",
        quantity: "200.00000",
        createdAt: ago(10078),
      },
    }),
    // FinTech fill
    db.trade.upsert({
      where: { id: T_FINTECH },
      create: {
        id: T_FINTECH,
        orderId: O_FINTECH_FILLED,
        isin: "FR0000120271",
        side: "sell",
        price: "210.00",
        quantity: "7.00000",
        createdAt: ago(98),
      },
      update: {
        price: "210.00",
        quantity: "7.00000",
        createdAt: ago(98),
      },
    }),
    // Acme second fill
    db.trade.upsert({
      where: { id: T_ACME2 },
      create: {
        id: T_ACME2,
        orderId: O_ACME_FILLED2,
        isin: "XF0000000046",
        side: "buy",
        price: "15.50",
        quantity: "60.00000",
        createdAt: ago(198),
      },
      update: {
        price: "15.50",
        quantity: "60.00000",
        createdAt: ago(198),
      },
    }),
  ]);
  console.log(`  ✓ ${trades.length} trades`);

  // ---- Documents --------------------------------------------------------
  const docs = await Promise.all([
    db.document.upsert({
      where: { id: D_A_TERMS },
      create: {
        id: D_A_TERMS,
        spaceId: S_A,
        type: "terms_of_service",
        status: "approved",
        createdAt: ago(1440),
      },
      update: { status: "approved" },
    }),
    db.document.upsert({
      where: { id: D_A_IDENTITY },
      create: {
        id: D_A_IDENTITY,
        spaceId: S_A,
        type: "identity_verification",
        status: "pending",
        createdAt: ago(120),
      },
      update: { status: "pending" },
    }),
    db.document.upsert({
      where: { id: D_B_RISK },
      create: {
        id: D_B_RISK,
        spaceId: S_B,
        type: "risk_disclosure",
        status: "approved",
        createdAt: ago(2880),
      },
      update: { status: "approved" },
    }),
    db.document.upsert({
      where: { id: D_B_ADDRESS },
      create: {
        id: D_B_ADDRESS,
        spaceId: S_B,
        type: "proof_of_address",
        status: "rejected",
        rejectReason:
          "Document is illegible — please upload a higher-resolution scan",
        createdAt: ago(180),
      },
      update: {
        status: "rejected",
        rejectReason:
          "Document is illegible — please upload a higher-resolution scan",
      },
    }),
    db.document.upsert({
      where: { id: D_C_IDENTITY },
      create: {
        id: D_C_IDENTITY,
        spaceId: S_C,
        type: "identity_verification",
        status: "pending",
        createdAt: ago(15),
      },
      update: { status: "pending" },
    }),
    db.document.upsert({
      where: { id: D_C_ADDRESS },
      create: {
        id: D_C_ADDRESS,
        spaceId: S_C,
        type: "proof_of_address",
        status: "rejected",
        rejectReason:
          "Utility bill dated more than 3 months ago — please provide a current bill",
        createdAt: ago(60),
      },
      update: {
        status: "rejected",
        rejectReason:
          "Utility bill dated more than 3 months ago — please provide a current bill",
      },
    }),
  ]);
  console.log(`  ✓ ${docs.length} documents`);

  // ---- Events -----------------------------------------------------------
  const events = await Promise.all([
    // Keep existing 001–003
    db.event.upsert({
      where: { id: E_A_ORDER_CREATED },
      create: {
        id: E_A_ORDER_CREATED,
        spaceId: S_A,
        type: "order.created",
        payload: JSON.stringify({
          order_id: O_A_OPEN,
          isin: "XF0000000046",
          side: "buy",
          quantity: "10.00000",
        }),
        createdAt: ago(10),
      },
      update: { createdAt: ago(10) },
    }),
    db.event.upsert({
      where: { id: E_A_ORDER_FILLED },
      create: {
        id: E_A_ORDER_FILLED,
        spaceId: S_A,
        type: "order.filled",
        payload: JSON.stringify({
          order_id: O_A_FILLED,
          isin: "US0378331005",
          fill_price: "150.2500",
          fill_quantity: "5.00000",
        }),
        createdAt: ago(60),
      },
      update: { createdAt: ago(60) },
    }),
    db.event.upsert({
      where: { id: E_B_ORDER_FAILED },
      create: {
        id: E_B_ORDER_FAILED,
        spaceId: S_B,
        type: "order.failed",
        payload: JSON.stringify({
          order_id: O_B_FAILED,
          isin: "DE000BASF111",
          reason: "insufficient_funds",
        }),
        createdAt: ago(30),
      },
      update: { createdAt: ago(30) },
    }),
    // New events 004–010
    // order.created for Demo Client B
    db.event.upsert({
      where: { id: E_B_ORDER_CREATED },
      create: {
        id: E_B_ORDER_CREATED,
        spaceId: S_B,
        type: "order.created",
        payload: JSON.stringify({
          order_id: O_B_OPEN,
          isin: "DE0007100000",
          side: "sell",
          quantity: "8.00000",
          limit_price: "42.00",
        }),
        createdAt: ago(7),
      },
      update: { createdAt: ago(7) },
    }),
    // order.filled for Acme Wealth
    db.event.upsert({
      where: { id: E_ACME_ORDER_FILLED },
      create: {
        id: E_ACME_ORDER_FILLED,
        spaceId: S_ACME,
        type: "order.filled",
        payload: JSON.stringify({
          order_id: O_ACME_FILLED,
          isin: "IE00BYX8XB24",
          fill_price: "42.5000",
          fill_quantity: "100.00000",
        }),
        createdAt: ago(180),
      },
      update: { createdAt: ago(180) },
    }),
    // order.failed for FinTech Startup
    db.event.upsert({
      where: { id: E_FINTECH_ORDER_FAILED },
      create: {
        id: E_FINTECH_ORDER_FAILED,
        spaceId: S_FINTECH,
        type: "order.failed",
        payload: JSON.stringify({
          order_id: O_FINTECH_FAILED,
          isin: "XF0000000046",
          reason: "market_not_open",
        }),
        createdAt: ago(20),
      },
      update: { createdAt: ago(20) },
    }),
    // order.canceled for Demo Client C
    db.event.upsert({
      where: { id: E_C_ORDER_CANCELED },
      create: {
        id: E_C_ORDER_CANCELED,
        spaceId: S_C,
        type: "order.canceled",
        payload: JSON.stringify({
          order_id: O_C_CANCELED,
          isin: "US0378331005",
          reason: "client_request",
        }),
        createdAt: ago(45),
      },
      update: { createdAt: ago(45) },
    }),
    // order.created for Acme Wealth (stuck order)
    db.event.upsert({
      where: { id: E_ACME_ORDER_CREATED },
      create: {
        id: E_ACME_ORDER_CREATED,
        spaceId: S_ACME,
        type: "order.created",
        payload: JSON.stringify({
          order_id: O_ACME_OPEN,
          isin: "US0378331005",
          side: "sell",
          quantity: "30.00000",
          limit_price: "180.00",
        }),
        createdAt: ago(15),
      },
      update: { createdAt: ago(15) },
    }),
    // account.created for FinTech Startup KG
    db.event.upsert({
      where: { id: E_FINTECH_ACCOUNT },
      create: {
        id: E_FINTECH_ACCOUNT,
        spaceId: S_FINTECH,
        type: "account.created",
        payload: JSON.stringify({
          space_id: S_FINTECH,
          name: "FinTech Startup KG",
          onboarding_complete: true,
        }),
        createdAt: ago(480),
      },
      update: { createdAt: ago(480) },
    }),
    // document.updated for Demo Client A
    db.event.upsert({
      where: { id: E_A_DOC_UPDATED },
      create: {
        id: E_A_DOC_UPDATED,
        spaceId: S_A,
        type: "document.updated",
        payload: JSON.stringify({
          document_id: D_A_TERMS,
          new_status: "approved",
        }),
        createdAt: ago(1440),
      },
      update: { createdAt: ago(1440) },
    }),
    // order.filled — Sandbox today
    db.event.upsert({
      where: { id: E_SB_ORDER_FILLED },
      create: {
        id: E_SB_ORDER_FILLED,
        spaceId: S_SANDBOX,
        type: "order.filled",
        payload: JSON.stringify({
          order_id: O_SB_TODAY_FILLED,
          isin: "US0378331005",
          fill_price: "145.0000",
          fill_quantity: "25.00000",
        }),
        createdAt: ago(0.4),
      },
      update: { createdAt: ago(0.4) },
    }),
    // order.failed — Sandbox today
    db.event.upsert({
      where: { id: E_SB_ORDER_FAILED },
      create: {
        id: E_SB_ORDER_FAILED,
        spaceId: S_SANDBOX,
        type: "order.failed",
        payload: JSON.stringify({
          order_id: O_SB_TODAY_FAILED,
          isin: "XF0000000046",
          reason: "insufficient_liquidity",
        }),
        createdAt: ago(0.3),
      },
      update: { createdAt: ago(0.3) },
    }),
    // order.created — FinTech open order
    db.event.upsert({
      where: { id: E_FINTECH_ORDER_CREATED },
      create: {
        id: E_FINTECH_ORDER_CREATED,
        spaceId: S_FINTECH,
        type: "order.created",
        payload: JSON.stringify({
          order_id: O_FINTECH_OPEN,
          isin: "LU1681045371",
          side: "buy",
          quantity: "3.00000",
          limit_price: "90.00",
        }),
        createdAt: ago(1),
      },
      update: { createdAt: ago(1) },
    }),
    // order.filled — FinTech
    db.event.upsert({
      where: { id: E_FINTECH_FILLED },
      create: {
        id: E_FINTECH_FILLED,
        spaceId: S_FINTECH,
        type: "order.filled",
        payload: JSON.stringify({
          order_id: O_FINTECH_FILLED,
          isin: "FR0000120271",
          fill_price: "210.0000",
          fill_quantity: "7.00000",
        }),
        createdAt: ago(98),
      },
      update: { createdAt: ago(98) },
    }),
    // order.filled — Acme second
    db.event.upsert({
      where: { id: E_ACME_ORDER_FILLED2 },
      create: {
        id: E_ACME_ORDER_FILLED2,
        spaceId: S_ACME,
        type: "order.filled",
        payload: JSON.stringify({
          order_id: O_ACME_FILLED2,
          isin: "XF0000000046",
          fill_price: "15.5000",
          fill_quantity: "60.00000",
        }),
        createdAt: ago(198),
      },
      update: { createdAt: ago(198) },
    }),
  ]);
  console.log(`  ✓ ${events.length} events`);

  // ---- Webhooks ---------------------------------------------------------
  const webhooks = await Promise.all([
    db.webhook.upsert({
      where: { id: W_A },
      create: {
        id: W_A,
        spaceId: S_A,
        eventType: "order.created",
        payload: JSON.stringify({
          order_id: O_A_OPEN,
          isin: "XF0000000046",
        }),
        status: "delivered",
        createdAt: ago(10),
      },
      update: { status: "delivered" },
    }),
    db.webhook.upsert({
      where: { id: W_B },
      create: {
        id: W_B,
        spaceId: S_B,
        eventType: "order.failed",
        payload: JSON.stringify({
          order_id: O_B_FAILED,
          reason: "insufficient_funds",
        }),
        status: "delivered",
        createdAt: ago(30),
      },
      update: { status: "delivered" },
    }),
    db.webhook.upsert({
      where: { id: W_ACME },
      create: {
        id: W_ACME,
        spaceId: S_ACME,
        eventType: "order.filled",
        payload: JSON.stringify({
          order_id: O_ACME_FILLED,
          isin: "IE00BYX8XB24",
        }),
        status: "failed",
        createdAt: ago(180),
      },
      update: { status: "failed" },
    }),
    // Sandbox order failed webhook
    db.webhook.upsert({
      where: { id: W_SB_ORDER_FAILED },
      create: {
        id: W_SB_ORDER_FAILED,
        spaceId: S_SANDBOX,
        eventType: "order.failed",
        payload: JSON.stringify({
          order_id: O_SB_TODAY_FAILED,
          reason: "insufficient_liquidity",
        }),
        status: "pending",
        createdAt: ago(0.3),
      },
      update: { status: "pending" },
    }),
    // FinTech order filled webhook
    db.webhook.upsert({
      where: { id: W_FINTECH_ORDER_FILLED },
      create: {
        id: W_FINTECH_ORDER_FILLED,
        spaceId: S_FINTECH,
        eventType: "order.filled",
        payload: JSON.stringify({
          order_id: O_FINTECH_FILLED,
          isin: "FR0000120271",
        }),
        status: "delivered",
        createdAt: ago(98),
      },
      update: { status: "delivered" },
    }),
  ]);
  console.log(`  ✓ ${webhooks.length} webhooks`);

  // ---- Issues -----------------------------------------------------------
  const issues = await Promise.all([
    // Open critical: stuck order on Space A
    db.issue.upsert({
      where: { id: I_STUCK },
      create: {
        id: I_STUCK,
        spaceId: S_A,
        type: "stuck_order",
        severity: "critical",
        description: `Order ${O_A_OPEN.slice(0, 8)} for XF0000000046 has been open for over 10 minutes`,
        details: JSON.stringify({
          order_id: O_A_OPEN,
          isin: "XF0000000046",
          side: "buy",
          quantity: "10.00000",
          created_at: ago(10).toISOString(),
        }),
        status: "open",
        createdAt: ago(5),
      },
      update: { status: "open" },
    }),
    // Open high: trade failed on Space B
    db.issue.upsert({
      where: { id: I_FAILED },
      create: {
        id: I_FAILED,
        spaceId: S_B,
        type: "trade_failed",
        severity: "high",
        description: `Order ${O_B_FAILED.slice(0, 8)} for DE000BASF111 failed due to insufficient funds`,
        details: JSON.stringify({
          order_id: O_B_FAILED,
          isin: "DE000BASF111",
          reason: "insufficient_funds",
        }),
        status: "open",
        createdAt: ago(30),
      },
      update: { status: "open" },
    }),
    // Resolved: webhook delivery failure on Space FinTech
    db.issue.upsert({
      where: { id: I_WEBHOOK },
      create: {
        id: I_WEBHOOK,
        spaceId: S_FINTECH,
        type: "webhook_delivery_failed",
        severity: "medium",
        description:
          "Webhook delivery failed for order.filled event — endpoint returned 502",
        details: JSON.stringify({
          webhook_id: W_ACME,
          event_type: "order.filled",
          endpoint: "https://webhook.example.com/lemon",
          http_status: 502,
        }),
        status: "resolved",
        resolvedAt: ago(120),
        notes:
          "Endpoint was temporarily unreachable. Automatically retried and succeeded after 30s.",
        createdAt: ago(180),
      },
      update: { status: "resolved" },
    }),
  ]);
  console.log(`  ✓ ${issues.length} issues`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
