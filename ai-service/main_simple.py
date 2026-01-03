from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any, Optional
import uvicorn
import asyncio
import random
import logging

# Import ML models
from models.pattern_recognizer import pattern_recognizer
from models.predictive_alerts import predictive_alerts
from models.smart_categorizer import smart_categorizer
from models.report_generator import report_generator
from models.nlp_processor import nlp_processor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="React OAS AI Service",
    description="AI/ML Service for React OAS Integration v3.0",
    version="3.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AnalysisRequest(BaseModel):
    data: dict
    type: str = "general"

class AnalysisResponse(BaseModel):
    id: int
    prediction: float
    confidence: float
    timestamp: str
    analysis_type: str
    recommendations: list

class PatternAnalysisRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str
    date_column: Optional[str] = None

class PredictiveAlertRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str
    metric_name: Optional[str] = None
    threshold: Optional[float] = None

class CategorizeRequest(BaseModel):
    data: List[Dict[str, Any]]
    category_rules: Optional[Dict[str, Any]] = None

class ReportRequest(BaseModel):
    data: List[Dict[str, Any]]
    value_column: str
    date_column: Optional[str] = None
    report_type: str = "comprehensive"
    title: Optional[str] = None

class NLPChatRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class NLPSearchRequest(BaseModel):
    query: str
    data: List[Dict[str, Any]]
    columns: Optional[List[str]] = None

@app.get("/")
async def root():
    return {
        "service": "React OAS AI Service",
        "version": "3.0.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "OK",
        "message": "AI Service is running",
        "timestamp": datetime.now().isoformat(),
        "uptime": "active"
    }

@app.get("/api/status")
async def api_status():
    return {
        "service": "AI/ML Service",
        "version": "3.0",
        "status": "operational",
        "features": [
            "Predictive Analytics",
            "Real-time Analysis",
            "Data Processing",
            "ML Models"
        ]
    }

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_data(request: AnalysisRequest):
    try:
        logger.info(f"Analysis request received: {request.type}")

        # Simulate AI processing delay
        await asyncio.sleep(0.5)

        # Generate mock AI analysis
        prediction = random.uniform(0, 100)
        confidence = random.uniform(0.7, 0.99)

        analysis_id = int(datetime.now().timestamp() * 1000)

        recommendations = [
            "Optimize data collection",
            "Improve data quality",
            "Consider additional features",
            "Monitor trends closely"
        ]

        result = AnalysisResponse(
            id=analysis_id,
            prediction=prediction,
            confidence=confidence,
            timestamp=datetime.now().isoformat(),
            analysis_type=request.type,
            recommendations=recommendations
        )

        logger.info(f"Analysis completed: {result.id}")
        return result

    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/predict/{model_type}")
async def predict(model_type: str):
    try:
        logger.info(f"Prediction request for model: {model_type}")

        # Simulate prediction
        await asyncio.sleep(0.3)

        prediction_data = {
            "model_type": model_type,
            "prediction": random.uniform(0, 100),
            "confidence": random.uniform(0.8, 0.95),
            "timestamp": datetime.now().isoformat(),
            "features_used": ["feature_1", "feature_2", "feature_3"],
            "model_version": "v4.0"
        }

        return prediction_data

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/models")
async def list_models():
    return {
        "available_models": [
            {
                "name": "prediction_model_v4",
                "type": "regression",
                "accuracy": 0.92,
                "status": "active"
            },
            {
                "name": "classification_model_v4",
                "type": "classification",
                "accuracy": 0.88,
                "status": "active"
            },
            {
                "name": "anomaly_detection_v4",
                "type": "anomaly",
                "accuracy": 0.95,
                "status": "active"
            },
            {
                "name": "pattern_recognizer",
                "type": "pattern_recognition",
                "status": "active"
            },
            {
                "name": "predictive_alerts",
                "type": "alert_prediction",
                "status": "active"
            },
            {
                "name": "smart_categorizer",
                "type": "categorization",
                "status": "active"
            },
            {
                "name": "report_generator",
                "type": "report_generation",
                "status": "active"
            }
        ],
        "total_models": 7,
        "last_updated": datetime.now().isoformat()
    }

# Pattern Recognition Endpoints
@app.post("/api/patterns/analyze")
async def analyze_patterns(request: PatternAnalysisRequest):
    """Analyze patterns in data"""
    try:
        result = pattern_recognizer.analyze_patterns(
            request.data,
            request.value_column,
            request.date_column
        )
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Pattern analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Pattern analysis failed: {str(e)}")

