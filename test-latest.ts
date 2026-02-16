import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

async function testLatest() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key || '');
  
  const models = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-1.0-pro-latest"];

  for (const m of models) {
    try {
      console.log(`\nTesting ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      const response = await result.response;
      console.log(`SUCCESS for ${m}:`, response.text());
      break; 
    } catch (error: any) {
      console.log(`FAILED for ${m}:`, error.message);
    }
  }
}

testLatest();
