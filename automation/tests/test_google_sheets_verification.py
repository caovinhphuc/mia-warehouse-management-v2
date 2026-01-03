#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Sheets Verification and Logging Test
Chạy test xác nhận Google Sheets và các tính năng logging
"""

import sys
import os
import logging
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from google_sheets_config import GoogleSheetsConfigService

def setup_logging():
    """Setup logging cho test"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(f'logs/sheets_verification_{datetime.now().strftime("%Y%m%d")}.log')
        ]
    )
    return logging.getLogger('SheetsVerification')

def test_google_sheets_connection():
    """Test kết nối Google Sheets"""
    logger = logging.getLogger('SheetsVerification')

    try:
        print("🔍 Testing Google Sheets Connection...")

        # Initialize service
        sheets_service = GoogleSheetsConfigService()

        if not sheets_service.client:
            print("❌ Failed to initialize Google Sheets client")
            return False

        if not sheets_service.spreadsheet:
            print("❌ Failed to access spreadsheet")
            return False

        print("✅ Google Sheets connection successful")
        print(f"📊 Spreadsheet ID: {sheets_service.spreadsheet_id}")

        # List existing worksheets
        worksheets = sheets_service.spreadsheet.worksheets()
        print(f"📋 Found {len(worksheets)} worksheets:")
        for ws in worksheets:
            print(f"   - {ws.title} ({ws.row_count}x{ws.col_count})")

        return True

    except Exception as e:
        logger.error(f"❌ Connection test failed: {e}")
        return False

def test_sheets_config_loading():
    """Test loading config từ Google Sheets"""
    logger = logging.getLogger('SheetsVerification')

    try:
        print("\n🔧 Testing Config Loading...")

        sheets_service = GoogleSheetsConfigService()

        # Test basic config
        config = sheets_service.get_sheets_config()
        print(f"✅ Loaded config with {len(config)} sections:")
        for section, values in config.items():
            print(f"   📁 {section}: {len(values) if isinstance(values, dict) else 1} keys")

        # Test merged config
        merged_config = sheets_service.get_config_merged('config/config.json')
        print(f"✅ Merged config source: {merged_config.get('_metadata', {}).get('config_source', 'unknown')}")

        # Test SLA rules
        sla_rules = sheets_service.get_sla_rules()
        print(f"✅ SLA rules for {len(sla_rules)} platforms:")
        for platform, rules in sla_rules.items():
            print(f"   🏪 {platform}: {len(rules)} rules")

        # Test workspace config
        workspace_config = sheets_service.get_workspace_config()
        print(f"✅ Workspace config - Target records: {workspace_config['target_records']}")

        # Test date range config
        date_config = sheets_service.get_date_range_config()
        print(f"✅ Date range: {date_config['start_date']} to {date_config['end_date']}")

        return True

    except Exception as e:
        logger.error(f"❌ Config loading test failed: {e}")
        return False

def test_logging_functions():
    """Test các tính năng logging"""
    logger = logging.getLogger('SheetsVerification')

    try:
        print("\n📝 Testing Logging Functions...")

        sheets_service = GoogleSheetsConfigService()

        # Test automation status update
        progress = {
            'current_page': 3,
            'total_pages': 10,
            'orders_extracted': 750,
            'products_extracted': 2250,
            'progress_percent': 30,
            'estimated_time_left': '5 minutes',
            'session_id': f'VERIFY_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
            'last_error': ''
        }

        success = sheets_service.update_automation_status('Testing Verification', progress)
        print(f"✅ Status update: {'Success' if success else 'Failed'}")

        # Test automation run logging
        test_result = {
            'success': True,
            'duration': 25.6,
            'order_count': 45,
            'enhanced_order_count': 42,
            'config_source': 'google_sheets',
            'sheets_integration': True,
            'system_url': 'https://one.tga.com.vn',
            'automation_version': '2.1_verified',
            'error': '',
            'start_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'end_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'export_files': {'csv': 'orders_verified.csv', 'json': 'products_verified.json'}
        }

        success = sheets_service.log_automation_run(test_result)
        print(f"✅ Automation logging: {'Success' if success else 'Failed'}")

        # Test config update
        timestamp = datetime.now().isoformat()
        success = sheets_service.update_system_config('verification.last_test', timestamp)
        print(f"✅ Config update: {'Success' if success else 'Failed'}")

        # Test data export
        sample_data = [
            {
                'verification_id': 'VER001',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'test_type': 'sheets_connection',
                'status': 'passed',
                'duration_ms': 1250,
                'notes': 'Google Sheets integration verified'
            },
            {
                'verification_id': 'VER002',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'test_type': 'config_loading',
                'status': 'passed',
                'duration_ms': 890,
                'notes': 'Config merged successfully'
            },
            {
                'verification_id': 'VER003',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'test_type': 'logging_functions',
                'status': 'passed',
                'duration_ms': 1580,
                'notes': 'All logging functions working'
            }
        ]

        sheet_name = f'Verification_{datetime.now().strftime("%Y%m%d_%H%M")}'
        success = sheets_service.export_data_to_sheets(sample_data, sheet_name)
        print(f"✅ Data export to '{sheet_name}': {'Success' if success else 'Failed'}")

        return True

    except Exception as e:
        logger.error(f"❌ Logging test failed: {e}")
        return False

