import { Anthropic } from '@anthropic-ai/sdk';

// Create a singleton instance for better testing
export const createAnthropicClient = () => {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || ''
  });
};

// Export for testing
export const defaultClient = createAnthropicClient();

export async function promptAI(prompt: string, client = defaultClient): Promise<string> {
  try {
    const fullPrompt = `Return only CODE. Write code based on this request: ${prompt}\n\nProvide ONLY the code without any explanations or markdown formatting. Never use "\`\`\`" symbols.`;

    const model = 'claude-3-sonnet-20240229';
    const max_tokens = 4096;
    const temperature = 0.8;
    
    const response = await client.messages.create({
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

    if (!response?.content?.[0]?.text) {
      console.error({response});
      throw new Error('Invalid API response structure');
    }

    return response.content[0].text;
  } catch (error: any) {
    // If it's already our custom error, throw it as is
    if (error.message === 'Invalid API response structure') {
      throw error;
    }
    // Otherwise, throw the original API error
    throw error;
  }
}
