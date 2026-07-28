import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  PrismaClient,
  UserRole,
} from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} belum dikonfigurasi di file .env.`);
  }

  return value;
}

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DIRECT_URL atau DATABASE_URL belum dikonfigurasi.",
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function seedSuperAdmin(): Promise<void> {
  const name = getRequiredEnv("SEED_ADMIN_NAME");
  const username = getRequiredEnv(
    "SEED_ADMIN_USERNAME",
  ).toLowerCase();
  const password = getRequiredEnv("SEED_ADMIN_PASSWORD");

  const emailValue = process.env.SEED_ADMIN_EMAIL?.trim();
  const email = emailValue
    ? emailValue.toLowerCase()
    : null;

  const existingUser = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        name,
        email,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
    });

    console.log(`Super admin diperbarui: ${username}`);
    return;
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      username,
      email,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      mustChangePassword: true,
    },
  });

  console.log(`Super admin dibuat: ${username}`);
}

async function seedSchoolProfile(): Promise<void> {
  const schoolName =
    process.env.SEED_SCHOOL_NAME?.trim() ||
    "Nama Sekolah";

  await prisma.schoolProfile.upsert({
    where: {
      id: "school",
    },
    create: {
      id: "school",
      schoolName,
    },
    update: {},
  });

  console.log("Profil sekolah awal tersedia.");
}

async function main(): Promise<void> {
  await seedSuperAdmin();
  await seedSchoolProfile();

  console.log("Seed database selesai.");
}

main()
  .catch((error: unknown) => {
    console.error("Seed database gagal.");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
