import { z } from "zod";

// Alert schemas
export const alertConditionTypes = [
  "PRICE_GT",
  "PRICE_LT",
  "PERCENT_CHANGE_GT",
  "PERCENT_CHANGE_LT",
  "VOLUME_SPIKE",
  "CUSTOM",
] as const;

export const alertRecurrenceTypes = ["ONCE", "DAILY", "CONTINUOUS"] as const;

export const createAlertSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1, "Symbol is required")
    .max(20, "Symbol must be less than 20 characters")
    .toUpperCase(),
  condition_type: z.enum(alertConditionTypes, {
    required_error: "Condition type is required",
  }),
  threshold: z
    .number({ invalid_type_error: "Threshold must be a number" })
    .positive("Threshold must be positive"),
  recurrence: z.enum(alertRecurrenceTypes).default("ONCE"),
  expires_at: z.string().optional(),
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
    .min(1, "Symbol is required")
    .max(20, "Symbol must be less than 20 characters")
    .toUpperCase(),
  segment: z.enum(marketSegments, {
    required_error: "Segment is required",
  }),
  trade_type: z.enum(tradeTypes, {
    required_error: "Trade type is required",
  }),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be positive")
    .optional()
    .default(1),
  entry_price: z
    .number({ invalid_type_error: "Entry price must be a number" })
    .positive("Entry price must be positive"),
  stop_loss: z
    .number({ invalid_type_error: "Stop loss must be a number" })
    .positive("Stop loss must be positive")
    .optional(),
  targets: z.array(z.number().positive()).max(3).optional(),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(10, "Rating must be at most 10")
    .optional(),
  confidence_score: z
    .number()
    .int()
    .min(1, "Confidence must be at least 1")
    .max(5, "Confidence must be at most 5")
    .optional(),
  timeframe: z.enum(timeframes).optional(),
  holding_period: z.string().max(50).optional(),
  trailing_sl_enabled: z.boolean().default(false),
  trailing_sl_percent: z
    .number()
    .positive("Trailing SL percent must be positive")
    .max(50, "Trailing SL percent must be at most 50%")
    .optional(),
  trailing_sl_points: z
    .number()
    .positive("Trailing SL points must be positive")
    .optional(),
  trailing_sl_trigger_price: z
    .number()
    .positive("Trigger price must be positive")
    .optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  study_id: z.string().uuid().optional(),
  chart_images: z.array(z.string().url()).max(5).optional(),
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
