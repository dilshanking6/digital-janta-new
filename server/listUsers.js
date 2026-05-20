const axios = require('axios');
require('dotenv').config();

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

async function listUsers() {
  try {
    const res = await axios.post(APPS_SCRIPT_URL, {
      action: 'read',
      sheetName: 'Users'
    });
    console.log('Users in Sheet:');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}

listUsers();
