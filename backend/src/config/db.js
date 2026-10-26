import mongoose from 'mongoose';
import { MenuItem } from '../models/MenuItem.js';
import { SEED_MENU_ITEMS } from '../data/menuSeed.js';

let memoryServerInstance = null;

/**
 * Connect to MongoDB database.
 * If local/remote MongoDB connection fails in development mode,
 * automatically starts an in-memory MongoDB instance and seeds it.
 * @param {string} [uri] - Optional MongoDB URI (defaults to process.env.MONGODB_URI)
 */
export const connectDB = async (uri) => {
  const connectionString = uri || process.env.MONGODB_URI;

  if (connectionString) {
    try {
      const conn = await mongoose.connect(connectionString, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`[MongoDB] Connected to external MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.warn(`[MongoDB] Could not connect to external URI (${error.message}). Checking development fallback...`);
    }
  }

  // Fallback: If no URI or connection failed, use MongoMemoryServer in development/demo mode
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!memoryServerInstance) {
      memoryServerInstance = await MongoMemoryServer.create();
    }
    const memUri = memoryServerInstance.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[MongoDB] Connected to embedded MongoDB (in-memory dev database): ${conn.connection.name}`);

    // Auto-seed dishes if empty
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      console.log(`[MongoDB] Initializing database with ${SEED_MENU_ITEMS.length} authentic dishes...`);
      await MenuItem.insertMany(SEED_MENU_ITEMS);
      console.log('[MongoDB] Auto-seeding completed successfully.');
    }

    // Auto-seed initial administrator in development mode
    const { Admin } = await import('../models/Admin.js');
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const { seedInitialAdmin } = await import('../scripts/seedAdmin.js');
      await seedInitialAdmin();
    }

    return conn;
  } catch (memError) {
    console.error(`[MongoDB] Fatal error initializing database: ${memError.message}`);
    throw memError;
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
      memoryServerInstance = null;
    }
    console.log('[MongoDB] Disconnected successfully');
  } catch (error) {
    console.error(`[MongoDB] Disconnect error: ${error.message}`);
  }
};
