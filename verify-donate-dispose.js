const BASE_URL = 'http://localhost:8080/api';

async function verifyFeatures() {
  console.log('--- Verifying Medicine Donation & Disposal Features ---');

  try {
    // 1. Verify Recommendation
    console.log('\n1. Testing AI Recommendation...');
    const recRes = await fetch(`${BASE_URL}/donate-dispose/recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicineInfo: {
          name: "Paracetamol 500mg",
          expiryDate: "2025-12-31",
          condition: "unopened",
          medicineType: "otc"
        }
      })
    });
    const recData = await recRes.json();
    console.log('Recommendation Success:', recData.success ? 'SUCCESS' : 'FAILED');
    if (recData.success) {
      console.log('Recommendation:', recData.data.recommendation);
    }

    // 2. Verify Donation Centers
    console.log('\n2. Testing Find Donation Centers (Mumbai)...');
    const centerRes = await fetch(`${BASE_URL}/donate-dispose/donation-centers?location=Mumbai`);
    const centerData = await centerRes.json();
    console.log('Centers Found Success:', centerData.success ? 'SUCCESS' : 'FAILED');
    console.log('Centers Count:', centerData.data.total);
    if (centerData.data.total > 0) {
      console.log('First Center Name:', centerData.data.centers[0].name);
    }

    // 3. Verify Disposal Guidelines
    console.log('\n3. Testing Disposal Guidelines...');
    const guideRes = await fetch(`${BASE_URL}/donate-dispose/disposal-guidelines`);
    const guideData = await guideRes.json();
    console.log('Guidelines Success:', guideData.success ? 'SUCCESS' : 'FAILED');
    if (guideData.success) {
      console.log('General Guidelines Count:', guideData.data.guidelines.general.length);
      console.log('Resource Example:', guideData.data.localResources[0].name);
    }

    // 4. Verify Donation Reporting
    console.log('\n4. Testing Donation Reporting...');
    const reportRes = await fetch(`${BASE_URL}/donate-dispose/report-donation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donationInfo: {
          medicine: { name: "Test Med" },
          center: { name: "Test Center" }
        }
      })
    });
    const reportData = await reportRes.json();
    console.log('Report Recorded Success:', reportData.success ? 'SUCCESS' : 'FAILED');
    if (reportData.success) {
      console.log('Report ID:', reportData.data.reportId);
    }

    console.log('\n--- Verification Completed Successfully ---');

  } catch (error) {
    console.error('\nVerification failed:', error.message);
  }
}

verifyFeatures();
