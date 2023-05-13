import { OpenAI } from 'langchain/llms/openai';

export function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OpenAI Credentials');
  }

  return new OpenAI({
    temperature: 0,
    maxTokens: 500,
  });
}