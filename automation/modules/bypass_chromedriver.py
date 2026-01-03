#!/usr/bin/env python3
"""
Bypass ChromeDriver download - Sử dụng Chrome trực tiếp không cần driver riêng
"""

import os
import sys
import subprocess

def get_chrome_path():
    """Tìm đường dẫn Chrome"""
    if sys.platform == "darwin":  # macOS
        paths = [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium"
        ]
    elif sys.platform == "linux":
        paths = [
            "/usr/bin/google-chrome",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser"
        ]
    else:  # Windows
        paths = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
        ]

    for path in paths:
        if os.path.exists(path):
            return path

    # Try which command
    try:
        result = subprocess.run(['which', 'google-chrome'], capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.strip()
    except:
        pass

    return None

def download_chromedriver_manual():
    """Hướng dẫn tải ChromeDriver thủ công"""
    print("\n📥 HƯỚNG DẪN TẢI CHROMEDRIVER THỦ CÔNG:")
    print("=" * 50)

    chrome_path = get_chrome_path()
    if chrome_path:
        # Get Chrome version
        try:
            result = subprocess.run([chrome_path, '--version'], capture_output=True, text=True)
            version = result.stdout.strip()
            print(f"✅ Chrome version: {version}")

            # Extract major version
            major_version = version.split()[2].split('.')[0]
            print(f"📊 Major version: {major_version}")

            print(f"\n🔗 Tải ChromeDriver từ:")
            print(f"   https://googlechromelabs.github.io/chrome-for-testing/")
            print(f"\n💡 Hoặc direct link:")
            print(f"   https://storage.googleapis.com/chrome-for-testing-public/{major_version}.0.6778.87/mac-x64/chromedriver-mac-x64.zip")

        except:
            print("⚠️ Không thể xác định version Chrome")

    print("\n📋 CÁC BƯỚC:")
    print("1. Tải ChromeDriver phù hợp với Chrome version")
    print("2. Giải nén file zip")
    print("3. Copy chromedriver vào thư mục này")
    print("4. Chạy: chmod +x chromedriver")
    print("5. Sửa automation.py để dùng driver local")

def create_local_driver_config():
    """Tạo config để dùng driver local"""
    config = """
# Thêm vào đầu automation.py hoặc automation_enhanced.py:

import os
from selenium.webdriver.chrome.service import Service

# Bypass ChromeDriver Manager
USE_LOCAL_DRIVER = True
LOCAL_DRIVER_PATH = "./chromedriver"  # hoặc đường dẫn đến chromedriver

def setup_driver_local():
    '''Setup driver với chromedriver local'''
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options

    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    # ... các options khác

    if USE_LOCAL_DRIVER and os.path.exists(LOCAL_DRIVER_PATH):
        service = Service(LOCAL_DRIVER_PATH)
        driver = webdriver.Chrome(service=service, options=options)
    else:
        # Fallback to system Chrome
        driver = webdriver.Chrome(options=options)

    return driver
"""

    print("\n📝 CONFIG CHO LOCAL DRIVER:")
    print("=" * 50)
    print(config)

    # Save to file
    with open('local_driver_config.txt', 'w') as f:
        f.write(config)

    print("\n✅ Đã lưu config vào: local_driver_config.txt")

def main():
    print("🔧 BYPASS CHROMEDRIVER DOWNLOAD")
    print("Giải pháp khi không thể tải ChromeDriver tự động\n")

    # Option 1: Manual download
    download_chromedriver_manual()

    # Option 2: Local config
    create_local_driver_config()

    print("\n🚀 GIẢI PHÁP NHANH:")
    print("1. Tắt tải tự động trong automation.py")
    print("2. Dùng system Chrome (có thể không ổn định)")
    print("3. Tải ChromeDriver thủ công một lần")

    print("\n💡 TIP: Chạy automation với timeout ngắn:")
    print("   export WDM_TIMEOUT=3")
    print("   python automation.py")

if __name__ == "__main__":
    main()
