#!/usr/bin/env python3
"""
Configuration Settings Module
"""

import os
from typing import Optional

class Settings:
    """Application settings"""

    def __init__(self):
        # Google API settings
        self.GOOGLE_CREDENTIALS_PATH = os.getenv('GOOGLE_CREDENTIALS_PATH')
        self.GOOGLE_SERVICE_ACCOUNT_PATH = os.getenv('GOOGLE_SERVICE_ACCOUNT_PATH')

        # Email settings
        self.SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
        self.SMTP_USER = os.getenv('SMTP_USER')
        self.SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
        self.EMAIL_FROM = os.getenv('EMAIL_FROM', 'OneAutomation <noreply@oneautomation.com>')

        # Database settings
        self.MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/oneautomation')
        self.POSTGRES_URI = os.getenv('POSTGRES_URI')

        # Logging settings
        self.LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
        self.LOG_FILE = os.getenv('LOG_FILE', 'logs/automation.log')

        # Automation settings
        self.MAX_CONCURRENT_TASKS = int(os.getenv('MAX_CONCURRENT_TASKS', '5'))
        self.TASK_TIMEOUT = int(os.getenv('TASK_TIMEOUT', '300'))
