const dotenv = require("dotenv");
dotenv.config();

const { PrismaClient, Role } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PATIENT_PERMISSIONS = [
  { name: "patients:create", description: "Create patients" },
  { name: "patients:read", description: "View patients" },
  { name: "patients:update", description: "Edit patients" },
  { name: "patients:delete", description: "Delete patients" },
];

const DOCTOR_PERMISSIONS = [
  { name: "doctors:create", description: "Create doctors" },
  { name: "doctors:read", description: "View doctors" },
  { name: "doctors:update", description: "Edit doctors" },
  { name: "doctors:delete", description: "Delete doctors" },
  { name: "doctors:schedule", description: "Manage doctor schedules" },
  { name: "doctors:leave", description: "Manage doctor leaves" },
];

const APPOINTMENT_PERMISSIONS = [
  { name: "appointments:create", description: "Create appointments" },
  { name: "appointments:read", description: "View appointments" },
  { name: "appointments:update", description: "Edit appointments" },
  { name: "appointments:delete", description: "Delete appointments" },
];

const ROLE_PERMISSION_MAP = {
  [Role.CLINIC_ADMIN]: [
    "patients:create", "patients:read", "patients:update", "patients:delete",
    "doctors:create", "doctors:read", "doctors:update", "doctors:delete",
    "doctors:schedule", "doctors:leave",
    "appointments:create", "appointments:read", "appointments:update", "appointments:delete",
  ],
  [Role.DOCTOR]: [
    "patients:create", "patients:read", "patients:update",
    "doctors:read", "doctors:update", "doctors:schedule", "doctors:leave",
    "appointments:create", "appointments:read", "appointments:update",
  ],
  [Role.RECEPTIONIST]: [
    "patients:create", "patients:read", "patients:update",
    "doctors:read", "doctors:schedule",
    "appointments:create", "appointments:read", "appointments:update",
  ],
};

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

  // Seed patient permissions
  console.log("\nSeeding patient permissions...");
  for (const perm of PATIENT_PERMISSIONS) {
    const existing = await prisma.permission.findUnique({
      where: { name: perm.name },
    });

    if (!existing) {
      await prisma.permission.create({ data: perm });
      console.log(`  Created permission: ${perm.name}`);
    } else {
      console.log(`  Permission exists: ${perm.name}`);
    }
  }

  // Seed doctor permissions
  console.log("\nSeeding doctor permissions...");
  for (const perm of DOCTOR_PERMISSIONS) {
    const existing = await prisma.permission.findUnique({
      where: { name: perm.name },
    });

    if (!existing) {
      await prisma.permission.create({ data: perm });
      console.log(`  Created permission: ${perm.name}`);
    } else {
      console.log(`  Permission exists: ${perm.name}`);
    }
  }

  // Seed appointment permissions
  console.log("\nSeeding appointment permissions...");
  for (const perm of APPOINTMENT_PERMISSIONS) {
    const existing = await prisma.permission.findUnique({
      where: { name: perm.name },
    });

    if (!existing) {
      await prisma.permission.create({ data: perm });
      console.log(`  Created permission: ${perm.name}`);
    } else {
      console.log(`  Permission exists: ${perm.name}`);
    }
  }

  // Seed role-permission assignments
  console.log("\nSeeding role-permission assignments...");
  for (const [role, permissions] of Object.entries(ROLE_PERMISSION_MAP)) {
    for (const permName of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permName },
      });

      if (permission) {
        const existing = await prisma.rolePermission.findUnique({
          where: {
            role_permissionId: {
              role: role,
              permissionId: permission.id,
            },
          },
        });

        if (!existing) {
          await prisma.rolePermission.create({
            data: {
              role: role,
              permissionId: permission.id,
            },
          });
          console.log(`  Assigned ${permName} -> ${role}`);
        }
      }
    }
  }

  console.log("\nPermissions seeded successfully!");
}

main()
  .catch((error) => {
    console.error("Admin seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

