import mongoose from 'mongoose';

let cachedConnection = null;

export const connectDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('MONGODB_URI is not defined in environment variables.');
    return;
  }

  if (!cachedConnection) {
    mongoose.set('strictQuery', true);
    cachedConnection = mongoose.connect(mongoUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
  }

  try {
    await cachedConnection;
    return mongoose.connection;
  } catch (error) {
    cachedConnection = null;
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};
