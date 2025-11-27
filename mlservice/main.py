from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import json
from dotenv import load_dotenv
from pathlib import Path

from ocr_service import OCRService
from categorization_service import CategorizationService
from prediction_service import PredictionService
from advice_service import AdviceService

# Load environment variables explicitly from mlservice/.env
_env_path = Path(__file__).with_name('.env')
load_dotenv(dotenv_path=_env_path, override=True)

app = FastAPI(
    title="AI Finance ML Service",
    description="Machine Learning service for AI Finance Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ocr_service = OCRService()
categorization_service = CategorizationService()
prediction_service = PredictionService()
advice_service = AdviceService()

# Pydantic models
class CategorizeRequest(BaseModel):
    merchant: str = None
    description: str = None
    amount: float

class TrainRequest(BaseModel):
    merchant: str = None
    description: str = None
    amount: float
    correct_category: str

class PredictRequest(BaseModel):
    user_id: int
    spending_data: list
    target_month: int
    target_year: int

class AdviceRequest(BaseModel):
    current_spending: list
    monthly_spending: dict = {}
    budgets: list
    predictions: list
    user_id: int
    analysis_period_months: int = 3

@app.get("/")
async def root():
    return {"message": "AI Finance ML Service", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "services": {
        "ocr": "ready",
        "categorization": "ready", 
        "prediction": "ready",
        "advice": "ready"
    }}

# OCR endpoints
@app.post("/ocr/extract")
async def extract_receipt_data(file: UploadFile = File(...)):
    try:
        result = await ocr_service.extract_receipt_data(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Categorization endpoints
@app.post("/categorize")
async def categorize_transaction(request: CategorizeRequest):
    try:
        result = categorization_service.categorize(
            merchant=request.merchant,
            description=request.description,
            amount=request.amount
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train_model(request: TrainRequest):
    try:
        result = categorization_service.train_model(
            merchant=request.merchant,
            description=request.description,
            amount=request.amount,
            correct_category=request.correct_category
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Prediction endpoints
@app.post("/predict")
async def predict_spending(request: PredictRequest):
    try:
        result = prediction_service.predict_spending(
            user_id=request.user_id,
            spending_data=request.spending_data,
            target_month=request.target_month,
            target_year=request.target_year
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Advice endpoints
@app.post("/advice")
async def generate_advice(request: AdviceRequest):
    try:
        result = advice_service.generate_advice(
            current_spending=request.current_spending,
            monthly_spending=request.monthly_spending,
            budgets=request.budgets,
            predictions=request.predictions,
            user_id=request.user_id,
            analysis_period_months=request.analysis_period_months
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/advice/stream")
async def generate_advice_stream(request: AdviceRequest):
    """Stream advice generation as it's being created"""
    async def generate():
        try:
            for chunk in advice_service.generate_advice_stream(
                current_spending=request.current_spending,
                monthly_spending=request.monthly_spending,
                budgets=request.budgets,
                predictions=request.predictions,
                user_id=request.user_id,
                analysis_period_months=request.analysis_period_months
            ):
                yield f"data: {json.dumps(chunk)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    # Create necessary directories
    os.makedirs(os.getenv("UPLOAD_DIR", "uploads"), exist_ok=True)
    os.makedirs(os.getenv("MODEL_PATH", "../models"), exist_ok=True)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("ML_SERVICE_PORT", 8000)),
        reload=True
    )
