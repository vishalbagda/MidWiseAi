import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

async function verifyGemini() {
  const key = process.env.GEMINI_API_KEY;
  console.log('--- GEMINI DIAGNOSTICS ---');
  console.log('Key length:', key?.length);
  console.log('Key prefix:', key?.substring(0, 10));

  const genAI = new GoogleGenerativeAI(key || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    console.log('\nTesting Gemini Text Generation...');
    const result = await model.generateContent("Say 'Gemini is active and working'");
    const response = await result.response;
    const text = response.text();
    console.log('SUCCESS:', text);
  } catch (error: any) {
    console.log('FAILED Gemini Test:');
    console.log('  Message:', error.message);
  }
}

verifyGemini();
