import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  console.log("DB Settings:", settings);
}

main().finally(() => prisma.$disconnect());
