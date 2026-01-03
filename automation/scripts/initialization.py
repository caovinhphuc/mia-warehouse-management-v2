#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Initialization Module - Khởi tạo hệ thống automation
Handles: logging setup, config loading, environment variables
"""

import json
import logging
import os
import sys
from dotenv import load_dotenv


class SystemInitializer:
    """Class xử lý khởi tạo hệ thống"""

    def __init__(self):
        self.config = None
        self.logger = None

    def setup_basic_logging(self):
        """Setup basic logging for initialization"""
        self.logger = logging.getLogger('AutomationSystem')
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
        return self.logger

    def load_config_with_sheets(self, config_path="config/config.json"):
        """Load config with Google Sheets integration fallback"""
        try:
            # Try to load from Google Sheets first
            try:
                from google_sheets_config import GoogleSheetsConfigService
                sheets_service = GoogleSheetsConfigService()
                self.config = sheets_service.get_config_merged(config_path)

                # Log config source
                metadata = self.config.get('_metadata', {})
                config_source = metadata.get('config_source', 'unknown')
                self.logger.info(f"✅ Configuration loaded from: {config_source}")

                if metadata.get('has_sheets_config'):
                    self.logger.info("📊 Google Sheets configuration active")
                if metadata.get('has_sla_config'):
                    self.logger.info("🕐 SLA configuration loaded from Google Sheets")

            except Exception as e:
                self.logger.warning(f"⚠️ Google Sheets config failed, using local file: {e}")
                # Fallback to local file
                with open(config_path, 'r', encoding='utf-8') as f:
                    self.config = json.load(f)

            # Load environment variables
            load_dotenv()

            # Replace environment variables in config
            self._replace_env_vars(self.config)

            self.logger.info("✅ Đã tải cấu hình thành công")
            return self.config

        except Exception as e:
            self.logger.error(f"❌ Lỗi tải cấu hình: {e}")
            raise

    def _replace_env_vars(self, obj):
        """Thay thế biến môi trường trong config"""
        if isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(value, str) and value.startswith('${') and value.endswith('}'):
                    env_var = value[2:-1]
                    obj[key] = os.getenv(env_var, value)
                elif isinstance(value, (dict, list)):
                    self._replace_env_vars(value)
        elif isinstance(obj, list):
            for item in obj:
                self._replace_env_vars(item)

    def setup_logging_advanced(self, config):
        """Setup advanced logging with config"""
        log_level = getattr(logging, config.get('logging', {}).get('level', 'INFO'))

        # Tạo formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        # Update logger level
        self.logger.setLevel(log_level)

        # File handler
        from datetime import datetime
        log_file = f"logs/automation_{datetime.now().strftime('%Y%m%d')}.log"

        # Create logs directory if it doesn't exist
        os.makedirs(os.path.dirname(log_file), exist_ok=True)

        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

        self.logger.info("🚀 Khởi tạo Advanced Automation System")
        return self.logger

    def initialize_system(self, config_path="config/config.json"):
        """Initialize complete system"""
        try:
            # Step 1: Setup basic logging
            logger = self.setup_basic_logging()

            # Step 2: Load config
            config = self.load_config_with_sheets(config_path)

            # Step 3: Setup advanced logging
            logger = self.setup_logging_advanced(config)

            logger.info("✅ System initialization completed successfully")
            return {
                'success': True,
                'config': config,
                'logger': logger
            }

        except Exception as e:
            if self.logger:
                self.logger.error(f"❌ System initialization failed: {e}")
            else:
                print(f"❌ System initialization failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'config': None,
                'logger': None
            }


def initialize_automation_system(config_path="config/config.json"):
    """Convenience function để khởi tạo hệ thống"""
    initializer = SystemInitializer()
    return initializer.initialize_system(config_path)
