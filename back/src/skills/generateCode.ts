import express, { Express, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { promptAI } from '../inc/ai';
const outputDir: string = path.resolve(process.cwd(), 'generated');

export function generateCodeSkill(app: Express){

  app.post('/api/generate-code', async (req: any, res: any) => {
    try {
        const { prompt, filename, projectName } = req.body;

        // Validate required parameters
        if (!prompt || !filename || !projectName) {
            return res.status(400).json({ 
                error: 'Bad Request',
                details: 'Prompt, filename, and projectName are required' 
            });
        }

        // Ensure base output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Create project directory if it doesn't exist
        const projectDir = path.join(outputDir, projectName);
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
        }

        console.log('Processing code request...');
        const generatedCode = await promptAI(prompt);      
        
        // Save file in the project directory
        const filePath = path.join(projectDir, filename);      

        // Save the generated code to file
        fs.writeFileSync(filePath, generatedCode);
        console.log(`Code generated and saved @ "${filePath}"`);

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