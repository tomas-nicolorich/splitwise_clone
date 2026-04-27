import { describe, it, expect } from 'vitest';
import { base44 } from './client';

describe('API Client', () => {
  it('should have essential entity stores', () => {
    expect(base44.entities.Group).toBeDefined();
    expect(base44.entities.Expense).toBeDefined();
    expect(base44.entities.BudgetCategory).toBeDefined();
    expect(base44.entities.Income).toBeDefined();
  });

  it('should have auth methods', () => {
    expect(base44.auth.me).toBeDefined();
    expect(base44.auth.logout).toBeDefined();
  });
});
