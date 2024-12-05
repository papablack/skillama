import express, { Express, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { promptAI } from '../inc/ai';
const outputDir: string = path.resolve(process.cwd(), 'generated');

export function generateCodeSkill(app: Express){

    // Code generation and save endpoint
  app.post('/api/generate-code', async (req: any, res: any) => {
    try {
      const { prompt, filename, projectName } = req.body;

      if (!prompt || !filename) {
        return res.status(400).json({ 
          error: 'Prompt and filename are required' 
        });
      }

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      console.log('Processing code request...');
      const generatedCode = await promptAI(prompt);      
      const filePath = path.join(outputDir, filename);      

      // Save the generated code to file
      fs.writeFileSync(filePath, generatedCode);
      console.log(`Code for project "${projectName}" generated @ "${outputDir}"`);

      res.json({
        message: 'Code generated and saved successfully',
        filePath,
        code: generatedCode,        
      });

    } catch (error) {
      console.error('Error generating code:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}