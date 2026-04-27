/**
 * Shared API types mapped from Prisma models for frontend use.
 * BigInt is mapped to string to avoid serialization issues.
 * Decimal is mapped to number for financial calculations.
 */

export interface User {
  id: string; // BigInt mapped to string
  name: string;
  created_at: string;
  auth_id: string | null;
  icon: string | null;
}

export interface Group {
  id: string; // BigInt mapped to string
  name: string;
  description: string | null;
  created_at: string | null;
  members: string[]; // BigInt[] mapped to string[]
}

export interface BudgetCategory {
  id: string; // BigInt mapped to string
  group_id: string;
  name: string;
  amount: number; // Decimal mapped to number
  icon: string | null;
  created_at: string | null;
  members: string[]; // BigInt[] mapped to string[]
}

export interface Expense {
  id: string; // BigInt mapped to string
  group_id: string;
  category_id: string;
  description: string | null;
  amount: number; // Decimal mapped to number
  date: string;
  created_at: string | null;
  paid_by: string;
}

export interface Income {
  id: string; // BigInt mapped to string
  group_id: string;
  user: string;
  amount: number; // Decimal mapped to number
  currency: string;
  created_at: string | null;
}

// Unified Group Context Data Type
export interface GroupData {
  group: Group;
  members: User[];
  expenses: Expense[];
  categories: BudgetCategory[];
  incomes: Income[];
}
