"""
ONE System - Automation Script (Run Once)
Chạy một lần thay vì liên tục
"""

import time
import requests
import json
from datetime import datetime
from loguru import logger

# Configure logging
logger.add("logs/automation_once.log", rotation="1 MB", retention="7 days",
           format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}")

class OneAutomationOnce:
    def __init__(self):
        self.backend_url = "http://localhost:5001"
        self.session_count = 0

    def log_message(self, message):
        """Log message to both file and console"""
        logger.info(message)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def check_backend_connection(self):
        """Kiểm tra kết nối backend"""
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            if response.status_code == 200:
                self.log_message("✅ Backend connection successful")
                return True
            else:
                self.log_message(f"❌ Backend returned status: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_message(f"❌ Cannot connect to backend: {e}")
            return False

    def simulate_data_processing(self):
        """Mô phỏng xử lý dữ liệu"""
        self.log_message("🔄 Starting data processing simulation...")

        # Simulate some work
        for i in range(3):
            time.sleep(1)
            self.log_message(f"   Processing step {i+1}/3...")

        # Generate sample data
        sample_data = {
            "timestamp": datetime.now().isoformat(),
            "processed_items": 150,
            "success_rate": 95.5,
            "errors": 2,
            "processing_time": 3.2
        }

        self.log_message(f"✅ Data processing completed: {sample_data['processed_items']} items")
        return sample_data

    def send_results_to_backend(self, data):
        """Gửi kết quả về backend"""
        try:
            response = requests.post(f"{self.backend_url}/api/automation-result",
                                   json=data, timeout=5)
            if response.status_code == 200:
                self.log_message("✅ Results sent to backend successfully")
                return True
            else:
                self.log_message(f"❌ Failed to send results: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_message(f"❌ Error sending results: {e}")
            return False

    def run_once(self):
        """Chạy automation một lần"""
        self.session_count += 1
        self.log_message(f"🚀 Starting automation session #{self.session_count}")

        # Step 1: Check backend
        if not self.check_backend_connection():
            self.log_message("❌ Automation aborted - backend not available")
            return False

        # Step 2: Process data
        processed_data = self.simulate_data_processing()

        # Step 3: Send results
        if self.send_results_to_backend(processed_data):
            self.log_message("✅ Automation session completed successfully")
            return True
        else:
            self.log_message("⚠️ Automation completed with errors")
            return False

    def generate_report(self):
        """Tạo báo cáo kết quả"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report = {
            "automation_type": "one-time",
            "session_id": f"session_{timestamp}",
            "timestamp": datetime.now().isoformat(),
            "total_sessions": self.session_count,
            "backend_url": self.backend_url,
            "status": "completed"
        }

        # Save report
        report_file = f"data/automation_once_report_{timestamp}.json"
        try:
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2)
            self.log_message(f"📊 Report saved: {report_file}")
        except Exception as e:
            self.log_message(f"❌ Failed to save report: {e}")

        return report

def main():
    automation = OneAutomationOnce()

    print("=" * 60)
    print("🤖 ONE SYSTEM - AUTOMATION (RUN ONCE)")
    print("=" * 60)

    try:
        # Run automation once
        success = automation.run_once()

        # Generate report
        report = automation.generate_report()

        if success:
            print("\n✅ Automation completed successfully!")
            print(f"📊 Session ID: {report['session_id']}")
            print(f"⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        else:
            print("\n❌ Automation completed with errors!")

    except KeyboardInterrupt:
        automation.log_message("⚠️ Automation interrupted by user")
        print("\n⚠️ Automation interrupted!")
    except Exception as e:
        automation.log_message(f"❌ Automation failed: {e}")
        print(f"\n❌ Automation failed: {e}")

    print("=" * 60)

if __name__ == "__main__":
    main()
