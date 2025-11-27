# AI Finance Platform

An intelligent personal finance management system that uses AI to help users track expenses, categorize transactions, predict spending, and get personalized financial advice.

## 🏗️ Architecture

- **Frontend**: React + TypeScript with Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **AI Service**: Python FastAPI with Gemini API and ML models
- **Database**: Local PostgreSQL (easily migratable to hosted services)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- PostgreSQL (local installation)

### 1. Database Setup
```bash
# Create database
createdb finance_ai

# Run migrations (after backend setup)
cd backend
npm run migrate
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. AI Service Setup
```bash
cd mlservice
pip install -r requirements.txt
cp .env.example .env
# Add your Gemini API key to .env
python main.py
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
/frontend          # React + TypeScript + Tailwind CSS
/backend           # Node.js + Express + PostgreSQL
/mlservice         # Python FastAPI + ML models
/models            # Saved ML models
```

## 🔧 Environment Variables

See `.env.example` files in each directory for required configuration.

## 🧠 AI Features

- **Receipt OCR**: Extract transaction details using Gemini Vision
- **Smart Categorization**: Random Forest + NLP for expense classification
- **Spending Prediction**: RNN for future expense forecasting
- **Financial Advice**: Personalized recommendations via Gemini LLM

## 📊 Features

- Account and transaction management
- Budget tracking and alerts
- Receipt upload and processing
- AI-powered insights and predictions
- Interactive dashboard with charts
- CSV import/export functionality

## 🔗 API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Create transaction
- `POST /api/transactions/uploadReceipt` - Upload receipt for OCR
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/analysis` - Get budget analysis

### AI
- `POST /api/ai/categorize` - Categorize transaction
- `POST /api/ai/train` - Retrain model
- `GET /api/ai/predict` - Get spending predictions
- `POST /api/ai/advice` - Get financial advice
- `GET /api/ai/insights` - Get spending insights

## 🧾 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Accounts table
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  merchant VARCHAR,
  description TEXT,
  category VARCHAR,
  amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR NOT NULL,
  limit_amount DECIMAL(15,2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Receipts table
CREATE TABLE receipts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
  file_path VARCHAR NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Predictions table
CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR NOT NULL,
  predicted_amount DECIMAL(15,2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Category corrections table
CREATE TABLE category_corrections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
  old_category VARCHAR NOT NULL,
  new_category VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🧩 Development Order

1. ✅ Setup PostgreSQL and schema
2. ✅ Build Auth (register/login)
3. ✅ Accounts + Transactions CRUD
4. ✅ Receipt upload → Gemini OCR
5. ✅ Random Forest categorization (NLP)
6. ✅ RNN-based prediction
7. ✅ Gemini advice integration
8. ✅ Frontend (React + Tailwind)
9. ✅ Dashboard (charts + AI insights)

## ✅ Deliverables

- ✅ Backend with all REST APIs working locally
- ✅ Frontend React app with Tailwind CSS and charts
- ✅ ML microservice (FastAPI) with OCR, categorization, prediction, and advice
- ✅ .env.example files for setup
- ✅ Complete documentation

## 🧩 Key Notes

- All AI/ML features work offline except Gemini API calls
- No Docker or cloud setup required
- Code is modular, clean, and well-commented
- Uses realistic sample data to demonstrate charts
- Polished UI using Tailwind CSS components

## 📞 Support

For setup issues, refer to the detailed `SETUP.md` file or check the troubleshooting section.

---

**Built with ❤️ using AI and modern web technologies**