from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import random
import time
import numpy as np

# Try to import optimization module
try:
    from optimization import cobyqa_minimize, COBYQA_AVAILABLE
except ImportError:
    COBYQA_AVAILABLE = False
    cobyqa_minimize = None

app = FastAPI(title="React OAS AI Service", version="4.0")

# Pydantic models for optimization
class OptimizationRequest(BaseModel):
    """Request model for optimization problems"""
    objective_type: str  # "minimize" or "maximize"
    initial_guess: List[float]
    bounds: Optional[List[List[float]]] = None  # [[min, max], ...]
    constraints: Optional[List[Dict[str, Any]]] = None
    options: Optional[Dict[str, Any]] = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "models": {
            "predictor": True,
            "anomaly_detector": True,
            "optimizer": True
        }
    }

@app.get("/ai/predictions")
async def get_predictions():
    return {
        "predictions": {
            "response_time": [random.randint(95, 110) for _ in range(5)],
            "active_users": [random.randint(500, 600) for _ in range(5)]
        },
        "confidence_scores": {
            "response_time": 0.85,
            "active_users": 0.78
        }
    }

@app.get("/ai/anomalies")
async def detect_anomalies():
    return {
        "anomalies": [],
        "risk_level": "low",
        "recommendations": ["System is running optimally"]
    }

@app.get("/ai/optimization")
async def get_optimization():
    """Get optimization recommendations (legacy endpoint)"""
    return {
        "optimizations": [
            {"action": "Optimize database queries", "impact": "15%", "priority": "high"},
            {"action": "Enable caching", "impact": "20%", "priority": "medium"}
        ],
        "overall_score": 89,
        "optimization_engine": "COBYQA" if COBYQA_AVAILABLE else "scipy.optimize"
    }

@app.post("/ai/optimization/solve")
async def solve_optimization(request: OptimizationRequest):
    """
    Solve optimization problem using COBYQA or scipy.optimize

    Example:
    {
        "objective_type": "minimize",
        "initial_guess": [1.0, 1.0],
        "bounds": [[0, 10], [0, 10]],
        "constraints": [],
        "options": {}
    }
    """
    try:
        if not COBYQA_AVAILABLE:
            raise HTTPException(
                status_code=503,
                detail="Optimization engine not available. COBYQA dependencies missing."
            )

        # Convert bounds to scipy format if provided
        from scipy.optimize import Bounds
        bounds_obj = None
        if request.bounds:
            bounds_array = np.array(request.bounds)
            bounds_obj = Bounds(bounds_array[:, 0], bounds_array[:, 1])

        # Simple objective function for demo
        # In production, this would be passed as a function or code
        def objective(x):
            # Example: minimize sum of squares
            return np.sum(x**2)

        # Solve optimization
        result = cobyqa_minimize(
            fun=objective,
            x0=np.array(request.initial_guess),
            bounds=bounds_obj,
            constraints=request.constraints or [],
            options=request.options or {}
        )

        return {
            "status": "success",
            "result": {
                "optimal_point": result.x.tolist() if hasattr(result, 'x') else None,
                "optimal_value": float(result.fun) if hasattr(result, 'fun') else None,
                "success": bool(result.success) if hasattr(result, 'success') else False,
                "message": str(result.message) if hasattr(result, 'message') else "Optimization completed",
                "iterations": int(result.nit) if hasattr(result, 'nit') else None,
                "function_evaluations": int(result.nfev) if hasattr(result, 'nfev') else None
            },
            "method": "COBYQA",
            "timestamp": time.time()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Optimization failed: {str(e)}"
        )

@app.get("/ai/optimization/status")
async def optimization_status():
    """Check optimization engine status"""
    return {
        "cobyqa_available": COBYQA_AVAILABLE,
        "engine": "COBYQA" if COBYQA_AVAILABLE else "scipy.optimize (fallback)",
        "status": "ready" if COBYQA_AVAILABLE else "limited"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
