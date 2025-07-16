import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to test image
const imagePath = path.join(__dirname, 'fair_skin_test.jpg');

// Create a form data object
const formData = new FormData();
formData.append('image', fs.createReadStream(imagePath));

// Make the API request
console.log(`Sending request to detect skin tone using image: ${imagePath}`);

axios.post('http://localhost:5000/detect-skintone', formData, {
  headers: formData.getHeaders()
})
.then(response => {
  console.log('API Response:');
  console.log(JSON.stringify(response.data, null, 2));
})
.catch(error => {
  console.error('Error:');
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(`Status: ${error.response.status}`);
    console.error('Response data:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error message:', error.message);
  }
});