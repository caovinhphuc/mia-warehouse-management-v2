#!/usr/bin/env python3
"""
Simple WebDriver Test
"""

import os
import sys

def test_webdriver():
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from webdriver_manager.chrome import ChromeDriverManager
        from selenium.webdriver.chrome.service import Service

        print("🌐 Testing WebDriver...")

        # Chrome options
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-web-security')

        # Get ChromeDriver
        print("📥 Getting ChromeDriver...")
        driver_path = ChromeDriverManager().install()
        print(f"Driver path: {driver_path}")

        # Check if file exists and is executable
        if os.path.exists(driver_path):
            print(f"✅ Driver file exists: {driver_path}")

            # Make executable
            os.chmod(driver_path, 0o755)

            # Test if it's executable
            if os.access(driver_path, os.X_OK):
                print("✅ Driver is executable")
            else:
                print("❌ Driver is not executable")
                return False

        else:
            print(f"❌ Driver file not found: {driver_path}")
            return False

        # Create service and driver
        service = Service(driver_path)
        driver = webdriver.Chrome(service=service, options=options)

        print("🌐 Testing web connection...")
        driver.set_page_load_timeout(10)
        driver.get('https://httpbin.org/get')

        title = driver.title
        print(f"✅ Test successful! Page title: {title}")

        driver.quit()
        return True

    except Exception as e:
        print(f"❌ WebDriver test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_webdriver()
    sys.exit(0 if success else 1)
