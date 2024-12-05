import { Anthropic } from '@anthropic-ai/sdk';

// Claude configuration
const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export async function promptAI(prompt: string): Promise<string> {
  const fullPrompt = `Return only CODE. Write code based on this request: ${prompt}\n\nProvide ONLY the code without any explanations or markdown formatting. Never use "\`\`\`" symbols.`;

  const model = 'claude-3-sonnet-20240229';
  const max_tokens = 4096;
  const temperature = 0.8;
  
  const response = await claude.messages.create({
    model,
    max_tokens,
    temperature,
    messages: [
      {
        role: 'user',
        content: fullPrompt
      }
    ]
  });

  return response.content[0].text;
}
