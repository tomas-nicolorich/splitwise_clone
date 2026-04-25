import prisma from './prisma';

/**
 * Serializes BigInt values to string for JSON output.
 */
export const serializeBigInt = (data) => {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
};

/**
 * Syncs Postgres primary key sequence.
 */
export const syncSequence = async (tableName) => {
  try {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), coalesce(max(id),0) + 1, false) FROM "${tableName}";`
    );
  } catch (e) {
    console.warn(`Could not sync sequence for ${tableName}:`, e.message);
  }
};

/**
 * Maps UUID (auth_id) to BigInt (id).
 */
export const resolveUuidToBigInt = async (uuid) => {
  const user = await prisma.users.findFirst({
    where: { auth_id: uuid },
  });
  return user ? user.id : null;
};
