import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app';
import { connectDB } from './config/database';
import logger from './config/logger';

const PORT = parseInt(process.env.PORT || '5000', 10);

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

let server: import('http').Server;

const startServer = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    logger.info(`🚀 CivicPulse API running on port ${PORT}`);
    logger.info(`📦 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🤖 AI Service: ${process.env.AI_SERVICE_URL}`);
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err: any) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

const gracefulShutdown = () => {
  logger.info('Received termination signal. Closing HTTP server and database connection...');
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await mongoose.disconnect();
      logger.info('MongoDB disconnected.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
