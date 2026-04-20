import { describe, it, expect, beforeEach } from 'vitest';
import { calculateCategorySplits } from './financial-utils';

describe('calculateCategorySplits', () => {
  it('should correctly split equal amounts', () => {
    const categories = [{ id: 1, amount: 1000, members: [1, 2] }];
    const incomes = [
      { user: 1, amount: 500 },
      { user: 2, amount: 500 }
    ];
    const members = [{ id: 1 }, { id: 2 }];
    const expenses = [];

    const result = calculateCategorySplits(categories, incomes, members, expenses);
    expect(result[1].length).toBe(2);
    expect(result[1][0].share).toBeCloseTo(500, 0);
  });

  it('should handle empty categories', () => {
    const result = calculateCategorySplits([], [], [], []);
    expect(result).toEqual({});
  });
});