import prisma from './prisma';

/**
 * Serializes BigInt values to string for JSON output.
 */
export const serializeBigInt = <T>(data: T): any => {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
};

/**
 * Syncs Postgres primary key sequence.
 */
export const syncSequence = async (tableName: string): Promise<void> => {
  try {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), coalesce(max(id),0) + 1, false) FROM "${tableName}";`
    );
  } catch (e: any) {
    console.warn(`Could not sync sequence for ${tableName}:`, e.message);
  }
};

/**
 * Maps UUID (auth_id) to BigInt (id).
 */
export const resolveUuidToBigInt = async (uuid: string): Promise<bigint | null> => {
  const user = await prisma.users.findFirst({
    where: { id: uuid },
  });
  return user ? (user.id as unknown as bigint) : null;
};
