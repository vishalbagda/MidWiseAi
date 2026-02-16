import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

async function finalTest() {
  const envPath = path.join(process.cwd(), '.env');
  let key = '';
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of envLines) {
      if (line.trim().startsWith('GEMINI_API_KEY=')) {
        key = line.split('=')[1].trim();
      }
    }
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    console.log('Testing gemini-2.0-flash...');
    const result = await model.generateContent("Say 'MedWise AI is now synchronized with Gemini 2.0.'");
    const response = await result.response;
    console.log('SUCCESS:', response.text());
  } catch (error: any) {
    console.log('FAILED:', error.message);
  }
}

finalTest();
