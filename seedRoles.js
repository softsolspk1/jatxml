const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Welcome@123', 10);
  
  const users = [
    { email: 'admin@example.com', name: 'Admin User', role: 'ADMIN' },
    { email: 'manager@example.com', name: 'Editorial Manager', role: 'EDITORIAL_MANAGER' },
    { email: 'operator@example.com', name: 'XML Operator', role: 'XML_OPERATOR' },
    { email: 'reviewer@example.com', name: 'Reviewer', role: 'REVIEWER' }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: hashedPassword,
        name: u.name,
        role: u.role
      },
      create: {
        email: u.email,
        password: hashedPassword,
        name: u.name,
        role: u.role
      }
    });
    console.log(`Seeded ${u.role}: ${u.email}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
