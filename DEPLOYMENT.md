# Deployment Guide - LungVision

This guide will help you deploy the LungVision application to various platforms.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- Git
- MongoDB (optional for development)

## 📱 Frontend Deployment

### Option 1: Expo (Recommended for Mobile)

1. **Install Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

2. **Build for Production**
   ```bash
   cd frontend
   npx expo build:web
   ```

3. **Deploy to Expo**
   ```bash
   npx expo publish
   ```

### Option 2: Vercel/Netlify (Web Only)

1. **Build the web version**
   ```bash
   cd frontend
   npx expo export:web
   ```

2. **Deploy to Vercel**
   ```bash
   npx vercel --prod
   ```

3. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `cd frontend && npx expo export:web`
   - Set publish directory: `frontend/dist`

## 🖥️ Backend Deployment

### Option 1: Heroku

1. **Create Heroku App**
   ```bash
   heroku create lungvision-api
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set SECRET_KEY=your_secret_key
   heroku config:set ALLOW_START_WITHOUT_DB=true
   ```

3. **Deploy**
   ```bash
   git subtree push --prefix=backend heroku main
   ```

### Option 2: Railway

1. **Connect GitHub Repository**
2. **Set Root Directory**: `backend`
3. **Add Environment Variables**:
   - `MONGODB_URI`
   - `SECRET_KEY`
   - `ALLOW_START_WITHOUT_DB=true`

### Option 3: DigitalOcean App Platform

1. **Create App from GitHub**
2. **Set Source Directory**: `backend`
3. **Configure Environment Variables**
4. **Deploy**

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
2. **Create Cluster**
3. **Get Connection String**
4. **Set Environment Variable**: `MONGODB_URI`

### Local MongoDB

1. **Install MongoDB**
2. **Start Service**
3. **Set Environment Variable**: `MONGODB_URI=mongodb://localhost:27017/lungvision`

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lungvision
SECRET_KEY=your-super-secret-key-here
ALLOW_START_WITHOUT_DB=false
DISABLE_AUTH=false
MODEL_PATH=Lung_Model.h5
```

### Frontend (app.json)
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-backend-url.herokuapp.com"
    }
  }
}
```

## 📦 Docker Deployment

### Backend Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
EXPOSE 5000

CMD ["python", "app.py"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
EXPOSE 8081

CMD ["npx", "expo", "start", "--web"]
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Configure CORS for production domains
3. **HTTPS**: Always use HTTPS in production
4. **Authentication**: Enable authentication in production
5. **Database**: Use strong passwords and connection strings

## 📊 Monitoring

### Health Checks
- Backend: `GET /health`
- Frontend: Check if app loads correctly

### Logging
- Backend: Configure logging level
- Frontend: Use error tracking (Sentry)

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Add your frontend domain to CORS origins
   - Check environment variables

2. **Database Connection**
   - Verify MongoDB URI
   - Check network connectivity
   - Ensure database user has proper permissions

3. **Model Loading**
   - Ensure `Lung_Model.h5` is in backend directory
   - Check file permissions

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

## 📈 Performance Optimization

1. **Frontend**
   - Enable code splitting
   - Optimize images
   - Use CDN for static assets

2. **Backend**
   - Enable gzip compression
   - Use connection pooling
   - Implement caching

3. **Database**
   - Create proper indexes
   - Monitor query performance
   - Use connection pooling

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "lungvision-api"
          heroku_email: "your-email@example.com"
          appdir: "backend"
```

## 📞 Support

For deployment issues:
1. Check the logs
2. Verify environment variables
3. Test locally first
4. Create an issue in the repository

---

**Developed by Nilansh Jain**
