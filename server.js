import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import path from 'path';
import multer from 'multer';
import { exec } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json());

// Google Vision Client
const client = new ImageAnnotatorClient({
  keyFilename: 'credentials.json', // path to your key
});

// Occasion-based Outfit Recommendation Endpoint
app.post('/occasion-recommendation', (req, res) => {
  const { occasion } = req.body;

  // Enhanced outfit recommendations with more details
  const outfits = {
    party: [
      { 
        outfit: 'Pink shimmer top with black skirt', 
        color: 'Pink and Black',
        style: 'Glamorous',
        accessories: 'Silver hoop earrings, black clutch',
        footwear: 'Black stiletto heels',
        description: 'Perfect for a night club or birthday celebration. The shimmer adds a festive touch.'
      },
      { 
        outfit: 'Red satin dress', 
        color: 'Red',
        style: 'Elegant',
        accessories: 'Gold pendant necklace, minimal bracelet',
        footwear: 'Nude heels',
        description: 'A classic choice for cocktail parties. The satin material creates a luxurious look.'
      },
      { 
        outfit: 'Glitter dress with silver heels', 
        color: 'Silver and Black',
        style: 'Bold',
        accessories: 'Diamond stud earrings, silver clutch',
        footwear: 'Silver strappy heels',
        description: 'Stand out at any party with this eye-catching ensemble that catches the light beautifully.'
      },
      { 
        outfit: 'Black sequined top with leather pants', 
        color: 'Black',
        style: 'Edgy',
        accessories: 'Statement earrings, multiple rings',
        footwear: 'Black ankle boots',
        description: 'A rock-chic look that works well for evening parties and concerts.'
      },
      { 
        outfit: 'White lace top with high-waisted jeans', 
        color: 'White and Blue',
        style: 'Casual-chic',
        accessories: 'Layered necklaces, small crossbody bag',
        footwear: 'Wedge sandals or heels',
        description: 'A more relaxed party look that is still stylish, perfect for daytime gatherings.'
      }
    ],
    meeting: [
      { 
        outfit: 'Navy blue blazer with white formal shirt', 
        color: 'Navy Blue and White',
        style: 'Professional',
        accessories: 'Silver watch, leather portfolio',
        footwear: 'Black or brown oxford shoes',
        description: 'A timeless professional look that conveys confidence and competence.'
      },
      { 
        outfit: 'Black trousers with light gray button-down shirt', 
        color: 'Black and Gray',
        style: 'Business casual',
        accessories: 'Minimalist watch, leather belt',
        footwear: 'Black loafers',
        description: 'A versatile outfit suitable for both formal and semi-formal business settings.'
      },
      { 
        outfit: 'Charcoal blazer with khaki pants', 
        color: 'Charcoal and Khaki',
        style: 'Smart casual',
        accessories: 'Patterned tie or pocket square',
        footwear: 'Brown leather shoes',
        description: 'A balanced look that works well for less formal business meetings or creative industries.'
      },
      { 
        outfit: 'White blouse with gray pencil skirt', 
        color: 'White and Gray',
        style: 'Classic professional',
        accessories: 'Pearl earrings, structured handbag',
        footwear: 'Black pumps',
        description: 'A polished, professional outfit that works in any corporate environment.'
      },
      { 
        outfit: 'Black pencil skirt with a burgundy blouse', 
        color: 'Black and Burgundy',
        style: 'Sophisticated',
        accessories: 'Gold stud earrings, slim belt',
        footwear: 'Black closed-toe heels',
        description: 'The rich burgundy color adds personality while maintaining professionalism.'
      }
    ],
    wedding: [
      { 
        outfit: 'Traditional saree with gold jewelry', 
        color: 'Gold and Red',
        style: 'Traditional',
        accessories: 'Gold bangles, statement earrings, bindi',
        footwear: 'Embellished sandals or heels',
        description: 'A classic choice for Indian weddings that honors cultural traditions.'
      },
      { 
        outfit: 'Elegant white gown with diamond necklace', 
        color: 'White and Diamond',
        style: 'Formal',
        accessories: 'Diamond or crystal jewelry, evening clutch',
        footwear: 'Silver or white heels',
        description: 'A sophisticated option for black-tie wedding events.'
      },
      { 
        outfit: 'Lace dress with satin shoes', 
        color: 'Ivory and Beige',
        style: 'Romantic',
        accessories: 'Pearl jewelry, small clutch',
        footwear: 'Satin pumps or sandals',
        description: 'A feminine and elegant choice for daytime or garden weddings.'
      },
      { 
        outfit: 'Red velvet gown with silver clutch', 
        color: 'Red and Silver',
        style: 'Luxurious',
        accessories: 'Silver statement earrings, bracelet',
        footwear: 'Silver heels',
        description: 'Make a statement at winter weddings with rich velvet texture.'
      },
      { 
        outfit: 'Black tuxedo with bow tie', 
        color: 'Black and White',
        style: 'Classic formal',
        accessories: 'Cufflinks, pocket square, watch',
        footwear: 'Polished black dress shoes',
        description: 'A timeless formal option that works for any black-tie wedding.'
      }
    ],
    casual: [
      { 
        outfit: 'White T-shirt with denim jeans', 
        color: 'White and Blue',
        style: 'Classic casual',
        accessories: 'Simple necklace or watch, sunglasses',
        footwear: 'White sneakers or casual flats',
        description: 'A timeless combination that works for almost any casual occasion.'
      },
      { 
        outfit: 'Gray hoodie with black joggers', 
        color: 'Gray and Black',
        style: 'Athleisure',
        accessories: 'Beanie, crossbody bag',
        footwear: 'Athletic shoes or casual sneakers',
        description: 'Comfortable yet put-together for running errands or casual outings.'
      },
      { 
        outfit: 'Pastel-colored blouse with shorts', 
        color: 'Pastel',
        style: 'Feminine casual',
        accessories: 'Delicate jewelry, straw hat',
        footwear: 'Sandals or espadrilles',
        description: 'Perfect for warm weather casual events or weekend brunches.'
      },
      { 
        outfit: 'Striped top with white pants', 
        color: 'White and Stripes',
        style: 'Nautical casual',
        accessories: 'Canvas tote, simple bracelet',
        footwear: 'Boat shoes or white sneakers',
        description: 'A fresh, clean look that is perfect for spring and summer casual events.'
      },
      { 
        outfit: 'Denim jacket with a white tank top', 
        color: 'Blue and White',
        style: 'Casual cool',
        accessories: 'Layered necklaces, crossbody bag',
        footwear: 'Ankle boots or sneakers',
        description: 'A versatile layered look that works for day-to-night casual occasions.'
      }
    ],
    gym: [
      { 
        outfit: 'Red tank top with black leggings', 
        color: 'Red and Black',
        style: 'High-energy',
        accessories: 'Sweatband, fitness tracker',
        footwear: 'Cross-training shoes',
        description: 'A bold combination that is perfect for high-intensity workouts.'
      },
      { 
        outfit: 'Blue sports bra with gray shorts', 
        color: 'Blue and Gray',
        style: 'Athletic',
        accessories: 'Lightweight water bottle, wireless earbuds',
        footwear: 'Running shoes',
        description: 'Breathable and flexible for cardio or HIIT sessions.'
      },
      { 
        outfit: 'Black compression shirt with training shorts', 
        color: 'Black',
        style: 'Performance',
        accessories: 'Gym gloves, sports watch',
        footwear: 'Weight training shoes',
        description: 'Supportive gear that is ideal for strength training sessions.'
      },
      { 
        outfit: 'Grey hoodie with sweatpants', 
        color: 'Gray',
        style: 'Comfortable',
        accessories: 'Gym bag, water bottle',
        footwear: 'Comfortable athletic shoes',
        description: 'A cozy option for warm-ups or light training days.'
      },
      { 
        outfit: 'White yoga pants with blue tank top', 
        color: 'White and Blue',
        style: 'Flexible',
        accessories: 'Yoga mat, hair tie',
        footwear: 'Barefoot or yoga socks',
        description: 'Stretchy, comfortable attire perfect for yoga or pilates classes.'
      }
    ],
  };

  // Get occasion description
  const occasionInfo = {
    party: {
      title: "Party Outfit Recommendations",
      description: "These outfits are designed for social gatherings, celebrations, and nightlife events. They feature eye-catching elements like shimmer, bold colors, and statement pieces that help you stand out in festive settings."
    },
    meeting: {
      title: "Business Meeting Attire",
      description: "Professional outfits suitable for workplace meetings and business settings. These selections balance professionalism with comfort, featuring classic color combinations and structured pieces."
    },
    wedding: {
      title: "Wedding Guest Attire",
      description: "Elegant options for attending wedding ceremonies and receptions. These outfits respect the formality of the occasion while allowing you to express your personal style appropriately."
    },
    casual: {
      title: "Everyday Casual Wear",
      description: "Comfortable yet stylish options for daily activities, informal gatherings, and relaxed settings. These versatile combinations can be easily accessorized to suit different casual occasions."
    },
    gym: {
      title: "Workout & Fitness Attire",
      description: "Functional outfits designed for exercise and physical activities. These combinations prioritize comfort, movement, and performance while still looking put-together."
    }
  };

  if (!occasion || !outfits[occasion]) {
    return res.status(400).json({ error: 'Invalid occasion selected' });
  }

  // Return enhanced recommendations with occasion information
  res.json({ 
    recommendations: outfits[occasion],
    occasionInfo: occasionInfo[occasion] 
  });
});

