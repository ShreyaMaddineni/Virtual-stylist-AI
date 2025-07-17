// backend/routes/upload.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const fetch = require('node-fetch');
const Replicate = require('replicate');
const path = require('path');

const router = express.Router();

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN, // Use the token from .env
});

// POST route for image upload and recommendation
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  const imagePath = req.file.path;

  try {
    // Convert the uploaded image to base64
    const imageData = fs.readFileSync(imagePath, { encoding: 'base64' });

    // Upload the image to Replicate's CDN (optional step if necessary)
    const uploadResponse = await fetch('https://dreambooth-api-experimental.replicate.com/v1/upload', {
      method: 'POST',
      headers: {
        Authorization: `Token ${replicate.auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: `data:image/jpeg;base64,${imageData}`,
      }),
    });

    const { url: imageUrl } = await uploadResponse.json();

    // Prepare input for the FashionCLIP model
    const input = {
      image: imageUrl,
      text: 'a fashionable outfit', // Text to guide the model
    };

    console.log('Sending request to Replicate with image:', imagePath);

    // Run the FashionCLIP model
    const output = await replicate.run(
      'fashionclip/fashion-clip:latest', // Model version ID
      { input }
    );

    console.log('Raw output from Replicate:', output);

    // Extract recommendations (labels)
    let labels = output?.similar_texts || [];

    // Fallback message if no recommendations found
    if (!labels.length) {
      labels = [
        'No recommendations found. Try using a clearer image.',
        'Ensure clothing is visible and well-lit in the image.',
      ];
    }

    // Delete the uploaded image after processing
    fs.unlinkSync(imagePath);

    // Send response with labels
    res.json({ labels });

  } catch (error) {
    console.error('Error during image analysis:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

module.exports = router;

