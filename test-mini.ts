import OpenAI from 'openai';
import 'dotenv/config';

async function testMini() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say 'Mini works'" }],
      max_tokens: 5,
    });
    console.log('SUCCESS:', response.choices[0].message.content);
  } catch (error: any) {
    console.log('FAILED:', error.message);
    console.log('STATUS:', error.status);
  }
}

testMini();
