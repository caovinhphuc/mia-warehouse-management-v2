#!/usr/bin/env python3
"""
All-in-One Demo Script
Chạy tất cả các tính năng Google Sheets integration và automation
"""
import os
import sys
import time
from datetime import datetime

print("🚀 WAREHOUSE AUTOMATION SYSTEM - COMPLETE DEMO")
print("📊 Google Sheets Integration & Logging Features")
print("=" * 80)

def run_script(script_name, description):
    """Chạy một script và hiển thị kết quả"""
    print(f"\n{'=' * 80}")
    print(f"🧪 Running: {description}")
    print(f"📄 Script: {script_name}")
    print('=' * 80)

    start_time = time.time()

    try:
        # Run the script
        result = os.system(f"cd {os.path.dirname(os.path.abspath(__file__))} && python {script_name}")

        duration = time.time() - start_time

        if result == 0:
            print(f"\n✅ SUCCESS: {description} completed in {duration:.1f}s")
            return True
        else:
            print(f"\n❌ FAILED: {description} failed after {duration:.1f}s")
            return False

    except Exception as e:
        duration = time.time() - start_time
        print(f"\n❌ ERROR: {description} failed with error: {e} (after {duration:.1f}s)")
        return False

def main():
    """Main demo function"""
    print("\n🎯 This demo will run all Google Sheets integration features:")
    print("   1. 🔐 Authentication & User Verification")
    print("   2. ✅ Google Sheets Connection Verification")
    print("   3. 📊 Google Sheets Data Inspection")
    print("   4. 🤖 Automation with Logging")
    print("   5. 🏭 Complete Automation Simulation")
    print("   6. 📋 Final Summary Report")

    print(f"\n⏰ Demo started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Test scripts to run in order
    test_scripts = [
        ("verify_authentication_and_user.py", "Authentication & User Verification"),
        ("verify_sheets.py", "Google Sheets Connection Verification"),
        ("inspect_sheets_data.py", "Google Sheets Data Inspection"),
        ("run_automation_with_logging.py", "Automation with Google Sheets Logging"),
        ("run_complete_automation.py", "Complete Automation Simulation"),
        ("generate_summary.py", "Final Summary Report Generation")
    ]

    results = {}
    total_start_time = time.time()

    # Run each test
    for script, description in test_scripts:
        print(f"\n{'⏱️ ' * 20}")
        time.sleep(2)  # Brief pause between tests

        result = run_script(script, description)
        results[description] = result

    total_duration = time.time() - total_start_time

    # Display final results
    print("\n" + "=" * 80)
    print("🏁 COMPLETE DEMO RESULTS")
    print("=" * 80)

    passed = sum(1 for result in results.values() if result)
    total = len(results)

    for description, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} {description}")

    print(f"\n📊 Results: {passed}/{total} tests passed")
    print(f"⏱️ Total Duration: {total_duration:.1f} seconds ({total_duration/60:.1f} minutes)")

    if passed == total:
        print("\n🎉 ALL FEATURES WORKING PERFECTLY!")
        print("✅ Google Sheets integration is fully operational")
        print("✅ Automation logging is working correctly")
        print("✅ Data export and monitoring features are active")
    else:
        print(f"\n⚠️ {total - passed} features failed")
        print("Please check the individual test results above")

    # Display important links and files
    print("\n📎 IMPORTANT RESOURCES:")
    print("-" * 40)
    print("🔗 Google Sheets: https://docs.google.com/spreadsheets/d/17xjOqmZFMYT_Tt78_BARbwMYhDEyGcODNwxYbxNSWG8")
    print("📁 Data Files: ./data/ directory")
    print("📋 Log Files: ./logs/ directory")
    print("⚙️ Config Files: ./config/ directory")

    # List recent files
    try:
        print("\n📄 RECENT OUTPUT FILES:")
        print("-" * 40)

        # Check data directory
        if os.path.exists('data'):
            data_files = sorted([f for f in os.listdir('data') if f.endswith(('.csv', '.json', '.txt'))], reverse=True)[:5]
            for file in data_files:
                print(f"📊 data/{file}")

        # Check logs directory
        if os.path.exists('logs'):
            log_files = sorted([f for f in os.listdir('logs') if f.endswith('.log')], reverse=True)[:3]
            for file in log_files:
                print(f"📋 logs/{file}")

    except Exception:
        print("📁 Output files available in data/ and logs/ directories")

    print("\n" + "=" * 80)
    print("🏭 WAREHOUSE AUTOMATION SYSTEM DEMO COMPLETED")
    print(f"⏰ Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    return passed == total

if __name__ == "__main__":
    try:
        success = main()
        print(f"\n{'🎉 DEMO SUCCESSFUL!' if success else '⚠️ DEMO HAD ISSUES'}")
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Demo interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Demo failed with error: {e}")
        sys.exit(1)
