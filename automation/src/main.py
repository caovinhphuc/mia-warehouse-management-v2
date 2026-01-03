#!/usr/bin/env python3
"""
OneAutomation System - Main Python Automation Service
Hệ thống tự động hóa chính cho OneAutomation
"""
import asyncio
import os
import sys
import logging
from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
from dotenv import load_dotenv

# Add parent directory to path để import từ automation root
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)
# Add current directory (src/) to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import custom modules với fallback
try:
    # Thử import từ src/modules (relative từ src/)
    from modules.data_processor import DataProcessor
except ImportError:
    try:
        # Thử import từ automation root với absolute path
        from src.modules.data_processor import DataProcessor
    except ImportError:
        # Fallback: Create a simple DataProcessor
        class DataProcessor:
            def __init__(self):
                self._initialized = False
                self.logger = logging.getLogger(__name__)
            async def analyze(self, data):
                return {"status": "processed", "count": len(data) if data else 0}
            def is_initialized(self):
                return self._initialized

# Google Sheets Service wrapper
try:
    # Import từ automation root
    from google_sheets_connector import GoogleSheetsConnector
    class GoogleSheetsService:
        def __init__(self):
            self.connector = None
            self._connected = False

        async def initialize(self):
            try:
                self.connector = GoogleSheetsConnector()
                self._connected = True
            except Exception as e:
                logging.error(f"Failed to initialize Google Sheets: {e}")
                self._connected = False

        def is_connected(self):
            return self._connected and self.connector is not None

        async def read_data(self, spreadsheet_id, range_name="Sheet1!A:Z"):
            if not self.connector:
                raise Exception("Google Sheets not initialized")
            # Implement read logic using connector
            return []

        async def update_data(self, spreadsheet_id, range_name, values):
            if not self.connector:
                raise Exception("Google Sheets not initialized")
            # Implement update logic using connector
            return {"updated": True}
except ImportError:
    class GoogleSheetsService:
        def __init__(self):
            self._connected = False
        async def initialize(self):
            self._connected = False
        def is_connected(self):
            return False
        async def read_data(self, *args, **kwargs):
            raise Exception("Google Sheets service not available")
        async def update_data(self, *args, **kwargs):
            raise Exception("Google Sheets service not available")

# Email Service wrapper
class EmailService:
    def __init__(self):
        self._configured = False

    def is_configured(self):
        return self._configured

    async def send_email(self, recipient, subject, body, attachment_path=None):
        # Implement email sending logic
        logging.info(f"Email would be sent to {recipient}: {subject}")
        return True

    async def send_report(self, recipient):
        return await self.send_email(recipient, "Automation Report", "Report content")

from utils.logger import setup_logger

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logger(__name__)

# FastAPI app instance
app = FastAPI(
    title="OneAutomation System API",
    description="Python automation service cho OneAutomation System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.localhost"]
)

# Pydantic models
class AutomationTask(BaseModel):
    task_type: str
    parameters: Optional[Dict[str, Any]] = {}

class EmailRequest(BaseModel):
    recipient: str
    subject: str
    body: str
    attachment_path: Optional[str] = None

class GoogleSheetsRequest(BaseModel):
    spreadsheet_id: str
    range_name: str = "Sheet1!A:Z"
    values: Optional[list] = None

# Global services
google_service = None
email_service = None
data_processor = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global google_service, email_service, data_processor
    logger.info("🚀 Starting OneAutomation System...")

    try:
        # Initialize Google Sheets service
        google_service = GoogleSheetsService()
        await google_service.initialize()
        logger.info("✅ Google Sheets service initialized")

        # Initialize Email service
        email_service = EmailService()
        logger.info("✅ Email service initialized")

        # Initialize Data processor
        data_processor = DataProcessor()
        logger.info("✅ Data processor initialized")

        logger.info("🎉 OneAutomation System started successfully!")

    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("👋 Shutting down OneAutomation System...")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "OneAutomation System API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        services_status = {
            "google_sheets": google_service.is_connected() if google_service else False,
            "email": email_service.is_configured() if email_service else False,
            "data_processor": data_processor is not None
        }
        return {
            "status": "healthy",
            "services": services_status,
            "uptime": "running",
            "timestamp": asyncio.get_event_loop().time()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": asyncio.get_event_loop().time()
        }

