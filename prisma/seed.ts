import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const userPassword = await bcrypt.hash('Pemilih2024', 10);

  // Buat Admin
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password_hash: adminPassword, name: 'Admin Pusat', role: 'ADMIN' }
  });

  // Buat 100 User
  const users = Array.from({ length: 100 }).map((_, i) => ({
    username: `USER${(i + 1).toString().padStart(3, '0')}`,
    password_hash: userPassword,
    name: `Peserta ${i + 1}`,
    role: 'VOTER' as const,
  }));
  await prisma.user.createMany({ data: users, skipDuplicates: true });

  // Buat 15 Calon
  const candidates = Array.from({ length: 15 }).map((_, i) => ({
    candidate_number: i + 1,
    name: `Calon Formatur ${i + 1}`,
  }));
  await prisma.candidate.createMany({ data: candidates, skipDuplicates: true });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());