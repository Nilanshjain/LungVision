import tensorflow as tf
import os

# Check if the exported model exists
model_path = "exported_model"
if not os.path.exists(model_path):
    raise FileNotFoundError(f"❌ Model folder '{model_path}' not found. Ensure training was successful.")

# Load the trained MediaPipe model
model = tf.keras.models.load_model(model_path)

# Convert and save in multiple formats
keras_model_path = "model.keras"
h5_model_path = "model.h5"

model.save(keras_model_path)  # Save in Keras 3 format
model.save(h5_model_path)      # Save in legacy H5 format

print(f"✅ Model successfully converted!\n- Keras 3 Format: {keras_model_path}\n- H5 Format: {h5_model_path}")
