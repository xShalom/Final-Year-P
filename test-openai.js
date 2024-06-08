import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo',
      prompt: 'Say this is a test',
      max_tokens: 5,
    });

    console.log('API Response:', response);
  } catch (error) {
    console.error('Error connecting to OpenAI API:', error);
  }
}

testOpenAI();
