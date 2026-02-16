import { RequestHandler } from "express";
import { aiService } from "../services/aiService";
import fs from "fs";
import path from "path";

const DONATION_CENTERS_PATH = path.join(process.cwd(), "shared", "donationCenters.json");
const DONATIONS_PATH = path.join(process.cwd(), "server", "donations.json");

export const getDonateDisposeRecommendation: RequestHandler = async (req, res) => {
  try {
    const { medicineInfo } = req.body;
    
    if (!medicineInfo) {
      return res.status(400).json({
        error: 'Missing medicine information',
        message: 'Please provide medicine information for recommendation'
      });
    }

    // Get AI-powered recommendation
    const recommendation = await aiService.getDonateDisposeRecommendation(medicineInfo);

    res.json({
      success: true,
      data: {
        ...recommendation,
        medicineInfo,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Donate/Dispose recommendation error:', error);
    res.status(500).json({
      error: 'Recommendation failed',
      message: error instanceof Error ? error.message : 'Failed to get recommendation'
    });
  }
};

export const findDonationCenters: RequestHandler = async (req, res) => {
  try {
    const { location, medicineType } = req.query;
    
    // Load donation centers from shared JSON
    let donationCenters = [];
    console.log(`[DonateDispose] findDonationCenters called with location: "${location}", medicineType: "${medicineType}"`);
    
    if (fs.existsSync(DONATION_CENTERS_PATH)) {
      const data = fs.readFileSync(DONATION_CENTERS_PATH, "utf-8");
      donationCenters = JSON.parse(data);
    } else {
      console.error(`[DonateDispose] JSON file NOT FOUND at: ${DONATION_CENTERS_PATH}`);
    }

    // Filter by location if provided
    if (location) {
      const searchLoc = (location as string).toLowerCase().trim();
      donationCenters = donationCenters.filter((center: any) => 
        (center.city && center.city.toLowerCase().includes(searchLoc)) || 
        (center.address && center.address.toLowerCase().includes(searchLoc)) ||
        (center.zipCode && center.zipCode.includes(searchLoc))
      );
    }

    console.log(`[DonateDispose] Returning ${donationCenters.length} centers for search: "${location}"`);

    res.json({
      success: true,
      data: {
        centers: donationCenters,
        searchCriteria: {
          location: location || "All locations",
          medicineType: medicineType || "Any"
        },
        total: donationCenters.length,
        disclaimer: "Please contact centers directly to confirm current donation policies"
      }
    });

  } catch (error) {
    console.error('Find donation centers error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Failed to find donation centers'
    });
  }
};

export const getDisposalGuidelines: RequestHandler = async (req, res) => {
  try {
    const { medicineType, location } = req.query;
    
    // Get AI-powered disposal guidelines
    const guidelinesData = await aiService.getDisposalGuidelines(
      medicineType as string || 'general', 
      location as string || 'General'
    );

    res.json({
      success: true,
      data: {
        ...guidelinesData,
        searchCriteria: {
          medicineType: medicineType || "general",
          location: location || "general"
        },
        lastUpdated: new Date().toISOString(),
        disclaimer: "Guidelines may vary by location. Check with local authorities for specific requirements."
      }
    });

  } catch (error) {
    console.error('Get disposal guidelines error:', error);
    res.status(500).json({
      error: 'Failed to fetch guidelines',
      message: 'Could not retrieve disposal guidelines'
    });
  }
};

export const reportDonation: RequestHandler = async (req, res) => {
  try {
    const { donationInfo } = req.body;
    
    if (!donationInfo) {
      return res.status(400).json({
        error: 'Missing donation information',
        message: 'Please provide donation details'
      });
    }

    // Persist donation to JSON file
    let donations = [];
    if (fs.existsSync(DONATIONS_PATH)) {
      try {
        const data = fs.readFileSync(DONATIONS_PATH, "utf-8");
        donations = JSON.parse(data);
      } catch (e) {
        donations = [];
      }
    }

    const reportId = `DON${Date.now()}`;
    const newDonation = {
      reportId,
      ...donationInfo,
      submittedAt: new Date().toISOString()
    };

    donations.push(newDonation);
    fs.writeFileSync(DONATIONS_PATH, JSON.stringify(donations, null, 2));
    
    res.json({
      success: true,
      data: {
        reportId,
        status: "recorded",
        message: "Thank you for your donation! Your contribution helps others in need.",
        donationInfo,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Report donation error:', error);
    res.status(500).json({
      error: 'Report failed',
      message: 'Failed to record donation'
    });
  }
};
