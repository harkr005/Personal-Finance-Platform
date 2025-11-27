import os
import re
import pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import joblib
from typing import Dict, List, Any, Tuple

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

class CategorizationService:
    def __init__(self):
        self.model_path = os.path.join(os.getenv("MODEL_PATH", "../models"), "category_rf.pkl")
        self.vectorizer_path = os.path.join(os.getenv("MODEL_PATH", "../models"), "tfidf_vectorizer.pkl")
        self.label_encoder_path = os.path.join(os.getenv("MODEL_PATH", "../models"), "label_encoder.pkl")
        
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
        # Common expense categories
        self.categories = [
            'food', 'transportation', 'shopping', 'entertainment', 'utilities',
            'healthcare', 'education', 'travel', 'insurance', 'other'
        ]
        
        # Category keywords for rule-based fallback
        self.category_keywords = {
            'food': ['restaurant', 'cafe', 'food', 'grocery', 'supermarket', 'dining', 'pizza', 'burger', 'coffee'],
            'transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'bus', 'train', 'metro', 'parking', 'toll'],
            'shopping': ['store', 'shop', 'mall', 'amazon', 'target', 'walmart', 'clothing', 'electronics'],
            'entertainment': ['movie', 'cinema', 'theater', 'netflix', 'spotify', 'game', 'concert', 'bar'],
            'utilities': ['electric', 'water', 'internet', 'phone', 'cable', 'utility', 'bill'],
            'healthcare': ['doctor', 'hospital', 'pharmacy', 'medical', 'health', 'dental', 'clinic'],
            'education': ['school', 'university', 'college', 'book', 'tuition', 'course', 'education'],
            'travel': ['hotel', 'flight', 'airline', 'vacation', 'trip', 'booking', 'travel'],
            'insurance': ['insurance', 'premium', 'policy', 'coverage'],
            'other': []
        }
        
        self._load_or_initialize_model()
    
    def _load_or_initialize_model(self):
        """Load existing model or initialize new one"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
                self.model = joblib.load(self.model_path)
                self.vectorizer = joblib.load(self.vectorizer_path)
                self.label_encoder = joblib.load(self.label_encoder_path)
                print("Loaded existing categorization model")
            else:
                self._initialize_model()
                print("Initialized new categorization model")
        except Exception as e:
            print(f"Error loading model: {e}")
            self._initialize_model()
    
    def _initialize_model(self):
        """Initialize new model with sample data"""
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.label_encoder = LabelEncoder()
        
        # Create sample training data
        sample_data = self._create_sample_data()
        self._train_model(sample_data)
    
    def _create_sample_data(self) -> pd.DataFrame:
        """Create sample training data for initial model"""
        sample_transactions = [
            # Food
            {"merchant": "McDonald's", "description": "Fast food lunch", "amount": -12.50, "category": "food"},
            {"merchant": "Starbucks", "description": "Coffee and pastry", "amount": -8.75, "category": "food"},
            {"merchant": "Whole Foods", "description": "Grocery shopping", "amount": -85.30, "category": "food"},
            {"merchant": "Pizza Hut", "description": "Pizza delivery", "amount": -24.99, "category": "food"},
            
            # Transportation
            {"merchant": "Shell", "description": "Gas station", "amount": -45.20, "category": "transportation"},
            {"merchant": "Uber", "description": "Ride sharing", "amount": -15.80, "category": "transportation"},
            {"merchant": "Metro", "description": "Public transport", "amount": -3.50, "category": "transportation"},
            
            # Shopping
            {"merchant": "Amazon", "description": "Online shopping", "amount": -67.45, "category": "shopping"},
            {"merchant": "Target", "description": "Department store", "amount": -125.80, "category": "shopping"},
            {"merchant": "Best Buy", "description": "Electronics", "amount": -299.99, "category": "shopping"},
            
            # Entertainment
            {"merchant": "Netflix", "description": "Streaming service", "amount": -15.99, "category": "entertainment"},
            {"merchant": "AMC Theaters", "description": "Movie tickets", "amount": -24.00, "category": "entertainment"},
            {"merchant": "Spotify", "description": "Music streaming", "amount": -9.99, "category": "entertainment"},
            
            # Utilities
            {"merchant": "Electric Company", "description": "Electric bill", "amount": -125.50, "category": "utilities"},
            {"merchant": "Verizon", "description": "Phone bill", "amount": -85.00, "category": "utilities"},
            {"merchant": "Comcast", "description": "Internet bill", "amount": -65.00, "category": "utilities"},
            
            # Healthcare
            {"merchant": "CVS Pharmacy", "description": "Prescription", "amount": -45.75, "category": "healthcare"},
            {"merchant": "Dr. Smith", "description": "Medical consultation", "amount": -150.00, "category": "healthcare"},
            
            # Education
            {"merchant": "University Bookstore", "description": "Textbooks", "amount": -200.00, "category": "education"},
            {"merchant": "Coursera", "description": "Online course", "amount": -49.99, "category": "education"},
            
            # Travel
            {"merchant": "Marriott", "description": "Hotel booking", "amount": -250.00, "category": "travel"},
            {"merchant": "Delta Airlines", "description": "Flight ticket", "amount": -450.00, "category": "travel"},
            
            # Insurance
            {"merchant": "State Farm", "description": "Car insurance", "amount": -120.00, "category": "insurance"},
            {"merchant": "Blue Cross", "description": "Health insurance", "amount": -300.00, "category": "insurance"},
        ]
        
        return pd.DataFrame(sample_transactions)
    
    def _preprocess_text(self, text: str) -> str:
        """Preprocess text for NLP"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens if token not in self.stop_words]
        
        return ' '.join(tokens)
    
    def _extract_features(self, df: pd.DataFrame) -> np.ndarray:
        """Extract features from transaction data"""
        # Combine merchant and description
        df['combined_text'] = df['merchant'].fillna('') + ' ' + df['description'].fillna('')
        df['processed_text'] = df['combined_text'].apply(self._preprocess_text)
        
        # TF-IDF vectorization
        tfidf_matrix = self.vectorizer.fit_transform(df['processed_text'])
        
        # Add amount as feature
        amount_features = df['amount'].values.reshape(-1, 1)
        
        # Combine text and amount features
        features = np.hstack([tfidf_matrix.toarray(), amount_features])
        
        return features
    
    def _train_model(self, df: pd.DataFrame):
        """Train the Random Forest model"""
        try:
            # Extract features
            X = self._extract_features(df)
            y = df['category'].values
            
            # Encode labels
            y_encoded = self.label_encoder.fit_transform(y)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y_encoded, test_size=0.2, random_state=42
            )
            
            # Train model
            self.model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            print(f"Model accuracy: {accuracy:.3f}")
            
            # Save model
            self._save_model()
            
        except Exception as e:
            print(f"Error training model: {e}")
    
    def _save_model(self):
        """Save trained model and components"""
        try:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.vectorizer, self.vectorizer_path)
            joblib.dump(self.label_encoder, self.label_encoder_path)
            print("Model saved successfully")
        except Exception as e:
            print(f"Error saving model: {e}")
    
    def categorize(self, merchant: str = None, description: str = None, amount: float = 0) -> Dict[str, Any]:
        """Categorize a transaction"""
        try:
            # Rule-based categorization first
            rule_based_category = self._rule_based_categorization(merchant, description)
            if rule_based_category and rule_based_category != 'other':
                return {
                    "category": rule_based_category,
                    "confidence": 0.9,
                    "method": "rule_based"
                }
            
            # ML-based categorization
            if self.model and self.vectorizer and self.label_encoder:
                # Prepare data
                data = pd.DataFrame([{
                    'merchant': merchant or '',
                    'description': description or '',
                    'amount': amount,
                    'category': 'unknown'
                }])
                
                # Extract features
                X = self._extract_features(data)
                
                # Predict
                prediction = self.model.predict(X)[0]
                probabilities = self.model.predict_proba(X)[0]
                
                # Get category name
                category = self.label_encoder.inverse_transform([prediction])[0]
                confidence = max(probabilities)
                
                return {
                    "category": category,
                    "confidence": float(confidence),
                    "method": "ml_model"
                }
            
            # Fallback
            return {
                "category": "other",
                "confidence": 0.5,
                "method": "fallback"
            }
            
        except Exception as e:
            print(f"Error in categorization: {e}")
            return {
                "category": "other",
                "confidence": 0.3,
                "method": "error_fallback"
            }
    
    def _rule_based_categorization(self, merchant: str, description: str) -> str:
        """Rule-based categorization using keywords"""
        text = f"{merchant or ''} {description or ''}".lower()
        
        for category, keywords in self.category_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    return category
        
        return "other"
    
    def train_model(self, merchant: str = None, description: str = None, 
                   amount: float = 0, correct_category: str = None) -> Dict[str, Any]:
        """Retrain model with new data"""
        try:
            if not correct_category:
                return {"success": False, "error": "Correct category required"}
            
            # Create new training data
            new_data = pd.DataFrame([{
                'merchant': merchant or '',
                'description': description or '',
                'amount': amount,
                'category': correct_category
            }])
            
            # Load existing training data if available
            try:
                existing_data = self._load_training_data()
                combined_data = pd.concat([existing_data, new_data], ignore_index=True)
            except:
                combined_data = new_data
            
            # Retrain model
            self._train_model(combined_data)
            
            return {
                "success": True,
                "message": "Model retrained successfully",
                "new_samples": len(combined_data)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _load_training_data(self) -> pd.DataFrame:
        """Load existing training data from file"""
        training_data_path = os.path.join(os.getenv("MODEL_PATH", "../models"), "training_data.pkl")
        try:
            return joblib.load(training_data_path)
        except:
            return self._create_sample_data()
    
    def _save_training_data(self, df: pd.DataFrame):
        """Save training data"""
        training_data_path = os.path.join(os.getenv("MODEL_PATH", "../models"), "training_data.pkl")
        try:
            os.makedirs(os.path.dirname(training_data_path), exist_ok=True)
            joblib.dump(df, training_data_path)
        except Exception as e:
            print(f"Error saving training data: {e}")
