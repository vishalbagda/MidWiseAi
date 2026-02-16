import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

async function testPro() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key || '');
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    console.log('Testing gemini-pro...');
    const result = await model.generateContent("Hi");
    const response = await result.response;
    console.log('SUCCESS gemini-pro:', response.text());
  } catch (error: any) {
    console.log('FAILED gemini-pro:', error.message);
  }
}

testPro();
