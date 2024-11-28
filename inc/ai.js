const { Anthropic } = require('@anthropic-ai/sdk');

// Claude configuration
const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function promptAI(fullPrompt){
  const model = 'claude-3-sonnet-20240229';
  const max_tokens = 4096;
  const temperature = 0.7;
  
  const response = await claude.messages.create({
        model: model,
        max_tokens: max_tokens,
        temperature: temperature,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ]
      });

      const generatedCode = response.content[0].text;
      
      return generatedCode;
}

module.exports = { promptAI }