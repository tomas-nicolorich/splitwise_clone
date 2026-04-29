/**
 * Shared API types mapped from Prisma models for frontend use.
 * BigInt is mapped to string to avoid serialization issues.
 * Decimal is mapped to number for financial calculations.
 */

import type { 
  Group as PrismaGroup, 
  Expense as PrismaExpense, 
  BudgetCategory as PrismaBudgetCategory, 
  Income as PrismaIncome, 
  AppUser as PrismaAppUser 
} from '@prisma/client'

export type ToFrontend<T> = T extends bigint
  ? string
  : T extends { toNumber(): number }
  ? number
  : T extends Date
  ? string
  : T extends Array<infer U>
  ? Array<ToFrontend<U>>
  : T extends object
  ? { [K in keyof T]: ToFrontend<T[K]> }
  : T;

export type User = ToFrontend<PrismaAppUser> & { role?: string };

export type Group = ToFrontend<PrismaGroup>;

export type BudgetCategory = ToFrontend<PrismaBudgetCategory>;

export type Expense = ToFrontend<PrismaExpense>;

export type Income = ToFrontend<PrismaIncome>;

// Unified Group Context Data Type
export interface GroupData {
  group: Group;
  members: User[];
  expenses: Expense[];
  categories: BudgetCategory[];
  incomes: Income[];
}
