import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Import all route handlers
import { uploadPrescription, analyzePrescription, getPrescriptionHistory } from "./routes/prescription";
import { uploadStripImage, scanMedicineStrip, updateMedicineInfo, getScanHistory } from "./routes/ocr";
import { getOTCRecommendations, searchOTCMedicines, getOTCCategories } from "./routes/otc";
import { getDonateDisposeRecommendation, findDonationCenters, getDisposalGuidelines, reportDonation } from "./routes/donateDispose";
import { startChatSession, sendMessage, getChatHistory, endChatSession, getQuickReplies } from "./routes/chatbot";

import { connectDB } from "./db";
import { authRoutes } from "./routes/auth";

// Connect to MongoDB
connectDB();

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Routes
  app.use("/api/auth", authRoutes);

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Prescription Analysis Routes
  app.post("/api/prescription/upload", uploadPrescription, analyzePrescription);
  app.get("/api/prescription/history", getPrescriptionHistory);

  // OCR Strip Scanner Routes
  app.post("/api/ocr/scan", uploadStripImage, scanMedicineStrip);
  app.post("/api/ocr/update", updateMedicineInfo);
  app.get("/api/ocr/history", getScanHistory);

  // OTC Suggestions Routes
  app.post("/api/otc/recommendations", getOTCRecommendations);
  app.get("/api/otc/search", searchOTCMedicines);
  app.get("/api/otc/categories", getOTCCategories);

  // Donate/Dispose Routes
  app.post("/api/donate-dispose/recommendation", getDonateDisposeRecommendation);
  app.get("/api/donate-dispose/donation-centers", findDonationCenters);
  app.get("/api/donate-dispose/disposal-guidelines", getDisposalGuidelines);
  app.post("/api/donate-dispose/report-donation", reportDonation);

  // Chatbot Routes
  app.post("/api/chatbot/start", startChatSession);
  app.post("/api/chatbot/message", sendMessage);
  app.get("/api/chatbot/history/:sessionId", getChatHistory);
  app.delete("/api/chatbot/session/:sessionId", endChatSession);
  app.get("/api/chatbot/quick-replies", getQuickReplies);

  // Error handling middleware
  app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server Error:', error);
    
    if (error.message.includes('File too large')) {
      return res.status(413).json({
        error: 'File too large',
        message: 'File size exceeds 10MB limit'
      });
    }
    
    if (error.message.includes('Only images') || error.message.includes('Invalid file')) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong on our end'
    });
  });

  return app;
}
