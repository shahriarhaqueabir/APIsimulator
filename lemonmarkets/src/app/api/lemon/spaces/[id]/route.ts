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
      if (!body.name || typeof body.name !== "string") {
        return NextResponse.json({ ok: false, message: "name is required" }, { status: 400 });
      }
      const space = await db.space.update({ where: { id }, data: { name: body.name } });
      return NextResponse.json({ ok: true, data: toSnakeCase(space as Record<string, unknown>) });
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
      await db.space.delete({ where: { id } });
      return NextResponse.json({ ok: true, message: "Space deleted" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: false, message: "Live API not supported" }, { status: 501 });
}
