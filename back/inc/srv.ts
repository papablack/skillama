import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { generateCodeSkill } from '../skills/generateCode'
import { traverseFilesSkill } from '../skills/traverseFiles'
import { gitOperationsSkill } from '../skills/gitOperations'
import { generateOpenApiDocs } from './jsonGenerate'
import fs from 'fs';
import path from 'path';

const PUBDIR = path.join(process.cwd(), 'front', 'public');

export function setupSrv(): Express {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());

  // generateOpenApiDocs(app)

  function doMainHtml(res: Response){
    const indexPath = path.join(PUBDIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('index.html not found');
    }
  }

  app.get('/', (req: Request, res: Response) => {
    try {
     doMainHtml(res);
    } catch (error) {
      console.error('Error serving index.html:', error);
      res.status(500).send('Internal server error');
    }
  });

  app.use(express.static(PUBDIR));

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    console.log(`[HEALTHCHECK REQUEST INFO] ORIGIN: IP: ${req.ip} | User-Agent: ${req.headers['user-agent']} | Path: ${req.path}`);

    res.status(200).json({ status: 'OK', message: 'Server is running' });
  });
  
  generateCodeSkill(app);
  traverseFilesSkill(app);
  gitOperationsSkill(app);

  app.use((req: Request, res: Response) => {    
    doMainHtml(res);
  });
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
