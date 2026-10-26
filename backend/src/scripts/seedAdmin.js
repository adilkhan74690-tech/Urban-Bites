import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Creates or verifies the initial administrator account safely
 */
export const seedInitialAdmin = async () => {
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Urban Bites Administrator';
  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@urbanbites.com').toLowerCase().trim();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';

  try {
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Admin Seed] Admin account "${adminEmail}" already exists. (Skipping creation)`);
      return existingAdmin;
    }

    console.log(`[Admin Seed] Creating initial administrator account: ${adminEmail}...`);
    const newAdmin = await Admin.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // will be hashed by Admin pre-save hook
      role: 'superadmin',
    });

    console.log(`[Admin Seed] Administrator account created successfully with ID: ${newAdmin._id}`);
    return newAdmin;
  } catch (error) {
    console.error('[Admin Seed] Error seeding initial admin:', error.message);
    throw error;
  }
};

// Execute if run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  connectDB()
    .then(() => seedInitialAdmin())
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
