# AI Finance Platform - Complete Setup Guide

## 🚀 Quick Start

This guide will help you set up the complete AI Finance Platform on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

## 🗄️ Database Setup

### 1. Install PostgreSQL

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Install with default settings
- Remember the password you set for the `postgres` user

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE finance_ai;

# Exit psql
\q
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your database credentials
# Update DATABASE_URL with your PostgreSQL connection details
```

### 4. Run Database Migrations

```bash
npm run migrate
```

### 5. Start Backend Server

```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

## 🧠 AI/ML Service Setup

### 1. Navigate to ML Service Directory

```bash
cd mlservice
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your Gemini API key
# Get your API key from: https://makersuite.google.com/app/apikey
```

### 5. Start ML Service

```bash
python main.py
```

The ML service will be available at `http://localhost:8000`

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# The default API URL should work if backend is running on port 5000
```

### 4. Start Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🔑 API Keys Setup

### Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `mlservice/.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## 🧪 Testing the Setup

### 1. Verify All Services

- **Backend**: Visit `http://localhost:5000/api/health`
- **ML Service**: Visit `http://localhost:8000/health`
- **Frontend**: Visit `http://localhost:3000`

### 2. Create Your First Account

1. Open `http://localhost:3000`
2. Register a new account
3. Add your first account (checking, savings, etc.)
4. Add some sample transactions
5. Upload a receipt to test OCR functionality

## 📊 Features Overview

### ✅ Implemented Features

- **User Authentication**: Register, login, JWT-based auth
- **Account Management**: Create, edit, delete accounts
- **Transaction Tracking**: Add, edit, delete transactions
- **Receipt OCR**: Upload receipts, extract data with Gemini Vision
- **Smart Categorization**: AI-powered expense categorization
- **Budget Management**: Set budgets, track spending
- **Spending Predictions**: RNN-based future spending forecasts
- **AI Financial Advice**: Personalized recommendations via Gemini LLM
- **Interactive Dashboard**: Charts, insights, and analytics
- **Responsive Design**: Works on desktop and mobile

### 🎯 Key AI Features

1. **Receipt Processing**: Upload images/PDFs, extract merchant, date, amount
2. **Expense Categorization**: Random Forest + NLP for smart categorization
3. **Spending Predictions**: LSTM neural network for future spending forecasts
4. **Financial Advice**: Gemini LLM provides personalized recommendations

## 🛠️ Development

### Backend API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/accounts` - Get user accounts
- `POST /api/accounts` - Create account
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Create transaction
- `POST /api/transactions/uploadReceipt` - Upload receipt for OCR
- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Create budget
- `POST /api/ai/categorize` - Categorize transaction
- `GET /api/ai/predict` - Get spending predictions
- `POST /api/ai/advice` - Get financial advice

### ML Service Endpoints

- `POST /ocr/extract` - Extract data from receipt
- `POST /categorize` - Categorize transaction
- `POST /train` - Retrain categorization model
- `POST /predict` - Predict spending
- `POST /advice` - Generate financial advice

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database `finance_ai` exists

2. **ML Service Not Starting**
   - Check Python virtual environment is activated
   - Verify all dependencies are installed
   - Check Gemini API key is valid

3. **Frontend Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

4. **OCR Not Working**
   - Verify Gemini API key is set correctly
   - Check file upload limits
   - Ensure image format is supported (JPG, PNG, PDF)

### Logs and Debugging

- **Backend logs**: Check console output in terminal
- **ML Service logs**: Check console output in terminal
- **Frontend logs**: Check browser developer console

## 📁 Project Structure

```
ai-finance-platform/
├── backend/                 # Node.js + Express API
│   ├── controllers/         # Route controllers
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── migrations/         # Database migrations
│   └── app.js              # Main application file
├── mlservice/              # Python FastAPI ML service
│   ├── ocr_service.py      # Gemini OCR integration
│   ├── categorization_service.py  # Random Forest + NLP
│   ├── prediction_service.py      # RNN predictions
│   ├── advice_service.py          # Gemini LLM advice
│   └── main.py            # FastAPI application
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities and API client
│   │   └── types/         # TypeScript types
│   └── package.json
└── models/                 # Saved ML models
```

## 🚀 Production Deployment

For production deployment, consider:

1. **Database**: Use a managed PostgreSQL service (Supabase, Neon, Render)
2. **Backend**: Deploy to Heroku, Railway, or Vercel
3. **ML Service**: Deploy to Google Cloud Run or AWS Lambda
4. **Frontend**: Deploy to Vercel, Netlify, or GitHub Pages

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed correctly
4. Verify all services are running on correct ports

---

**Happy coding! 🎉**

The AI Finance Platform is now ready to help you manage your finances with the power of artificial intelligence.
