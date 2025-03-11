// OpenAI Configuration
export const OPENAI_CONFIG = {
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    max_tokens: 150,
    apiKey: process.env.OPENAI_API_KEY // The API key should be set in an environment variable
}; 