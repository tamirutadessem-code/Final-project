import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err: Error) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// Graceful shutdown
const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
};

process.on('SIGINT', async () => {
  await disconnectPrisma();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectPrisma();
  process.exit(0);
});

export default prisma;