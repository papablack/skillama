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

      const fullPrompt = `Write code based on this request: ${prompt}\n\nProvide ONLY the code without any explanations or markdown formatting.`;

      const generatedCode = await promptAI(fullPrompt);      
      const filePath = path.join(outputDir, filename);

      console.log({generatedCode, filePath});

      // Save the generated code to file
      fs.writeFileSync(filePath, generatedCode);

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