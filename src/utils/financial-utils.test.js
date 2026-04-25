import { describe, it, expect } from 'vitest';
import { calculateCategorySplits } from './financial-utils';

describe('calculateCategorySplits - Largest Remainder Method', () => {
  it('should distribute remainder correctly to sum to total amount', () => {
    // 3 people, equal income ($100 each), total category amount $1000.
    // Each should get $333.33... -> $333, $333, $334.
    const categories = [{ id: 1, amount: 1000, members: [1, 2, 3] }];
    const incomes = [
      { user: 1, amount: 100 },
      { user: 2, amount: 100 },
      { user: 3, amount: 100 }
    ];
    const members = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = calculateCategorySplits(categories, incomes, members, []);
    
    const shares = result[1].map(s => s.share);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(1000);
    expect(shares.sort()).toEqual([333, 333, 334]);
  });
});

describe('calculateCategorySplits - Budget Transfers', () => {
  it('should adjust shares based on budget transfers', () => {
    const categories = [{ id: 1, amount: 1000, members: [1, 2] }];
    const incomes = [
      { user: 1, amount: 1000 },
      { user: 2, amount: 0 } // User 1 owns all income
    ];
    const members = [{ id: 1 }, { id: 2 }];
    const expenses = [
        { description: '[BUDGET_TRANSFER] TO:2', amount: 200, paid_by: 1, category_id: 1 }
    ];

    const result = calculateCategorySplits(categories, incomes, members, expenses);
    const shares = result[1];
    
    // Original: U1: 1000, U2: 0. After U1 -> U2 ($200): U1: 800, U2: 200.
    expect(shares.find(s => s.userId === 1).share).toBe(800);
    expect(shares.find(s => s.userId === 2).share).toBe(200);
  });
});
