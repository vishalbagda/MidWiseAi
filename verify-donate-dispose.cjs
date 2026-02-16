const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function verifyFeatures() {
  console.log('--- Verifying Medicine Donation & Disposal Features ---');

  try {
    // 1. Verify Recommendation
    console.log('\n1. Testing AI Recommendation...');
    const recRes = await axios.post(`${BASE_URL}/donate-dispose/recommendation`, {
      medicineInfo: {
        name: "Paracetamol 500mg",
        expiryDate: "2025-12-31",
        condition: "unopened",
        medicineType: "otc"
      }
    });
    console.log('Recommendation Success:', recRes.data.success ? 'SUCCESS' : 'FAILED');
    if (recRes.data.success) {
      console.log('Recommendation:', recRes.data.data.recommendation);
    }

    // 2. Verify Donation Centers
    console.log('\n2. Testing Find Donation Centers (Mumbai)...');
    const centerRes = await axios.get(`${BASE_URL}/donate-dispose/donation-centers?location=Mumbai`);
    console.log('Centers Found Success:', centerRes.data.success ? 'SUCCESS' : 'FAILED');
    console.log('Centers Count:', centerRes.data.data.total);
    if (centerRes.data.data.total > 0) {
      console.log('First Center Name:', centerRes.data.data.centers[0].name);
    }

    // 3. Verify Disposal Guidelines
    console.log('\n3. Testing Disposal Guidelines...');
    const guideRes = await axios.get(`${BASE_URL}/donate-dispose/disposal-guidelines`);
    console.log('Guidelines Success:', guideRes.data.success ? 'SUCCESS' : 'FAILED');
    if (guideRes.data.success) {
      console.log('General Guidelines Count:', guideRes.data.data.guidelines.general.length);
      console.log('Resource Example:', guideRes.data.data.localResources[0].name);
    }

    // 4. Verify Donation Reporting
    console.log('\n4. Testing Donation Reporting...');
    const reportRes = await axios.post(`${BASE_URL}/donate-dispose/report-donation`, {
      donationInfo: {
        medicine: { name: "Test Med" },
        center: { name: "Test Center" }
      }
    });
    console.log('Report Recorded Success:', reportRes.data.success ? 'SUCCESS' : 'FAILED');
    if (reportRes.data.success) {
      console.log('Report ID:', reportRes.data.data.reportId);
    }

    console.log('\n--- Verification Completed Successfully ---');

  } catch (error) {
    console.error('\nVerification failed:', error.response ? error.response.data : error.message);
  }
}

verifyFeatures();
