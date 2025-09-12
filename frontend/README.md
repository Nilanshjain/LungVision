# Lung Cancer Detection System

A full-stack application for detecting lung cancer from CT scan images using AI. The system includes a React Native mobile app and a Flask backend with MongoDB Atlas integration.

## Features

- AI-powered lung cancer detection from CT scan images
- Patient record management with MongoDB Atlas
- Searchable patient history
- Real-time predictions with confidence scores
- Educational information about lung cancer

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- MongoDB Atlas account (free tier available)
- Expo CLI installed globally

## Setup Instructions

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account:
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account
   - Create a new project

2. Create a free cluster:
   - Click "Build a Database"
   - Choose the FREE tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. Set up database access:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

4. Set up network access:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. Get your connection string:
   - Go to "Database"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Replace `<dbname>` with `lung_cancer_db`

6. Create a `.env` file:
   - Create a file named `.env` in the project root
   - Add your MongoDB connection string:
     ```
     MONGODB_URI=your_connection_string_here
     ```

### Backend Setup

1. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the Flask backend:
```bash
python app.py
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npx expo start
```

3. Run on your preferred platform:
- Press 'w' for web
- Press 'a' for Android
- Press 'i' for iOS
- Scan QR code with Expo Go app for mobile

## API Endpoints

### POST /predict
Upload a CT scan image and get a prediction
- Form data:
  - file: Image file
  - patientId: Patient identifier

### GET /history
Get all patient records

### GET /history/<patient_id>
Get records for a specific patient

## Project Structure

```
LungCancerDetection/
├── app/                    # React Native frontend
│   ├── index.tsx          # Home screen
│   ├── scan.tsx           # CT scan upload screen
│   ├── history.tsx        # Patient history screen
│   └── _layout.tsx        # Navigation layout
├── Model/                  # AI model directory
│   └── model.tflite       # TFLite model file
├── uploads/               # Uploaded images directory
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (not in git)
└── package.json          # Node.js dependencies
```

## Notes

- The application is for educational purposes only and should not replace professional medical advice
- Keep your MongoDB Atlas credentials secure and never commit the .env file
- The frontend is configured to connect to the backend at http://192.168.0.175:5000
- Update the backend URL in the frontend code if your setup is different
