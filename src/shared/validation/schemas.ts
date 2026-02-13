import { z } from "zod";

/**
 * Request validation schemas using Zod
 */

// Query params schemas
export const shipIdYearQuerySchema = z.object({
  shipId: z.string().min(1, "Ship ID is required"),
  year: z.string().regex(/^\d{4}$/, "Year must be a 4-digit number")
});

// Route schemas
export const setBaselineParamsSchema = z.object({
  id: z.string().min(1, "Route ID is required")
});

// Banking schemas
export const bankSurplusSchema = z.object({
  shipId: z.string().min(1, "Ship ID is required"),
  year: z.number().int().min(2024).max(2050, "Invalid year")
});

export const applyBankSchema = z.object({
  shipId: z.string().min(1, "Ship ID is required"),
  year: z.number().int().min(2024).max(2050, "Invalid year"),
  amount: z.number().positive("Amount must be positive")
});

// Pooling schemas
export const poolMemberSchema = z.object({
  shipId: z.string().min(1, "Ship ID is required"),
  cbBefore: z.number(),
  cbAfter: z.number().optional(),
  year: z.number().int().min(2024).max(2050).optional()
});

export const createPoolSchema = z.object({
  members: z.array(poolMemberSchema).min(2, "Pool must have at least 2 members"),
  year: z.number().int().min(2024).max(2050).optional()
});

// Type exports
export type ShipIdYearQuery = z.infer<typeof shipIdYearQuerySchema>;
export type SetBaselineParams = z.infer<typeof setBaselineParamsSchema>;
export type BankSurplusBody = z.infer<typeof bankSurplusSchema>;
export type ApplyBankBody = z.infer<typeof applyBankSchema>;
export type PoolMember = z.infer<typeof poolMemberSchema>;
export type CreatePoolBody = z.infer<typeof createPoolSchema>;
