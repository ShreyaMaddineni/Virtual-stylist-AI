# skin_tone_detector.py

import cv2
import numpy as np
from sklearn.cluster import KMeans
import sys
import os

# Define skin tone categories with their color recommendations
SKIN_TONE_RECOMMENDATIONS = {
    "Very Fair": {
        "description": "Your skin has a porcelain or ivory appearance with cool undertones.",
        "colors_to_wear": "Deep blues, emerald greens, ruby reds, and rich purples enhance your complexion.",
        "colors_to_avoid": "Pale yellows, oranges, and beige can wash you out.",
        "neutrals": "Navy, charcoal gray, and pure white work well as neutrals."
    },
    "Fair": {
        "description": "Your skin has a light appearance with either cool or warm undertones.",
        "colors_to_wear": "Jewel tones like sapphire blue, emerald green, and ruby red. Pastels also work well.",
        "colors_to_avoid": "Orange-based colors and very bright yellows may overwhelm your complexion.",
        "neutrals": "Light gray, navy, and soft white are excellent neutral choices."
    },
    "Medium": {
        "description": "Your skin has a balanced tone that's neither too light nor too dark.",
        "colors_to_wear": "Most colors complement your skin tone well. Earth tones, warm reds, and olive greens are particularly flattering.",
        "colors_to_avoid": "Very pale colors might not create enough contrast with your skin.",
        "neutrals": "Khaki, camel, and all shades of gray work well."
    },
    "Olive": {
        "description": "Your skin has a greenish-yellow undertone that tans easily.",
        "colors_to_wear": "Rich, warm colors like coral, terracotta, and mustard yellow. Deep purples and forest greens also work well.",
        "colors_to_avoid": "Neon colors and pastel pinks may clash with your undertones.",
        "neutrals": "Cream, camel, and chocolate brown are excellent neutrals."
    },
    "Brown": {
        "description": "Your skin has a rich brown tone with warm undertones.",
        "colors_to_wear": "Bright, vibrant colors like cobalt blue, fuchsia, and emerald green. Warm earth tones also look great.",
        "colors_to_avoid": "Muddy browns that are too close to your skin tone may not create enough contrast.",
        "neutrals": "White, cream, and navy create beautiful contrast."
    },
    "Dark": {
        "description": "Your skin has a deep, rich tone with warm or neutral undertones.",
        "colors_to_wear": "Bold, bright colors like royal blue, hot pink, and bright orange create beautiful contrast.",
        "colors_to_avoid": "Dark browns that are too close to your skin tone may not provide enough contrast.",
        "neutrals": "White and light beige create striking contrast, while dark navy adds depth."
    }
}

def detect_skin_tone(image_path, k=5):
    # Check if file exists
    if not os.path.exists(image_path):
        print(f"Error: File {image_path} does not exist")
        sys.exit(1)
        
    try:
        # Read the image
        img = cv2.imread(image_path)
        if img is None:
            print(f"Error: Could not read image {image_path}")
            sys.exit(1)
            
        # Convert to RGB (OpenCV loads as BGR)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Get dimensions
        h, w, _ = img.shape
        
        # Define crop region (center of the image)
        # Make sure we don't go out of bounds
        crop_size = min(100, h//3, w//3)
        if crop_size <= 0:
            crop_size = min(h, w) // 2
            
        cx, cy = w // 2, h // 2
        
        # Extract the center region (likely to contain face/skin)
        y_start = max(0, cy - crop_size)
        y_end = min(h, cy + crop_size)
        x_start = max(0, cx - crop_size)
        x_end = min(w, cx + crop_size)
        
        crop = img[y_start:y_end, x_start:x_end]
        
        if crop.size == 0:
            # If cropping failed, use the whole image
            crop = img
        
        # Apply skin color filtering to focus on skin pixels
        # This uses a simple color-based skin detection
        lower_skin = np.array([0, 20, 70], dtype=np.uint8)
        upper_skin = np.array([255, 255, 255], dtype=np.uint8)
        mask = cv2.inRange(crop, lower_skin, upper_skin)
        
        # Apply the mask to get only skin pixels
        skin = cv2.bitwise_and(crop, crop, mask=mask)
        
        # Reshape for KMeans, filtering out black (masked) pixels
        pixels = skin.reshape((-1, 3))
        pixels = pixels[np.all(pixels != [0, 0, 0], axis=1)]
        
        # If no skin pixels were detected, use the original crop
        if pixels.size == 0:
            pixels = crop.reshape((-1, 3))
        
        # Apply KMeans clustering to find dominant colors
        kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
        kmeans.fit(pixels)
        
        # Get the colors and their counts
        colors = kmeans.cluster_centers_
        labels = kmeans.labels_
        counts = np.bincount(labels)
        
        # Sort colors by count (most frequent first)
        indices = np.argsort(counts)[::-1]
        dominant_colors = colors[indices]
        
        # Filter colors that are likely to be skin
        skin_colors = []
        for color in dominant_colors:
            r, g, b = color
            # Basic skin tone check: R > G > B for most skin tones
            if r > g and g > b and r > 60:
                skin_colors.append(color)
        
        # If no skin colors were found, use the most dominant color
        if not skin_colors:
            dominant_color = dominant_colors[0].astype(int)
        else:
            dominant_color = skin_colors[0].astype(int)
        
        r, g, b = dominant_color
        
        # Convert to hex
        hex_color = '#%02x%02x%02x' % (r, g, b)
        
        # Classify the skin tone
        skin_tone = classify_skin_tone(dominant_color)
        
        # Output in format expected by the Node.js server
        # Format: skin_tone,r,g,b,hex_color
        print(f"{skin_tone},{r},{g},{b},{hex_color}")
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        sys.exit(1)

def classify_skin_tone(rgb):
    r, g, b = rgb
    
    # Calculate different color metrics
    avg = (r + g + b) / 3
    
    # Simplified classification based on average RGB value
    # These thresholds are calibrated for common skin tones
    if avg > 220:
        return "Very Fair"
    elif avg > 190:
        return "Fair"
    elif avg > 160:
        return "Medium"
    elif avg > 120:
        return "Olive"
    elif avg > 90:
        return "Brown"
    else:
        return "Dark"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: Please provide an image path")
        sys.exit(1)
        
    detect_skin_tone(sys.argv[1])
