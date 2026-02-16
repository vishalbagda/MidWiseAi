import { RequestHandler } from "express";
import { aiService } from "../services/aiService";

export const getOTCRecommendations: RequestHandler = async (req, res) => {
  try {
    const { symptoms, age, weight, allergies, currentMedications } = req.body;
    
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid symptoms',
        message: 'Please provide symptoms description (minimum 2 characters)'
      });
    }

    const userInfo = {
      age: age || null,
      weight: weight || null,
      allergies: allergies || [],
      currentMedications: currentMedications || []
    };

    // Get AI-powered OTC recommendations
    const recommendations = await aiService.getOTCRecommendations(symptoms, userInfo);

    res.json({
      success: true,
      data: {
        ...recommendations,
        query: {
          symptoms,
          userInfo
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('OTC recommendations error:', error);
    res.status(500).json({
      error: 'Recommendations failed',
      message: error instanceof Error ? error.message : 'Failed to get OTC recommendations'
    });
  }
};

export const searchOTCMedicines: RequestHandler = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid search query',
        message: 'Please provide a search term'
      });
    }

    // Mock OTC medicine database search
    const mockResults = [
      {
        name: "Paracetamol",
        category: "Pain reliever",
        description: "Common pain and fever reducer",
        dosage: "500mg every 4-6 hours",
        warnings: ["Do not exceed 4g per day", "Avoid alcohol"]
      },
      {
        name: "Ibuprofen",
        category: "Anti-inflammatory",
        description: "Pain, inflammation, and fever reducer",
        dosage: "200-400mg every 4-6 hours",
        warnings: ["Take with food", "Avoid if stomach ulcers"]
      },
      {
        name: "Antacid",
        category: "Digestive",
        description: "Neutralizes stomach acid",
        dosage: "As needed for heartburn",
        warnings: ["Do not use for more than 2 weeks"]
      }
    ].filter(med => 
      med.name.toLowerCase().includes(query.toString().toLowerCase()) ||
      med.category.toLowerCase().includes(query.toString().toLowerCase())
    );

    res.json({
      success: true,
      data: {
        results: mockResults,
        query,
        total: mockResults.length
      }
    });

  } catch (error) {
    console.error('OTC search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Failed to search OTC medicines'
    });
  }
};

export const getOTCCategories: RequestHandler = async (req, res) => {
  try {
    const categories = [
      {
        name: "Pain Relief",
        description: "Headaches, body aches, fever",
        icon: "pill",
        medicines: ["Paracetamol", "Ibuprofen", "Aspirin"]
      },
      {
        name: "Digestive Health",
        description: "Stomach issues, heartburn, nausea",
        icon: "stomach",
        medicines: ["Antacids", "Anti-diarrheal", "Probiotics"]
      },
      {
        name: "Cold & Flu",
        description: "Cough, congestion, runny nose",
        icon: "thermometer",
        medicines: ["Cough syrup", "Decongestants", "Throat lozenges"]
      },
      {
        name: "Allergy Relief",
        description: "Sneezing, itching, hives",
        icon: "allergen",
        medicines: ["Antihistamines", "Eye drops", "Nasal sprays"]
      },
      {
        name: "Skin Care",
        description: "Cuts, rashes, burns",
        icon: "bandage",
        medicines: ["Antiseptic", "Hydrocortisone", "Bandages"]
      },
      {
        name: "Sleep & Wellness",
        description: "Sleep aids, vitamins, supplements",
        icon: "moon",
        medicines: ["Melatonin", "Vitamins", "Minerals"]
      }
    ];

    res.json({
      success: true,
      data: {
        categories,
        total: categories.length
      }
    });

  } catch (error) {
    console.error('Get OTC categories error:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: 'Could not retrieve OTC categories'
    });
  }
};
