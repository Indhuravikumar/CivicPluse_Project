import mongoose from 'mongoose';
import logger from './logger';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicpulse';
  try {
    await mongoose.connect(uri);
    logger.info('✅ MongoDB connected successfully');
  } catch (error: any) {
    logger.error('❌ MongoDB connection failed. Please check the MongoDB server.');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', () => {
  logger.error('MongoDB error occurred after connection was established.');
});
