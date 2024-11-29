import dotenv from 'dotenv';
import { Express } from 'express';
import { tunneling } from './inc/tunnel';
import { setupSrv } from './inc/srv';

dotenv.config();

const app: Express = setupSrv();
const port: number = parseInt(process.env.SKILLAMA_PORT || '3000', 10);

const startServer = async (): Promise<void> => {
  try {
    // Start the express server
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // Create tunnel with fixed subdomain
    const tunneler = await tunneling(port);
  } catch (error) {
    console.error('🔥 Server startup error:', error);
    process.exit(1);
  }
};

startServer();
