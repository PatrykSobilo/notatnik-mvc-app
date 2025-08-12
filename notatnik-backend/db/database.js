import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ Połączono z bazą danych PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Błąd połączenia z bazą danych:', err);
  process.exit(-1);
});

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('🕒 Czas z bazy danych:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Błąd testowania połączenia:', err);
    return false;
  }
};

export default pool;
