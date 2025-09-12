import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.optimizers.legacy import Adam

print("Loading original model...")
model = load_model('Lung_Model.h5', compile=False)

print("Recompiling model with legacy optimizer...")
model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("Saving converted model...")
model.save('Lung_Model_converted.h5')
print("Model conversion completed successfully!")