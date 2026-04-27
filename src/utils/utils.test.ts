import { describe, it, expect } from 'vitest';
import { getUserName, getMappedIncomes } from './utils';
import { User, Income } from '../api/types';

describe('utils', () => {
  it('getUserName should return correct name', () => {
    const members: User[] = [
      { id: '1', name: 'Alice', auth_id: null, created_at: '', icon: null },
      { id: '2', name: 'Bob', auth_id: null, created_at: '', icon: null }
    ];
    expect(getUserName('1', members)).toBe('Alice');
    expect(getUserName(2, members)).toBe('Bob');
    expect(getUserName('3', members)).toBe('Unknown User');
  });

  it('getMappedIncomes should deduplicate incomes', () => {
    const rawIncomes: Income[] = [
      { user: '1', amount: 100, id: '1', group_id: '1', currency: 'EUR', created_at: null },
      { user: '1', amount: 200, id: '2', group_id: '1', currency: 'EUR', created_at: null }
    ];
    const mapped = getMappedIncomes(rawIncomes);
    expect(mapped.length).toBe(1);
    expect(mapped[0].amount).toBe(200); // Last one wins in the Map
  });
});
