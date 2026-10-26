import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../config/db.js';
import { MenuItem } from '../models/MenuItem.js';
import { SEED_MENU_ITEMS } from '../data/menuSeed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing menu items...');
    await MenuItem.deleteMany({});

    console.log(`[Seed] Inserting ${SEED_MENU_ITEMS.length} authentic dishes...`);
    const createdItems = await MenuItem.insertMany(SEED_MENU_ITEMS);

    console.log(`[Seed] Successfully seeded ${createdItems.length} menu items!`);
    return createdItems;
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    throw error;
  }
};

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await disconnectDB();
      process.exit(1);
    });
}
