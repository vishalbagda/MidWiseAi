import { RequestHandler } from "express";
import { aiService } from "../services/aiService";
import { fileService, upload } from "../services/fileService";

export const uploadStripImage: RequestHandler = upload.single('stripImage');

export const scanMedicineStrip: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image uploaded',
        message: 'Please upload an image of the medicine strip'
      });
    }

    // Validate image file type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!fileService.validateFileType(req.file, allowedImageTypes)) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only image files (JPEG, PNG, GIF, WEBP) are supported for strip scanning'
      });
    }

    // Extract text from image using OCR
    const ocrText = await fileService.extractTextFromImage(req.file.buffer);
    
    if (!ocrText || ocrText.trim().length < 3) {
      return res.status(400).json({
        error: 'No readable text found',
        message: 'Could not extract readable text from the image. Please ensure the image is clear and well-lit.'
      });
    }

    // Analyze OCR text with AI to extract medicine information
    const medicineInfo = await aiService.analyzeOCRText(ocrText);

    res.json({
      success: true,
      data: {
        ...medicineInfo,
        fileInfo: {
          name: req.file.originalname,
          size: fileService.formatFileSize(req.file.size),
          type: req.file.mimetype
        },
        ocrText: ocrText.substring(0, 300) + (ocrText.length > 300 ? '...' : ''),
        confidence: 'high' // In real implementation, this would come from OCR engine
      }
    });

  } catch (error) {
    console.error('OCR scanning error:', error);
    res.status(500).json({
      error: 'Scanning failed',
      message: error instanceof Error ? error.message : 'Failed to scan medicine strip'
    });
  }
};

export const updateMedicineInfo: RequestHandler = async (req, res) => {
  try {
    const { medicineInfo } = req.body;
    
    if (!medicineInfo) {
      return res.status(400).json({
        error: 'Missing medicine information',
        message: 'Please provide medicine information to update'
      });
    }

    // Get updated recommendation based on corrected information
    const recommendation = await aiService.getDonateDisposeRecommendation(medicineInfo);

    res.json({
      success: true,
      data: {
        ...medicineInfo,
        ...recommendation,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Update medicine info error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: error instanceof Error ? error.message : 'Failed to update medicine information'
    });
  }
};

export const getScanHistory: RequestHandler = async (req, res) => {
  try {
    // This would typically fetch from a database
    // For now, return empty array
    res.json({
      success: true,
      data: {
        history: [],
        message: "Scan history feature coming soon"
      }
    });
  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      message: 'Could not retrieve scan history'
    });
  }
};
