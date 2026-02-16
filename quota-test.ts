import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testWithWait() {
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
  const models = ["gemini-2.0-flash", "gemini-flash-latest"];

  for (const m of models) {
    console.log(`\n--- Testing ${m} ---`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      const response = await result.response;
      console.log(`SUCCESS for ${m}:`, response.text().substring(0, 50));
      return; 
    } catch (error: any) {
      console.log(`FAILED for ${m}:`, error.message);
      if (error.message.includes('429') || error.message.includes('quota')) {
        console.log('Detected rate limit. Waiting 35 seconds...');
        await wait(35000);
        console.log('Retrying...');
        try {
          const result = await model.generateContent("Hi again");
          const response = await result.response;
          console.log(`SUCCESS ON RETRY for ${m}:`, response.text().substring(0, 50));
          return;
        } catch (retryError: any) {
          console.log(`RETRY FAILED for ${m}:`, retryError.message);
        }
      }
    }
  }
}

testWithWait();
