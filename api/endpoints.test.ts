import { describe, it, expect } from 'vitest';
import authHandler from './auth';
import dataHandler from './data';
import groupsHandler from './groups';
import expensesHandler from './expenses';
import incomesHandler from './incomes';
import categoriesHandler from './categories';

describe('API Endpoints', () => {
  it('all handlers should be exported as default functions', () => {
    expect(typeof authHandler).toBe('function');
    expect(typeof dataHandler).toBe('function');
    expect(typeof groupsHandler).toBe('function');
    expect(typeof expensesHandler).toBe('function');
    expect(typeof incomesHandler).toBe('function');
    expect(typeof categoriesHandler).toBe('function');
  });
});
