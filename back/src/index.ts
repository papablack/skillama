import dotenv from 'dotenv';
import { Express } from 'express';
import { tunneling } from './inc/tunnel';
import { setupSrv } from './inc/srv';
import path from 'path';
import fs from 'fs';

dotenv.config({
  path: [path.resolve(process.cwd(), '.env.local'), path.resolve(process.cwd(), '.env')]
});

const app: Express = setupSrv();
const port: number = parseInt(process.env.SKILLAMA_PORT || '3000', 10);

const startServer = async (): Promise<void> => {
  try {
    // Start the express server
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // Create tunnel with fixed subdomain
    await tunneling(port);
  } catch (error) {
    console.error('🔥 Server startup error:', error);
    process.exit(1);
  }
};

if(!fs.existsSync(path.resolve(process.cwd(), 'bun.lockb'))){
  throw new Error('Run app from root directory.')
}

startServer();