// Weather-based Outfit Recommendation Endpoint
app.post('/weather-recommendation', (req, res) => {
  const { weather } = req.body;

  // Enhanced outfit recommendations with more details
  const outfits = {
    sunny: [
      { 
        outfit: 'White T-shirt with denim shorts', 
        color: 'White and Blue',
        style: 'Casual',
        accessories: 'Sunglasses, straw hat, minimal jewelry',
        footwear: 'Sandals or canvas sneakers',
        description: 'A light, breathable combination perfect for sunny days. The white reflects sunlight to keep you cool.'
      },
      { 
        outfit: 'Floral dress with sandals', 
        color: 'Floral and Beige',
        style: 'Feminine',
        accessories: 'Wide-brimmed hat, sunglasses, woven bag',
        footwear: 'Strappy sandals or espadrilles',
        description: 'A breezy option that allows air circulation while providing some sun protection for your legs.'
      },
      { 
        outfit: 'Light tank top with shorts', 
        color: 'Light Blue and Khaki',
        style: 'Sporty casual',
        accessories: 'Baseball cap, sunglasses, waterproof watch',
        footwear: 'Comfortable sneakers or sport sandals',
        description: 'Perfect for active outdoor activities on sunny days, with moisture-wicking fabrics to keep you dry.'
      },
      { 
        outfit: 'Sun dress with sun hat', 
        color: 'Yellow and White',
        style: 'Summer chic',
        accessories: 'Wide-brimmed sun hat, sunglasses, delicate necklace',
        footwear: 'White sandals or espadrilles',
        description: 'A cheerful, sun-ready outfit that provides comfort and style for outdoor events or beach days.'
      },
      { 
        outfit: 'Casual shorts and a striped top', 
        color: 'Stripes and White',
        style: 'Nautical casual',
        accessories: 'Canvas tote, sunglasses, simple bracelet',
        footwear: 'Boat shoes or white sneakers',
        description: 'A classic summer combination that works well for boardwalks, outdoor dining, or casual gatherings.'
      },
      { 
        outfit: 'Breezy blouse with white jeans', 
        color: 'Light Pink and White',
        style: 'Polished casual',
        accessories: 'Straw hat, sunglasses, delicate jewelry',
        footwear: 'Nude sandals or white flats',
        description: 'A slightly more put-together look that remains cool and comfortable for sunny day events.'
      },
      { 
        outfit: 'Strapless top with high-waisted shorts', 
        color: 'White and Blue',
        style: 'Trendy casual',
        accessories: 'Sunglasses, layered necklaces, crossbody bag',
        footwear: 'Strappy sandals or white sneakers',
        description: 'Minimizes tan lines while keeping you cool during hot, sunny weather.'
      },
      { 
        outfit: 'Linen shirt with lightweight chinos', 
        color: 'Beige and Tan',
        style: 'Smart casual',
        accessories: 'Panama hat, sunglasses, leather watch',
        footwear: 'Loafers or leather sandals',
        description: 'Breathable natural fabrics that look polished while keeping you cool in the sun.'
      },
      { 
        outfit: 'Cotton sundress with denim jacket', 
        color: 'Floral and Blue',
        style: 'Versatile',
        accessories: 'Sunglasses, small crossbody bag, simple earrings',
        footwear: 'White sneakers or sandals',
        description: 'Perfect for sunny days that might cool down later, with a layer you can add or remove.'
      },
      { 
        outfit: 'Sleeveless button-up with bermuda shorts', 
        color: 'White and Navy',
        style: 'Preppy casual',
        accessories: 'Visor or cap, sunglasses, minimal jewelry',
        footwear: 'Boat shoes or canvas sneakers',
        description: 'A classic warm-weather combination that offers sun protection while keeping you cool.'
      },
      { 
        outfit: 'Lightweight romper with sun hat', 
        color: 'Pastel or Neutral',
        style: 'Effortless',
        accessories: 'Wide-brimmed hat, sunglasses, simple bracelet',
        footwear: 'Flat sandals or espadrilles',
        description: 'An easy one-piece option that provides comfort and style for sunny day activities.'
      },
      { 
        outfit: 'Polo shirt with lightweight shorts', 
        color: 'Bright or Pastel and Neutral',
        style: 'Classic casual',
        accessories: 'Baseball cap or visor, sunglasses, watch',
        footwear: 'Loafers or clean sneakers',
        description: 'A timeless combination that works for casual outings, golf, or outdoor dining.'
      },
      { 
        outfit: 'Maxi dress with sandals', 
        color: 'Bold print or Solid',
        style: 'Boho chic',
        accessories: 'Straw hat, sunglasses, layered bracelets',
        footwear: 'Flat sandals or low wedges',
        description: 'Provides sun protection for your legs while allowing airflow to keep you cool.'
      },
      { 
        outfit: 'Cropped pants with sleeveless blouse', 
        color: 'White and Bright or Pastel',
        style: 'Polished casual',
        accessories: 'Sunglasses, sun hat, simple jewelry',
        footwear: 'Loafers, mules, or sandals',
        description: 'A balanced option that provides some leg coverage while keeping you cool and put-together.'
      },
      { 
        outfit: 'Lightweight jumpsuit with wide-brimmed hat', 
        color: 'Neutral or Pastel',
        style: 'Modern casual',
        accessories: 'Statement sunglasses, minimal jewelry, small bag',
        footwear: 'Flat sandals or espadrilles',
        description: 'A contemporary one-piece option that offers style and comfort for sunny day events.'
      }
    ],
    rainy: [
      { 
        outfit: 'Black raincoat with boots', 
        color: 'Black',
        style: 'Practical',
        accessories: 'Umbrella, waterproof bag or backpack',
        footwear: 'Waterproof rain boots',
        description: 'A classic rainy day combination that keeps you dry from head to toe with maximum protection.'
      },
      { 
        outfit: 'Denim jacket with waterproof boots', 
        color: 'Blue and Black',
        style: 'Casual',
        accessories: 'Compact umbrella, water-resistant hat',
        footwear: 'Waterproof chelsea boots or duck boots',
        description: 'A stylish option for light rain that balances protection with everyday style.'
      },
      { 
        outfit: 'Grey hoodie with waterproof shoes', 
        color: 'Grey and Black',
        style: 'Sporty casual',
        accessories: 'Waterproof cap, crossbody bag with flap',
        footwear: 'Water-resistant sneakers or boots',
        description: 'A comfortable, casual option for running errands or casual outings in the rain.'
      },
      { 
        outfit: 'Water-resistant jacket with leggings', 
        color: 'Green and Black',
        style: 'Athleisure',
        accessories: 'Waterproof cap, small backpack',
        footwear: 'Waterproof sneakers or ankle boots',
        description: 'A flexible, comfortable combination that allows movement while keeping you dry.'
      },
      { 
        outfit: 'Oversized sweater with rain boots', 
        color: 'Cream and Brown',
        style: 'Cozy casual',
        accessories: 'Umbrella, waterproof tote bag',
        footwear: 'Colorful or patterned rain boots',
        description: 'A comfortable, warm option for cool rainy days that keeps your feet dry and adds a pop of color.'
      },
      { 
        outfit: 'Trench coat with straight-leg jeans', 
        color: 'Beige and Blue',
        style: 'Classic',
        accessories: 'Umbrella, waterproof watch, crossbody bag',
        footwear: 'Waterproof loafers or ankle boots',
        description: 'A timeless rainy day look that transitions well from casual to more formal settings.'
      },
      { 
        outfit: 'Waterproof parka with slim pants', 
        color: 'Navy and Black',
        style: 'Modern practical',
        accessories: 'Waterproof cap or hat, water-resistant backpack',
        footwear: 'Waterproof sneakers or hiking boots',
        description: 'A contemporary option with technical fabrics that provide maximum rain protection.'
      },
      { 
        outfit: 'Rain poncho with leggings', 
        color: 'Clear or Bright Color and Black',
        style: 'Practical',
        accessories: 'Waterproof hat, water-resistant crossbody bag',
        footwear: 'Rain boots or waterproof sneakers',
        description: 'A highly functional option that provides full coverage for heavy downpours.'
      },
      { 
        outfit: 'Sweater dress with tights and rain boots', 
        color: 'Burgundy or Grey and Black',
        style: 'Feminine practical',
        accessories: 'Umbrella, waterproof tote, simple jewelry',
        footwear: 'Tall rain boots',
        description: 'A put-together option that keeps you warm and dry while maintaining a feminine silhouette.'
      },
      { 
        outfit: 'Lightweight rain jacket with joggers', 
        color: 'Bright Color and Grey',
        style: 'Sporty',
        accessories: 'Waterproof cap, water-resistant backpack',
        footwear: 'Water-resistant running shoes or trail shoes',
        description: 'Perfect for active individuals who don\'t let rain interrupt their routine.'
      },
      { 
        outfit: 'Button-up shirt with cardigan and chinos', 
        color: 'Blue and Beige',
        style: 'Smart casual',
        accessories: 'Compact umbrella, leather messenger bag',
        footwear: 'Waterproof dress shoes or leather boots',
        description: 'A professional option for rainy workdays that transitions well from office to evening.'
      },
      { 
        outfit: 'Waterproof shell jacket with hiking pants', 
        color: 'Red or Blue and Grey',
        style: 'Outdoor',
        accessories: 'Waterproof hat, hiking backpack',
        footwear: 'Waterproof hiking boots',
        description: 'Designed for outdoor activities in the rain with technical fabrics that keep you dry and comfortable.'
      },
      { 
        outfit: 'Raincoat with wide-leg pants', 
        color: 'Yellow and Navy',
        style: 'Trendy practical',
        accessories: 'Clear umbrella, water-resistant bag',
        footwear: 'Waterproof ankle boots or rain shoes',
        description: 'A fashion-forward rainy day option that combines style with functionality.'
      },
      { 
        outfit: 'Hooded sweatshirt with water-resistant pants', 
        color: 'Grey and Black',
        style: 'Casual practical',
        accessories: 'Waterproof cap, zippered pouch',
        footwear: 'Water-resistant sneakers',
        description: 'A comfortable, low-maintenance option for light rain and casual activities.'
      },
      { 
        outfit: 'Packable rain jacket with jeans', 
        color: 'Bright Color and Blue',
        style: 'Practical casual',
        accessories: 'Compact umbrella, crossbody bag',
        footwear: 'Waterproof sneakers or ankle boots',
        description: 'A versatile option that can be easily packed away if the rain stops, perfect for unpredictable weather.'
      }
    ],
    cold: [
      { 
        outfit: 'Winter coat with scarf and gloves', 
        color: 'Red and Black',
        style: 'Classic winter',
        accessories: 'Wool scarf, insulated gloves, beanie',
        footwear: 'Insulated winter boots',
        description: 'A traditional cold weather ensemble that provides maximum warmth and protection.'
      },
      { 
        outfit: 'Sweater with thermal leggings', 
        color: 'Grey and Black',
        style: 'Cozy casual',
        accessories: 'Beanie, thick socks, fingerless gloves',
        footwear: 'Shearling-lined boots',
        description: 'A comfortable, layered option for indoor-outdoor transitions in cold weather.'
      },
      { 
        outfit: 'Fur-lined jacket with boots', 
        color: 'Beige and Brown',
        style: 'Luxurious warmth',
        accessories: 'Earmuffs or fur hat, leather gloves',
        footwear: 'Fur-lined boots',
        description: 'A plush, insulating combination that traps heat while looking stylish.'
      },
      { 
        outfit: 'Puffer jacket with jeans', 
        color: 'Navy and Blue',
        style: 'Casual winter',
        accessories: 'Knit beanie, insulated gloves, wool scarf',
        footwear: 'Insulated sneakers or winter boots',
        description: 'A practical everyday option that provides serious warmth without bulk.'
      },
      { 
        outfit: 'Wool coat with wool hat', 
        color: 'Dark Grey and Beige',
        style: 'Elegant winter',
        accessories: 'Cashmere scarf, leather gloves, earmuffs',
        footwear: 'Leather boots with warm lining',
        description: 'A sophisticated cold weather look that maintains a polished appearance.'
      },
      { 
        outfit: 'Turtleneck sweater with corduroy pants', 
        color: 'Burgundy and Brown',
        style: 'Retro winter',
        accessories: 'Wool scarf, leather gloves, newsboy cap',
        footwear: 'Leather boots with thick socks',
        description: 'A vintage-inspired combination with fabrics that provide natural insulation.'
      },
      { 
        outfit: 'Thermal henley with flannel-lined jeans', 
        color: 'Navy and Blue',
        style: 'Rugged winter',
        accessories: 'Wool beanie, insulated gloves, thick scarf',
        footwear: 'Insulated work boots',
        description: 'A durable, warm option for outdoor activities in cold weather.'
      },
      { 
        outfit: 'Cashmere sweater with wool trousers', 
        color: 'Camel and Grey',
        style: 'Luxe winter',
        accessories: 'Cashmere scarf, leather gloves, wool fedora',
        footwear: 'Leather dress boots with insulation',
        description: 'An upscale cold weather ensemble that doesn\'t sacrifice style for warmth.'
      },
      { 
        outfit: 'Fleece-lined hoodie with insulated pants', 
        color: 'Black and Grey',
        style: 'Active winter',
        accessories: 'Performance beanie, touchscreen gloves, neck gaiter',
        footwear: 'Insulated hiking boots or snow boots',
        description: 'Technical fabrics designed for outdoor winter activities with maximum heat retention.'
      },
      { 
        outfit: 'Quilted vest over thermal shirt with jeans', 
        color: 'Green and Blue',
        style: 'Layered casual',
        accessories: 'Knit beanie, fingerless gloves, wool scarf',
        footwear: 'Insulated sneakers or casual boots',
        description: 'A versatile layering option that allows adjustment for varying cold temperatures.'
      },
      { 
        outfit: 'Shearling jacket with thermal jeans', 
        color: 'Tan and Blue',
        style: 'Rustic winter',
        accessories: 'Wool beanie, leather gloves, thick scarf',
        footwear: 'Shearling-lined boots',
        description: 'Natural materials that provide exceptional insulation for very cold conditions.'
      },
      { 
        outfit: 'Merino wool base layer with insulated jacket', 
        color: 'Black and Bright Color',
        style: 'Technical winter',
        accessories: 'Performance beanie, insulated gloves, neck warmer',
        footwear: 'Insulated snow boots',
        description: 'A high-performance layering system designed for extreme cold weather activities.'
      },
      { 
        outfit: 'Cable knit sweater with flannel-lined pants', 
        color: 'Cream and Brown',
        style: 'Classic cozy',
        accessories: 'Wool scarf, knit gloves, ear muffs',
        footwear: 'Shearling-lined boots or slippers',
        description: 'A traditional cold weather combination that emphasizes comfort and warmth.'
      },
      { 
        outfit: 'Down coat with snow pants', 
        color: 'Black and Grey',
        style: 'Winter sport',
        accessories: 'Insulated hat, waterproof gloves, neck gaiter',
        footwear: 'Insulated snow boots',
        description: 'Maximum protection for snowy, cold conditions with technical fabrics designed for winter sports.'
      },
      { 
        outfit: 'Wool blazer with turtleneck and trousers', 
        color: 'Navy and Grey',
        style: 'Business winter',
        accessories: 'Cashmere scarf, leather gloves, wool hat',
        footwear: 'Insulated dress shoes or boots',
        description: 'A professional cold weather option that maintains a business-appropriate appearance.'
      }
    ],
    windy: [
      { 
        outfit: 'Light jacket with scarf', 
        color: 'Blue and White',
        style: 'Casual layered',
        accessories: 'Secure hat or cap, sunglasses, crossbody bag',
        footwear: 'Closed-toe shoes or sneakers',
        description: 'A versatile combination that provides wind protection while preventing overheating.'
      },
      { 
        outfit: 'Windbreaker with joggers', 
        color: 'Black and Grey',
        style: 'Sporty',
        accessories: 'Secure cap, sunglasses with strap, zippered pockets',
        footwear: 'Athletic shoes with good traction',
        description: 'Designed to minimize wind resistance while allowing freedom of movement.'
      },
      { 
        outfit: 'Loose sweater with skinny jeans', 
        color: 'Pink and Blue',
        style: 'Casual chic',
        accessories: 'Secure headband or hat, crossbody bag',
        footwear: 'Ankle boots or slip-on sneakers',
        description: 'A comfortable option that balances style with practicality for windy conditions.'
      },
      { 
        outfit: 'Turtleneck with leather jacket', 
        color: 'Black and Brown',
        style: 'Edgy',
        accessories: 'Secure beanie, sunglasses, crossbody bag',
        footwear: 'Boots with good traction',
        description: 'The leather provides excellent wind resistance while the turtleneck protects your neck.'
      },
      { 
        outfit: 'Trench coat with boots', 
        color: 'Beige and Black',
        style: 'Classic',
        accessories: 'Secure scarf, sunglasses, structured handbag',
        footwear: 'Boots with good traction',
        description: 'A timeless option that provides coverage and wind protection with a belted waist to prevent flapping.'
      },
      { 
        outfit: 'Quarter-zip pullover with chinos', 
        color: 'Navy and Khaki',
        style: 'Smart casual',
        accessories: 'Secure cap, sunglasses, leather belt',
        footwear: 'Loafers or casual shoes with good grip',
        description: 'A versatile option that works for casual offices or weekend activities in windy conditions.'
      },
      { 
        outfit: 'Denim jacket with maxi dress', 
        color: 'Blue and Floral or Solid',
        style: 'Feminine practical',
        accessories: 'Secure headband or hat, crossbody bag',
        footwear: 'Ankle boots or flats with good traction',
        description: 'The longer dress prevents unwanted exposure in windy conditions while the jacket blocks wind.'
      },
      { 
        outfit: 'Fitted hoodie with straight-leg jeans', 
        color: 'Grey and Blue',
        style: 'Casual comfort',
        accessories: 'Hood up or secure beanie, crossbody bag',
        footwear: 'Sneakers with good traction',
        description: 'A practical option with a hood to protect your head and ears from the wind.'
      },
      { 
        outfit: 'Button-down shirt with cardigan and pants', 
        color: 'White, Navy, and Grey',
        style: 'Layered professional',
        accessories: 'Secure scarf, sunglasses, structured bag',
        footwear: 'Loafers or oxfords with good traction',
        description: 'Layers that can be adjusted based on wind conditions while maintaining a professional appearance.'
      },
      { 
        outfit: 'Midi skirt with tucked-in blouse and cardigan', 
        color: 'Burgundy and White',
        style: 'Feminine classic',
        accessories: 'Secure headband, sunglasses, structured bag',
        footwear: 'Flats or low heels with good traction',
        description: 'The midi length prevents the skirt from blowing up while remaining stylish and feminine.'
      },
      { 
        outfit: 'Utility jacket with slim pants', 
        color: 'Olive and Black',
        style: 'Practical casual',
        accessories: 'Secure cap, sunglasses, crossbody bag with zipper',
        footwear: 'Ankle boots or sneakers with good grip',
        description: 'Multiple pockets allow you to secure small items, and the jacket provides excellent wind protection.'
      },
      { 
        outfit: 'Knit dress with leggings and denim jacket', 
        color: 'Grey, Black, and Blue',
        style: 'Layered casual',
        accessories: 'Secure beanie or headband, crossbody bag',
        footwear: 'Ankle boots with good traction',
        description: 'The leggings prevent unwanted exposure in windy conditions while the layers provide warmth and protection.'
      },
      { 
        outfit: 'Windproof vest over long-sleeve shirt with jeans', 
        color: 'Black, White, and Blue',
        style: 'Outdoor casual',
        accessories: 'Secure cap, sunglasses, crossbody bag',
        footwear: 'Sneakers or hiking shoes with good traction',
        description: 'The vest blocks wind at your core while allowing arm mobility and preventing overheating.'
      },
      { 
        outfit: 'Wrap dress with cropped jacket', 
        color: 'Patterned and Solid',
        style: 'Feminine smart',
        accessories: 'Secure headband, sunglasses, structured bag',
        footwear: 'Flats or low heels with good traction',
        description: 'The wrap style secures the dress in windy conditions while the jacket adds warmth and protection.'
      },
      { 
        outfit: 'Bomber jacket with straight-leg pants', 
        color: 'Green and Black',
        style: 'Urban casual',
        accessories: 'Secure beanie, sunglasses, backpack',
        footwear: 'Sneakers or boots with good traction',
        description: 'The fitted cuffs and waistband prevent wind from entering while the jacket provides excellent protection.'
      }
    ],
    hot: [
      { 
        outfit: 'Tank top with shorts', 
        color: 'Light Blue and Khaki',
        style: 'Casual summer',
        accessories: 'Sunglasses, sun hat, minimal jewelry',
        footwear: 'Sandals or flip flops',
        description: 'Minimal coverage to allow maximum airflow and heat release in very hot conditions.'
      },
      { 
        outfit: 'Crop top with skirt', 
        color: 'Pink and White',
        style: 'Trendy summer',
        accessories: 'Sunglasses, small crossbody bag, minimal jewelry',
        footwear: 'Sandals or espadrilles',
        description: 'A stylish option that minimizes fabric contact with your skin to keep you cool.'
      },
      { 
        outfit: 'Sleeveless blouse with white pants', 
        color: 'White and Beige',
        style: 'Elegant summer',
        accessories: 'Wide-brimmed hat, sunglasses, minimal jewelry',
        footwear: 'Sandals or espadrilles',
        description: 'Lightweight, breathable fabrics in light colors that reflect rather than absorb heat.'
      },
      { 
        outfit: 'Breezy dress with sandals', 
        color: 'Floral and Tan',
        style: 'Feminine summer',
        accessories: 'Straw hat, sunglasses, minimal jewelry',
        footwear: 'Flat sandals or espadrilles',
        description: 'A loose-fitting option that allows air circulation while providing sun protection.'
      },
      { 
        outfit: 'Rash guard with board shorts', 
        color: 'Blue and White',
        style: 'Active summer',
        accessories: 'Baseball cap, sunglasses, waterproof watch',
        footwear: 'Water shoes or flip flops',
        description: 'UPF-rated fabrics that protect from the sun while wicking moisture away from your body.'
      },
      { 
        outfit: 'Linen shirt with linen shorts', 
        color: 'White and Beige',
        style: 'Natural summer',
        accessories: 'Panama hat, sunglasses, minimal jewelry',
        footwear: 'Leather sandals or espadrilles',
        description: 'Natural fabrics that absorb moisture and allow maximum airflow to keep you cool.'
      },
      { 
        outfit: 'Cotton sundress with wide brim hat', 
        color: 'Pastel or Bright',
        style: 'Classic summer',
        accessories: 'Wide-brimmed hat, sunglasses, minimal jewelry',
        footwear: 'Sandals or espadrilles',
        description: 'A single-layer option in breathable cotton that provides comfort and ease in hot weather.'
      },
      { 
        outfit: 'Loose cotton t-shirt with lightweight shorts', 
        color: 'Light colors',
        style: 'Casual comfort',
        accessories: 'Baseball cap, sunglasses, minimal accessories',
        footwear: 'Sandals or lightweight sneakers',
        description: 'Breathable fabrics cut in loose styles to maximize airflow and minimize heat retention.'
      },
      { 
        outfit: 'Sleeveless jumpsuit with sandals', 
        color: 'Solid or Patterned',
        style: 'Modern summer',
        accessories: 'Sun hat, sunglasses, minimal jewelry',
        footwear: 'Flat sandals or slides',
        description: 'A one-piece option in lightweight fabric that provides style without excess layers.'
      },
      { 
        outfit: 'Moisture-wicking athletic top with shorts', 
        color: 'Bright or Neutral',
        style: 'Active summer',
        accessories: 'Visor or cap, sunglasses, sweatbands',
        footwear: 'Breathable athletic shoes',
        description: 'Technical fabrics designed to pull sweat away from your body for enhanced cooling.'
      },
      { 
        outfit: 'Loose cotton button-up with lightweight pants', 
        color: 'White and Light Neutral',
        style: 'Smart summer',
        accessories: 'Panama hat, sunglasses, minimal jewelry',
        footwear: 'Loafers or leather sandals',
        description: 'A more covered option in breathable fabrics that still allows airflow while providing sun protection.'
      },
      { 
        outfit: 'Sleeveless maxi dress with sandals', 
        color: 'Bright or Patterned',
        style: 'Boho summer',
        accessories: 'Wide-brimmed hat, sunglasses, minimal jewelry',
        footwear: 'Flat sandals or slides',
        description: 'Full leg coverage for sun protection while the loose fit and sleeveless style allow for airflow.'
      },
      { 
        outfit: 'Lightweight kaftan or tunic with shorts', 
        color: 'White or Bright',
        style: 'Resort summer',
        accessories: 'Straw hat, sunglasses, minimal jewelry',
        footwear: 'Sandals or espadrilles',
        description: 'Loose, flowing fabrics that create air circulation while providing some sun protection.'
      },
      { 
        outfit: 'Breathable polo with lightweight shorts', 
        color: 'Light colors',
        style: 'Classic casual',
        accessories: 'Visor or cap, sunglasses, minimal accessories',
        footwear: 'Boat shoes or sandals',
        description: 'A slightly more polished option in technical fabrics designed to enhance airflow and cooling.'
      },
      { 
        outfit: 'Loose tank dress with sun hat', 
        color: 'Solid or Patterned',
        style: 'Minimalist summer',
        accessories: 'Wide-brimmed hat, sunglasses, minimal jewelry',
        footwear: 'Simple sandals or slides',
        description: 'A one-piece option with minimal fabric contact to keep you cool in extremely hot conditions.'
      }
    ]
  };

  // Weather information
  const weatherInfo = {
    sunny: {
      title: "Sunny Weather Outfit Recommendations",
      description: "These outfits are designed for bright, sunny days. They feature lightweight fabrics, sun protection elements, and breathable materials to keep you cool while shielding you from UV rays."
    },
    rainy: {
      title: "Rainy Weather Outfit Recommendations",
      description: "Stay dry with these rainy day ensembles. These selections include water-resistant or waterproof materials, appropriate layering, and practical footwear to keep you comfortable in wet conditions."
    },
    cold: {
      title: "Cold Weather Outfit Recommendations",
      description: "Bundle up with these cold-weather options. These outfits focus on insulation, layering, and wind protection to keep you warm and comfortable in chilly temperatures."
    },
    windy: {
      title: "Windy Weather Outfit Recommendations",
      description: "These selections are designed to withstand breezy conditions. They feature secure styles, appropriate layers, and wind-resistant materials to keep you comfortable on gusty days."
    },
    hot: {
      title: "Hot Weather Outfit Recommendations",
      description: "Beat the heat with these summer-ready outfits. These combinations prioritize breathability, minimal coverage, and light colors to help you stay cool in high temperatures."
    }
  };

  if (!weather || !outfits[weather]) {
    return res.status(400).json({ error: 'Invalid weather condition selected' });
  }

  // Return enhanced recommendations with weather information
  res.json({ 
    recommendations: outfits[weather],
    weatherInfo: weatherInfo[weather] 
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Debug endpoint for occasion recommendations
app.get('/debug-occasions', (req, res) => {
  const occasionTypes = Object.keys(outfits);
  const sampleData = {};
  
  occasionTypes.forEach(type => {
    sampleData[type] = outfits[type].length > 0 ? outfits[type][0] : null;
  });
  
  res.json({
    availableOccasions: occasionTypes,
    sampleData: sampleData
  });
});

// Skin tone detection endpoint
app.post('/detect-skintone', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const imagePath = req.file.path;
  console.log(`Processing image: ${imagePath}`);
  
  // Define skin tone recommendations
  const skinToneRecommendations = {
    "Very Fair": {
      description: "Your skin has a porcelain or ivory appearance with cool undertones.",
      colors_to_wear: "Deep blues, emerald greens, ruby reds, and rich purples enhance your complexion.",
      colors_to_avoid: "Pale yellows, oranges, and beige can wash you out.",
      neutrals: "Navy, charcoal gray, and pure white work well as neutrals."
    },
    "Fair": {
      description: "Your skin has a light appearance with either cool or warm undertones.",
      colors_to_wear: "Jewel tones like sapphire blue, emerald green, and ruby red. Pastels also work well.",
      colors_to_avoid: "Orange-based colors and very bright yellows may overwhelm your complexion.",
      neutrals: "Light gray, navy, and soft white are excellent neutral choices."
    },
    "Medium": {
      description: "Your skin has a balanced tone that's neither too light nor too dark.",
      colors_to_wear: "Most colors complement your skin tone well. Earth tones, warm reds, and olive greens are particularly flattering.",
      colors_to_avoid: "Very pale colors might not create enough contrast with your skin.",
      neutrals: "Khaki, camel, and all shades of gray work well."
    },
    "Olive": {
      description: "Your skin has a greenish-yellow undertone that tans easily.",
      colors_to_wear: "Rich, warm colors like coral, terracotta, and mustard yellow. Deep purples and forest greens also work well.",
      colors_to_avoid: "Neon colors and pastel pinks may clash with your undertones.",
      neutrals: "Cream, camel, and chocolate brown are excellent neutrals."
    },
    "Brown": {
      description: "Your skin has a rich brown tone with warm undertones.",
      colors_to_wear: "Bright, vibrant colors like cobalt blue, fuchsia, and emerald green. Warm earth tones also look great.",
      colors_to_avoid: "Muddy browns that are too close to your skin tone may not create enough contrast.",
      neutrals: "White, cream, and navy create beautiful contrast."
    },
    "Dark": {
      description: "Your skin has a deep, rich tone with warm or neutral undertones.",
      colors_to_wear: "Bold, bright colors like royal blue, hot pink, and bright orange create beautiful contrast.",
      colors_to_avoid: "Dark browns that are too close to your skin tone may not provide enough contrast.",
      neutrals: "White and light beige create striking contrast, while dark navy adds depth."
    }
  };
  
  // Execute the Python script for skin tone detection
  exec(`python ${path.join(__dirname, 'skin_tone_detector.py')} "${imagePath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing skin tone detector: ${error}`);
      return res.status(500).json({ error: 'Failed to detect skin tone' });
    }
    
    if (stderr) {
      console.error(`Skin tone detector stderr: ${stderr}`);
    }
    
    try {
      console.log(`Python script output: ${stdout.trim()}`);
      
      // Parse the output from the Python script
      const [skinTone, r, g, b, hex] = stdout.trim().split(',');
      
      // Get recommendations for the detected skin tone
      const recommendations = skinToneRecommendations[skinTone] || {
        description: "Your unique skin tone works well with a variety of colors.",
        colors_to_wear: "Experiment with both warm and cool tones to find what you feel most confident in.",
        colors_to_avoid: "Colors that are too similar to your skin tone may not provide enough contrast.",
        neutrals: "Classic neutrals like black, white, and navy are universally flattering."
      };
      
      // Return the skin tone information with recommendations
      res.json({
        skinTone: skinTone,
        rgb: {
          r: parseInt(r),
          g: parseInt(g),
          b: parseInt(b)
        },
        hex: hex,
        recommendations: recommendations
      });
      
      // Clean up the uploaded file
      fs.unlink(imagePath, (err) => {
        if (err) console.error(`Error deleting file: ${err}`);
      });
    } catch (parseError) {
      console.error(`Error parsing skin tone output: ${parseError}, Output: ${stdout}`);
      res.status(500).json({ error: 'Failed to parse skin tone data' });
    }
  });
});

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});






























