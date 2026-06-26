const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('???S@fTs@Ls123', 10);
  await prisma.user.upsert({
    where: { email: 'kashiffareed01@gmail.com' },
    update: {
      password: hashedPassword,
      name: 'softsols'
    },
    create: {
      email: 'kashiffareed01@gmail.com',
      password: hashedPassword,
      name: 'softsols'
    }
  });
  console.log('Admin User successfully seeded!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
