import fs from 'fs';
import path from 'path';

async function testV1() {
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

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;
  
  try {
    console.log('Testing v1 endpoint directly...');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
    });
    
    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.log('FAILED Direct Fetch:', error.message);
  }
}

testV1();
