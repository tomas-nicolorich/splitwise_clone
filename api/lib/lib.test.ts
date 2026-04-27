import { describe, it, expect } from 'vitest';
import { schemas } from './schemas';
import prisma from './prisma';
import { supabaseAdmin } from './supabase-admin';

describe('api/lib infrastructure', () => {
  it('schemas should be defined', () => {
    expect(schemas.Expense).toBeDefined();
    expect(schemas.Group).toBeDefined();
  });

  it('prisma client should be defined', () => {
    expect(prisma).toBeDefined();
  });

  it('supabaseAdmin should be defined', () => {
    expect(supabaseAdmin).toBeDefined();
  });
});
