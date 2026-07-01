import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const data: any = {
    id: 'global',
    pmcFtpHost: 'test',
    updatedAt: new Date().toISOString(),
  };

  delete data.id;
  delete data.updatedAt;

  try {
    const updated = await prisma.systemSettings.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data }
    });
    console.log("Success", updated);
  } catch (e) {
    console.error("Error", e);
  }
}

main().finally(() => prisma.$disconnect());
