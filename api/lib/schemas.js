import { z } from 'zod';

const BigIntString = z.string().regex(/^\d+$/).transform((val) => BigInt(val));

export const ExpenseSchema = z.object({
  group_id: BigIntString.optional(),
  category_id: BigIntString,
  description: z.string().optional(),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  paid_by: BigIntString.optional(),
});

export const IncomeSchema = z.object({
  group_id: BigIntString,
  amount: z.number().positive(),
  user: BigIntString.optional(),
});

export const GroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const schemas = {
  Expense: ExpenseSchema,
  Income: IncomeSchema,
  Group: GroupSchema,
};
