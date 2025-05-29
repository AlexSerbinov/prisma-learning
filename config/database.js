export const databaseConfig = {
  // PostgreSQL connection settings
  url: "postgresql://admin:password123@localhost:5432/prisma_learning?schema=public",
  
  // Connection pool settings
  connectionLimit: 10,
  
  // Prisma settings
  log: ['query', 'info', 'warn', 'error'],
} 