import { expect, test, describe, beforeEach, mock } from "bun:test";
import { promptAI, createAnthropicClient } from '../src/inc/ai';
import { Anthropic } from '@anthropic-ai/sdk';

// Mock the create function
const mockCreate = mock(() => Promise.resolve({
  content: [{ text: '' }]
}));

// Create a complete mock Anthropic instance
const mockAnthropicInstance = {
  apiKey: 'test-api-key',
  authToken: null,
  _options: {},
  messages: {
    create: mockCreate
  },
  completions: {},
  embeddings: {},
  files: {},
  images: {},
  _client: {},
  _baseURL: '',
  _maxRetries: 0,
  _timeout: 0,
  _httpAgent: null,
  _fetch: null,
  _formatURL: () => '',
  _fetchWithTimeout: async () => null,
  _requestAPIKey: () => '',
  _authHeaders: () => ({}),
  _makeRequest: async () => null,
  _validateHeaders: () => null
} as unknown as Anthropic;

// Replace the actual createAnthropicClient function
const originalCreateClient = createAnthropicClient;
(globalThis as any).createAnthropicClient = mock(() => mockAnthropicInstance);

describe('AI Service', () => {
  beforeEach(() => {
    // Reset all mocks
    mockCreate.mockReset();
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
  });

  test('should call Claude API with correct parameters and formatting', async () => {
    const testPrompt = 'Create a React component';
    const expectedFullPrompt = `Return only CODE. Write code based on this request: ${testPrompt}\n\nProvide ONLY the code without any explanations or markdown formatting. Never use "\`\`\`" symbols.`;
    
    const mockResponse = {
      content: [{ text: 'const TestComponent = () => { return <div>Test</div> }' }]
    };
    
    mockCreate.mockImplementation(() => Promise.resolve(mockResponse));
    
    const client = mockAnthropicInstance;
    await promptAI(testPrompt, client);

    expect(mockCreate).toHaveBeenCalledWith({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: expectedFullPrompt
        }
      ]
    });
  });

  test('should return the AI response text', async () => {
    const expectedResponse = 'const TestComponent = () => { return <div>Test</div> }';
    mockCreate.mockImplementation(() => Promise.resolve({
      content: [{ text: expectedResponse }]
    }));

    const client = mockAnthropicInstance;
    const result = await promptAI('Create a React component', client);
    expect(result).toBe(expectedResponse);
  });

  test('should handle invalid API response structure', async () => {
    const client = mockAnthropicInstance;

    // Mock an invalid response structure
    mockCreate.mockImplementation(() => Promise.resolve({
      content: [] as { text: string }[] // Empty content array
    }));

    try {
      await promptAI('Test prompt', client);
      throw new Error('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBe('Invalid API response structure');
    }

    // Test with missing text property
    mockCreate.mockImplementation(() => Promise.resolve({
      content: [{ text: '' }]
    }));

    try {
      await promptAI('Test prompt', client);
      throw new Error('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBe('Invalid API response structure');
    }

    // Test with null response
    mockCreate.mockImplementation(() => Promise.resolve({
      content: [{ text: '' }]
    } as any));

    try {
      await promptAI('Test prompt', client);
      throw new Error('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBe('Invalid API response structure');
    }
  });

  test('should handle API errors', async () => {
    const client = mockAnthropicInstance;
    const apiError = new Error('API Error');
    mockCreate.mockImplementation(() => Promise.reject(apiError));

    try {
      await promptAI('Test prompt', client);
      throw new Error('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBe('API Error');
    }
  });
});
