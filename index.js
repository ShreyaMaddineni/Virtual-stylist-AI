// backend/index.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = 5000;

// Initialize Replicate with token from environment variables
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// POST endpoint for image upload and analysis
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  const uploadedFilePath = path.join(__dirname, req.file.path);
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`; // Public URL for the uploaded image

  try {
    // Send the image to Replicate for processing
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a', // Replace with the version you get from Replicate
        input: {
          image: fileUrl,
          candidate_labels: "dress, jeans, jacket, shorts, blazer, coat, sneakers, heels, formal, casual",
          return_embeddings: false
        }
      })
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error);

    const labels = data?.prediction?.output || [];
    res.status(200).json({ message: 'Success', recommendations: labels });

  } catch (error) {
    console.error('Replicate API error:', error);
    res.status(500).send('Failed to analyze image.');
  }

  // Delete uploaded image after processing
  fs.unlinkSync(uploadedFilePath);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


