const axios = require('axios');
require('dotenv').config();

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

async function cleanup() {
  try {
    // Delete the one with plain text password and old ID
    const response = await axios.post(APPS_SCRIPT_URL, {
      action: 'delete',
      sheetName: 'Users',
      id: 'test-id-123'
    });
    console.log('Delete Response:', response.data);
  } catch (err) {
    console.error(err.message);
  }
}

cleanup();
