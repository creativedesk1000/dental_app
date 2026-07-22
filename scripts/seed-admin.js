const dotenv = require("dotenv");
dotenv.config();

const { PrismaClient, Role } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ D:\github\dental_app\flutter_mobile>
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@dental.com";
  const password = "Admin@123";
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Admin",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      clinicId: null,
    },
    create: {
      email,
      name: "Admin",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      clinicId: null,
    },
  });

  console.log(`Admin seed ensured: ${user.email} (${user.role})`);
}

main()
  .catch((error) => {
    console.error("Admin seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
