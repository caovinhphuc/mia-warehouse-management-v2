#!/usr/bin/env python3
"""
Script cài đặt ChromeDriver offline để tránh tải mỗi lần chạy
"""

import os
import sys
import platform
import subprocess
from pathlib import Path

def install_chromedriver():
    """Cài đặt ChromeDriver một lần"""
    print("🔧 CÀI ĐẶT CHROMEDRIVER OFFLINE")
    print("=" * 50)

    try:
        from webdriver_manager.chrome import ChromeDriverManager
        from webdriver_manager.core.os_manager import ChromeType

        print("📦 Đang tải ChromeDriver...")

        # Set timeout dài hơn cho lần tải đầu
        os.environ['WDM_TIMEOUT'] = '60'

        # Xác định loại Chrome
        chrome_type = ChromeType.CHROMIUM if platform.system() == "Linux" else ChromeType.GOOGLE

        # Tải và cache ChromeDriver
        driver_manager = ChromeDriverManager(
            chrome_type=chrome_type
        )

        driver_path = driver_manager.install()

        print(f"✅ ChromeDriver đã được cài đặt tại: {driver_path}")

        # Kiểm tra cache directory
        cache_dir = os.path.expanduser("~/.wdm")
        if os.path.exists(cache_dir):
            print(f"📁 Cache directory: {cache_dir}")

            # Liệt kê các file trong cache
            cache_files = list(Path(cache_dir).rglob("*"))
            print(f"📊 Số file trong cache: {len(cache_files)}")

        # Test ChromeDriver
        print("\n🧪 Kiểm tra ChromeDriver...")
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.service import Service

            options = webdriver.ChromeOptions()
            options.add_argument('--headless=new')
            options.add_argument('--no-sandbox')

            driver = webdriver.Chrome(
                service=Service(driver_path),
                options=options
            )

            driver.get("data:text/html,<h1>ChromeDriver OK</h1>")
            print("✅ ChromeDriver hoạt động tốt!")

            driver.quit()

        except Exception as e:
            print(f"⚠️ Lỗi test ChromeDriver: {e}")

        print("\n✨ HOÀN THÀNH!")
        print("💡 ChromeDriver đã được cache, các lần chạy sau sẽ nhanh hơn")

        return True

    except Exception as e:
        print(f"❌ Lỗi cài đặt: {e}")
        print("\n💡 Giải pháp:")
        print("1. Kiểm tra kết nối internet")
        print("2. Thử chạy lại sau")
        print("3. Hoặc tải manual từ: https://chromedriver.chromium.org/")
        return False


def check_chrome_installed():
    """Kiểm tra Chrome đã cài chưa"""
    print("\n🔍 Kiểm tra Chrome browser...")

    # Các đường dẫn Chrome phổ biến
    chrome_paths = []

    if platform.system() == "Darwin":  # macOS
        chrome_paths = [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium"
        ]
    elif platform.system() == "Linux":
        chrome_paths = [
            "/usr/bin/google-chrome",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser"
        ]
    else:  # Windows
        chrome_paths = [
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
        ]

    for path in chrome_paths:
        if os.path.exists(path):
            print(f"✅ Chrome tìm thấy: {path}")

            # Lấy version
            try:
                if platform.system() == "Darwin":
                    cmd = [path, "--version"]
                    result = subprocess.run(cmd, capture_output=True, text=True)
                    if result.returncode == 0:
                        print(f"📊 Version: {result.stdout.strip()}")
            except:
                pass

            return True

    # Thử command line
    try:
        result = subprocess.run(['which', 'google-chrome'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Chrome tìm thấy: {result.stdout.strip()}")
            return True
    except:
        pass

    print("❌ Chrome chưa được cài đặt")
    print("💡 Cài đặt Chrome từ: https://www.google.com/chrome/")

    if platform.system() == "Darwin":
        print("   Hoặc dùng Homebrew: brew install --cask google-chrome")
    elif platform.system() == "Linux":
        print("   Hoặc dùng: sudo apt install google-chrome-stable")

    return False


if __name__ == "__main__":
    print("🚀 CHROMEDRIVER INSTALLER")
    print("Cài đặt ChromeDriver để tăng tốc automation\n")

    # Kiểm tra Chrome trước
    if not check_chrome_installed():
        print("\n⚠️ Vui lòng cài Chrome trước!")
        sys.exit(1)

    # Cài ChromeDriver
    if install_chromedriver():
        sys.exit(0)
    else:
        sys.exit(1)
