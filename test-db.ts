import prisma from './api/lib/prisma';

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    const users = await prisma.Users.findMany({ take: 1 });
    console.log('Connection successful!');
    console.log('Users count:', users.length);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
