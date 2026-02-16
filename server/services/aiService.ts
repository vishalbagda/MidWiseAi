import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Manual env loading fallback for this environment
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('GEMINI_API_KEY=')) {
      const value = line.split('=')[1].trim();
      process.env.GEMINI_API_KEY = value;
    }
  }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: process.env.AI_MODEL || "gemini-2.0-flash" });

export class AIService {
  
  private async retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && (error.message?.includes('429') || error.message?.includes('quota'))) {
        console.log(`Rate limit hit, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code block syntax if present
    return text.replace(/```json\n?|```/g, '').trim();
  }

  async analyzePrescription(extractedText: string): Promise<any> {
    try {
      const prompt = `
      You are a medical AI assistant. Analyze the following prescription/medical report text and provide a structured response:

      Text: "${extractedText}"

      Please provide:
      1. A plain language summary of the medical document
      2. A list of medications with their purposes, dosages, and frequencies
      3. Specific instructions for each medication (how to take, when to stop, etc.)
      4. Important health notes or warnings specifically mentioned in the report

      Format your response as JSON with this structure:
      {
        "summary": "Brief explanation in simple terms",
        "medications": [
          {
            "name": "Medicine name and strength",
            "purpose": "What this medicine treats",
            "dosage": "Amount per dose",
            "frequency": "How often to take",
            "instructions": "Specific way to take this medicine",
            "sideEffects": ["list", "of", "common", "side", "effects"],
            "warnings": ["specific", "warnings"]
          }
        ],
        "importantNotes": ["list", "of", "general", "important", "health", "notes"],
        "disclaimer": "Medical disclaimer text"
      }
      `;

      const result = await this.retryWithBackoff(() => model.generateContent(prompt));
      const response = await result.response;
      const content = response.text();
      
      if (content) {
        try {
          return JSON.parse(this.cleanJsonResponse(content));
        } catch (parseError) {
          return this.createFallbackPrescriptionResponse(extractedText, 'Analysis failed to format correctly');
        }
      }
      return this.createFallbackPrescriptionResponse(extractedText, 'No response from AI service');
    } catch (error: any) {
      console.error('Gemini AI Service Error:', error);
      let message = 'AI analysis service is temporarily unavailable';
      if (error.message?.includes('quota') || error.status === 429) {
        message = 'AI Quota exceeded. Please check your Gemini billing details.';
      } else if (error.message?.includes('API key') || error.status === 401) {
        message = 'Invalid Gemini API key. Please check your .env configuration.';
      }
      return this.createFallbackPrescriptionResponse(extractedText, message);
    }
  }

  async analyzeOCRText(ocrText: string): Promise<any> {
    try {
      const prompt = `
      Analyze this OCR text from a medicine strip/package and extract structured information:

      OCR Text: "${ocrText}"

      Extract and provide this information in JSON format:
      {
        "name": "Medicine name",
        "manufacturer": "Company name",
        "expiryDate": "YYYY-MM-DD format",
        "batchNumber": "Batch/Lot number",
        "strength": "Dosage strength",
        "isExpired": false,
        "recommendation": "keep|donate|dispose",
        "reasoning": "Explanation for recommendation"
      }

      If expiry date suggests medicine is expired, set isExpired to true and recommendation to "dispose".
      If medicine is not expired, recommend "donate" for unused medicines or "keep" for current use.
      `;

      const result = await this.retryWithBackoff(() => model.generateContent(prompt));
      const response = await result.response;
      const content = response.text();
      
      if (content) {
        try {
          const parsed = JSON.parse(this.cleanJsonResponse(content));
          if (parsed.expiryDate) {
            const expiry = new Date(parsed.expiryDate);
            const today = new Date();
            parsed.isExpired = expiry < today;
            
            if (parsed.isExpired) {
              parsed.recommendation = 'dispose';
              parsed.reasoning = 'Medicine has expired. Please dispose of it safely according to local guidelines.';
            } else if (!parsed.recommendation || parsed.recommendation === 'keep') {
              parsed.recommendation = 'donate';
              parsed.reasoning = 'Medicine is within expiry date and in good condition. Consider donating to local pharmacy or healthcare center.';
            }
          }
          return parsed;
        } catch (parseError) {
          return this.createFallbackOCRResponse(ocrText);
        }
      }
      return this.createFallbackOCRResponse(ocrText, 'No response from AI service');
    } catch (error: any) {
      console.error('Gemini OCR AI Analysis Error:', error);
      let message = 'OCR analysis service is temporarily unavailable';
      if (error.message?.includes('quota') || error.status === 429) {
        message = 'AI Quota exceeded. Please check your billing.';
      } else if (error.message?.includes('API key') || error.status === 401) {
        message = 'Invalid API key.';
      }
      return this.createFallbackOCRResponse(ocrText, message);
    }
  }

  async getOTCRecommendations(symptoms: string, userInfo?: any): Promise<any> {
    try {
      const prompt = `
      As a medical AI assistant, provide over-the-counter medicine recommendations for these symptoms: "${symptoms}"

      Please provide a structured response in JSON format:
      {
        "recommendations": [
          {
            "medicine": "OTC medicine name",
            "type": "Medicine category (pain reliever, antacid, etc.)",
            "dosage": "Typical adult dosage",
            "duration": "How long to use",
            "sideEffects": ["common", "side", "effects"],
            "warnings": ["important", "warnings"]
          }
        ],
        "generalAdvice": "General health advice for these symptoms",
        "whenToSeeDoctor": "Warning signs that require medical attention",
        "disclaimer": "Important medical disclaimer"
      }

      Important: Only recommend common, safe OTC medicines. Include strong medical disclaimers.
      `;

      const result = await this.retryWithBackoff(() => model.generateContent(prompt));
      const response = await result.response;
      const content = response.text();
      
      if (content) {
        try {
          return JSON.parse(this.cleanJsonResponse(content));
        } catch (parseError) {
          return this.createFallbackOTCResponse(symptoms);
        }
      }
      return this.createFallbackOTCResponse(symptoms);
    } catch (error) {
      console.error('Gemini OTC Recommendations Error:', error);
      return this.createFallbackOTCResponse(symptoms);
    }
  }

  async chatbotResponse(message: string, context?: string): Promise<string> {
    try {
      const systemPrompt = `You are MedWise AI, a helpful healthcare assistant. You help users understand prescriptions, manage medicines responsibly, and provide basic health information. 
      Guidelines:
      - Always include medical disclaimers
      - Don't provide specific medical diagnoses
      - Encourage consulting healthcare providers for serious concerns
      - Be helpful but emphasize the importance of professional medical advice
      - Focus on education and general wellness information
      `;

      const result = await this.retryWithBackoff(() => model.generateContent(systemPrompt + "\n\nUser Message: " + message));
      const response = await result.response;
      return response.text() || "I'm here to help with health-related questions. Please note that I'm an AI assistant and cannot replace professional medical advice. How can I assist you today?";
    } catch (error) {
      console.error('Gemini Chatbot Error:', error);
      return "I'm experiencing some technical difficulties. Please try again later. For urgent medical concerns, please contact your healthcare provider.";
    }
  }

  async getDonateDisposeRecommendation(medicineInfo: any): Promise<any> {
    try {
      const prompt = `
      Based on this medicine information, provide a recommendation on whether to keep, donate, or dispose:

      Medicine: ${JSON.stringify(medicineInfo)}

      Consider:
      - Expiry date
      - Condition of medicine
      - Type of medication
      - Safety considerations

      Respond in JSON format:
      {
        "recommendation": "keep|donate|dispose",
        "reasoning": "Detailed explanation",
        "instructions": ["step", "by", "step", "instructions"],
        "resources": ["helpful", "resources", "or", "contacts"],
        "warnings": ["important", "safety", "warnings"]
      }
      `;

      const result = await this.retryWithBackoff(() => model.generateContent(prompt));
      const response = await result.response;
      const content = response.text();
      
      if (content) {
        try {
          return JSON.parse(this.cleanJsonResponse(content));
        } catch (parseError) {
          return this.createFallbackDonateDisposeResponse(medicineInfo);
        }
      }
      return this.createFallbackDonateDisposeResponse(medicineInfo);
    } catch (error) {
      console.error('Gemini Donate/Dispose Recommendation Error:', error);
      return this.createFallbackDonateDisposeResponse(medicineInfo);
    }
  }

  async getDisposalGuidelines(medicineType: string, location: string): Promise<any> {
    try {
      const prompt = `
      Provide detailed, safe disposal guidelines for ${medicineType || 'general'} medicines.
      Location: ${location || 'General'}
      
      Respond in JSON format:
      {
        "guidelines": {
          "general": ["important", "general", "rules"],
          "safeDisposal": ["official", "disposal", "methods"],
          "specificTypes": {
            "controlled": ["instructions", "for", "controlled", "substances"],
            "liquid": ["how", "to", "handle", "liquids"],
            "inhalers": ["inhaler", "disposal"]
          },
          "emergency": ["trash", "disposal", "steps"]
        },
        "localResources": [
          {
            "name": "Resource Name",
            "type": "Type of facility",
            "description": "How they help",
            "contact": "How to reach"
          }
        ]
      }
      `;

      const result = await this.retryWithBackoff(() => model.generateContent(prompt));
      const response = await result.response;
      const content = response.text();
      
      if (content) {
        try {
          return JSON.parse(this.cleanJsonResponse(content));
        } catch (parseError) {
          return this.createFallbackDisposalGuidelines();
        }
      }
      return this.createFallbackDisposalGuidelines();
    } catch (error) {
      console.error('Gemini Disposal Guidelines Error:', error);
      return this.createFallbackDisposalGuidelines();
    }
  }

  // Fallback methods for when AI service fails
  private createFallbackPrescriptionResponse(text: string, customMessage?: string) {
    return {
      summary: customMessage || "AI analysis is currently unavailable. Please consult your healthcare provider for medication information.",
      medications: [
        {
          name: "Analysis unavailable",
          purpose: "Please try again or consult your pharmacist",
          dosage: "As prescribed",
          frequency: "As directed",
          instructions: "Follow professional guidance",
          sideEffects: ["Consult healthcare provider"],
          warnings: ["Please verify with your doctor"]
        }
      ],
      importantNotes: [
        "Take medications as prescribed",
        "Consult your pharmacist for questions",
        "Keep regular medical appointments"
      ],
      disclaimer: "This AI service is temporarily limited. Always consult healthcare professionals for medical advice."
    };
  }

  private createFallbackOCRResponse(text: string, customMessage?: string) {
    return {
      name: customMessage || "Unable to read text clearly",
      manufacturer: "Please check manually",
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      batchNumber: "Unknown",
      strength: "Please check packaging",
      isExpired: false,
      recommendation: 'dispose',
      reasoning: customMessage || "OCR analysis failed. Please check expiry date manually and dispose if expired."
    };
  }

  private createFallbackOTCResponse(symptoms: string) {
    return {
      recommendations: [
        {
          medicine: "Consult pharmacist for recommendations",
          type: "Professional guidance",
          dosage: "As recommended by pharmacist",
          duration: "As advised",
          sideEffects: ["Varies by medication"],
          warnings: ["Consult healthcare provider"]
        }
      ],
      generalAdvice: "Please consult a pharmacist or healthcare provider for appropriate recommendations.",
      whenToSeeDoctor: "If symptoms persist or worsen, seek medical attention immediately.",
      disclaimer: "AI recommendations are unavailable. Please consult healthcare professionals."
    };
  }

  private createFallbackDonateDisposeResponse(medicineInfo: any) {
    return {
      recommendation: 'dispose',
      reasoning: "Unable to analyze medicine information. For safety, we recommend proper disposal.",
      instructions: [
        "Check expiry date manually",
        "Contact local pharmacy for disposal programs",
        "Do not throw in regular trash"
      ],
      resources: ["Local pharmacy", "Healthcare provider", "Municipal waste programs"],
      warnings: ["Never share prescription medications", "Always dispose of expired medicines safely"]
    };
  }

  private createFallbackDisposalGuidelines() {
    return {
      guidelines: {
        general: [
          "Remove or black out personal information on prescription labels",
          "Keep medicines in original containers when possible",
          "Do not crush or dissolve medicines unless specifically instructed",
          "Never flush medicines down the toilet unless specifically directed"
        ],
        safeDisposal: [
          "Use FDA-approved disposal programs",
          "Take to pharmacy take-back programs",
          "Use municipal hazardous waste programs",
          "Follow DEA National Prescription Drug Take Back events"
        ],
        specificTypes: {
          controlled: [
            "Contact DEA-authorized collection sites",
            "Use mail-back programs for controlled substances",
            "Never give to unauthorized persons"
          ],
          liquid: [
            "Do not pour down drains",
            "Absorb with kitty litter or coffee grounds",
            "Seal in plastic bag before disposal"
          ],
          inhalers: [
            "Check if inhaler is empty",
            "Follow manufacturer instructions",
            "Some inhalers are recyclable"
          ]
        },
        emergency: [
          "If no take-back program available, mix with unpalatable substance",
          "Place in sealed container",
          "Throw in household trash",
          "Remove personal information from labels"
        ]
      },
      localResources: [
        {
          name: "Local Pharmacy Chain",
          type: "Pharmacy take-back",
          description: "Most major pharmacy chains accept expired medicines",
          contact: "Visit pharmacy customer service"
        }
      ]
    };
  }
}

export const aiService = new AIService();
