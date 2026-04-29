import { z } from "zod";
import type {
  Expense,
  Income,
  Group,
  BudgetCategory,
  User,
} from "../../src/api/types";

const BigIntString = z.string().regex(/^\d+$/);

export const GroupSchema: z.ZodType<
  Pick<Group, "name" | "description">,
  z.ZodTypeDef,
  { name: string; description?: string | null }
> = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional().default(null),
});

export const BudgetCategorySchema: z.ZodType<
  Pick<BudgetCategory, "group_id" | "name">,
  z.ZodTypeDef,
  { group_id?: string | null; name: string }
> = z.object({
  group_id: BigIntString,
  name: z.string().min(1),
});

export const UserSchema: z.ZodType<
  Pick<User, "auth_id" | "name">,
  z.ZodTypeDef,
  { auth_id?: string | null; name: string }
> = z.object({
  auth_id: z.string().uuid().nullable().optional().default(null),
  name: z.string().min(1),
});

export const ExpenseSchema: z.ZodType<
  Pick<
    Expense,
    "group_id" | "category_id" | "description" | "amount" | "date" | "paid_by"
  >,
  z.ZodTypeDef,
  {
    group_id?: string | null;
    category_id?: string | null;
    description?: string | null;
    amount: number;
    date: Date | string;
    paid_by?: string | null;
  }
> = z.object({
  group_id: BigIntString,
  category_id: BigIntString,
  description: z.string().nullable().optional().default(null),
  amount: z.number().positive(),
  date: z
    .string()
    .datetime()
    .or(z.date().transform((d) => d.toISOString())),
  paid_by: BigIntString,
});

export const IncomeSchema: z.ZodType<
  Pick<Income, "group_id" | "amount" | "user">,
  z.ZodTypeDef,
  { group_id?: string | null; amount: number; user?: string | null }
> = z.object({
  group_id: BigIntString,
  amount: z.number().positive(),
  user: BigIntString,
});

export const schemas = {
  Expense: ExpenseSchema,
  Income: IncomeSchema,
  Group: GroupSchema,
  BudgetCategory: BudgetCategorySchema,
  Users: UserSchema,
};

export type ExpenseInput = z.infer<typeof ExpenseSchema>;
export type IncomeInput = z.infer<typeof IncomeSchema>;
export type GroupInput = z.infer<typeof GroupSchema>;
export type BudgetCategoryInput = z.infer<typeof BudgetCategorySchema>;
export type UserInput = z.infer<typeof UserSchema>;
