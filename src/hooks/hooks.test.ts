import { describe, it, expect } from 'vitest';
import { useGroups } from './use-groups';
import { useGroupData } from './use-group-data';
import { useIsMobile } from './use-mobile';

describe('Custom Hooks', () => {
  it('should export hooks as functions', () => {
    expect(typeof useGroups).toBe('function');
    expect(typeof useGroupData).toBe('function');
    expect(typeof useIsMobile).toBe('function');
  });
});
