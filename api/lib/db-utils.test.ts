import { describe, it, expect } from 'vitest';
import { serializeBigInt } from './db-utils';

describe('db-utils', () => {
  it('should serialize BigInt to string', () => {
    const data = { id: BigInt(123), name: 'Test' };
    const serialized = serializeBigInt(data);
    expect(serialized.id).toBe('123');
    expect(serialized.name).toBe('Test');
  });
});
