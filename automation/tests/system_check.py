#!/usr/bin/env python3
"""
System Check - Kiểm tra toàn bộ hệ thống warehouse automation
"""

import os
import sys
import json
import time
from pathlib import Path
import subprocess
import platform


def check_dependencies():
    """Kiểm tra dependencies"""
    print("🔍 1. KIỂM TRA DEPENDENCIES")
    print("-" * 40)

    required_packages = [
        'selenium', 'webdriver_manager', 'schedule', 'pandas',
        'openpyxl', 'dotenv', 'requests', 'matplotlib', 'seaborn',
        'numpy', 'xlsxwriter', 'bs4', 'lxml', 'streamlit',
        'plotly', 'flask', 'flask_cors', 'flask_compress'
    ]

    missing = []
    installed = []
    for package in required_packages:
        try:
            module = __import__(package)
            version = getattr(module, '__version__', 'unknown')
            print(f"✅ {package} (v{version})")
            installed.append(package)
        except ImportError:
            print(f"❌ {package} - THIẾU")
            missing.append(package)

    if missing:
        print(f"\n💡 Cài đặt: pip install {' '.join(missing)}")
        return False
    else:
        print(f"\n🎉 Tất cả {len(required_packages)} packages OK!")
        return True


def check_project_structure():
    """Kiểm tra cấu trúc dự án"""
    print("\n🔍 2. KIỂM TRA CẤU TRÚC DỰ ÁN")
    print("-" * 40)

    required_dirs = ['logs', 'data', 'config', 'scripts']
    required_files = [
        'automation.py', 'automation_enhanced.py',
        'setup.sh', 'start.sh', 'requirements.txt'
    ]

    all_ok = True

    # Kiểm tra thư mục
    for dir_name in required_dirs:
        if os.path.exists(dir_name):
            print(f"✅ {dir_name}/")
        else:
            print(f"❌ {dir_name}/ - THIẾU")
            all_ok = False

    # Kiểm tra files
    for file_name in required_files:
        if os.path.exists(file_name):
            size = os.path.getsize(file_name)
            print(f"✅ {file_name} ({size:,} bytes)")
        else:
            print(f"❌ {file_name} - THIẾU")
            all_ok = False

    return all_ok


def check_config():
    """Kiểm tra cấu hình"""
    print("\n🔍 3. KIỂM TRA CẤU HÌNH")
    print("-" * 40)

    # Kiểm tra .env
    if os.path.exists('.env'):
        print("✅ .env file tồn tại")
        # Kiểm tra các biến cần thiết
        try:
            with open('.env', 'r') as f:
                env_content = f.read()
                if 'ONE_USERNAME' in env_content and 'ONE_PASSWORD' in env_content:
                    print("✅ Credentials đã cấu hình")
                else:
                    print("⚠️ Credentials chưa cấu hình đầy đủ")
                    return False
        except:
            print("❌ Không thể đọc .env")
            return False
    else:
        print("❌ .env file không tồn tại")
        print("💡 Chạy ./quick_config.sh để tạo")
        return False

    # Kiểm tra config.json
    if os.path.exists('config/config.json'):
        try:
            with open('config/config.json', 'r') as f:
                config = json.load(f)
            print("✅ config/config.json hợp lệ")
        except:
            print("❌ config/config.json không hợp lệ")
            return False
    else:
        print("⚠️ config/config.json không tồn tại")

    return True


