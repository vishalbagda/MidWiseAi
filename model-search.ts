import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

async function modelSearch() {
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
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-pro",
    "gemini-1.0-pro",
    "gemini-2.0-flash-exp"
  ];

  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      const response = await result.response;
      console.log(`SUCCESS ${m}: ${response.text().substring(0, 50)}`);
      return; 
    } catch (error: any) {
      console.log(`FAILED ${m}: ${error.message.substring(0, 100)}`);
    }
  }
}

modelSearch();
