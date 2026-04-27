import { readFileSync, existsSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('TypeScript Configuration Migration', () => {
  it('should have strict mode enabled in tsconfig.json', () => {
    const tsconfig = JSON.parse(readFileSync('./tsconfig.json', 'utf-8'));
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  it('should include both src and api directories in tsconfig.json', () => {
    const tsconfig = JSON.parse(readFileSync('./tsconfig.json', 'utf-8'));
    expect(tsconfig.include).toContain('src');
    expect(tsconfig.include).toContain('api');
  });

  it('should not have jsconfig.json file', () => {
    expect(existsSync('./jsconfig.json')).toBe(false);
  });
});
