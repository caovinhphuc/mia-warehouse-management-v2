#!/usr/bin/env python3
"""
Simple Automation Bridge - Kết nối automation.py với frontend
"""

import os
import sys
import json
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Add current directory to Python path
sys.path.append('.')

# Import automation system
try:
    from automation import OneAutomationSystem
    automation_available = True
    print("✅ Automation system imported successfully")
except Exception as e:
    automation_available = False
    print(f"❌ Could not import automation system: {e}")

# Initialize FastAPI app
app = FastAPI(title="MIA Automation Bridge", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global storage
orders_storage = []
automation_status = {"running": False, "last_run": None}

@app.get("/")
async def root():
    return {"message": "MIA Automation Bridge", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "automation_available": automation_available}

@app.post("/api/automation/start")
async def start_automation():
    """Start automation process"""
    if not automation_available:
        return {"success": False, "message": "Automation system not available"}

    try:
        # Initialize and run automation
        automation = OneAutomationSystem()
        result = automation.run_automation()

        # Store orders if successful
        if result.get("success") and result.get("orders"):
            global orders_storage
            orders_storage.extend(result["orders"])

        return {"success": True, "message": "Automation completed", "data": result}

    except Exception as e:
        return {"success": False, "message": f"Error: {str(e)}"}

@app.get("/api/orders")
async def get_orders():
    """Get all orders"""
    return {
        "success": True,
        "data": {
            "orders": orders_storage,
            "count": len(orders_storage)
        }
    }

@app.get("/api/automation/status")
async def get_status():
    """Get automation status"""
    return {"success": True, "data": automation_status}

if __name__ == "__main__":
    print("🚀 Starting MIA Automation Bridge...")
    print("📍 API: http://localhost:8000")
    print("📍 Health: http://localhost:8000/health")

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
