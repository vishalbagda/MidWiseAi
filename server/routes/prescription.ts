import { RequestHandler } from "express";
import { aiService } from "../services/aiService";
import { fileService, upload } from "../services/fileService";

export const uploadPrescription: RequestHandler = upload.single('prescription');

export const analyzePrescription: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please upload a prescription file (PDF or image)'
      });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!fileService.validateFileType(req.file, allowedTypes)) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only PDF and image files are supported'
      });
    }

    // Extract text from uploaded file
    const extractedText = await fileService.processUploadedFile(req.file);
    
    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(400).json({
        error: 'No readable text found',
        message: 'Could not extract readable text from the file. Please ensure the image is clear and contains text.'
      });
    }

    // Analyze prescription with AI
    const analysis = await aiService.analyzePrescription(extractedText);

    res.json({
      success: true,
      data: {
        ...analysis,
        fileInfo: {
          name: req.file.originalname,
          size: fileService.formatFileSize(req.file.size),
          type: req.file.mimetype
        },
        extractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '')
      }
    });

  } catch (error) {
    console.error('Prescription analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Failed to analyze prescription'
    });
  }
};

export const getPrescriptionHistory: RequestHandler = async (req, res) => {
  try {
    // This would typically fetch from a database
    // For now, return empty array
    res.json({
      success: true,
      data: {
        history: [],
        message: "Prescription history feature coming soon"
      }
    });
  } catch (error) {
    console.error('Get prescription history error:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      message: 'Could not retrieve prescription history'
    });
  }
};
