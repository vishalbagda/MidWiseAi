import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key || '');

  try {
    console.log('--- GEMINI MODEL LIST ---');
    // The SDK doesn't have a direct 'listModels' on the genAI instance sometimes depending on version
    // But we can try the standard names. 
    // Let's try gemini-1.5-flash-latest or gemini-1.5-pro
    
    const testModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    
    for (const m of testModels) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("Hi");
        console.log(`Model ${m} is WORKING`);
      } catch (e: any) {
        console.log(`Model ${m} is NOT WORKING: ${e.message}`);
      }
    }
  } catch (error: any) {
    console.log('General error:', error.message);
  }
}

listModels();
