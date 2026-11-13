import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toSnakeCase } from "@/lib/demo-transform";

type DemoFetcher<T> = () => Promise<T[]>;
type ApiFetcher = () => Promise<unknown>;

interface ApiHandlerOptions {
  demoFetcher: DemoFetcher<Record<string, unknown>>;
  apiFetcher: ApiFetcher;
}

export async function apiHandler(options: ApiHandlerOptions) {
  if (!process.env.LEMON_MARKETS_API_KEY) {
    try {
      const data = await options.demoFetcher();
      return NextResponse.json({
        ok: true,
        data: { results: data.map(toSnakeCase) },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { ok: false, code: "DB_ERROR", message },
        { status: 500 },
      );
    }
  }
  try {
    const data = await options.apiFetcher();
    return NextResponse.json({ ok: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, code: "API_ERROR", message },
      { status: 500 },
    );
  }
}
