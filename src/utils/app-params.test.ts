import { describe, it, expect } from 'vitest';
import { appParams } from './app-params';

describe('appParams', () => {
  it('should have basic structure', () => {
    expect(appParams).toBeDefined();
    expect(Object.keys(appParams)).toContain('appId');
  });
});
