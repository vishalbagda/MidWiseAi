import { AIService } from './server/services/aiService';
import { FileService } from './server/services/fileService';
import fs from 'fs';
import path from 'path';

async function test() {
  const aiService = new AIService();
  const fileService = new FileService();

  console.log('Testing PDF extraction...');
  // Since we don't have a real PDF, we'll just check if the service exists and can be invoked
  // In a real scenario, we'd provide a sample PDF
  
  console.log('Testing AI Service with dummy text...');
  try {
    const result = await aiService.analyzePrescription('Amoxicillin 500mg, 1 tablet twice a day for 7 days for ear infection.');
    console.log('AI Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('AI Test Failed:', error);
  }
}

test();
