/// <reference types="jest" />

import { promptAI, createAnthropicClient } from '../src/inc/ai';
import { Anthropic } from '@anthropic-ai/sdk';

// Mock the entire @anthropic-ai/sdk module
jest.mock('@anthropic-ai/sdk');

describe('AI Service', () => {
  let mockClient: jest.Mocked<Anthropic>;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock implementation
    mockCreate = jest.fn();
    mockClient = {
      messages: {
        create: mockCreate
      }
    } as unknown as jest.Mocked<Anthropic>;

    // Mock the Anthropic constructor
    (Anthropic as unknown as jest.Mock).mockImplementation(() => mockClient);
  });

  it('should call Claude API with correct parameters and formatting', async () => {
    const testPrompt = 'Create a React component';
    const expectedFullPrompt = `Return only CODE. Write code based on this request: ${testPrompt}\n\nProvide ONLY the code without any explanations or markdown formatting. Never use "\`\`\`" symbols.`;
    
    const mockResponse = {
      content: [{ text: 'const TestComponent = () => { return <div>Test</div> }' }]
    };
    
    mockCreate.mockResolvedValueOnce(mockResponse);
    
    const client = createAnthropicClient();
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

  it('should return the AI response text', async () => {
    const expectedResponse = 'const TestComponent = () => { return <div>Test</div> }';
    mockCreate.mockResolvedValueOnce({
      content: [{ text: expectedResponse }]
    });

    const client = createAnthropicClient();
    const result = await promptAI('Create a React component', client);
    expect(result).toBe(expectedResponse);
  });

  it('should handle invalid API response structure', async () => {
    const client = createAnthropicClient();

    // Mock an invalid response structure
    mockCreate.mockResolvedValueOnce({
      content: [] // Empty content array
    });

    await expect(promptAI('Test prompt', client)).rejects.toThrow('Invalid API response structure');

    // Test with missing text property
    mockCreate.mockResolvedValueOnce({
      content: [{}]
    });

    await expect(promptAI('Test prompt', client)).rejects.toThrow('Invalid API response structure');

    // Test with null response
    mockCreate.mockResolvedValueOnce(null);

    await expect(promptAI('Test prompt', client)).rejects.toThrow('Invalid API response structure');
  });

  it('should handle API errors', async () => {
    const client = createAnthropicClient();
    const apiError = new Error('API Error');
    mockCreate.mockRejectedValueOnce(apiError);

    await expect(promptAI('Test prompt', client)).rejects.toThrow('API Error');
  });
});
