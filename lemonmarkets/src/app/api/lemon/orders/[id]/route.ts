import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toSnakeCase } from "@/lib/demo-transform";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!process.env.LEMON_MARKETS_API_KEY) {
    try {
      const body = await request.json();
      // Allow updating status, quantity, limitPrice
      const data: Record<string, unknown> = {};
      if (body.status) data.status = body.status;
      if (body.quantity) data.quantity = body.quantity;
      if (body.limit_price !== undefined) data.limitPrice = body.limit_price;

      const order = await db.order.update({ where: { id }, data });
      return NextResponse.json({ ok: true, data: toSnakeCase(order as Record<string, unknown>) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: false, message: "Live API not supported" }, { status: 501 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!process.env.LEMON_MARKETS_API_KEY) {
    try {
      await db.order.delete({ where: { id } });
      return NextResponse.json({ ok: true, message: "Order deleted" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: false, message: "Live API not supported" }, { status: 501 });
}
