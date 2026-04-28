import { describe, it, expect } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { GroupProvider, useGroup } from './GroupContext';

describe('Contexts', () => {
  it('AuthProvider and useAuth should be exported', () => {
    expect(typeof AuthProvider).toBe('function');
    expect(typeof useAuth).toBe('function');
  });

  it('GroupProvider and useGroup should be exported', () => {
    expect(typeof GroupProvider).toBe('function');
    expect(typeof useGroup).toBe('function');
  });
});
