const axios = require('axios');
require('dotenv').config();

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

async function updatePrincipal() {
  try {
    const hashedPassword = '$2b$10$oLwTd.XOY4yb3caTH/rBw.veXxMqn2FA70gBSj.m0RVezcAey3vMG';
    const updatedRow = ["dilshan", "dilshan@janta.com", hashedPassword, "principal", "", "", "6a0acf3fd0e6266d698d14ff"];
    
    // The ID to find the row might be "test-id-123" currently
    const response = await axios.post(APPS_SCRIPT_URL, {
      action: 'update',
      sheetName: 'Users',
      id: 'test-id-123',
      values: updatedRow
    });
    console.log('Update Response:', response.data);
  } catch (err) {
    console.error(err.message);
  }
}

updatePrincipal();
