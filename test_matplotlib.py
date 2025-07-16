import matplotlib.pyplot as plt
import numpy as np

# Create a simple image with random noise
img = np.random.random((28, 28))

plt.imshow(img, cmap='gray')
plt.title("Random Image")
plt.show()
