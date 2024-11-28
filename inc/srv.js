const express = require('express');
  const cors = require('cors');
  const fs = require('fs');
  const path = require('path');
  const { promptAI } = require('./ai');

 function setupSrv(){
  const outputDir = process.env.OUTPUT_DIR; 
  const app = express();
  // Middleware
  app.use(cors());
  app.use(express.json());
  

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
  });

  // Code generation and save endpoint
  app.post('/api/generate-code', async (req, res) => {
    try {
      const { 
        prompt,
        filename,
      } = req.body;

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
      console.log('Code generated');

      res.json({
        message: 'Code generated and saved successfully',
        filePath: filePath,
        code: generatedCode,        
      });
      
      

    } catch (error) {
      console.error('Error generating code:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
      });
    }
  });

  // List generated files endpoint
  app.get('/api/list-files', (req, res) => {
    try {
      if (!fs.existsSync(outputDir)) {
        return res.json({ files: [] });
      }

      const files = fs.readdirSync(outputDir)
        .map(filename => {
          const filePath = path.join(outputDir, filename);
          const stats = fs.statSync(filePath);
          return {
            name: filename,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        });

      res.json({ files });
    } catch (error) {
      console.error('Error listing files:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  });

   // Show file contents endpoint
   app.post('/api/show-file', (req, res) => {
    try {
      const filename = req.body.filename;
      const directory = outputDir;
      const filePath = path.join(directory, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: 'File not found',
          details: `File ${filename} does not exist in ${directory}`
        });
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      
      // Read file contents
      const content = fs.readFileSync(filePath, 'utf8');

      res.json({
        filename,
        path: filePath,
        content,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      });

    } catch (error) {
      console.error('Error reading file:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      error: 'Something broke!', 
      details: err.message 
    });
  });
  
  return app;
}


module.exports = { setupSrv }
