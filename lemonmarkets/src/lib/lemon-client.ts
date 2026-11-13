import {
  OrderSchema,
  SpaceSchema,
  TradeSchema,
  DocumentSchema,
  EventSchema,
  ApiResponseSchema,
} from "@/types/lemon";

const BASE_URL =
  process.env.LEMON_MARKETS_BASE_URL || "https://paper.lemon.markets/v1";
const API_KEY = process.env.LEMON_MARKETS_API_KEY;

class LemonApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "LemonApiError";
  }
}

async function fetchLemon<T>(
  path: string,
  options?: { params?: Record<string, string>; signal?: AbortSignal },
): Promise<T> {
  if (!API_KEY) {
    throw new LemonApiError(
      401,
      "NO_API_KEY",
      "LEMON_MARKETS_API_KEY is not configured",
    );
  }

  const url = new URL(`${BASE_URL}${path}`);
  if (options?.params) {
    for (const [k, v] of Object.entries(options.params)) {
      if (v !== undefined) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    signal: options?.signal,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new LemonApiError(
      res.status,
      body.code || "UNKNOWN",
      body.message || `API returned ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}

export const lemonApi = {
  async getSpaces(signal?: AbortSignal) {
    const schema = ApiResponseSchema(SpaceSchema);
    return schema.parse(await fetchLemon<unknown>("/spaces", { signal }));
  },

  async getOrders(params?: {
    space_id?: string;
    status?: string;
    limit?: string;
    signal?: AbortSignal;
  }) {
    const { signal, ...rest } = params || {};
    const schema = ApiResponseSchema(OrderSchema);
    return schema.parse(
      await fetchLemon<unknown>("/trading/orders", { params: rest, signal }),
    );
  },

  async getTrades(params?: { order_id?: string; signal?: AbortSignal }) {
    const { signal, ...rest } = params || {};
    const schema = ApiResponseSchema(TradeSchema);
    return schema.parse(
      await fetchLemon<unknown>("/trading/trades", { params: rest, signal }),
    );
  },

  async getDocuments(params?: {
    space_id?: string;
    status?: string;
    signal?: AbortSignal;
  }) {
    const { signal, ...rest } = params || {};
    const schema = ApiResponseSchema(DocumentSchema);
    return schema.parse(
      await fetchLemon<unknown>("/documents", { params: rest, signal }),
    );
  },

  async getEvents(params?: {
    space_id?: string;
    type?: string;
    limit?: string;
    signal?: AbortSignal;
  }) {
    const { signal, ...rest } = params || {};
    const schema = ApiResponseSchema(EventSchema);
    return schema.parse(
      await fetchLemon<unknown>("/events", { params: rest, signal }),
    );
  },
};

export { LemonApiError };
