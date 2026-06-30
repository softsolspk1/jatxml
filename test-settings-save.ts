import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  let settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  console.log("Current Settings:", settings);

  const updated = await prisma.systemSettings.upsert({
    where: { id: "global" },
    update: { pmcFtpHost: "test-host", porticoFtpHost: "portico-test-host" },
    create: { id: "global", pmcFtpHost: "test-host", porticoFtpHost: "portico-test-host" }
  });
  
  console.log("Updated:", updated);
}

main().finally(() => prisma.$disconnect());
