import { config } from 'dotenv';
import { defineConfig } from '@prisma/config';

config({ path: './.env' });

// Banco único: todos os simuladores e APIs usam exclusivamente DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL deve estar definida no .env');
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
