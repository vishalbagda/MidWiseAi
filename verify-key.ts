import OpenAI from 'openai';
import 'dotenv/config';

async function verifyKey() {
  const key = process.env.OPENAI_API_KEY;
  console.log('Testing key starting with:', key?.substring(0, 10));
  
  const openai = new OpenAI({
    apiKey: key
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5,
    });
    console.log('Success! AI responded.');
  } catch (error) {
    console.error('Error verifying key:', error.message);
    if (error.status === 401) {
      console.error('The API key is invalid according to OpenAI.');
    }
  }
}

verifyKey();
