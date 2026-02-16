import OpenAI from 'openai';
import 'dotenv/config';

async function verifyKey() {
  const key = process.env.OPENAI_API_KEY;
  console.log('Testing key starting with:', key?.substring(0, 15));
  
  const openai = new OpenAI({
    apiKey: key
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hi" }],
      max_tokens: 5,
    });
    console.log('API RESPONSE SUCCESS:', response.choices[0].message.content);
  } catch (error: any) {
    console.log('API ERROR TYPE:', error.constructor.name);
    console.log('API ERROR MESSAGE:', error.message);
    console.log('API ERROR STATUS:', error.status);
  }
}

verifyKey();
