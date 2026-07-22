require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// Clean URL - remove pgbouncer params
const cleanUrl = process.env.DATABASE_URL.split('?')[0];
console.log('Clean URL:', cleanUrl);

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg({ pool });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const result = await prisma.$queryRawUnsafe('SELECT 1 as val');
    console.log('PrismaPg connection OK:', result[0].val);
  } catch (e) {
    console.log('PrismaPg FAIL:', e.message, e.code);
    console.log('Meta:', JSON.stringify(e.meta, null, 2));
  }
  await prisma.$disconnect();
}

main();

