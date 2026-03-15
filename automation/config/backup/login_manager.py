#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔐 Login Manager - Tổng hợp 4 modules cho quy trình đăng nhập hoàn chỉnh
Imports: initialization + setup + login + enhanced_scraper
"""

import os
import sys
import time
import logging
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import 4 modules
from scripts.initialization import initialize_automation_system
from scripts.setup import setup_automation_system
from scripts.login import login_to_automation_system
from scripts.enhanced_scraper import EnhancedScraper


class CompleteLoginManager:
    """
    🔐 Manager tổng hợp cho quy trình đăng nhập hoàn chỉnh
    Sử dụng 4 modules: initialization → setup → login → enhanced_scraper
    """

    def __init__(self, log_level='INFO'):
        self.log_level = log_level
        self.logger = None
        self.config = None
        self.driver = None
        self.google_sheets = None
        self.sla_monitor = None
        self.session_manager = None
        self.enhanced_scraper = None
        self.is_logged_in = False

    def complete_login_process(self):
        """
        🚀 Quy trình đăng nhập hoàn chỉnh với 4 modules
        Returns: {success: bool, components: dict, message: str}
        """
        try:
            print("🔐 COMPLETE LOGIN MANAGER - Starting 4-module process...")

            # ===== MODULE 1: INITIALIZATION =====
            print("📦 [1/4] Initializing system...")
            init_result = initialize_automation_system()

            if not init_result['success']:
                return {
                    'success': False,
                    'error': f"Initialization failed: {init_result.get('error', 'Unknown error')}",
                    'step': 'initialization'
                }

            self.logger = init_result['logger']
            self.config = init_result['config']
            self.logger.info("✅ Module 1: Initialization completed")

            # ===== MODULE 2: SETUP =====
            print("🔧 [2/4] Setting up components...")
            setup_result = setup_automation_system(self.logger)

            if not setup_result['success']:
                return {
                    'success': False,
                    'error': f"Setup failed: {setup_result.get('error', 'Unknown error')}",
                    'step': 'setup'
                }

            results = setup_result['results']
            self.driver = results['driver']
            self.google_sheets = results['sheets_service']
            self.sla_monitor = results['sla_monitor']
            self.session_manager = results['session_manager']
            self.logger.info("✅ Module 2: Setup completed")

            # ===== MODULE 3: LOGIN =====
            print("🔑 [3/4] Logging into system...")
            login_result = login_to_automation_system(
                self.driver,
                self.config,
                self.logger,
                self.session_manager
            )

            if not login_result['success']:
                return {
                    'success': False,
                    'error': f"Login failed: {login_result.get('error', 'Login process failed')}",
                    'step': 'login'
                }

            self.is_logged_in = True
            self.logger.info("✅ Module 3: Login completed")

                        # ===== MODULE 4: ENHANCED SCRAPER SETUP =====
            print("📊 [4/4] Setting up enhanced scraper...")
            self.enhanced_scraper = EnhancedScraper(
                self.driver,
                self.logger
            )
            self.logger.info("✅ Module 4: Enhanced scraper ready")

            # ===== SUCCESS =====
            success_message = "🎉 Complete login process successful - All 4 modules ready!"
            print(success_message)
            self.logger.info(success_message)

            return {
                'success': True,
                'is_logged_in': self.is_logged_in,
                'components': {
                    'driver': self.driver,
                    'config': self.config,
                    'logger': self.logger,
                    'google_sheets': self.google_sheets,
                    'sla_monitor': self.sla_monitor,
                    'session_manager': self.session_manager,
                    'enhanced_scraper': self.enhanced_scraper
                },
                'message': 'All 4 modules initialized and login successful'
            }

        except Exception as e:
            error_msg = f"Complete login process failed: {str(e)}"
            print(f"❌ {error_msg}")
            if self.logger:
                self.logger.error(error_msg)

            return {
                'success': False,
                'error': error_msg,
                'step': 'unknown'
            }

    def cleanup(self):
        """🧹 Dọn dẹp resources"""
        try:
            if self.driver:
                self.driver.quit()
                if self.logger:
                    self.logger.info("🧹 WebDriver cleaned up")
                print("🧹 WebDriver cleaned up")
        except Exception as e:
            print(f"⚠️ Cleanup warning: {e}")


def quick_login_test():
    """🧪 Test nhanh chức năng đăng nhập"""
    print("🧪 QUICK LOGIN TEST - Testing 4-module integration...")

    manager = CompleteLoginManager()

    try:
        # Test login process
        result = manager.complete_login_process()

        if result['success']:
            print("\n" + "="*60)
            print("✅ LOGIN TEST SUCCESSFUL!")
            print("="*60)
            print(f"🔑 Login Status: {result['is_logged_in']}")
            print(f"📦 Components Ready: {len(result['components'])}")
            print("🎯 All 4 modules working perfectly!")
            print("="*60)
            return True
        else:
            print("\n" + "="*60)
            print("❌ LOGIN TEST FAILED!")
            print("="*60)
            print(f"❌ Error: {result['error']}")
            print(f"🔍 Failed at: {result['step']}")
            print("="*60)
            return False

    except Exception as e:
        print(f"\n❌ Test exception: {e}")
        return False
    finally:
        manager.cleanup()


if __name__ == "__main__":
    """🚀 Run quick test when executed directly"""
    quick_login_test()
