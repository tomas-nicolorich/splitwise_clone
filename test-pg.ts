import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function testPg() {
  const connectionString = process.env.DATABASE_URL;
  console.log('Testing direct PG connection...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('Connected to PG!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error('PG Connection error:', err);
  } finally {
    await pool.end();
  }
}

testPg();
