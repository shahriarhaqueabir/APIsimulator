import { NextResponse } from "next/server"

export async function GET() {
  const hasApiKey = !!process.env.LEMON_MARKETS_API_KEY

  return NextResponse.json({
    ok: hasApiKey,
    status: hasApiKey ? "connected" : "no_api_key",
    message: hasApiKey
      ? "API key is configured"
      : "LEMON_MARKETS_API_KEY is not set. Using demo mode.",
  })
}
