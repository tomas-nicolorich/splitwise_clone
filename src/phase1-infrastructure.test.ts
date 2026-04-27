import { readFileSync, existsSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('Phase 1: Infrastructure & Core Types', () => {
  it('tsconfig.json should have strict mode and correct includes', () => {
    const tsconfig = JSON.parse(readFileSync('./tsconfig.json', 'utf-8'));
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.include).toContain('src');
    expect(tsconfig.include).toContain('api');
    expect(tsconfig.compilerOptions.checkJs).toBe(true);
  });

  it('jsconfig.json should be deleted', () => {
    expect(existsSync('./jsconfig.json')).toBe(false);
  });

  it('package.json should have essential types and no deprecated ones', () => {
    const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    expect(deps['@types/recharts']).toBeDefined();
    expect(deps['react-quill']).toBeUndefined();
    expect(deps['lodash']).toBeUndefined();
  });

  it('src/api/types.ts should export core interfaces', () => {
    const typesContent = readFileSync('./src/api/types.ts', 'utf-8');
    expect(typesContent).toContain('export interface User');
    expect(typesContent).toContain('export interface Group');
    expect(typesContent).toContain('export interface Expense');
    expect(typesContent).toContain('export interface GroupData');
  });
});
