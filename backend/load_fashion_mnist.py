from tensorflow.keras.datasets import fashion_mnist
import matplotlib.pyplot as plt

# Load the dataset
(x_train, y_train), (x_test, y_test) = fashion_mnist.load_data()

# Check the shape of the data to make sure it's loaded
print(f"x_train shape: {x_train.shape}, x_test shape: {x_test.shape}")

# Display a few sample images
for i in range(5):
    plt.imshow(x_train[i], cmap='gray')
    plt.title(f"Label: {y_train[i]}")
    plt.show()

# Print dataset size
print(f"Loaded {len(x_train)} training images and {len(x_test)} test images.")


