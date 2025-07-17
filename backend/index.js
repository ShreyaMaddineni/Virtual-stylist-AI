import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

// To get the directory name in ES modules, use import.meta.url
const __dirname = new URL('.', import.meta.url).pathname;

const app = express();
const port = 5000;

// Middleware to handle JSON and URL encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint to handle file upload and process
app.post('/upload', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  
  if (!uploadedFile) {
    return res.status(400).send('No file uploaded');
  }

  const imagePath = path.join(__dirname, 'uploads', uploadedFile.filename);

  // You can process the image here (e.g., with a body shape detection API or other logic)
  console.log(`Uploaded file path: ${imagePath}`);
  res.send({
    message: 'File uploaded successfully',
    filePath: imagePath,
    fileUrl: `http://localhost:${port}/uploads/${uploadedFile.filename}`,
  });
});

// Body shape recommendations (simplified)
const bodyShapeRecommendations = {
  hourglass: ['Fitted tops and bottoms', 'Cinch-waisted dresses', 'High-waisted skirts'],
  pear: ['A-line skirts', 'Empire-waist dresses', 'Tops that draw attention to the shoulders'],
  apple: ['V-necklines', 'Empire-waist tops', 'Tailored trousers'],
  rectangle: ['Ruffles', 'Belts', 'High-waisted bottoms'],
  invertedTriangle: ['Wide-leg pants', 'A-line skirts', 'V-neck tops'],
};

// Endpoint to get body shape-based recommendations
app.post('/body-shape-recommendation', (req, res) => {
  const { shape } = req.body;
  const recommendations = bodyShapeRecommendations[shape.toLowerCase()];

  if (!recommendations) {
    return res.status(400).send('Invalid body shape');
  }

  res.send({
    shape,
    recommendations,
  });
});

// Occasion-based outfit recommendations (for events like meeting, party, etc.)
const occasionRecommendations = {
  meeting: [
    { outfit: 'Suit', color: 'Black suit with white shirt' },
    { outfit: 'Coordinated suit', color: 'Off-white suit with navy blue shirt' },
    { outfit: 'Formal skirt with blouse', color: 'Dark grey skirt with red blouse' },
    { outfit: 'Blazer with trousers', color: 'Black blazer with grey trousers' },
  ],
  casual: [
    { outfit: 'Jeans and t-shirt', color: 'Light blue jeans with white t-shirt' },
    { outfit: 'Casual dress', color: 'Floral dress with light pink accents' },
    { outfit: 'Shorts and a tank top', color: 'Khaki shorts with white tank top' },
    { outfit: 'Joggers with a hoodie', color: 'Grey joggers with black hoodie' },
  ],
  party: [
    { outfit: 'Cocktail dress', color: 'Black cocktail dress with red heels' },
    { outfit: 'Stylish jumpsuit', color: 'Navy blue jumpsuit with silver accessories' },
    { outfit: 'Dressy blouse with a skirt', color: 'White blouse with black skirt' },
    { outfit: 'Maxi dress', color: 'Gold maxi dress with a beige belt' },
  ]
};

// Endpoint to get outfit recommendations based on occasion
app.post('/occasion-recommendation', (req, res) => {
  const { occasion } = req.body;

  if (!occasion) {
    return res.status(400).send('Occasion is required');
  }

  const occasionOutfits = occasionRecommendations[occasion];

  if (!occasionOutfits) {
    return res.status(400).send('Invalid occasion input');
  }

  res.send({
    occasion,
    recommendations: occasionOutfits,
  });
});

// Weather-based outfit recommendations (based on weather conditions like hot, cold, rainy)
const weatherRecommendations = {
  hot: [
    { outfit: 'Light dress', color: 'White cotton dress with floral print' },
    { outfit: 'Skirts', color: 'Black A-line skirt with coral top' },
    { outfit: 'Shorts', color: 'Denim shorts with green t-shirt' },
    { outfit: 'Tank tops', color: 'Yellow tank top with light blue jeans' },
    { outfit: 'Sundresses', color: 'Pink sundress with brown sandals' },
  ],
  cold: [
    { outfit: 'Sweaters', color: 'Beige sweater with brown pants' },
    { outfit: 'Coats', color: 'Camel coat with grey scarf' },
    { outfit: 'Layered outfits', color: 'Black jacket over a red shirt with denim jeans' },
    { outfit: 'Scarves', color: 'Dark grey scarf with red gloves' },
    { outfit: 'Boots', color: 'Brown leather boots with black leggings' },
  ],
  rainy: [
    { outfit: 'Raincoat', color: 'Yellow raincoat with black boots' },
    { outfit: 'Waterproof boots', color: 'Black waterproof boots with blue jeans' },
    { outfit: 'Umbrella', color: 'Transparent umbrella with any outfit' },
    { outfit: 'Water-resistant jacket', color: 'Navy jacket with black pants' },
  ],
};

// Endpoint to get outfit recommendations based on weather
app.post('/weather-recommendation', (req, res) => {
  const { weather } = req.body;

  if (!weather) {
    return res.status(400).send('Weather is required');
  }

  const weatherOutfits = weatherRecommendations[weather];

  if (!weatherOutfits) {
    return res.status(400).send('Invalid weather input');
  }

  res.send({
    weather,
    recommendations: weatherOutfits,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});





