@app.post("/api/patterns/trends")
async def analyze_trends(request: PatternAnalysisRequest):
    """Analyze trends in data"""
    try:
        result = pattern_recognizer.recognize_trends(request.data, request.value_column)
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Trend analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Trend analysis failed: {str(e)}")

@app.post("/api/patterns/anomalies")
async def detect_anomalies(request: PatternAnalysisRequest):
    """Detect anomalies in data"""
    try:
        result = pattern_recognizer.detect_anomalies(request.data, request.value_column)
        return {
            "success": True,
            "data": result,
            "count": len(result),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Anomaly detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

# Predictive Alerts Endpoints
@app.post("/api/alerts/predictive")
async def generate_predictive_alerts(request: PredictiveAlertRequest):
    """Generate predictive alerts based on trends"""
    try:
        result = predictive_alerts.analyze_and_alert(
            request.data,
            request.value_column,
            request.metric_name,
            request.threshold
        )
        return {
            "success": True,
            "data": result,
            "count": len(result),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Predictive alert error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Predictive alert failed: {str(e)}")

# Smart Categorization Endpoints
@app.post("/api/categorize/columns")
async def categorize_columns(request: Dict[str, Any]):
    """Categorize columns in data"""
    try:
        column_name = request.get("column_name")
        sample_values = request.get("sample_values", [])

        result = smart_categorizer.categorize_column(column_name, sample_values)
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Categorization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Categorization failed: {str(e)}")

@app.post("/api/categorize/rows")
async def categorize_rows(request: CategorizeRequest):
    """Categorize rows in data"""
    try:
        result = smart_categorizer.categorize_rows(
            request.data,
            request.category_rules
        )
        return {
            "success": True,
            "data": result,
            "count": len(result),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Row categorization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Row categorization failed: {str(e)}")

# Automated Report Generation Endpoints
@app.post("/api/reports/generate")
async def generate_report(request: ReportRequest):
    """Generate automated report"""
    try:
        title = request.title or f"Report {datetime.now().strftime('%Y-%m-%d %H:%M')}"

        if request.report_type == "summary":
            result = report_generator.generate_summary_report(request.data, title)
        elif request.report_type == "trend":
            result = report_generator.generate_trend_report(
                request.data, request.value_column, request.date_column, title
            )
        elif request.report_type == "anomaly":
            result = report_generator.generate_anomaly_report(
                request.data, request.value_column, title
            )
        elif request.report_type == "comprehensive":
            result = report_generator.generate_comprehensive_report(
                request.data, request.value_column, request.date_column, title
            )
        else:
            result = report_generator.generate_comprehensive_report(
                request.data, request.value_column, request.date_column, title
            )

        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Report generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

# NLP Endpoints
@app.post("/api/nlp/chat")
async def process_chat_query(request: NLPChatRequest):
    """Process natural language chat query"""
    try:
        result = nlp_processor.process_chat_query(request.query, request.context)
        response_text = nlp_processor.generate_response(result)

        return {
            "success": True,
            "data": {
                "response": response_text,
                "intent": result.get("intent"),
                "entities": result.get("entities"),
                "query_structure": result.get("query_structure"),
                "confidence": result.get("confidence"),
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"NLP chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"NLP processing failed: {str(e)}")

@app.post("/api/nlp/summary")
async def generate_summary(request: Dict[str, Any]):
    """Generate auto summary from data"""
    try:
        data = request.get("data", [])
        max_length = request.get("max_length", 200)

        summary = nlp_processor.generate_summary(data, max_length)

        return {
            "success": True,
            "data": {
                "summary": summary,
                "data_points": len(data),
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Summary generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")

@app.post("/api/nlp/search")
async def smart_search(request: NLPSearchRequest):
    """Smart search across all data"""
    try:
        results = nlp_processor.smart_search(
            request.query,
            request.data,
            request.columns
        )

        return {
            "success": True,
            "data": results,
            "count": len(results),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Smart search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Smart search failed: {str(e)}")

@app.post("/api/nlp/voice")
async def process_voice_command(request: NLPChatRequest):
    """Process voice command (same as chat query)"""
    try:
        result = nlp_processor.process_voice_command(request.query)
        response_text = nlp_processor.generate_response(result)

        return {
            "success": True,
            "data": {
                "response": response_text,
                "intent": result.get("intent"),
                "entities": result.get("entities"),
                "confidence": result.get("confidence"),
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Voice command error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Voice command processing failed: {str(e)}")

if __name__ == "__main__":
    logger.info("Starting React OAS AI Service v4.0...")
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
