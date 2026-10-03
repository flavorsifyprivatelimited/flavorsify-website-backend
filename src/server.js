import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function startServer() {
  try {
    // Connect to MongoDB before starting the API
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`API running on port ${env.PORT} (${env.NODE_ENV})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();