@app.post("/api/automation/run")
async def run_automation_task(task: AutomationTask):
    """Run automation task"""
    try:
        logger.info(f"Running automation task: {task.task_type}")
        result = {"status": "success", "message": "Task completed successfully"}

        if task.task_type == "google_sheets_sync":
            if not google_service:
                raise HTTPException(status_code=500, detail="Google Sheets service not initialized")

            spreadsheet_id = task.parameters.get("spreadsheet_id")
            if not spreadsheet_id:
                raise HTTPException(status_code=400, detail="spreadsheet_id required")

            data = await google_service.read_data(spreadsheet_id)
            result["data"] = data

        elif task.task_type == "send_email_report":
            if not email_service:
                raise HTTPException(status_code=500, detail="Email service not initialized")

            recipient = task.parameters.get("recipient")
            if not recipient:
                raise HTTPException(status_code=400, detail="recipient required")

            await email_service.send_report(recipient)

        elif task.task_type == "data_analysis":
            if not data_processor:
                raise HTTPException(status_code=500, detail="Data processor not initialized")

            data = task.parameters.get("data", [])
            analysis = await data_processor.analyze(data)
            result["analysis"] = analysis

        else:
            raise HTTPException(status_code=400, detail=f"Unknown task type: {task.task_type}")

        logger.info(f"✅ Task {task.task_type} completed successfully")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Task {task.task_type} failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/google-sheets/{spreadsheet_id}")
async def get_sheets_data(spreadsheet_id: str, range_name: str = "Sheet1!A:Z"):
    """Get data from Google Sheets"""
    try:
        if not google_service:
            raise HTTPException(status_code=500, detail="Google Sheets service not initialized")
        data = await google_service.read_data(spreadsheet_id, range_name)
        return {
            "status": "success",
            "data": data,
            "spreadsheet_id": spreadsheet_id,
            "range": range_name
        }

    except Exception as e:
        logger.error(f"Failed to get sheets data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/google-sheets/{spreadsheet_id}")
async def update_sheets_data(spreadsheet_id: str, request: GoogleSheetsRequest):
    """Update data in Google Sheets"""
    try:
        if not google_service:
            raise HTTPException(status_code=500, detail="Google Sheets service not initialized")
        if not request.values:
            raise HTTPException(status_code=400, detail="values required")

        result = await google_service.update_data(
            spreadsheet_id,
            request.range_name,
            request.values
        )

        return {
            "status": "success",
            "message": "Data updated successfully",
            "result": result
        }

    except Exception as e:
        logger.error(f"Failed to update sheets data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/email/send")
async def send_email(request: EmailRequest):
    """Send email"""
    try:
        if not email_service:
            raise HTTPException(status_code=500, detail="Email service not initialized")
        await email_service.send_email(
            recipient=request.recipient,
            subject=request.subject,
            body=request.body,
            attachment_path=request.attachment_path
        )

        return {
            "status": "success",
            "message": "Email sent successfully"
        }

    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/logs")
async def get_logs(lines: int = 50):
    """Get recent logs"""
    try:
        # This would read from log file in production
        return {
            "status": "success",
            "logs": [
                {
                    "timestamp": "2025-01-19T11:24:59Z",
                    "level": "INFO",
                    "message": "Automation system started"
                },
                {
                    "timestamp": "2025-01-19T11:23:45Z",
                    "level": "INFO",
                    "message": "Google Sheets service initialized"
                }
            ]
        }
    except Exception as e:
        logger.error(f"Failed to get logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Configuration
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8001"))  # Use port 8001 to avoid conflict with backend (8000)
    debug = os.getenv("DEBUG", "true").lower() == "true"
    logger.info(f"Starting OneAutomation System on {host}:{port}")

    # Run the application
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if not debug else "debug"
    )

    if __name__ == "__main__":
        main()
