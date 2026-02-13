import { z } from "zod";

// Alert schemas
export const alertConditionTypes = [
  "PRICE_GT",
  "PRICE_LT",
  "PRICE_CROSS_ABOVE",
  "PRICE_CROSS_BELOW",
  "PERCENT_CHANGE_GT",
  "PERCENT_CHANGE_LT",
  "VOLUME_SPIKE",
  "CUSTOM",
] as const;

export const alertRecurrenceTypes = ["ONCE", "DAILY", "CONTINUOUS"] as const;

export const exchangeTypes = ["NSE", "NFO", "MCX"] as const;

export const createAlertSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1, "Symbol is required")
    .max(50, "Symbol must be less than 50 characters")
    .toUpperCase(),
  condition_type: z.enum(alertConditionTypes, {
    required_error: "Condition type is required",
  }),
  threshold: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? null : Number(val)),
    z.number().positive("Threshold must be positive").nullable()
  ),
  recurrence: z.enum(alertRecurrenceTypes).default("ONCE"),
  expires_at: z.string().optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional().nullable(),
  telegram_enabled: z.boolean().default(false),
  instrument_id: z.string().optional().nullable(),
  exchange: z.enum(exchangeTypes).default("NSE"),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;

// Trade schemas
export const marketSegments = [
  "Equity_Intraday",
  "Equity_Positional",
  "Futures",
  "Options",
  "Commodities",
] as const;

export const tradeTypes = ["BUY", "SELL"] as const;

export const timeframes = [
  "1min",
  "5min",
  "15min",
  "30min",
  "1H",
  "4H",
  "1D",
  "1W",
] as const;

export const createTradeSchema = z.object({
  symbol: z
    .string()
    .trim()
    .max(50, "Symbol must be less than 50 characters")
    .toUpperCase()
    .optional(),
  segment: z.enum(marketSegments, {
    required_error: "Segment is required",
  }),
  trade_type: z.enum(tradeTypes, {
    required_error: "Trade type is required",
  }),
  quantity: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 1 : Number(val)),
    z.number().int().positive().optional().default(1)
  ),
  entry_price: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? null : Number(val)),
    z.number().positive().nullable().optional()
  ),
  stop_loss: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? null : Number(val)),
    z.number().positive().nullable().optional()
  ),
  targets: z.array(z.number().positive()).max(5).optional().nullable(),
  rating: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? null : Number(val)),
    z.number().int().min(1).max(10).nullable().optional()
  ),
  confidence_score: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? null : Number(val)),
    z.number().int().min(1).max(5).nullable().optional()
  ),
  timeframe: z.enum(timeframes).optional(),
  holding_period: z.string().max(50).optional(),
  trailing_sl_enabled: z.boolean().default(false),
  trailing_sl_percent: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? null : Number(val)),
    z.number().positive().max(50).nullable().optional()
  ),
  trailing_sl_points: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? null : Number(val)),
    z.number().positive().nullable().optional()
  ),
  trailing_sl_trigger_price: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? null : Number(val)),
    z.number().positive().nullable().optional()
  ),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  study_id: z.string().uuid().optional(),
  chart_images: z.array(z.string().url()).max(5).optional(),
  // New automation fields
  auto_track_enabled: z.boolean().optional().default(false),
  telegram_post_enabled: z.boolean().optional().default(false),
  instrument_token: z.string().optional().nullable(),
  contract_key: z.string().optional().nullable(),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;

// Study schemas
export const studyCategories = [
  "Technical",
  "Fundamental",
  "News",
  "Sentiment",
  "Other",
] as const;

export const createStudySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  symbol: z
    .string()
    .trim()
    .min(1, "Symbol is required")
    .max(20, "Symbol must be less than 20 characters")
    .toUpperCase(),
  category: z.enum(studyCategories).default("Technical"),
  notes: z.string().max(5000, "Notes must be less than 5000 characters").optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export type CreateStudyInput = z.infer<typeof createStudySchema>;
