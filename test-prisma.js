require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
  }
  await prisma.$disconnect();
}

main();

