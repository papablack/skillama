import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { generateCodeSkill } from '../skills/generateCode'
import { traverseFilesSkill } from '../skills/traverseFiles'

export function setupSrv(): Express {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
  });

  generateCodeSkill(app);
  traverseFilesSkill(app);

  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ 
      error: 'Something broke!', 
      details: err.message 
    });
  });
  
  return app;
}