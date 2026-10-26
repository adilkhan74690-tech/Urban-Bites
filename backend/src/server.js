import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Attempt database connection
    try {
      await connectDB();
    } catch (dbErr) {
      console.warn('[Server] Database connection failed on startup. Server running with pending database connection.');
    }

    const server = app.listen(PORT, () => {
      console.log(`[Urban Bites Backend] Server listening on http://localhost:${PORT}`);
      console.log(`[Urban Bites Backend] Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Closing HTTP server...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
