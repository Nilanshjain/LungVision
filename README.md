# LungVision - AI-Powered Lung Cancer Detection System

![LungVision Logo](https://img.shields.io/badge/LungVision-AI%20Medical%20Diagnosis-blue?style=for-the-badge&logo=medical&logoColor=white)

A comprehensive web and mobile application that uses machine learning to detect lung cancer from CT scan images. Built with React Native (Expo), Flask, and TensorFlow.

## 🚀 Features

- **AI-Powered Detection**: Advanced machine learning model for lung cancer detection
- **Cross-Platform**: Works on web, iOS, and Android devices
- **Patient Management**: Complete patient record management system
- **Medical Reports**: Generate detailed medical reports with AI analysis
- **Doctor Profiles**: Manage doctor information and credentials
- **Real-time Analysis**: Instant CT scan analysis and results
- **Secure Authentication**: JWT-based authentication system
- **Database Integration**: MongoDB for data persistence

## 🏗️ Architecture

### Frontend (React Native + Expo)
- **Framework**: React Native with Expo Router
- **UI Components**: Custom components with gradient designs
- **Navigation**: Tab-based navigation for mobile, header navigation for web
- **State Management**: React Context API
- **Image Handling**: Expo ImagePicker with cross-platform support

### Backend (Flask + Python)
- **Framework**: Flask REST API
- **ML Model**: TensorFlow/Keras for image classification
- **Database**: MongoDB for data storage
- **Authentication**: JWT tokens
- **Image Processing**: PIL for image manipulation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (optional - can run without database)
- **Git**

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/LungVision.git
cd LungVision
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (optional)
# Create a .env file with:
# MONGODB_URI=your_mongodb_connection_string
# SECRET_KEY=your_secret_key
# ALLOW_START_WITHOUT_DB=true
# DISABLE_AUTH=false

# Start the backend server
python app.py
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npx expo start
```

The frontend will start on `http://localhost:8081`

## 🚀 Running the Application

### Web Version
1. Start both backend and frontend servers
2. Open `http://localhost:8081` in your browser
3. The app will automatically connect to the backend

### Mobile Version (iOS/Android)
1. Install Expo Go app on your mobile device
2. Start the frontend server with `npx expo start`
3. Scan the QR code with Expo Go
4. Ensure your mobile device and computer are on the same network

## 📱 Usage

### For Doctors
1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Add Patients**: Register new patients with medical history
3. **Upload CT Scans**: Select a patient and upload CT scan images
4. **View Results**: Get instant AI analysis and diagnosis
5. **Generate Reports**: Create detailed medical reports
6. **Manage Profile**: Update doctor information and credentials

### For Patients
- Patients can view their scan results and reports through the doctor's interface
- All data is securely stored and managed by healthcare professionals

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/lungvision
SECRET_KEY=your-secret-key-here
ALLOW_START_WITHOUT_DB=true
DISABLE_AUTH=false
MODEL_PATH=Lung_Model.h5
EXPO_PUBLIC_API_URL=http://localhost:5000
```

### Model Configuration

The AI model (`Lung_Model.h5`) should be placed in the backend directory. The model is trained to detect lung cancer from CT scan images.

**Note:** Due to GitHub's file size limits, the model file is not included in this repository. You'll need to:
1. Download the model file separately
2. Place it in the `backend/` directory
3. Ensure it's named `Lung_Model.h5`

## 📊 API Endpoints

### Authentication
- `POST /signup` - Register new doctor
- `POST /login` - Login doctor
- `GET /doctor/profile` - Get doctor profile

### Patient Management
- `POST /patients` - Add new patient
- `GET /patients` - Get all patients

### Image Analysis
- `POST /predict` - Analyze CT scan image
- `POST /save-record` - Save scan results
- `GET /history` - Get scan history
- `GET /stats` - Get statistics

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📁 Project Structure

```
LungVision/
├── backend/
│   ├── app.py                 # Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── Lung_Model.h5         # AI model file
│   └── .env                  # Environment variables
├── frontend/
│   ├── app/                  # Expo Router pages
│   │   ├── (tabs)/          # Tab navigation
│   │   ├── scan.tsx         # CT scan upload
│   │   ├── login.tsx        # Authentication
│   │   └── ...
│   ├── components/           # Reusable components
│   ├── constants/           # App constants
│   ├── package.json         # Node dependencies
│   └── app.json            # Expo configuration
├── README.md               # This file
└── .gitignore             # Git ignore rules
```

## 🔒 Security Features

- JWT-based authentication
- Secure file upload validation
- Input sanitization
- CORS protection
- Environment variable protection

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Create a `Procfile` with: `web: python app.py`
2. Set environment variables in your hosting platform
3. Deploy the backend

### Frontend Deployment (Expo/Vercel)
1. Build for production: `npx expo build`
2. Deploy to Expo or build for app stores

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational and research purposes only. It should not be used as a substitute for professional medical diagnosis, treatment, or advice. Always consult with qualified healthcare professionals for medical decisions.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: [Your Email]

## 🙏 Acknowledgments

- TensorFlow team for the machine learning framework
- Expo team for the React Native platform
- Flask team for the Python web framework
- Medical imaging community for datasets and research

---

**Developed by Nilansh Jain**

*Empowering healthcare with AI-driven diagnostic solutions*