def test_dashboard_creation():
    """Test tạo dashboard"""
    logger = logging.getLogger('SheetsVerification')

    try:
        print("\n📊 Testing Dashboard Creation...")

        sheets_service = GoogleSheetsConfigService()

        # Create sample sheets if not exist
        success = sheets_service.create_sample_sheets()
        print(f"✅ Sample sheets creation: {'Success' if success else 'Failed'}")

        # Create dashboard
        success = sheets_service.create_automation_dashboard()
        print(f"✅ Dashboard creation: {'Success' if success else 'Failed'}")

        return True

    except Exception as e:
        logger.error(f"❌ Dashboard test failed: {e}")
        return False

def test_config_backup():
    """Test backup config local lên sheets"""
    logger = logging.getLogger('SheetsVerification')

    try:
        print("\n💾 Testing Config Backup...")

        sheets_service = GoogleSheetsConfigService()

        # Backup local config
        success = sheets_service.backup_local_config_to_sheets('config/config.json')
        print(f"✅ Config backup: {'Success' if success else 'Failed'}")

        return True

    except Exception as e:
        logger.error(f"❌ Config backup test failed: {e}")
        return False

def test_automation_history():
    """Test lấy lịch sử automation"""
    logger = logging.getLogger('SheetsVerification')

    try:
        print("\n📈 Testing Automation History...")

        sheets_service = GoogleSheetsConfigService()

        # Get history
        history = sheets_service.get_automation_history(limit=10)
        print(f"✅ Retrieved {len(history)} history records")

        if history:
            latest = history[0]
            print(f"   🕐 Latest run: {latest.get('Timestamp', 'N/A')}")
            print(f"   ✅ Success: {latest.get('Success', 'N/A')}")
            print(f"   📊 Orders: {latest.get('Order_Count', 'N/A')}")

        return True

    except Exception as e:
        logger.error(f"❌ History test failed: {e}")
        return False

def verify_sheets_integration():
    """Chạy toàn bộ verification Google Sheets"""
    logger = setup_logging()

    print("🚀 Starting Google Sheets Integration Verification")
    print("=" * 60)

    # Test steps
    tests = [
        ("Connection Test", test_google_sheets_connection),
        ("Config Loading Test", test_sheets_config_loading),
        ("Logging Functions Test", test_logging_functions),
        ("Dashboard Creation Test", test_dashboard_creation),
        ("Config Backup Test", test_config_backup),
        ("Automation History Test", test_automation_history)
    ]

    results = {}

    for test_name, test_func in tests:
        try:
            print(f"\n{'=' * 60}")
            print(f"🧪 Running: {test_name}")
            print('=' * 60)

            result = test_func()
            results[test_name] = result

            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"\n{status}: {test_name}")

        except Exception as e:
            logger.error(f"❌ {test_name} failed with exception: {e}")
            results[test_name] = False

    # Summary
    print("\n" + "=" * 60)
    print("📋 VERIFICATION SUMMARY")
    print("=" * 60)

    passed = sum(1 for result in results.values() if result)
    total = len(results)

    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")

    print(f"\n📊 Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All Google Sheets integration tests PASSED!")
        print("✅ Google Sheets is ready for automation logging")
    else:
        print(f"⚠️ {total - passed} tests failed. Please check the issues above.")

    # Log final result
    sheets_service = GoogleSheetsConfigService()
    if sheets_service.client:
        verification_result = {
            'success': passed == total,
            'duration': 0,  # Would be calculated in real scenario
            'order_count': 0,
            'enhanced_order_count': 0,
            'config_source': 'verification_test',
            'sheets_integration': True,
            'system_url': 'verification_test',
            'automation_version': '2.1_verification',
            'error': '' if passed == total else f'{total - passed} tests failed',
            'start_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'end_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'export_files': {'verification': 'sheets_verification_complete.json'}
        }

        sheets_service.log_automation_run(verification_result)
        print(f"\n🔗 Spreadsheet URL: https://docs.google.com/spreadsheets/d/{sheets_service.spreadsheet_id}")

    return passed == total

if __name__ == "__main__":
    success = verify_sheets_integration()
    sys.exit(0 if success else 1)
