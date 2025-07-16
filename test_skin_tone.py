import cv2
import numpy as np
import os

# Create a simple test image with a skin-like color
test_img = np.ones((200, 200, 3), dtype=np.uint8)

# Create three test images with different skin tones
# Fair skin tone
fair_img = test_img.copy() * [220, 190, 170]  # RGB values for fair skin
cv2.imwrite('fair_skin_test.jpg', fair_img)
print("Created fair skin test image: fair_skin_test.jpg")

# Medium skin tone
medium_img = test_img.copy() * [180, 140, 120]  # RGB values for medium skin
cv2.imwrite('medium_skin_test.jpg', medium_img)
print("Created medium skin test image: medium_skin_test.jpg")

# Dark skin tone
dark_img = test_img.copy() * [100, 80, 70]  # RGB values for dark skin
cv2.imwrite('dark_skin_test.jpg', dark_img)
print("Created dark skin test image: dark_skin_test.jpg")

print("Test images created successfully. Now testing the skin tone detector...")

# Test the skin tone detector with each image
import subprocess

for img_file in ['fair_skin_test.jpg', 'medium_skin_test.jpg', 'dark_skin_test.jpg']:
    print(f"\nTesting with {img_file}:")
    result = subprocess.run(['python', 'skin_tone_detector.py', img_file], 
                           capture_output=True, text=True)
    print(f"Output: {result.stdout}")
    if result.stderr:
        print(f"Error: {result.stderr}")

print("\nTest completed.")