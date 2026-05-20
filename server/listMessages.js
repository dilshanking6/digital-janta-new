const axios = require('axios');
require('dotenv').config();

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

async function listMessages() {
  try {
    const res = await axios.post(APPS_SCRIPT_URL, {
      action: 'read',
      sheetName: 'Messages'
    });
    console.log('Messages in Sheet:');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}

listMessages();
