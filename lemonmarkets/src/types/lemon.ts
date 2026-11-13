import { z } from "zod";

export const OrderStatus = z.enum(["open", "filled", "canceled", "failed"]);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  space_id: z.string().uuid(),
  isin: z.string().length(12),
  side: z.enum(["buy", "sell"]),
  quantity: z.string(),
  limit_price: z.string().nullable(),
  status: OrderStatus,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type LemonOrder = z.infer<typeof OrderSchema>;

export const SpaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  created_at: z.string().datetime(),
});
export type LemonSpace = z.infer<typeof SpaceSchema>;

export const TradeSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  isin: z.string().length(12),
  side: z.enum(["buy", "sell"]),
  price: z.string(),
  quantity: z.string(),
  created_at: z.string().datetime(),
});
export type LemonTrade = z.infer<typeof TradeSchema>;

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  space_id: z.string().uuid(),
  type: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  reject_reason: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type LemonDocument = z.infer<typeof DocumentSchema>;

export const EventSchema = z.object({
  id: z.string().uuid(),
  space_id: z.string().uuid(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()),
  created_at: z.string().datetime(),
});
export type LemonEvent = z.infer<typeof EventSchema>;

// API response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    results: z.array(data),
    next: z.string().nullable(),
    previous: z.string().nullable(),
  });

// Proxy API response formats
export type ProxyResponse<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };
