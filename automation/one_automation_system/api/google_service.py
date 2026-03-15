#!/usr/bin/env python3
"""
Google Sheets Service for OneAutomation System
Dịch vụ tương tác với Google Sheets API
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional
import gspread
from google.oauth2.service_account import Credentials
from google.auth.exceptions import GoogleAuthError
logger = logging.getLogger(name)

class GoogleSheetsService:
"""Service to interact with Google Sheets"""
def __init__(self):
    self.client = None
    self.credentials = None
    self.is_initialized = False

async def initialize(self):
    """Initialize Google Sheets service"""
    try:
        # Method 1: Service account key file
        credentials_path = os.getenv('GOOGLE_SERVICE_ACCOUNT_PATH')
        if credentials_path and os.path.exists(credentials_path):
            self.credentials = Credentials.from_service_account_file(
                credentials_path,
                scopes=['https://www.googleapis.com/auth/spreadsheets']
            )
            logger.info("✅ Google credentials loaded from file")

        # Method 2: Environment variables
        elif os.getenv('GOOGLE_SERVICE_ACCOUNT_EMAIL') and os.getenv('GOOGLE_PRIVATE_KEY'):
            creds_data = {
                "type": "service_account",
                "client_email": os.getenv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
                "private_key": os.getenv('GOOGLE_PRIVATE_KEY').replace('\\n', '\n'),
                "token_uri": "https://oauth2.googleapis.com/token"
            }

            self.credentials = Credentials.from_service_account_info(
                creds_data,
                scopes=['https://www.googleapis.com/auth/spreadsheets']
            )
            logger.info("✅ Google credentials loaded from environment")

        else:
            logger.warning("⚠️ Google credentials not found - service will use demo mode")
            self.is_initialized = False
            return False

        # Initialize gspread client
        self.client = gspread.authorize(self.credentials)
        self.is_initialized = True
        logger.info("🔗 Google Sheets client initialized successfully")
        return True

    except GoogleAuthError as e:
        logger.error(f"❌ Google authentication failed: {e}")
        self.is_initialized = False
        return False
    except Exception as e:
        logger.error(f"❌ Failed to initialize Google Sheets service: {e}")
        self.is_initialized = False
        return False

def is_connected(self) -> bool:
    """Check if service is connected"""
    return self.is_initialized and self.client is not None

async def read_data(self, spreadsheet_id: str, range_name: str = "Sheet1!A:Z") -> List[Dict[str, Any]]:
    """Read data from Google Sheets"""
    try:
        if not self.is_connected():
            logger.warning("Google Sheets not connected, returning demo data")
            return self._get_demo_data()

        # Open spreadsheet
        sheet = self.client.open_by_key(spreadsheet_id)
        worksheet = sheet.get_worksheet(0)  # First sheet

        # Get all values
        values = worksheet.get_all_values()

        if not values:
            return []

        # Convert to list of dictionaries
        headers = values[0]
        data = []

        for row in values[1:]:
            row_dict = {}
            for i, header in enumerate(headers):
                row_dict[header] = row[i] if i < len(row) else ""
            data.append(row_dict)

        logger.info(f"📊 Read {len(data)} rows from Google Sheets")
        return data

    except Exception as e:
        logger.error(f"❌ Failed to read from Google Sheets: {e}")
        return self._get_demo_data()

async def update_data(self, spreadsheet_id: str, range_name: str, values: List[List[Any]]) -> Dict[str, Any]:
    """Update data in Google Sheets"""
    try:
        if not self.is_connected():
            logger.warning("Google Sheets not connected, returning demo response")
            return {"updated": len(values), "status": "demo"}

        # Open spreadsheet
        sheet = self.client.open_by_key(spreadsheet_id)
        worksheet = sheet.get_worksheet(0)

        # Update values
        worksheet.update(range_name, values)

        logger.info(f"✅ Updated {len(values)} rows in Google Sheets")
        return {
            "updated": len(values),
            "range": range_name,
            "status": "success"
        }

    except Exception as e:
        logger.error(f"❌ Failed to update Google Sheets: {e}")
        raise

async def append_data(self, spreadsheet_id: str, values: List[List[Any]]) -> Dict[str, Any]:
    """Append data to Google Sheets"""
    try:
        if not self.is_connected():
            logger.warning("Google Sheets not connected, returning demo response")
            return {"appended": len(values), "status": "demo"}

        # Open spreadsheet
        sheet = self.client.open_by_key(spreadsheet_id)
        worksheet = sheet.get_worksheet(0)

        # Append values
        worksheet.append_rows(values)

        logger.info(f"➕ Appended {len(values)} rows to Google Sheets")
        return {
            "appended": len(values),
            "status": "success"
        }

    except Exception as e:
        logger.error(f"❌ Failed to append to Google Sheets: {e}")
        raise

async def get_spreadsheet_info(self, spreadsheet_id: str) -> Dict[str, Any]:
    """Get spreadsheet information"""
    try:
        if not self.is_connected():
            return {
                "title": "Demo Spreadsheet",
                "sheets": ["Sheet1"],
                "status": "demo"
            }

        # Open spreadsheet
        sheet = self.client.open_by_key(spreadsheet_id)

        return {
            "title": sheet.title,
            "sheets": [ws.title for ws in sheet.worksheets()],
            "status": "connected"
        }

    except Exception as e:
        logger.error(f"❌ Failed to get spreadsheet info: {e}")
        raise

def _get_demo_data(self) -> List[Dict[str, Any]]:
    """Return demo data when Google Sheets is not available"""
    return [
        {
            "ID": "001",
            "Date": "2025-01-19",
            "Customer": "Nguyễn Văn A",
            "Product": "Laptop Dell",
            "Amount": "25000000",
            "Status": "Completed"
        },
        {
            "ID": "002",
            "Date": "2025-01-19",
            "Customer": "Trần Thị B",
            "Product": "iPhone 15",
            "Amount": "30000000",
            "Status": "Processing"
        },
        {
            "ID": "003",
            "Date": "2025-01-18",
            "Customer": "Lê Văn C",
            "Product": "Samsung Galaxy",
            "Amount": "20000000",
            "Status": "Shipped"
        }
    ]
Initialize global service instance
google_sheets_service = GoogleSheetsService()
