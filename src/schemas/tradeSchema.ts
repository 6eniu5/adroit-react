import { z } from 'zod';

// Custom validator for the timestamp format returned by the API
const apiDatetimeString = z.string().refine(
  (value) => {
    // Allow any string that resembles an ISO-8601 date string with timezone
    // This is more permissive than z.string().datetime() to handle various timezone formats
    try {
      return !isNaN(new Date(value).getTime());
    } catch {
      return false;
    }
  },
  {
    message: "Invalid datetime format",
  }
);

// Single trade schema
export const stockTradeSchema = z.object({
  id: z.number().int().positive(),
  timestamp: apiDatetimeString,
  tradeSize: z.number().int().nonnegative(),
  price: z.number().positive().multipleOf(0.01),
  symbol: z.enum(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'])
});

// Array of trades
export const stockTradeArraySchema = z.array(stockTradeSchema);

// Frontend model schema (matches StockTradeData interface)
export const stockTradeDataSchema = z.object({
  id: z.string(),
  timeStamp: z.string(),
  tradeSize: z.number().int().nonnegative(),
  price: z.number().positive().multipleOf(0.01),
  symbol: z.enum(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'])
});

// Array of frontend model trades
export const stockTradeDataArraySchema = z.array(stockTradeDataSchema);

// Request parameters schema
export const tradeRequestParamsSchema = z.object({
  startTimestamp: z.string(),
  minQuoteSize: z.number().int().nonnegative()
});

// Error response schema
export const errorResponseSchema = z.object({
  message: z.string()
});

// Extract types from schemas
export type StockTrade = z.infer<typeof stockTradeSchema>;
export type StockTradeArray = z.infer<typeof stockTradeArraySchema>;
export type StockTradeData = z.infer<typeof stockTradeDataSchema>;
export type StockTradeDataArray = z.infer<typeof stockTradeDataArraySchema>;
export type TradeRequestParams = z.infer<typeof tradeRequestParamsSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;