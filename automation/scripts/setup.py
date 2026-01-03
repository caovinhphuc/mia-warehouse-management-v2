#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Setup Module - Thiết lập các thành phần hệ thống
Handles: WebDriver setup, Google Sheets integration, SLA Monitor setup
"""

import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


class SystemSetup:
    """Class xử lý setup các thành phần hệ thống"""

    def __init__(self, logger=None):
        self.logger = logger
        self.driver = None
        self.sla_monitor = None
        self.sheets_config_service = None

    def setup_driver(self, headless=True):
        """Setup Chrome WebDriver với tối ưu performance"""
        try:
            self.logger.info("🌐 Setting up WebDriver...")

            chrome_options = Options()

            # Headless mode
            if headless:
                chrome_options.add_argument('--headless=new')

            # Core performance arguments
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')

            # AGGRESSIVE PERFORMANCE OPTIMIZATION
            # Block unnecessary content to speed up loading
            chrome_options.add_experimental_option("prefs", {
                "profile.default_content_setting_values": {
                    "images": 2,        # Block images (60-80% faster loading)
                    "plugins": 2,       # Block plugins
                    "popups": 2,        # Block popups
                    "geolocation": 2,   # Block location requests
                    "notifications": 2, # Block notifications
                    "media_stream": 2,  # Block media stream
                }
            })

            # Advanced performance flags
            performance_args = [
                '--disable-extensions',
                '--disable-plugins',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-background-timer-throttling',
                '--disable-background-networking',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--aggressive-cache-discard',
                '--memory-pressure-off',
                '--disable-ipc-flooding-protection',
                '--disable-hang-monitor',
                '--disable-prompt-on-repost',
                '--no-first-run',
                '--disable-default-apps',
                '--log-level=3'
            ]

            for arg in performance_args:
                chrome_options.add_argument(arg)

            # JavaScript optimization
            chrome_options.add_argument('--js-flags=--expose-gc')
            chrome_options.add_argument('--js-flags=--max_old_space_size=4096')

            # Disable automation detection
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)

            # Chrome binary path for macOS
            chrome_binary = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            if os.path.exists(chrome_binary):
                chrome_options.binary_location = chrome_binary

            # User agent
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')

            # Setup driver
            try:
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
            except Exception as e:
                self.logger.warning(f"ChromeDriverManager failed: {e}")
                service = Service()
                self.driver = webdriver.Chrome(service=service, options=chrome_options)

            # OPTIMIZED TIMEOUTS
            self.driver.implicitly_wait(3)  # Giảm từ 10s xuống 3s
            self.driver.set_page_load_timeout(15)  # Giảm từ 30s xuống 15s
            self.driver.set_script_timeout(3)  # Giảm từ 5s xuống 3s

            # Hide automation detection
            self.driver.execute_script(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
            )

            self.logger.info("✅ WebDriver tối ưu đã sẵn sàng")
            return self.driver

        except Exception as e:
            self.logger.error(f"❌ Lỗi khởi tạo WebDriver: {e}")
            return None

    def setup_sheets_config(self):
        """Setup Google Sheets configuration service"""
        try:
            self.logger.info("📊 Setting up Google Sheets integration...")

            from google_sheets_config import GoogleSheetsConfigService
            # Use the specific Google Sheets ID from user's link
            sheets_id = '1xxQ3SedROJqBqwgRct4bq6xpoIIXy8-eWzfwUWrJJU0'
            self.sheets_config_service = GoogleSheetsConfigService(spreadsheet_id=sheets_id)

            self.logger.info("✅ Google Sheets config service initialized with user's spreadsheet")
            return self.sheets_config_service

        except ImportError:
            self.logger.warning("⚠️ Google Sheets integration not available - install gspread and google-auth")
            return None
        except Exception as e:
            self.logger.error(f"❌ Google Sheets setup failed: {e}")
            return None

    def setup_sla_monitor(self):
        """Setup SLA monitoring"""
        try:
            self.logger.info("🕐 Setting up SLA Monitor...")

            from sla_monitor import SLAMonitor
            self.sla_monitor = SLAMonitor()

            self.logger.info("✅ SLA Monitor initialized successfully")
            return self.sla_monitor

        except ImportError:
            self.logger.warning("⚠️ SLA Monitor not available")
            return None
        except Exception as e:
            self.logger.error(f"❌ SLA Monitor setup failed: {e}")
            return None

    def setup_session_manager(self):
        """Setup session manager for login persistence"""
        try:
            self.logger.info("💾 Setting up Session Manager...")

            from automation import SessionManager
            session_manager = SessionManager()

            self.logger.info("✅ Session Manager initialized")
            return session_manager

        except ImportError:
            self.logger.warning("⚠️ Session Manager not available")
            return None
        except Exception as e:
            self.logger.error(f"❌ Session Manager setup failed: {e}")
            return None

    def setup_all_components(self, headless=True):
        """Setup tất cả các thành phần"""
        try:
            self.logger.info("🔧 Setting up all system components...")

            results = {}

            # 1. Setup WebDriver
            results['driver'] = self.setup_driver(headless)

            # 2. Setup Google Sheets
            results['sheets_service'] = self.setup_sheets_config()

            # 3. Setup SLA Monitor
            results['sla_monitor'] = self.setup_sla_monitor()

            # 4. Setup Session Manager
            results['session_manager'] = self.setup_session_manager()

            # Count successful setups
            successful_setups = sum(1 for v in results.values() if v is not None)
            total_setups = len(results)

            self.logger.info(f"✅ Setup completed: {successful_setups}/{total_setups} components successful")

            return {
                'success': successful_setups > 0,  # At least WebDriver should work
                'results': results,
                'successful_count': successful_setups,
                'total_count': total_setups
            }

        except Exception as e:
            self.logger.error(f"❌ Setup all components failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'results': {},
                'successful_count': 0,
                'total_count': 0
            }

    def cleanup(self):
        """Cleanup resources"""
        try:
            if self.driver:
                self.driver.quit()
                self.logger.info("🧹 WebDriver cleaned up")
        except Exception as e:
            self.logger.warning(f"⚠️ Cleanup warning: {e}")


def setup_automation_system(logger, headless=True):
    """Convenience function để setup hệ thống"""
    setup_manager = SystemSetup(logger)
    return setup_manager.setup_all_components(headless)
