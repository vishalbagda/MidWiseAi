import { AIService } from './server/services/aiService';
import 'dotenv/config';

async function testAI() {
  const aiService = new AIService();

  console.log('Testing AI Service with dummy text...');
  try {
    const result = await aiService.analyzePrescription('Amoxicillin 500mg, 1 tablet twice a day for 7 days for ear infection.');
    console.log('AI Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('AI Test Failed:', error);
  }
}

testAI();
