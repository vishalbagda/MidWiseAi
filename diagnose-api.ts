import OpenAI from 'openai';
import 'dotenv/config';

async function diagnose() {
  const key = process.env.OPENAI_API_KEY;
  console.log('--- DIAGNOSTICS ---');
  console.log('Key length:', key?.length);
  console.log('Key prefix:', key?.substring(0, 10));
  console.log('Key suffix:', key?.substring(key.length - 5));

  const openai = new OpenAI({
    apiKey: key
  });

  const models = ["gpt-3.5-turbo", "gpt-4o-mini"];

  for (const model of models) {
    console.log(`\nTesting model: ${model}`);
    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: "Say 'Hello'" }],
        max_tokens: 5,
      });
      console.log(`SUCCESS for ${model}:`, response.choices[0].message.content);
    } catch (error: any) {
      console.log(`FAILED for ${model}:`);
      console.log(`  Status: ${error.status}`);
      console.log(`  Message: ${error.message}`);
    }
  }
}

diagnose();
