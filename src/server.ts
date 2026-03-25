import app from './app';
import logger from './lib/logger';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints:`);
  console.log(`   POST /api/auth/register - Register new user`);
  console.log(`   POST /api/auth/login - Login`);
  console.log(`   GET /api/auth/me - Get current user`);
  console.log(`\n📋 Task endpoints:`);
  console.log(`   GET /api/tasks - Get all tasks`);
  console.log(`   POST /api/tasks - Create task`);
  console.log(`   GET /api/tasks/:id - Get task by ID`);
  console.log(`   PUT /api/tasks/:id - Update task`);
  console.log(`   DELETE /api/tasks/:id - Delete task`);
  console.log(`   GET /api/tasks/stats - Get task statistics`);
  console.log(`\n👤 User endpoints (admin only):`);
  console.log(`   GET /api/users - Get all users`);
  console.log(`   GET /api/users/:id - Get user by ID`);
  console.log(`   PUT /api/users/:id - Update user`);
  console.log(`   DELETE /api/users/:id - Delete user`);
  console.log(`\n`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🔌 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});