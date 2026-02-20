/**
 * Cria o banco de dados referenciado em DATABASE_URL se não existir.
 * Uso: npx ts-node scripts/create-db.ts
 */
import { config } from 'dotenv';
config({ path: './.env' });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL não definida no .env');
  process.exit(1);
}

// Extrair database name da URL (último segmento do path)
const match = url.match(/\/([^/?]+)(?:\?|$)/);
const dbName = match ? match[1] : null;
if (!dbName) {
  console.error('Não foi possível extrair o nome do banco de DATABASE_URL');
  process.exit(1);
}

// URL para conectar ao template1 (sempre existe em PostgreSQL padrão)
const adminUrl = url.replace(/\/([^/?]+)(\?|$)/, '/template1$2');

async function main() {
  const pg = require('pg');
  const client = new pg.Client({ connectionString: adminUrl });
  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    if (res.rows.length > 0) {
      console.log(`Banco "${dbName}" já existe.`);
      return;
    }
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Banco "${dbName}" criado com sucesso.`);
  } catch (err: any) {
    console.error('Erro:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
