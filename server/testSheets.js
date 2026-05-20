const axios = require('axios');
require('dotenv').config();

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyDM5FAazjyspReasoh4itia8Tw2YKWK41jlWw1l3Y4EMnwduGRryRpr3nNbdd7TILL/exec';

async function testConnection() {
  console.log('--- Testing Google Apps Script Connection ---');
  console.log('URL:', APPS_SCRIPT_URL);

  try {
    console.log('\n1. Testing GET request (doGet)...');
    const getRes = await axios.get(APPS_SCRIPT_URL);
    console.log('GET Response:', getRes.data);

    console.log('\n2. Testing POST request (doPost - read Users)...');
    const postRes = await axios.post(APPS_SCRIPT_URL, {
      action: 'read',
      sheetName: 'Users'
    });
    console.log('POST Response:', JSON.stringify(postRes.data).substring(0, 100) + '...');

    console.log('\n3. Testing POST request (doPost - append Test User)...');
    const appendRes = await axios.post(APPS_SCRIPT_URL, {
      action: 'append',
      sheetName: 'Users',
      values: ['Test Name', 'test@email.com', 'password123', 'student', '10', 'A', 'test-id-123']
    });
    console.log('Append Response:', appendRes.data);

    console.log('\n--- Test Completed ---');
  } catch (error) {
    console.error('\n--- Test Failed ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testConnection();