def check_chrome():
    """Kiểm tra Chrome/Chromium"""
    print("\n🔍 4. KIỂM TRA CHROME BROWSER")
    print("-" * 40)

    chrome_found = False

    # Kiểm tra các đường dẫn Chrome phổ biến
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
            chrome_found = True
            break

    if not chrome_found:
        # Thử command line
        try:
            result = subprocess.run(['which', 'google-chrome'], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ Chrome tìm thấy: {result.stdout.strip()}")
                chrome_found = True
        except:
            pass

    if not chrome_found:
        print("⚠️ Chrome/Chromium không tìm thấy")
        print("💡 Cài đặt Chrome từ: https://www.google.com/chrome/")
        return False

    return True


def check_webdriver():
    """Test WebDriver nhanh với timeout"""
    print("\n🔍 5. KIỂM TRA WEBDRIVER")
    print("-" * 40)

    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service
        from webdriver_manager.chrome import ChromeDriverManager
        from webdriver_manager.core.os_manager import ChromeType

        print("🔧 Khởi tạo ChromeDriver...")

        # Kiểm tra cache
        cache_dir = os.path.expanduser("~/.wdm")
        if os.path.exists(cache_dir):
            print("📦 Kiểm tra ChromeDriver từ cache...")

        options = webdriver.ChromeOptions()
        options.add_argument('--headless=new')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1280,720')

        # Set timeout ngắn
        os.environ['WDM_TIMEOUT'] = '5'  # Chỉ 5 giây

        try:
            # Ưu tiên ENV driver nếu có
            env_driver = os.getenv('CHROMEDRIVER_PATH') or os.getenv('CHROMEDRIVER')
            if env_driver and os.path.exists(env_driver):
                try:
                    os.chmod(env_driver, 0o755)
                except Exception:
                    pass
                driver = webdriver.Chrome(service=Service(env_driver), options=options)
            else:
                driver_manager = ChromeDriverManager(
                    chrome_type=ChromeType.CHROMIUM if platform.system() == "Linux" else ChromeType.GOOGLE
                )
                driver_path = driver_manager.install()
                driver = webdriver.Chrome(service=Service(driver_path), options=options)

            # Test nhanh
            driver.set_page_load_timeout(3)
            driver.get("data:text/html,<h1>OK</h1>")

            print("✅ ChromeDriver hoạt động tốt")
            print(f"📊 Browser version: {driver.capabilities.get('browserVersion', 'Unknown')}")

            driver.quit()
            return True

        except Exception as e:
            print(f"⚠️ Không thể khởi tạo ChromeDriver: {str(e)[:100]}...")
            print("💡 Có thể do:")
            print("   - Kết nối internet chậm")
            print("   - ChromeDriver chưa được cache")
            print("   - Chạy: python install_chromedriver.py để cài offline")
            return False

    except ImportError:
        print("❌ Selenium chưa được cài đặt")
        return False
    except Exception as e:
        print(f"❌ Lỗi WebDriver: {str(e)[:100]}...")
        return False


def check_network():
    """Kiểm tra kết nối mạng"""
    print("\n🔍 6. KIỂM TRA KẾT NỐI MẠNG")
    print("-" * 40)

    try:
        import requests

        # Test kết nối internet
        response = requests.get('https://www.google.com', timeout=5)
        if response.status_code == 200:
            print("✅ Kết nối Internet OK")

        # Test ONE system
        try:
            response = requests.get('https://one.tga.com.vn', timeout=5, verify=False)
            if response.status_code in [200, 302, 301]:
                print("✅ ONE System có thể truy cập")
            else:
                print(f"⚠️ ONE System trả về status: {response.status_code}")
        except:
            print("⚠️ Không thể kết nối đến ONE System")

        return True

    except Exception as e:
        print(f"❌ Lỗi kết nối mạng: {str(e)}")
        return False


def main():
    """Chạy tất cả kiểm tra"""
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                    🔧 SYSTEM HEALTH CHECK                    ║")
    print("║              Warehouse Automation System v2.1               ║")
    print("╚══════════════════════════════════════════════════════════════╝\n")

    start_time = time.time()
    results = []

    # Chạy các kiểm tra
    checks = [
        ("Dependencies", check_dependencies),
        ("Project Structure", check_project_structure),
        ("Configuration", check_config),
        ("Chrome Browser", check_chrome),
        ("WebDriver", check_webdriver),
        ("Network", check_network)
    ]

    for check_name, check_func in checks:
        try:
            result = check_func()
            results.append((check_name, result))
        except Exception as e:
            print(f"\n❌ Lỗi khi kiểm tra {check_name}: {str(e)}")
            results.append((check_name, False))

    # Tổng kết
    print("\n" + "="*60)
    print("📊 TỔNG KẾT KIỂM TRA")
    print("="*60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for check_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {check_name}")

    elapsed_time = time.time() - start_time
    print(f"\n⏱️ Thời gian kiểm tra: {elapsed_time:.2f} giây")
    print(f"📈 Kết quả: {passed}/{total} kiểm tra thành công")

    if passed == total:
        print("\n🎉 HỆ THỐNG SẴN SÀNG HOẠT ĐỘNG!")
        print("💡 Chạy: python automation.py")
        return True
    else:
        print("\n⚠️ HỆ THỐNG CẦN ĐƯỢC KHẮC PHỤC")
        print("💡 Chạy: ./setup.sh để cài đặt lại")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
