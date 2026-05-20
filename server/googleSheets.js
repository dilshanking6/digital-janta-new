const axios = require('axios');
require('dotenv').config();

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

async function getSheetData(sheetName) {
  try {
    console.log(`Fetching data from sheet: ${sheetName}...`);
    const response = await axios.post(APPS_SCRIPT_URL, {
      action: 'read',
      sheetName: sheetName
    });
    console.log(`Data fetched successfully from ${sheetName}`);
    return response.data;
  } catch (error) {
    console.error(`Error reading ${sheetName}:`, error.response ? error.response.data : error.message);
    return null;
  }
}

async function appendSheetData(sheetName, values) {
  try {
    console.log(`Appending data to sheet: ${sheetName}... Data:`, values);
    const response = await axios.post(APPS_SCRIPT_URL, {
      action: 'append',
      sheetName: sheetName,
      values: values
    });
    console.log(`Data appended successfully to ${sheetName}. Response:`, response.data);
    return true;
  } catch (error) {
    console.error(`Error appending to ${sheetName}:`, error.response ? error.response.data : error.message);
    return false;
  }
}

async function deleteSheetData(sheetName, id) {
  try {
    console.log(`Deleting ID ${id} from sheet: ${sheetName}...`);
    const response = await axios.post(APPS_SCRIPT_URL, {
      action: 'delete',
      sheetName: sheetName,
      id: id
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting from ${sheetName}:`, error.message);
    return null;
  }
}

async function updateSheetData(sheetName, id, values) {
  try {
    console.log(`Updating ID ${id} in sheet: ${sheetName}...`);
    const response = await axios.post(APPS_SCRIPT_URL, {
      action: 'update',
      sheetName: sheetName,
      id: id,
      values: values
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating ${sheetName}:`, error.message);
    return null;
  }
}

module.exports = { getSheetData, appendSheetData, deleteSheetData, updateSheetData };
