import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

async function finalVerify() {
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

  if (!key) {
    console.log('ERROR: Key not found in .env');
    return;
  }

  console.log('Verifying Gemini with key:', key.substring(0, 10) + '...');
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent("Say 'MedWise AI is now powered by Gemini and ready.'");
    const response = await result.response;
    console.log('SUCCESS:', response.text());
  } catch (error: any) {
    console.log('FAILED:', error.message);
  }
}

finalVerify();
