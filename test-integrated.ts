import { aiService } from './server/services/aiService';

async function finalIntegratedTest() {
  console.log('Testing integrated aiService with gemini-flash-latest...');
  
  const sampleText = "Patient: John Doe. Med: Amoxicillin 500mg, 3 times daily for 7 days for throat infection.";
  
  try {
    const response = await aiService.analyzePrescription(sampleText);
    console.log('SUCCESS: Response received from Gemini!');
    console.log('Summary:', response.summary);
    if (!response.summary.includes('unavailable')) {
       console.log('VERIFIED: AI is working correctly.');
    } else {
       console.log('FAILED: Still getting fallback response.');
    }
  } catch (error: any) {
    console.log('ERROR during integrated test:', error.message);
  }
}

finalIntegratedTest();
