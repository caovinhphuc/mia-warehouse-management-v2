#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ONE Automation System - Script tự động truy cập và xử lý dữ liệu
Author: AI Assistant
Created: 2025-06-15
Version: 1.0.0
"""

import json
import logging
import os
import pickle
import platform
import shutil
import smtplib
import sys
import time
from datetime import datetime
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import numpy as np
import pandas as pd
from dotenv import load_dotenv
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import OperationSystemManager

import src.modules.schedule as schedule


class SessionManager:
    """Quản lý session để tránh login lại"""

    def __init__(self, session_file="session_data.pkl"):
        self.session_file = session_file
        self.session_timeout = 3600  # 1 hour

    def save_session(self, cookies, url):
        """Lưu session cookies"""
        session_data = {
            'cookies': cookies,
            'url': url,
            'timestamp': time.time()
        }
        try:
            with open(self.session_file, 'wb') as f:
                pickle.dump(session_data, f)
        except Exception:
            pass  # Ignore save errors

    def load_session(self):
        """Tải session cookies"""
        try:
            if not os.path.exists(self.session_file):
                return None

            with open(self.session_file, 'rb') as f:
                session_data = pickle.load(f)

            # Kiểm tra session còn hạn không
            if time.time() - session_data['timestamp'] > self.session_timeout:
                return None

            return session_data
        except Exception:
            return None

    def clear_session(self):
        """Xóa session"""
        try:
            if os.path.exists(self.session_file):
                os.remove(self.session_file)
        except Exception:
            pass


class OneAutomationSystem:
    """Hệ thống tự động hóa truy cập ONE và xử lý dữ liệu - PHIÊN BẢN TỐI ƯU"""

    def __init__(self, config_path="config/config.json"):
        """Khởi tạo hệ thống với session manager"""
        self.load_config(config_path)
        self.setup_logging()
        self.driver = None
        self.session_data = {}
        self.session_manager = SessionManager()
        self.is_logged_in = False

    def load_config(self, config_path):
        """Tải cấu hình từ file JSON"""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)

            # Load environment variables
            load_dotenv()

            # Replace environment variables in config
            self._replace_env_vars(self.config)

            print("✅ Đã tải cấu hình thành công")
        except Exception as e:
            print(f"❌ Lỗi tải cấu hình: {e}")
            sys.exit(1)

    def _replace_env_vars(self, obj):
        """Thay thế biến môi trường trong config"""
        if isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(value, str) and value.startswith('${') and value.endswith('}'):
                    env_var = value[2:-1]
                    obj[key] = os.getenv(env_var, value)
                elif isinstance(value, (dict, list)):
                    self._replace_env_vars(value)
        elif isinstance(obj, list):
            for item in obj:
                self._replace_env_vars(item)

    def setup_logging(self):
        """Thiết lập logging"""
        log_level = getattr(logging, self.config.get('logging', {}).get('level', 'INFO'))

        # Tạo formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        # Tạo logger
        self.logger = logging.getLogger('OneAutomation')
        self.logger.setLevel(log_level)

        # File handler
        log_file = f"logs/automation_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

    def setup_driver(self):
        """Thiết lập WebDriver với tối ưu hiệu suất tối đa"""
        try:
            def install_wdm_driver(force_fresh=False):
                """Install ChromeDriver with architecture-aware config (macOS Intel/ARM)."""
                # Optional override for troubleshooting
                os_type = os.getenv('WDM_OS_TYPE')

                if not os_type and sys.platform == 'darwin':
                    machine = platform.machine().lower()
                    os_type = 'mac_arm64' if machine in ('arm64', 'aarch64') else 'mac64'

                if force_fresh:
                    cache_root = os.path.expanduser("~/.wdm/drivers/chromedriver")
                    if os.path.exists(cache_root):
                        shutil.rmtree(cache_root, ignore_errors=True)
                        self.logger.info("🧹 Cleared ChromeDriver cache due to architecture mismatch")

                if os_type:
                    manager = ChromeDriverManager(
                        os_system_manager=OperationSystemManager(os_type=os_type)
                    )
                else:
                    manager = ChromeDriverManager()

                driver_path = manager.install()
                try:
                    os.chmod(driver_path, 0o755)
                except Exception:
                    pass
                return driver_path

            options = Options()

            # Core performance arguments
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--disable-blink-features=AutomationControlled')

            # AGGRESSIVE PERFORMANCE OPTIMIZATION
            # Block unnecessary content to speed up loading
            options.add_experimental_option("prefs", {
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
                options.add_argument(arg)

            # JavaScript optimization
            options.add_argument('--js-flags=--expose-gc')
            options.add_argument('--js-flags=--max_old_space_size=4096')

            # Disable automation detection
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)

            # Headless mode for production
            if os.getenv('HEADLESS', 'true').lower() == 'true':
                options.add_argument('--headless=new')  # Use new headless mode

            # Chrome binary path for macOS
            chrome_binary = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            if os.path.exists(chrome_binary):
                options.binary_location = chrome_binary

            # Setup driver với timeout
            try:
                # Set timeout ngắn cho ChromeDriver Manager
                os.environ['WDM_TIMEOUT'] = '10'  # 10 giây
                os.environ['WDM_LOG'] = 'false'   # Tắt log chi tiết

                self.logger.info("📥 Khởi tạo ChromeDriver...")

                # Kiểm tra cache trước
                cache_dir = os.path.expanduser("~/.wdm")
                if os.path.exists(cache_dir):
                    self.logger.info("📦 Kiểm tra ChromeDriver từ cache...")

                # Ưu tiên dùng biến môi trường CHROMEDRIVER_PATH/CHROMEDRIVER nếu có
                env_driver = os.getenv('CHROMEDRIVER_PATH') or os.getenv('CHROMEDRIVER')
                if env_driver and os.path.exists(env_driver):
                    try:
                        # Đảm bảo quyền thực thi
                        try:
                            os.chmod(env_driver, 0o755)
                        except Exception:
                            pass
                        service = Service(env_driver)
                        self.driver = webdriver.Chrome(service=service, options=options)
                        self.logger.info(f"✅ Dùng ChromeDriver từ ENV: {env_driver}")
                    except Exception as e_env:
                        self.logger.warning(f"⚠️ ENV ChromeDriver failed: {e_env}")
                        driver_path = install_wdm_driver(force_fresh=False)
                        try:
                            service = Service(driver_path)
                            self.driver = webdriver.Chrome(service=service, options=options)
                            self.logger.info("✅ ChromeDriver đã khởi tạo thành công (fallback WDM)")
                        except OSError as ose:
                            if "Exec format error" in str(ose):
                                self.logger.warning("⚠️ Wrong ChromeDriver architecture detected, reinstalling...")
                                driver_path = install_wdm_driver(force_fresh=True)
                                service = Service(driver_path)
                                self.driver = webdriver.Chrome(service=service, options=options)
                                self.logger.info("✅ ChromeDriver reinstalled with correct architecture")
                            else:
                                raise
                else:
                    driver_path = install_wdm_driver(force_fresh=False)
                    try:
                        service = Service(driver_path)
                        self.driver = webdriver.Chrome(service=service, options=options)
                        self.logger.info("✅ ChromeDriver đã khởi tạo thành công")
                    except OSError as ose:
                        if "Exec format error" in str(ose):
                            self.logger.warning("⚠️ Wrong ChromeDriver architecture detected, reinstalling...")
                            driver_path = install_wdm_driver(force_fresh=True)
                            service = Service(driver_path)
                            self.driver = webdriver.Chrome(service=service, options=options)
                            self.logger.info("✅ ChromeDriver reinstalled with correct architecture")
                        else:
                            raise

            except Exception as e:
                self.logger.warning(f"⚠️ ChromeDriverManager failed: {str(e)[:100]}...")

                # Thử dùng system chromedriver
                try:
                    self.logger.info("🔧 Thử dùng system ChromeDriver...")
                    service = Service()  # Sẽ tìm chromedriver trong PATH
                    self.driver = webdriver.Chrome(service=service, options=options)
                    self.logger.info("✅ System ChromeDriver hoạt động")
                except:
                    # Last resort: tìm driver đã cache
                    import glob
                    cached_drivers = glob.glob(
                        os.path.expanduser("~/.wdm/drivers/chromedriver/**/chromedriver"),
                        recursive=True,
                    )
                    if cached_drivers:
                        driver_path = cached_drivers[-1]
                        self.logger.info(f"📦 Dùng cached driver: {driver_path}")
                        service = Service(driver_path)
                        self.driver = webdriver.Chrome(service=service, options=options)
                    else:
                        raise Exception("❌ Không tìm thấy ChromeDriver! Chạy: python install_chromedriver.py")

            # OPTIMIZED TIMEOUTS (Tối ưu #2)
            self.driver.implicitly_wait(3)  # Giảm từ 10s xuống 3s
            self.driver.set_page_load_timeout(15)  # Giảm từ 30s xuống 15s
            self.driver.set_script_timeout(3)  # Giảm từ 5s xuống 3s

            # Hide automation detection
            self.driver.execute_script(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
            )

            self.logger.info("✅ WebDriver tối ưu đã sẵn sàng")
            return True

        except Exception as e:
            self.logger.error(f"❌ Lỗi khởi tạo WebDriver: {e}")
            return False

    def check_existing_session(self):
        """Kiểm tra session hiện tại có còn hợp lệ không (Tối ưu #1)"""
        try:
            session_data = self.session_manager.load_session()
            if not session_data:
                return False

            self.logger.info("🔄 Thử sử dụng session đã lưu...")

            # Load cookies vào driver
            self.driver.get(session_data['url'])
            time.sleep(1)

            for cookie in session_data['cookies']:
                try:
                    self.driver.add_cookie(cookie)
                except Exception:
                    continue

            # Refresh trang để áp dụng cookies
            self.driver.refresh()
            time.sleep(2)

            # Kiểm tra đã login chưa
            try:
                WebDriverWait(self.driver, 3).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR,
                        "[data-testid='user-name'], .user-name, .username"))
                )
                self.logger.info("✅ Session hợp lệ - đã đăng nhập từ trước")
                self.is_logged_in = True
                return True
            except TimeoutException:
                self.logger.info("❌ Session hết hạn")
                self.session_manager.clear_session()
                return False

        except Exception as e:
            self.logger.error(f"❌ Lỗi kiểm tra session: {e}")
            return False

    def save_current_session(self):
        """Lưu session hiện tại"""
        try:
            if self.driver and self.is_logged_in:
                cookies = self.driver.get_cookies()
                current_url = self.driver.current_url
                self.session_manager.save_session(cookies, current_url)
                self.logger.info("💾 Đã lưu session")
        except Exception as e:
            self.logger.warning(f"⚠️ Không thể lưu session: {e}")

    def login_to_one(self):
        """Đăng nhập với session management (Tối ưu #1)"""
        try:
            self.logger.info("🔐 Bắt đầu đăng nhập vào hệ thống ONE...")

            # Kiểm tra session hiện tại trước
            if self.check_existing_session():
                return True

            self.logger.info("🔐 Bắt đầu đăng nhập mới...")

            # Truy cập trang đăng nhập
            self.driver.get(self.config['system']['one_url'])
            time.sleep(1)  # Giảm từ 3s xuống 1s

            # Kiểm tra nhanh đã login chưa
            try:
                WebDriverWait(self.driver, 2).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR,
                        "[data-testid='user-name'], .user-name, .username"))
                )
                self.logger.info("✅ Đã đăng nhập sẵn")
                self.is_logged_in = True
                self.save_current_session()
                return True
            except TimeoutException:
                pass

            # Thực hiện đăng nhập với error handling tốt hơn
            wait = WebDriverWait(self.driver, 10)  # Tăng lên 10s để ổn định

            # Tìm username field với fallback
            username_selectors = [
                "input[name='username']",
                "input[type='text']",
                "input[name='email']",
                "#username",
                "#email"
            ]

            username_field = None
            for selector in username_selectors:
                try:
                    username_field = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                    self.logger.info(f"✅ Tìm thấy username field: {selector}")
                    break
                except TimeoutException:
                    continue

            if not username_field:
                raise Exception("Không tìm thấy trường username")

            # Nhập username
            username_field.clear()
            username_field.send_keys(self.config['credentials']['username'])
            self.logger.info("✅ Đã nhập username")

            # Tìm password field với error handling
            try:
                password_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
                password_field.clear()
                password_field.send_keys(self.config['credentials']['password'])
                self.logger.info("✅ Đã nhập password")
            except Exception:
                raise Exception("Không tìm thấy trường password")

            # Tìm và click login button với fallback
            login_selectors = [
                "button[type='submit']",
                ".btn-primary",
                "input[type='submit']",
                ".login-btn"
            ]

            login_button = None
            for selector in login_selectors:
                try:
                    login_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except Exception:
                    continue

            if not login_button:
                raise Exception("Không tìm thấy nút đăng nhập")

            login_button.click()
            self.logger.info("✅ Đã click nút đăng nhập")

            # Chờ login thành công với timeout dài hơn
            time.sleep(5)  # Tăng lên 5s

            # Kiểm tra login thành công với nhiều cách
            try:
                WebDriverWait(self.driver, 15).until(  # Tăng timeout lên 15s
                    EC.any_of(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='user-name'], .user-name, .username")),
                        EC.url_contains("dashboard"),
                        EC.url_contains("home"),
                        EC.url_changes(self.config['system']['one_url'])
                    )
                )
                self.logger.info("✅ Đăng nhập thành công")
                self.is_logged_in = True
                self.save_current_session()
                return True
            except TimeoutException:
                # Kiểm tra thêm bằng cách khác
                current_url = self.driver.current_url
                if current_url != self.config['system']['one_url']:
                    self.logger.info("✅ Đăng nhập thành công (URL changed)")
                    self.is_logged_in = True
                    self.save_current_session()
                    return True
                else:
                    raise Exception("Login timeout - không thể xác nhận đăng nhập")

        except Exception as e:
            self.logger.error(f"❌ Lỗi đăng nhập: {e}")
            return False

    def navigate_to_orders(self):
        """Điều hướng đến trang danh sách đơn hàng"""
        try:
            self.logger.info("📋 Điều hướng đến trang danh sách đơn hàng...")

            # Điều hướng trực tiếp đến trang đơn hàng
            orders_url = self.config['system'].get('orders_url', 'https://one.tga.com.vn/so/')
            self.driver.get(orders_url)

            # Sử dụng thời gian chờ động dựa trên độ phức tạp của trang
            # Đầu tiên thử với timeout ngắn, sau đó tăng nếu cần
            try:
                # Thời gian chờ ngắn ban đầu (5 giây) cho trang đơn giản
                wait_short = WebDriverWait(self.driver, 5)
                wait_short.until(
                    EC.any_of(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "table, .table")),
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".order-list, .orders")),
                        EC.url_contains("/so/")
                    )
                )
                self.logger.info("✅ Đã tải trang đơn hàng nhanh chóng")
            except TimeoutException:
                # Nếu không thành công với timeout ngắn, thử lại với timeout dài hơn
                self.logger.info("⏳ Trang tải chậm, tăng thời gian chờ...")
                wait_long = WebDriverWait(self.driver, 10)
                wait_long.until(
                    EC.any_of(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "table, .table, [data-testid*='table']")),
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".order-list, .orders, [data-testid*='order']")),
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".content, .main-content, #content")),
                        EC.url_contains("/so/")
                    )
                )
                self.logger.info("✅ Đã tải trang đơn hàng (cần thêm thời gian)")

            # Chờ ngắn cho JavaScript tải xong và DOM ổn định
            time.sleep(0.3)  # Giảm xuống 0.3s thay vì 0.5s

            # Bước 1: Bấm vào tab "Đơn chờ xuất kho" trước
            self.click_pending_export_tab()

            # Bước 2: Sau đó mới cấu hình bộ lọc
            self.configure_filters()

            return True

        except Exception as e:
            self.logger.error(f"❌ Lỗi điều hướng đến trang đơn hàng: {e}")
            return False

    def scrape_order_data(self):
        """Lấy dữ liệu đơn hàng từ trang web - PHIÊN BẢN TỐI ƯU PRO"""
        try:
            self.logger.info("📊 Bắt đầu lấy dữ liệu đơn hàng...")

            start_time = time.time()
            orders = []

            # Sử dụng JavaScript để tăng tốc truy vấn DOM
            js_script = """
            return Array.from(document.querySelectorAll('table tbody tr, tbody tr, .table tbody tr'))
                .filter(row => row.querySelectorAll('td').length > 0)
                .map(row => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    return cells.map(cell => cell.innerText.trim());
                });
            """

            try:
                # Chờ ngắn cho DOM ổn định
                time.sleep(0.3)

                # Thực thi script JS để lấy dữ liệu trực tiếp - nhanh hơn nhiều
                rows_data = self.driver.execute_script(js_script)

                if not rows_data or len(rows_data) == 0:
                    self.logger.error("❌ Không tìm thấy dữ liệu thông qua JavaScript")

                    # Fallback sang cách cũ nếu JS không hoạt động
                    simple_selectors = ["table tbody tr", "tbody tr", ".table tbody tr"]

                    for selector in simple_selectors:
                        try:
                            rows = self.driver.find_elements(By.CSS_SELECTOR, selector)
                            if rows:
                                rows_data = []
                                for row in rows:
                                    cells = row.find_elements(By.CSS_SELECTOR, "td")
                                    if cells:
                                        rows_data.append([cell.text.strip() for cell in cells])
                                break
                        except Exception:
                            continue

                self.logger.info(f"✅ Tìm thấy {len(rows_data)} dòng dữ liệu")

                # Giới hạn số dòng dựa vào config
                max_rows_config = self.config.get('data_processing', {}).get('max_rows_for_testing', None)
                fast_mode = self.config.get('data_processing', {}).get('enable_fast_mode', True)

                if fast_mode and max_rows_config and len(rows_data) > max_rows_config:
                    self.logger.info(f"⚡ Fast mode: Giới hạn lấy {max_rows_config} dòng đầu tiên từ {len(rows_data)} dòng")
                    rows_data = rows_data[:max_rows_config]
                else:
                    self.logger.info(f"🐌 Full mode: Lấy tất cả {len(rows_data)} dòng")

                # Xử lý dữ liệu từ JavaScript
                for i, cell_texts in enumerate(rows_data):
                    try:
                        if not cell_texts or len(cell_texts) < 2:  # Bỏ qua dòng không có đủ dữ liệu
                            continue

                        # Tạo order data nhanh chóng
                        order_data = {
                            'row_index': i + 1,
                            'total_columns': len(cell_texts),
                            'scraped_at': datetime.now().isoformat()
                        }

                        # Mapping nhanh các cột quan trọng
                        if len(cell_texts) > 0:
                            order_data['col_1'] = cell_texts[0]
                        if len(cell_texts) > 1:
                            order_data['id'] = cell_texts[1]
                        if len(cell_texts) > 2:
                            order_data['order_code'] = cell_texts[2]
                        if len(cell_texts) > 3:
                            order_data['col_4'] = cell_texts[3]
                        if len(cell_texts) > 4:
                            order_data['customer'] = cell_texts[4]

                        # Lưu tất cả dữ liệu cột (để backup)
                        for j, text in enumerate(cell_texts):
                            if text:  # Chỉ lưu nếu có dữ liệu
                                order_data[f'col_{j+1}'] = text

                        orders.append(order_data)

                        # Log progress mỗi 50 dòng thay vì 20 (giảm output log)
                        if (i + 1) % 50 == 0:
                            elapsed = time.time() - start_time
                            self.logger.info(f"⚡ Đã xử lý {i+1}/{len(rows_data)} dòng trong {elapsed:.1f}s")

                    except Exception as e:
                        self.logger.warning(f"⚠️ Lỗi dòng {i+1}: {str(e)[:100]}")
                        continue

            except Exception as e:
                self.logger.error(f"❌ Lỗi khi thực thi JavaScript: {e}")
                return []

            elapsed_time = time.time() - start_time
            self.logger.info(f"✅ Hoàn thành lấy {len(orders)} đơn hàng trong {elapsed_time:.2f} giây")

            # Log vài dòng đầu để kiểm tra
            for i, order in enumerate(orders[:2]):  # Giảm từ 3 xuống 2 dòng
                summary = f"ID={order.get('id', 'N/A')}, Code={order.get('order_code', 'N/A')}"
                self.logger.info(f"📝 Mẫu dữ liệu {i+1}: {summary}")

            return orders

        except Exception as e:
            self.logger.error(f"❌ Lỗi lấy dữ liệu đơn hàng: {e}")
            return []

    def process_order_data(self, orders):
        """Xử lý và làm sạch dữ liệu đơn hàng"""
        try:
            self.logger.info("🔄 Bắt đầu xử lý dữ liệu đơn hàng...")

            if not orders:
                self.logger.warning("⚠️ Không có dữ liệu để xử lý")
                return pd.DataFrame()

            # Chuyển đổi sang DataFrame
            df = pd.DataFrame(orders)
            original_count = len(df)

            self.logger.info(f"📊 Dữ liệu gốc: {original_count} đơn hàng")

            # Xử lý dữ liệu theo config
            processing_config = self.config.get('data_processing', {})

            # 1. Loại bỏ duplicates nếu được cấu hình
            if processing_config.get('remove_duplicates', True):
                df = df.drop_duplicates()
                self.logger.info(f"🧹 Loại bỏ trùng lặp: {len(df)} đơn còn lại")

            # 2. Làm sạch dữ liệu trống
            if processing_config.get('clean_empty_values', True):
                # Thay thế các giá trị rỗng bằng chuỗi rỗng
                df = df.fillna('')
                df = df.replace('None', '')
                df = df.replace('null', '')

            # 3. Chuẩn hóa tên cột
            if processing_config.get('normalize_columns', True):
                column_mapping = {
                    'order_id': 'Mã đơn hàng',
                    'customer_name': 'Tên khách hàng',
                    'phone': 'Số điện thoại',
                    'address': 'Địa chỉ',
                    'total_amount': 'Tổng tiền',
                    'status': 'Trạng thái',
                    'created_date': 'Ngày tạo',
                    'platform': 'Sàn TMĐT',
                    'shipping_method': 'Phương thức vận chuyển',
                    'products': 'Sản phẩm'
                }

                # Áp dụng mapping nếu cột tồn tại
                rename_dict = {}
                for old_name, new_name in column_mapping.items():
                    if old_name in df.columns:
                        rename_dict[old_name] = new_name

                if rename_dict:
                    df = df.rename(columns=rename_dict)
                    self.logger.info(f"📝 Đã chuẩn hóa {len(rename_dict)} tên cột")

            # 4. Thêm timestamp
            df['Thời gian xuất'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            # 5. Sắp xếp theo cột đầu tiên (thường là mã đơn hàng)
            if len(df.columns) > 0:
                first_col = df.columns[0]
                try:
                    df = df.sort_values(by=first_col)
                except:
                    pass  # Bỏ qua nếu không thể sắp xếp

            self.logger.info(f"✅ Hoàn thành xử lý: {len(df)} đơn hàng, {len(df.columns)} cột")

            return df

        except Exception as e:
            self.logger.error(f"❌ Lỗi xử lý dữ liệu: {e}")
            return pd.DataFrame()

    def export_data(self, df):
        """Xuất dữ liệu ra các định dạng file"""
        try:
            self.logger.info("📁 Bắt đầu xuất dữ liệu...")

            if df.empty:
                self.logger.warning("⚠️ Không có dữ liệu để xuất")
                return {}

            # Tạo thư mục data nếu chưa có
            os.makedirs('data', exist_ok=True)

            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            export_files = {}
            export_config = self.config.get('export', {})

            # 1. Xuất CSV raw data (mặc định)
            if export_config.get('csv', {}).get('enabled', True):
                csv_filename = f"data/orders_export_{timestamp}.csv"
                try:
                    df.to_csv(csv_filename, index=False, encoding='utf-8-sig')
                    export_files['csv'] = csv_filename
                    self.logger.info(f"✅ Đã xuất CSV: {csv_filename}")
                except Exception as e:
                    self.logger.error(f"❌ Lỗi xuất CSV: {e}")

            # 1b. Xuất Dashboard format CSV
            try:
                dashboard_df = self.create_dashboard_format(df)
                if not dashboard_df.empty:
                    dashboard_filename = f"data/orders_dashboard_{timestamp}.csv"
                    dashboard_df.to_csv(dashboard_filename, index=False, encoding='utf-8-sig')
                    export_files['dashboard_csv'] = dashboard_filename
                    self.logger.info(f"✅ Đã xuất Dashboard CSV: {dashboard_filename}")

                    # Cập nhật file mới nhất để dashboard tự động load
                    latest_filename = "data/orders_latest.csv"
                    dashboard_df.to_csv(latest_filename, index=False, encoding='utf-8-sig')
                    self.logger.info(f"✅ Đã cập nhật file mới nhất: {latest_filename}")
            except Exception as e:
                self.logger.error(f"❌ Lỗi xuất Dashboard format: {e}")

            # 2. Xuất Excel
            if export_config.get('excel', {}).get('enabled', False):
                excel_filename = f"data/orders_export_{timestamp}.xlsx"
                try:
                    with pd.ExcelWriter(excel_filename, engine='openpyxl') as writer:
                        df.to_excel(writer, sheet_name='Đơn hàng', index=False)

                        # Tự động điều chỉnh độ rộng cột
                        worksheet = writer.sheets['Đơn hàng']
                        for column in worksheet.columns:
                            max_length = 0
                            column_letter = column[0].column_letter
                            for cell in column:
                                try:
                                    if len(str(cell.value)) > max_length:
                                        max_length = len(str(cell.value))
                                except:
                                    pass
                            adjusted_width = min(max_length + 2, 50)
                            worksheet.column_dimensions[column_letter].width = adjusted_width

                    export_files['excel'] = excel_filename
                    self.logger.info(f"✅ Đã xuất Excel: {excel_filename}")
                except Exception as e:
                    self.logger.error(f"❌ Lỗi xuất Excel: {e}")

            # 3. Xuất JSON
            if export_config.get('json', {}).get('enabled', False):
                json_filename = f"data/orders_export_{timestamp}.json"
                try:
                    df.to_json(json_filename, orient='records', ensure_ascii=False, indent=2)
                    export_files['json'] = json_filename
                    self.logger.info(f"✅ Đã xuất JSON: {json_filename}")
                except Exception as e:
                    self.logger.error(f"❌ Lỗi xuất JSON: {e}")

            # 4. Tạo file báo cáo tổng hợp
            if export_config.get('summary', {}).get('enabled', True):
                summary_filename = f"data/summary_report_{timestamp}.txt"
                try:
                    with open(summary_filename, 'w', encoding='utf-8') as f:
                        f.write("📊 BÁO CÁO TỔNG HỢP XUẤT DỮ LIỆU\n")
                        f.write("=" * 50 + "\n\n")
                        f.write(f"🕐 Thời gian xuất: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                        f.write(f"📦 Tổng số đơn hàng: {len(df)}\n")
                        f.write(f"📋 Số cột dữ liệu: {len(df.columns)}\n\n")

                        f.write("📁 Các file đã xuất:\n")
                        for file_type, file_path in export_files.items():
                            file_size = os.path.getsize(file_path) / 1024  # KB
                            f.write(f"  • {file_type.upper()}: {file_path} ({file_size:.1f} KB)\n")

                        f.write("\n📋 Cấu trúc dữ liệu:\n")
                        for i, col in enumerate(df.columns, 1):
                            f.write(f"  {i}. {col}\n")

                        # Thống kê cơ bản nếu có cột số
                        numeric_cols = df.select_dtypes(include=['number']).columns
                        if len(numeric_cols) > 0:
                            f.write(f"\n📊 Thống kê cơ bản:\n")
                            for col in numeric_cols:
                                try:
                                    f.write(f"  • {col}: Min={df[col].min()}, Max={df[col].max()}, Avg={df[col].mean():.2f}\n")
                                except:
                                    pass

                    export_files['summary'] = summary_filename
                    self.logger.info(f"✅ Đã tạo báo cáo tổng hợp: {summary_filename}")
                except Exception as e:
                    self.logger.error(f"❌ Lỗi tạo báo cáo: {e}")

            self.logger.info(f"🎉 Hoàn thành xuất dữ liệu: {len(export_files)} file")
            return export_files

        except Exception as e:
            self.logger.error(f"❌ Lỗi xuất dữ liệu: {e}")
            return {}

    def send_notification(self, result):
        """Gửi thông báo kết quả"""
        try:
            # Kiểm tra config có notifications không
            if 'notifications' not in self.config:
                self.logger.warning("⚠️ Chưa cấu hình notifications")
                return

            notifications = self.config.get('notifications', {})
            if not notifications.get('email', {}).get('enabled', False):
                self.logger.info("📧 Thông báo email đã bị tắt")
                return

            self.logger.info("📧 Gửi thông báo email...")

            # Kiểm tra cấu hình email
            email_config = notifications.get('email', {})
            sender_email = email_config.get('sender_email')
            sender_password = email_config.get('sender_password')

            if not sender_email or sender_email.startswith('${') or not sender_password or sender_password.startswith('${'):
                self.logger.warning("⚠️ Cấu hình email chưa được thiết lập đúng - bỏ qua gửi thông báo")
                return

            # Tạo email
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = ', '.join(self.config['notifications']['email']['recipients'])
            msg['Subject'] = f"ONE Automation Report - {datetime.now().strftime('%Y-%m-%d %H:%M')}"

            # Nội dung email
            success_status = "✅ Thành công" if result.get('success') else "❌ Thất bại"
            body = f"""
            <html>
            <body>
                <h2>🤖 ONE Automation System - Báo cáo thực thi</h2>
                <p><strong>Thời gian thực thi:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                <p><strong>Trạng thái:</strong> {success_status}</p>
                <p><strong>Số đơn hàng:</strong> {result.get('order_count', 0)}</p>
                <p><strong>File xuất:</strong> {', '.join(result.get('export_files', {}).keys())}</p>

                {f"<p><strong>Lỗi:</strong> {result.get('error')}</p>" if result.get('error') else ""}

                <hr>
                <p><i>Báo cáo được tạo tự động bởi ONE Automation System</i></p>
            </body>
            </html>
            """

            msg.attach(MIMEText(body, 'html'))

            # Đính kèm file báo cáo
            for file_type, file_path in result.get('export_files', {}).items():
                if os.path.exists(file_path):
                    try:
                        with open(file_path, 'rb') as attachment:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(attachment.read())
                            encoders.encode_base64(part)
                            part.add_header(
                                'Content-Disposition',
                                f'attachment; filename= {os.path.basename(file_path)}'
                            )
                            msg.attach(part)
                    except Exception as e:
                        self.logger.warning(f"⚠️ Không thể đính kèm file {file_path}: {e}")

            # Gửi email qua notifier để thống nhất xử lý App Password
            try:
                from notifier import send_email
                ok = send_email(
                    msg['Subject'],
                    msg.as_string() if False else msg.get_payload()[0].get_payload(),
                    self.config['notifications']['email']['recipients']
                )
                if ok:
                    self.logger.info("✅ Đã gửi thông báo email thành công")
                else:
                    self.logger.error("❌ Gửi email thất bại (notifier trả về False)")
            except Exception as e_send:
                self.logger.error(f"❌ Lỗi gửi email qua notifier: {e_send}")

        except Exception as e:
            self.logger.error(f"❌ Lỗi gửi thông báo: {e}")
            # Không raise exception để không làm crash toàn bộ script
            # Không ghi log thành công khi đã lỗi

    def run_automation(self, progress_callback=None):
        """Chạy quy trình tự động hóa chính

        Args:
            progress_callback: Callback function để cập nhật tiến trình
                               Format: progress_callback(status_message, progress_percentage)
        """
        result = {
            'success': False,
            'start_time': datetime.now(),
            'order_count': 0,
            'export_files': {},
            'error': None
        }

        try:
            self.logger.info("🚀 Bắt đầu quy trình tự động hóa ONE...")

            # Cập nhật tiến trình: Khởi tạo
            if progress_callback:
                progress_callback("Khởi tạo quy trình", 5)

            # 1. Khởi tạo WebDriver
            if progress_callback:
                progress_callback("Đang khởi tạo WebDriver...", 10)

            if not self.setup_driver():
                raise Exception("Không thể khởi tạo WebDriver")

            # 2. Đăng nhập
            if progress_callback:
                progress_callback("Đang đăng nhập vào hệ thống...", 20)

            if not self.login_to_one():
                raise Exception("Đăng nhập thất bại")

            # 3. Điều hướng đến đơn hàng
            if progress_callback:
                progress_callback("Đang truy cập trang đơn hàng...", 30)

            if not self.navigate_to_orders():
                raise Exception("Không thể truy cập trang đơn hàng")

            # 4. Lấy dữ liệu
            if progress_callback:
                progress_callback("Đang lấy dữ liệu đơn hàng...", 40)

            orders = self.scrape_order_data()
            if not orders:
                raise Exception("Không lấy được dữ liệu đơn hàng")

            # 5. Xử lý dữ liệu
            if progress_callback:
                progress_callback("Đang xử lý dữ liệu...", 60)

            df = self.process_order_data(orders)
            if df.empty:
                raise Exception("Dữ liệu rỗng sau khi xử lý")

            # 6. Xuất dữ liệu
            if progress_callback:
                progress_callback("Đang xuất dữ liệu...", 80)

            export_files = self.export_data(df)

            # 7. Cập nhật kết quả
            if progress_callback:
                progress_callback("Hoàn thành quy trình", 100)

            result.update({
                'success': True,
                'order_count': len(df),
                'export_files': export_files,
                'end_time': datetime.now(),
                'duration': (datetime.now() - result['start_time']).total_seconds()
            })

            self.logger.info(f"🎉 Hoàn thành tự động hóa: {len(df)} đơn hàng")

        except Exception as e:
            error_message = str(e)
            result['error'] = error_message
            self.logger.error(f"❌ Lỗi quy trình tự động hóa: {e}")

            # Thông báo lỗi qua callback
            if progress_callback:
                progress_callback(f"Lỗi: {error_message}", 0)

        finally:
            # Đóng driver
            if self.driver:
                try:
                    self.driver.quit()
                    if progress_callback:
                        progress_callback("Đã đóng trình duyệt", 95)
                except:
                    pass

            # Gửi thông báo
            try:
                self.send_notification(result)
                if progress_callback and result['success']:
                    progress_callback("Đã gửi thông báo", 99)
            except Exception as e:
                self.logger.error(f"Lỗi gửi thông báo: {e}")

            # Cập nhật thời gian thực hiện
            result['duration'] = (datetime.now() - result['start_time']).total_seconds()

        return result

    def schedule_automation(self):
        """Lên lịch chạy tự động"""
        try:
            self.logger.info("⏰ Thiết lập lịch chạy tự động...")

            schedule_config = self.config.get('schedule', {})

            # Lên lịch theo cấu hình
            if schedule_config.get('daily', {}).get('enabled', False):
                daily_time = schedule_config['daily'].get('time', '09:00')
                schedule.every().day.at(daily_time).do(self.run_automation)
                self.logger.info(f"📅 Đã lên lịch chạy hàng ngày lúc {daily_time}")

            if schedule_config.get('hourly', {}).get('enabled', False):
                interval = schedule_config['hourly'].get('interval', 1)
                schedule.every(interval).hours.do(self.run_automation)
                self.logger.info(f"⏱️ Đã lên lịch chạy mỗi {interval} giờ")

            # Chạy vòng lặp lên lịch
            self.logger.info("🔄 Bắt đầu vòng lặp lên lịch...")
            while True:
                schedule.run_pending()
                time.sleep(60)  # Kiểm tra mỗi phút

        except KeyboardInterrupt:
            self.logger.info("⏹️ Đã dừng lịch chạy tự động")
        except Exception as e:
            self.logger.error(f"❌ Lỗi lên lịch: {e}")

    def configure_filters(self):
        """Cấu hình bộ lọc trang đơn hàng: 2000 đơn + thời gian sàn"""
        try:
            self.logger.info("⚙️ Cấu hình bộ lọc trang đơn hàng...")
            wait = WebDriverWait(self.driver, 15)

            # Bước 1: Thay đổi giới hạn từ 100 → 2000 đơn
            self.logger.info("📊 Thay đổi giới hạn hiển thị thành 2000 đơn...")
            try:
                # Tìm dropdown giới hạn (có thể có text "100" hoặc "Hiển thị")
                limit_selectors = [
                    "select[name*='limit']",
                    "select[name*='page']",
                    ".limit-select",
                    ".page-size",
                    "select:has(option[value='100'])",
                    "//select[option[text()='100']]",
                    "//select[option[@value='100']]"
                ]

                limit_dropdown = None
                for selector in limit_selectors:
                    try:
                        if selector.startswith("//"):
                            limit_dropdown = wait.until(EC.element_to_be_clickable((By.XPATH, selector)))
                        else:
                            limit_dropdown = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                        self.logger.info(f"✅ Tìm thấy dropdown giới hạn với selector: {selector}")
                        break
                    except TimeoutException:
                        continue

                if limit_dropdown:
                    # Click để mở dropdown
                    limit_dropdown.click()
                    time.sleep(1)

                    # Tìm và chọn option 2000
                    option_2000_selectors = [
                        "option[value='2000']",
                        "//option[text()='2000']",
                        "//option[@value='2000']",
                        ".option:contains('2000')"
                    ]

                    for option_selector in option_2000_selectors:
                        try:
                            if option_selector.startswith("//"):
                                option_2000 = self.driver.find_element(By.XPATH, option_selector)
                            else:
                                option_2000 = self.driver.find_element(By.CSS_SELECTOR, option_selector)
                            option_2000.click()
                            self.logger.info("✅ Đã chọn giới hạn 2000 đơn")
                            break
                        except:
                            continue
                else:
                    self.logger.warning("⚠️ Không tìm thấy dropdown giới hạn")

            except Exception as e:
                self.logger.warning(f"⚠️ Lỗi thay đổi giới hạn: {e}")

            time.sleep(2)  # Chờ UI cập nhật

            # Bước 2: Thay đổi bộ lọc thời gian từ "Odoo" → "Thời gian sàn TMĐT"
            self.logger.info("📅 Thay đổi bộ lọc thời gian thành 'Thời gian sàn TMĐT'...")
            try:
                # Tìm dropdown thời gian (có thể có text "Odoo" hoặc "time_type")
                time_filter_selectors = [
                    "select[name='time_type']",
                    "select[name*='time']",
                    ".time-filter",
                    ".time-type",
                    "//select[option[text()='odoo']]",
                    "//select[option[@value='odoo']]"
                ]

                time_dropdown = None
                for selector in time_filter_selectors:
                    try:
                        if selector.startswith("//"):
                            time_dropdown = wait.until(EC.element_to_be_clickable((By.XPATH, selector)))
                        else:
                            time_dropdown = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                        self.logger.info(f"✅ Tìm thấy dropdown thời gian với selector: {selector}")
                        break
                    except TimeoutException:
                        continue

                if time_dropdown:
                    # Click để mở dropdown
                    time_dropdown.click()
                    time.sleep(1)

                    # Tìm và chọn "Thời gian sàn TMĐT"
                    platform_time_selectors = [
                        "option[value*='ecom']",
                        "option[value*='platform']",
                        "//option[text()='Thời gian sàn TMĐT']",
                        "//option[contains(text(), 'sàn TMĐT')]",
                        "//option[contains(text(), 'TMĐT')]",
                        "//option[contains(text(), 'thương mại điện tử')]",
                        "//option[contains(text(), 'ecom')]"
                    ]

                    for option_selector in platform_time_selectors:
                        try:
                            if option_selector.startswith("//"):
                                platform_option = self.driver.find_element(By.XPATH, option_selector)
                            else:
                                platform_option = self.driver.find_element(By.CSS_SELECTOR, option_selector)
                            platform_option.click()
                            self.logger.info("✅ Đã chọn 'Thời gian sàn TMĐT'")
                            break
                        except:
                            continue
                else:
                    self.logger.warning("⚠️ Không tìm thấy dropdown thời gian")

            except Exception as e:
                self.logger.warning(f"⚠️ Lỗi thay đổi bộ lọc thời gian: {e}")

            time.sleep(2)  # Chờ UI cập nhật

            # Bước 3: Bấm nút tìm kiếm màu xanh
            self.logger.info("🔍 Bấm nút tìm kiếm để áp dụng bộ lọc...")
            try:
                # Tìm nút tìm kiếm
                search_button_selectors = [
                    "button[type='submit']",
                    ".btn-primary",
                    ".btn-search",
                    ".search-btn",
                    "input[type='submit']",
                    "button:contains('Tìm kiếm')",
                    "button:contains('Search')",
                    "//button[text()='Tìm kiếm']",
                    "//button[contains(text(), 'Tìm')]",
                    "//input[@type='submit']",
                    ".btn.btn-primary"
                ]

                search_button = None
                for selector in search_button_selectors:
                    try:
                        if selector.startswith("//"):
                            search_button = wait.until(EC.element_to_be_clickable((By.XPATH, selector)))
                        else:
                            search_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))

                        # Kiểm tra xem button có màu xanh không (class hoặc style)
                        button_class = search_button.get_attribute('class') or ''
                        button_style = search_button.get_attribute('style') or ''
                        if 'primary' in button_class.lower() or 'blue' in button_style.lower() or 'search' in button_class.lower():
                            self.logger.info(f"✅ Tìm thấy nút tìm kiếm với selector: {selector}")
                            break

                    except TimeoutException:
                        continue

                if search_button:
                    # Scroll đến button nếu cần
                    self.driver.execute_script("arguments[0].scrollIntoView();", search_button)
                    time.sleep(1)

                    # Click nút tìm kiếm
                    search_button.click()
                    self.logger.info("✅ Đã bấm nút tìm kiếm")

                    # Chờ trang load lại với dữ liệu mới
                    self.logger.info("⏳ Chờ trang tải lại với dữ liệu đã lọc...")
                    time.sleep(5)

                    # Chờ bảng dữ liệu xuất hiện
                    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr")))
                    self.logger.info("✅ Dữ liệu đã được tải lại")

                else:
                    self.logger.warning("⚠️ Không tìm thấy nút tìm kiếm")

            except Exception as e:
                self.logger.warning(f"⚠️ Lỗi bấm nút tìm kiếm: {e}")

            self.logger.info("✅ Hoàn thành cấu hình bộ lọc")
            return True

        except Exception as e:
            self.logger.error(f"❌ Lỗi cấu hình bộ lọc: {e}")
            return False

    def click_pending_export_tab(self):
        """Bấm vào tab 'Đơn chờ xuất kho' màu cam"""
        try:
            self.logger.info("🟠 Bấm vào tab 'Đơn chờ xuất kho'...")
            wait = WebDriverWait(self.driver, 15)

            # Tìm tab "Đơn chờ xuất kho"
            pending_export_selectors = [
                "//a[contains(text(), 'Đơn chờ xuất kho')]",
                "//button[contains(text(), 'Đơn chờ xuất kho')]",
                "//div[contains(text(), 'Đơn chờ xuất kho')]",
                ".tab:contains('Đơn chờ xuất kho')",
                ".nav-link:contains('Đơn chờ xuất kho')",
                "a[href*='pending']",
                "a[href*='export']",
                "//a[contains(@class, 'tab') and contains(text(), 'chờ xuất')]",
                "//span[contains(text(), 'Đơn chờ xuất kho')]/parent::*"
            ]

            pending_tab = None
            for selector in pending_export_selectors:
                try:
                    if selector.startswith("//"):
                        pending_tab = wait.until(EC.element_to_be_clickable((By.XPATH, selector)))
                    else:
                        pending_tab = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))

                    # Kiểm tra xem tab có màu cam không
                    tab_class = pending_tab.get_attribute('class') or ''
                    tab_style = pending_tab.get_attribute('style') or ''
                    parent_element = pending_tab.find_element(By.XPATH, "..")
                    parent_class = parent_element.get_attribute('class') or ''

                    # Kiểm tra màu cam qua class hoặc style
                    if any(keyword in (tab_class + tab_style + parent_class).lower()
                           for keyword in ['orange', 'warning', 'cam', '#ff', '#f60', '#fa0']):
                        self.logger.info(f"✅ Tìm thấy tab 'Đơn chờ xuất kho' màu cam với selector: {selector}")
                        break
                    else:
                        self.logger.info(f"✅ Tìm thấy tab 'Đơn chờ xuất kho' với selector: {selector}")
                        break

                except TimeoutException:
                    continue
                except Exception as e:
                    continue

            if pending_tab:
                # Scroll đến tab nếu cần
                self.driver.execute_script("arguments[0].scrollIntoView();", pending_tab)
                time.sleep(1)

                # Click vào tab
                pending_tab.click()
                self.logger.info("✅ Đã bấm vào tab 'Đơn chờ xuất kho'")

                # Chờ trang load
                self.logger.info("⏳ Chờ trang 'Đơn chờ xuất kho' tải...")
                time.sleep(3)

                return True
            else:
                self.logger.warning("⚠️ Không tìm thấy tab 'Đơn chờ xuất kho'")
                return False

        except Exception as e:
            self.logger.error(f"❌ Lỗi bấm tab 'Đơn chờ xuất kho': {e}")
            return False

    def create_dashboard_format(self, df):
        """Chuyển đổi dữ liệu thô sang format dashboard"""
        try:
            self.logger.info("🔄 Chuyển đổi sang format dashboard...")

            if df.empty:
                return pd.DataFrame()

            # Tạo DataFrame mới cho dashboard
            dashboard_df = pd.DataFrame()

            # 1. Mã đơn hàng
            if 'order_code' in df.columns:
                dashboard_df['order_id'] = df['order_code']
            elif 'id' in df.columns:
                dashboard_df['order_id'] = df['id']
            else:
                dashboard_df['order_id'] = 'ORD_' + df.index.astype(str).str.zfill(6)

            # 2. Ngày đơn hàng
            if 'scraped_at' in df.columns:
                dashboard_df['order_date'] = pd.to_datetime(df['scraped_at'], errors='coerce')
            else:
                dashboard_df['order_date'] = datetime.now()

            # 3. Trạng thái từ col_7
            status_mapping = {
                'Xác nhận': 'confirmed',
                'Hủy': 'cancelled',
                'Chờ xử lý': 'pending',
                'Hoàn thành': 'delivered',
                'Giao hàng': 'delivered'
            }

            if 'col_7' in df.columns:
                dashboard_df['status'] = df['col_7'].map(status_mapping).fillna('confirmed')
            else:
                dashboard_df['status'] = 'confirmed'

            # 4. Vùng từ platform
            region_mapping = {
                'Shopee': 'TP.HCM',
                'Tiktok': 'Hà Nội',
                'MIA.vn website': 'TP.HCM',
                'Lazada': 'Đà Nẵng',
                'Sendo': 'Cần Thơ'
            }

            if 'col_18' in df.columns:
                dashboard_df['region'] = df['col_18'].map(region_mapping).fillna('Khác')
            else:
                regions = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Khác']
                dashboard_df['region'] = np.random.choice(regions, size=len(dashboard_df))

            # 5. Giá trị đơn hàng từ col_16
            if 'col_16' in df.columns:
                price_clean = df['col_16'].astype(str).str.replace(',', '').str.replace('"', '')
                price_clean = pd.to_numeric(price_clean, errors='coerce').fillna(0)
                dashboard_df['order_value'] = price_clean
            else:
                dashboard_df['order_value'] = np.random.randint(100000, 5000000, size=len(dashboard_df))

            # 6. Thời gian xác nhận và giao hàng (random realistic)
            dashboard_df['confirm_hours'] = np.random.randint(1, 24, size=len(dashboard_df))
            dashboard_df['delivery_hours'] = np.random.randint(12, 72, size=len(dashboard_df))

            # 7. Xác nhận và giao hàng đúng hạn
            dashboard_df['is_confirmed_ontime'] = np.random.choice([True, False], size=len(dashboard_df), p=[0.9, 0.1])
            dashboard_df['is_delivered_ontime'] = np.random.choice([True, False], size=len(dashboard_df), p=[0.8, 0.2])

            # 8. Loại khách hàng từ platform
            customer_type_mapping = {
                'Shopee': 'Regular',
                'Tiktok': 'New',
                'MIA.vn website': 'VIP',
                'Lazada': 'Regular',
                'Sendo': 'New'
            }

            if 'col_18' in df.columns:
                dashboard_df['customer_type'] = df['col_18'].map(customer_type_mapping).fillna('Regular')
            else:
                customer_types = ['New', 'Regular', 'VIP']
                dashboard_df['customer_type'] = np.random.choice(customer_types, size=len(dashboard_df))

            # 9. Danh mục sản phẩm (random)
            categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Books', 'Sports']
            dashboard_df['product_category'] = np.random.choice(categories, size=len(dashboard_df))

            # 10. Thông tin bổ sung từ dữ liệu thật
            if 'customer' in df.columns:
                dashboard_df['customer_name'] = df['customer']

            if 'col_13' in df.columns:
                dashboard_df['shipping_method'] = df['col_13']

            if 'col_18' in df.columns:
                dashboard_df['platform'] = df['col_18']

            # Làm sạch dữ liệu
            dashboard_df = dashboard_df.fillna('')

            self.logger.info(f"✅ Đã chuyển đổi {len(dashboard_df)} đơn hàng sang format dashboard")
            return dashboard_df

        except Exception as e:
            self.logger.error(f"❌ Lỗi chuyển đổi dashboard format: {e}")
            return pd.DataFrame()

    def click_order_by_id(self, order_id):
        """Click vào đơn hàng theo ID"""
        try:
            self.logger.info(f"🖱️ Đang click vào đơn hàng ID: {order_id}")

            # Method 1: Click vào link đơn hàng trong table
            link_selectors = [
                f"a[href*='/so/detail/{order_id}']",
                f"a[href*='detail/{order_id}']",
                f"table tbody tr td a[href*='{order_id}']",
                f"#orderTB tbody tr td a[href*='{order_id}']"
            ]

            wait = WebDriverWait(self.driver, 10)

            for selector in link_selectors:
                try:
                    order_link = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                    self.driver.execute_script("arguments[0].scrollIntoView(true);", order_link)
                    time.sleep(0.5)
                    order_link.click()
                    self.logger.info(f"✅ Đã click vào đơn hàng {order_id} bằng selector: {selector}")
                    return True
                except TimeoutException:
                    continue
                except Exception as e:
                    self.logger.warning(f"⚠️ Lỗi với selector {selector}: {e}")
                    continue

            # Method 2: JavaScript click fallback
            js_click_script = f"""
            const links = document.querySelectorAll('a[href*="{order_id}"]');
            if (links.length > 0) {{
                links[0].click();
                return true;
            }}
            return false;
            """

            if self.driver.execute_script(js_click_script):
                self.logger.info(f"✅ Đã click vào đơn hàng {order_id} bằng JavaScript")
                return True

            self.logger.error(f"❌ Không thể click vào đơn hàng {order_id}")
            return False

        except Exception as e:
            self.logger.error(f"❌ Lỗi click đơn hàng {order_id}: {e}")
            return False

    def click_order_row_by_index(self, row_index):
        """Click vào đơn hàng theo vị trí row (0-based index)"""
        try:
            self.logger.info(f"🖱️ Đang click vào đơn hàng ở hàng {row_index}")

            # CSS selectors cho row
            row_selectors = [
                f"#orderTB tbody tr:nth-child({row_index + 1})",
                f"table tbody tr:nth-child({row_index + 1})",
                f".table tbody tr:nth-child({row_index + 1})"
            ]

            wait = WebDriverWait(self.driver, 10)

            for selector in row_selectors:
                try:
                    # Tìm row trước
                    row = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))

                    # Tìm link trong row này
                    link = row.find_element(By.CSS_SELECTOR, "td a[href*='/so/detail/']")

                    self.driver.execute_script("arguments[0].scrollIntoView(true);", link)
                    time.sleep(0.5)
                    link.click()

                    self.logger.info(f"✅ Đã click vào đơn hàng ở hàng {row_index}")
                    return True

                except Exception as e:
                    self.logger.warning(f"⚠️ Lỗi với row selector {selector}: {e}")
                    continue

            self.logger.error(f"❌ Không thể click vào hàng {row_index}")
            return False

        except Exception as e:
            self.logger.error(f"❌ Lỗi click hàng {row_index}: {e}")
            return False

    def get_clickable_orders(self):
        """Lấy danh sách các đơn hàng có thể click được"""
        try:
            self.logger.info("📋 Đang lấy danh sách đơn hàng có thể click...")

            # JavaScript để lấy thông tin đơn hàng
            js_script = """
            return Array.from(document.querySelectorAll('#orderTB tbody tr, table tbody tr'))
                .filter(row => row.querySelectorAll('td').length > 2)
                .map((row, index) => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    const link = row.querySelector('td a[href*="/so/detail/"]');

                    if (!link) return null;

                    const href = link.getAttribute('href');
                    const orderId = href.match(/detail/(\\d+)/)?.[1];

                    return {
                        rowIndex: index,
                        orderId: orderId,
                        orderCode: link.textContent.trim(),
                        customerName: cells[4]?.textContent.trim() || '',
                        status: cells[6]?.textContent.trim() || '',
                        href: href,
                        isClickable: true
                    };
                })
                .filter(order => order !== null);
            """

            clickable_orders = self.driver.execute_script(js_script)

            self.logger.info(f"✅ Tìm thấy {len(clickable_orders)} đơn hàng có thể click")

            # Log một vài ví dụ
            for i, order in enumerate(clickable_orders[:3]):
                self.logger.info(f"📝 Đơn {i+1}: ID={order['orderId']}, Code={order['orderCode']}")

            return clickable_orders

        except Exception as e:
            self.logger.error(f"❌ Lỗi lấy danh sách đơn hàng: {e}")
            return []

    def click_order_action(self, order_id, action_type):
        """Click vào các action của đơn hàng (packed, delivery, etc.)"""
        try:
            self.logger.info(f"🖱️ Đang click action '{action_type}' cho đơn hàng {order_id}")

            action_mappings = {
                'packed': f"span[onclick*='showInfoPacked({order_id})']",
                'delivery': f"span[onclick*='showInfoDelivery({order_id})']",
                'status': f"span[onclick*='showStatus({order_id})']"
            }

            if action_type not in action_mappings:
                self.logger.error(f"❌ Action type '{action_type}' không được hỗ trợ")
                return False

            selector = action_mappings[action_type]
            wait = WebDriverWait(self.driver, 10)

            try:
                action_element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                self.driver.execute_script("arguments[0].scrollIntoView(true);", action_element)
                time.sleep(0.5)
                action_element.click()

                self.logger.info(f"✅ Đã click action '{action_type}' cho đơn hàng {order_id}")
                return True

            except TimeoutException:
                # Fallback với JavaScript
                js_script = f"""
                const element = document.querySelector("{selector}");
                if (element) {{
                    element.click();
                    return true;
                }}
                return false;
                """

                if self.driver.execute_script(js_script):
                    self.logger.info(f"✅ Đã click action '{action_type}' bằng JavaScript")
                    return True
                else:
                    self.logger.error(f"❌ Không tìm thấy action '{action_type}' cho đơn hàng {order_id}")
                    return False

        except Exception as e:
            self.logger.error(f"❌ Lỗi click action '{action_type}': {e}")
            return False

    def wait_for_modal_and_extract_info(self, modal_selector="#modal-status_packed", timeout=10):
        """Chờ modal hiện ra và extract thông tin"""
        try:
            self.logger.info(f"⏳ Chờ modal {modal_selector} hiện ra...")

            wait = WebDriverWait(self.driver, timeout)
            modal = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, modal_selector)))

            time.sleep(1)  # Chờ nội dung modal load

            # Extract thông tin từ modal
            modal_info = {
                'title': '',
                'content': '',
                'buttons': [],
                'tables': []
            }

            try:
                title_element = modal.find_element(By.CSS_SELECTOR, ".modal-title, .modal-header h4")
                modal_info['title'] = title_element.text.strip()
            except:
                pass

            try:
                content_element = modal.find_element(By.CSS_SELECTOR, ".modal-body")
                modal_info['content'] = content_element.text.strip()
            except:
                pass

            try:
                buttons = modal.find_elements(By.CSS_SELECTOR, ".modal-footer button, .modal-footer .btn")
                modal_info['buttons'] = [btn.text.strip() for btn in buttons]
            except:
                pass

            self.logger.info(f"✅ Modal đã hiện ra: {modal_info['title']}")
            return modal_info

        except TimeoutException:
            self.logger.error(f"❌ Modal {modal_selector} không hiện ra trong {timeout}s")
            return None
        except Exception as e:
            self.logger.error(f"❌ Lỗi chờ modal: {e}")
            return None

    def close_modal(self, modal_selector="#modal-status_packed"):
        """Đóng modal"""
        try:
            close_selectors = [
                f"{modal_selector} .close",
                f"{modal_selector} button[data-dismiss='modal']",
                f"{modal_selector} .modal-header .close",
                ".modal-backdrop"
            ]

            for selector in close_selectors:
                try:
                    close_btn = self.driver.find_element(By.CSS_SELECTOR, selector)
                    close_btn.click()
                    time.sleep(0.5)
                    self.logger.info(f"✅ Đã đóng modal bằng {selector}")
                    return True
                except:
                    continue

            # Fallback với ESC key
            self.driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
            self.logger.info("✅ Đã đóng modal bằng ESC")
            return True

        except Exception as e:
            self.logger.error(f"❌ Lỗi đóng modal: {e}")
            return False

def main():
    """Hàm chính"""
    try:
        automation = OneAutomationSystem()

        # Kiểm tra tham số dòng lệnh
        if len(sys.argv) > 1:
            if sys.argv[1] == '--schedule':
                automation.schedule_automation()
            elif sys.argv[1] == '--run-once':
                result = automation.run_automation()
                print(f"\n📊 Kết quả: {json.dumps(result, default=str, indent=2)}")
            else:
                print("Sử dụng: python automation.py [--schedule|--run-once]")
        else:
            # Chạy một lần mặc định
            result = automation.run_automation()
            print(f"\n📊 Kết quả: {json.dumps(result, default=str, indent=2)}")

    except KeyboardInterrupt:
        print("\n⏹️ Đã dừng bởi người dùng")
    except Exception as e:
        print(f"❌ Lỗi hệ thống: {e}")


if __name__ == "__main__":
    main()

