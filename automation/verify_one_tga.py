#!/usr/bin/env python3
"""
Verify one.tga.com.vn login credentials
Service để verify đăng nhập vào one.tga.com.vn
Được gọi từ backend Node.js qua API
"""

import sys
import time
import json
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

def setup_driver():
    """Setup Chrome WebDriver với headless mode"""
    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--headless')  # Headless mode
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-infobars')
    options.add_argument('--disable-logging')
    options.add_argument('--log-level=3')

    # Chrome binary path (Mac)
    chrome_binary_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if os.path.exists(chrome_binary_path):
        options.binary_location = chrome_binary_path

    try:
        service = Service('/opt/homebrew/bin/chromedriver')
        driver = webdriver.Chrome(service=service, options=options)
    except:
        # Fallback: không cần service
        driver = webdriver.Chrome(options=options)

    return driver

def verify_one_tga_login(email, password):
    """
    Verify đăng nhập vào one.tga.com.vn
    Returns: dict với success, valid, error
    """
    driver = None
    try:
        driver = setup_driver()

        # Navigate to login page
        driver.get("https://one.tga.com.vn/")
        time.sleep(2)

        # Find và fill username field
        wait = WebDriverWait(driver, 10)
        username_field = wait.until(
            EC.element_to_be_clickable((
                By.CSS_SELECTOR,
                "input[type='text'], input[name='username'], input[name='email']"
            ))
        )
        username_field.clear()
        username_field.send_keys(email)

        # Find và fill password field
        password_field = driver.find_element(
            By.CSS_SELECTOR,
            "input[type='password'], input[name='password']"
        )
        password_field.clear()
        password_field.send_keys(password)

        # Click login button
        login_button = driver.find_element(
            By.CSS_SELECTOR,
            "button[type='submit'], input[type='submit'], .login-btn"
        )
        login_button.click()

        # Wait for page load
        time.sleep(3)

        # Kiểm tra đăng nhập thành công
        current_url = driver.current_url
        page_title = driver.title.lower()

        # Nếu bị redirect về trang login hoặc URL vẫn là login page
        if "login" in current_url.lower() or "đăng nhập" in page_title:
            return {
                "success": False,
                "valid": False,
                "error": "Đăng nhập thất bại - Credentials không hợp lệ"
            }

        # Nếu URL thay đổi và không phải trang login -> đăng nhập thành công
        if "one.tga.com.vn" in current_url and "login" not in current_url.lower():
            return {
                "success": True,
                "valid": True,
                "message": "Đăng nhập one.tga.com.vn thành công"
            }

        # Kiểm tra thêm bằng cách tìm các element sau khi đăng nhập
        try:
            # Tìm các element thường có sau khi đăng nhập thành công
            logged_in_indicators = driver.find_elements(
                By.CSS_SELECTOR,
                ".user-info, .logout, [href*='logout'], .sidebar-menu, .dashboard"
            )
            if len(logged_in_indicators) > 0:
                return {
                    "success": True,
                    "valid": True,
                    "message": "Đăng nhập one.tga.com.vn thành công"
                }
        except:
            pass

        # Nếu không xác định được, trả về false
        return {
            "success": False,
            "valid": False,
            "error": "Không thể xác định trạng thái đăng nhập"
        }

    except Exception as e:
        return {
            "success": False,
            "valid": False,
            "error": f"Lỗi khi verify: {str(e)}"
        }
    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass

def main():
    """Main function - đọc input từ stdin và trả về JSON"""
    try:
        # Đọc input từ stdin (JSON)
        input_data = json.loads(sys.stdin.read())
        email = input_data.get("email")
        password = input_data.get("password")

        if not email or not password:
            result = {
                "success": False,
                "valid": False,
                "error": "Email và password là bắt buộc"
            }
        else:
            result = verify_one_tga_login(email, password)

        # Output JSON result
        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        error_result = {
            "success": False,
            "valid": False,
            "error": f"Lỗi: {str(e)}"
        }
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()

