#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enhanced Warehouse Automation System v2.1
Hệ thống tự động hóa warehouse với tính năng SLA monitoring và product details
"""

import argparse
import json
import logging
import os
import re
import sys
import time
from datetime import datetime

import pandas as pd
import requests
from dotenv import load_dotenv
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

# Import base automation
from automation import OneAutomationSystem, SessionManager


class EnhancedOneAutomationSystem(OneAutomationSystem):
    """Enhanced automation system with product details extraction"""

    def __init__(self, config_path="config/config.json"):
        """Khởi tạo Enhanced automation với Google Sheets config integration"""
        # Setup basic logging first
        self.setup_basic_logging()

        # Load config (now logger is available)
        self.load_config_with_sheets(config_path)

        # Setup full logging with config
        self.setup_logging()

        # Initialize other components
        self.driver = None
        self.session_data = {}
        self.session_manager = SessionManager()
        self.is_logged_in = False
        self.sla_monitor = self.setup_sla_monitor()
        self.sheets_config_service = self.setup_sheets_config()

    def setup_basic_logging(self):
        """Setup basic logging for initialization"""
        import logging
        self.logger = logging.getLogger('EnhancedAutomation')
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)

    def setup_sheets_config(self):
        """Setup Google Sheets configuration service"""
        # Check if Google Sheets is enabled in config
        if not self.config.get('google_sheets', {}).get('enabled', False):
            self.logger.info("📊 Google Sheets integration disabled in config")
            return None

        try:
            from google_sheets_config import GoogleSheetsConfigService

            # Use the specific Google Sheets ID from user's link
            sheets_id = '1xdfAEgbvDee_oJFwzb8bWW9ONmYO3RbQJ3Oscbmm5Uc'  # Updated ID from config.json
            service = GoogleSheetsConfigService(spreadsheet_id=sheets_id)
            self.logger.info(
                "✅ Google Sheets config service initialized with user's spreadsheet"
            )
            return service
        except ImportError:
            self.logger.warning(
                "⚠️ Google Sheets integration not available - " +
                "install gspread and google-auth"
            )
            return None
        except Exception as e:
            self.logger.error(f"❌ Google Sheets setup failed: {e}")
            return None

    def load_config_with_sheets(self, config_path):
        """Load config with Google Sheets integration"""
        try:
            # Load config from local file first
            with open(config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)

            self.logger.info(f"✅ Configuration loaded from: local_file")

            # Only try Google Sheets if enabled
            if self.config.get('google_sheets', {}).get('enabled', False):
                try:
                    from google_sheets_config import GoogleSheetsConfigService
                    sheets_service = GoogleSheetsConfigService()
                    sheets_config = sheets_service.get_config_merged(config_path)

                    if sheets_config:
                        self.config = sheets_config
                        # Log config source
                        metadata = self.config.get('_metadata', {})
                        config_source = metadata.get('config_source', 'google_sheets')
                        self.logger.info(f"✅ Configuration updated from: {config_source}")

                        if metadata.get('has_sheets_config'):
                            self.logger.info("📊 Google Sheets configuration active")
                        if metadata.get('has_sla_config'):
                            self.logger.info("🕐 SLA configuration loaded from Google Sheets")

                except Exception as e:
                    self.logger.warning(f"⚠️ Google Sheets config failed: {e}")
                    # Continue with local config

            # Load environment variables
            load_dotenv()

            # Replace environment variables in config
            self._replace_env_vars(self.config)

            print("✅ Đã tải cấu hình thành công")
        except Exception as e:
            print(f"❌ Lỗi tải cấu hình: {e}")
            sys.exit(1)

    def setup_sla_monitor(self):
        """Setup SLA monitoring"""
        try:
            from sla_monitor import SLAMonitor
            return SLAMonitor()
        except ImportError:
            self.logger.warning("⚠️ SLA Monitor not available")
            return None

    def extract_product_details_batch(self, order_ids, batch_size=10):
        """Lấy chi tiết sản phẩm theo batch để tối ưu performance"""
        try:
            self.logger.info(f"📦 Bắt đầu lấy chi tiết sản phẩm cho {len(order_ids)} đơn hàng...")

            product_details = {}
            total_batches = (len(order_ids) + batch_size - 1) // batch_size

            for batch_num in range(total_batches):
                start_idx = batch_num * batch_size
                end_idx = min(start_idx + batch_size, len(order_ids))
                batch_ids = order_ids[start_idx:end_idx]

                self.logger.info(f"📦 Batch {batch_num + 1}/{total_batches}: {len(batch_ids)} đơn hàng")

                # Method 1: Try direct API call first (fastest)
                batch_details = self.fetch_json_api_direct(batch_ids)

                if not batch_details:
                    # Method 2: Fallback to UI interaction
                    batch_details = self.fetch_json_via_ui(batch_ids)

                # Merge results
                product_details.update(batch_details)

                # Progress logging
                processed = min(end_idx, len(order_ids))
                self.logger.info(f"⚡ Đã xử lý {processed}/{len(order_ids)} đơn hàng")

                # Small delay between batches
                time.sleep(0.5)

            self.logger.info(f"✅ Hoàn thành lấy chi tiết {len(product_details)} đơn hàng")
            return product_details

        except Exception as e:
            self.logger.error(f"❌ Lỗi lấy chi tiết sản phẩm: {e}")
            return {}

    def fetch_json_api_direct(self, order_ids):
        """Method 1: Direct API call (fastest)"""
        try:
            # Build API URL
            ids_str = ','.join(map(str, order_ids))
            api_url = f"https://one.tga.com.vn/so/invoiceJSON?id={ids_str}"

            # Get cookies from current session
            cookies = {cookie['name']: cookie['value'] for cookie in self.driver.get_cookies()}

            # Make API request
            response = requests.get(api_url, cookies=cookies, timeout=10)

            if response.status_code == 200:
                content_type = (response.headers.get('Content-Type') or '').lower()
                raw_text = response.text.strip() if response.text else ''

                # invoiceJSON đôi lúc trả về HTML login hoặc body rỗng dù status=200
                if not raw_text:
                    self.logger.warning("⚠️ API Direct: empty response body")
                    return {}
                if 'json' not in content_type and raw_text.startswith('<'):
                    self.logger.warning("⚠️ API Direct: non-JSON response (possible session timeout/login page)")
                    return {}

                data = response.json()
                if not data.get('error', True) and data.get('data'):
                    self.logger.info(f"✅ API Direct: Lấy được {len(data['data'])} đơn hàng")
                    return self.parse_json_response(data['data'])

                self.logger.warning(f"⚠️ API Direct: invalid payload format - keys={list(data.keys())[:5]}")
                return {}

            self.logger.warning(f"⚠️ API Direct: HTTP {response.status_code}")

            return {}

        except Exception as e:
            self.logger.warning(f"⚠️ API Direct failed: {e}")
            return {}

    def fetch_json_via_ui(self, order_ids):
        """Method 2: UI interaction fallback"""
        try:
            self.logger.info("🖱️ Fallback to UI interaction...")

            # Step 1: Select checkboxes for order IDs
            selected_count = self.select_order_checkboxes(order_ids)

            if selected_count == 0:
                return {}

            # Step 2: Click "Lấy JSON" button
            json_data = self.click_json_button()

            # Step 3: Parse response
            if json_data:
                return self.parse_json_response(json_data)

            return {}

        except Exception as e:
            self.logger.error(f"❌ UI method failed: {e}")
            return {}

    def select_order_checkboxes(self, order_ids):
        """Select checkboxes for given order IDs"""
        try:
            selected_count = 0

            for order_id in order_ids:
                try:
                    # Find checkbox for this order ID
                    checkbox_selectors = [
                        f"input[type='checkbox'][value='{order_id}']",
                        f"tr:has(td:contains('{order_id}')) input[type='checkbox']",
                        f"//tr[td[contains(text(), '{order_id}')]]//input[@type='checkbox']"
                    ]

                    checkbox = None
                    for selector in checkbox_selectors:
                        try:
                            if selector.startswith("//"):
                                checkbox = self.driver.find_element(By.XPATH, selector)
                            else:
                                checkbox = self.driver.find_element(By.CSS_SELECTOR, selector)
                            break
                        except:
                            continue

                    if checkbox and not checkbox.is_selected():
                        # Scroll to checkbox
                        self.driver.execute_script("arguments[0].scrollIntoView();", checkbox)
                        time.sleep(0.1)

                        # Click checkbox
                        checkbox.click()
                        selected_count += 1
                        self.logger.debug(f"✅ Selected order {order_id}")

                except Exception as e:
                    self.logger.warning(f"⚠️ Cannot select order {order_id}: {e}")
                    continue

            self.logger.info(f"✅ Selected {selected_count}/{len(order_ids)} checkboxes")
            return selected_count

        except Exception as e:
            self.logger.error(f"❌ Error selecting checkboxes: {e}")
            return 0

    def click_json_button(self):
        """Click 'Lấy JSON' button and get response"""
        try:
            # Find "Lấy JSON" button
            json_button_selectors = [
                "//button[contains(text(), 'Lấy JSON')]",
                "//a[contains(text(), 'Lấy JSON')]",
                ".btn:contains('Lấy JSON')",
                "button[title*='JSON']",
                ".json-btn"
            ]

            json_button = None
            for selector in json_button_selectors:
                try:
                    if selector.startswith("//"):
                        json_button = WebDriverWait(self.driver, 3).until(
                            EC.element_to_be_clickable((By.XPATH, selector))
                        )
                    else:
                        json_button = WebDriverWait(self.driver, 3).until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                        )
                    break
                except TimeoutException:
                    continue

            if not json_button:
                self.logger.error("❌ Cannot find 'Lấy JSON' button")
                return None

            # Click button
            json_button.click()
            self.logger.info("✅ Clicked 'Lấy JSON' button")

            # Wait for new page/response
            time.sleep(2)

            # Check if redirected to JSON page
            current_url = self.driver.current_url
            if "invoiceJSON" in current_url:
                # Extract JSON from page
                try:
                    json_text = self.driver.find_element(By.TAG_NAME, "pre").text
                    json_data = json.loads(json_text)

                    if not json_data.get('error', True) and json_data.get('data'):
                        self.logger.info(f"✅ Got JSON data for {len(json_data['data'])} orders")
                        return json_data['data']

                except Exception as e:
                    self.logger.error(f"❌ Error parsing JSON: {e}")

            return None

        except Exception as e:
            self.logger.error(f"❌ Error clicking JSON button: {e}")
            return None

    def parse_json_response(self, json_data):
        """Parse JSON response and extract product details"""
        try:
            product_details = {}

            for order in json_data:
                order_id = str(order.get('id', ''))
                detail = order.get('detail', '')

                if order_id and detail:
                    # Parse product details
                    products = self.parse_product_detail(detail)

                    product_details[order_id] = {
                        'products': products,
                        'product_count': len(products),
                        'raw_detail': detail,
                        'customer': order.get('customer', ''),
                        'amount_total': order.get('amount_total', ''),
                        'transporter': order.get('transporter', ''),
                        'address': order.get('address', ''),
                        'phone': order.get('phone', '')
                    }

            return product_details

        except Exception as e:
            self.logger.error(f"❌ Error parsing JSON response: {e}")
            return {}

    def parse_product_detail(self, detail_string):
        """Parse product detail string into structured data"""
        try:
            products = []

            # Split by comma
            items = detail_string.split(',')

            for item in items:
                item = item.strip()
                if not item:
                    continue

                # Extract quantity using regex
                quantity_match = re.search(r'\((\d+)\)$', item)

                if quantity_match:
                    quantity = int(quantity_match.group(1))
                    product_name = item[:quantity_match.start()].strip()
                else:
                    quantity = 1
                    product_name = item

                if product_name:
                    products.append({
                        'name': product_name,
                        'quantity': quantity
                    })

            return products

        except Exception as e:
            self.logger.error(f"❌ Error parsing product detail: {e}")
            return []

    def enhanced_scrape_order_data(self):
        """Enhanced scraping with product details"""
        try:
            self.logger.info("📊 Bắt đầu lấy dữ liệu đơn hàng ENHANCED...")

            # Step 1: Get basic order data (existing method)
            orders = self.scrape_order_data()

            if not orders:
                return []

            # Step 2: Extract order IDs
            order_ids = []
            for order in orders:
                order_id = order.get('id')
                if order_id:
                    order_ids.append(order_id)

            self.logger.info(f"📦 Tìm thấy {len(order_ids)} order IDs để lấy chi tiết sản phẩm")

            # Step 3: Get product details in batches
            if order_ids:
                # Read batch size from config (fallback 5)
                batch_size = (
                    self.config.get('data_processing', {}).get('product_details_batch_size', 5)
                )
                product_details = self.extract_product_details_batch(order_ids, batch_size=batch_size)

                # Step 4: Merge product details with order data
                enhanced_orders = self.merge_product_details(orders, product_details)

                self.logger.info(f"✅ Enhanced {len(enhanced_orders)} đơn hàng với chi tiết sản phẩm")
                return enhanced_orders

            return orders

        except Exception as e:
            self.logger.error(f"❌ Lỗi enhanced scraping: {e}")
            return []

    def merge_product_details(self, orders, product_details):
        """Merge product details with basic order data"""
        try:
            enhanced_orders = []

            for order in orders:
                order_id = str(order.get('id', ''))

                # Copy original order data
                enhanced_order = order.copy()

                # Add product details if available
                if order_id in product_details:
                    details = product_details[order_id]

                    # Add product information
                    enhanced_order['products'] = details['products']
                    enhanced_order['product_count'] = details['product_count']
                    enhanced_order['raw_product_detail'] = details['raw_detail']

                    # Add additional API data
                    enhanced_order['api_customer'] = details.get('customer', '')
                    enhanced_order['api_amount'] = details.get('amount_total', '')
                    enhanced_order['api_transporter'] = details.get('transporter', '')
                    enhanced_order['api_address'] = details.get('address', '')
                    enhanced_order['api_phone'] = details.get('phone', '')

                    # Create product summary
                    if details['products']:
                        product_names = [p['name'] for p in details['products']]
                        enhanced_order['product_summary'] = '; '.join(product_names[:3])  # First 3 products
                        enhanced_order['total_items'] = sum(p['quantity'] for p in details['products'])
                    else:
                        enhanced_order['product_summary'] = 'No products'
                        enhanced_order['total_items'] = 0
                else:
                    # No product details available
                    enhanced_order['products'] = []
                    enhanced_order['product_count'] = 0
                    enhanced_order['product_summary'] = 'Details not available'
                    enhanced_order['total_items'] = 0

                enhanced_orders.append(enhanced_order)

            return enhanced_orders

        except Exception as e:
            self.logger.error(f"❌ Error merging product details: {e}")
            return orders

    def export_enhanced_data(self, df):
        """Export enhanced data with product details"""
        try:
            self.logger.info("📁 Xuất dữ liệu ENHANCED...")

            # Call parent export method
            export_files = super().export_data(df)

            # Additional enhanced exports
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

            # 1. Products-only CSV
            if 'products' in df.columns:
                try:
                    products_df = self.create_products_export(df)
                    products_filename = f"data/products_detail_{timestamp}.csv"
                    products_df.to_csv(products_filename, index=False, encoding='utf-8-sig')
                    export_files['products'] = products_filename
                    self.logger.info(f"✅ Đã xuất Products CSV: {products_filename}")
                except Exception as e:
                    self.logger.error(f"❌ Lỗi xuất Products CSV: {e}")

            # 2. Enhanced summary report
            try:
                enhanced_summary = f"data/enhanced_summary_{timestamp}.txt"
                self.create_enhanced_summary(df, enhanced_summary)
                export_files['enhanced_summary'] = enhanced_summary
                self.logger.info(f"✅ Đã tạo Enhanced Summary: {enhanced_summary}")
            except Exception as e:
                self.logger.error(f"❌ Lỗi tạo Enhanced Summary: {e}")

            return export_files

        except Exception as e:
            self.logger.error(f"❌ Lỗi xuất enhanced data: {e}")
            return {}

    def post_export_upload_and_notify(self, export_files: dict) -> None:
        """Upload files to Google Drive (if configured) and send notifications"""
        try:
            # Upload to Drive if folder configured
            drive_cfg = self.config.get('google_drive', {})
            folder_id = drive_cfg.get('folder_id', '')
            if folder_id:
                try:
                    from drive_uploader import upload_file_to_drive
                    for _, path in export_files.items():
                        if os.path.exists(path):
                            upload_file_to_drive(path, folder_id)
                    self.logger.info("✅ Uploaded files to Google Drive")
                except Exception as e:
                    self.logger.warning(f"⚠️ Drive upload failed: {e}")

            # Notify via email/telegram
            notif = self.config.get('notifications', {})
            if notif.get('email', {}).get('enabled', False) or notif.get('telegram', {}).get('enabled', False):
                try:
                    from notifier import send_email, send_telegram
                    summary = f"Orders: {len(export_files)} files exported\n"
                    # Email
                    if notif.get('email', {}).get('enabled', False):
                        recipients = notif['email'].get('recipients', [])
                        html = "<h3>Automation Completed</h3><ul>" + ''.join(
                            f"<li>{k}: {v}</li>" for k, v in export_files.items()
                        ) + "</ul>"
                        send_email("Automation Export", html, recipients)
                    # Telegram
                    if notif.get('telegram', {}).get('enabled', False):
                        send_telegram(f"[Automation] Exported files: {list(export_files.values())[:3]}")
                except Exception as e:
                    self.logger.warning(f"⚠️ Notify failed: {e}")
        except Exception as e:
            self.logger.warning(f"⚠️ Post-export hook failed: {e}")

    def create_products_export(self, df):
        """Create products-only export"""
        try:
            products_data = []

            for _, row in df.iterrows():
                order_id = row.get('id', '')
                products = row.get('products', [])

                if isinstance(products, list):
                    for product in products:
                        products_data.append({
                            'order_id': order_id,
                            'order_code': row.get('order_code', ''),
                            'customer': row.get('customer', ''),
                            'product_name': product.get('name', ''),
                            'quantity': product.get('quantity', 0),
                            'scraped_at': row.get('scraped_at', '')
                        })

            return pd.DataFrame(products_data)

        except Exception as e:
            self.logger.error(f"❌ Error creating products export: {e}")
            return pd.DataFrame()

    def create_enhanced_summary(self, df, filename):
        """Create enhanced summary report"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("📊 BÁO CÁO TỔNG HỢP ENHANCED\n")
                f.write("=" * 50 + "\n\n")
                f.write(f"🕐 Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"📦 Tổng đơn hàng: {len(df)}\n")

                # Product statistics
                if 'products' in df.columns:
                    total_products = df['product_count'].sum() if 'product_count' in df.columns else 0
                    orders_with_products = len(df[df['product_count'] > 0]) if 'product_count' in df.columns else 0

                    f.write(f"🛍️ Tổng sản phẩm: {total_products}\n")
                    f.write(f"📋 Đơn có sản phẩm: {orders_with_products}/{len(df)}\n")
                    f.write(f"📊 Tỷ lệ thành công: {orders_with_products/len(df)*100:.1f}%\n")

                f.write(f"\n📋 Cấu trúc dữ liệu Enhanced:\n")
                for i, col in enumerate(df.columns, 1):
                    f.write(f"  {i}. {col}\n")

        except Exception as e:
            self.logger.error(f"❌ Error creating enhanced summary: {e}")

    def run_enhanced_automation(self, progress_callback=None):
        """Run enhanced automation with product details"""
        result = {
            'success': False,
            'start_time': datetime.now(),
            'order_count': 0,
            'enhanced_order_count': 0,
            'export_files': {},
            'error': None
        }

        try:
            self.logger.info("🚀 Bắt đầu ENHANCED automation...")

            # Steps 1-3: Same as original (login, navigate, etc.)
            if progress_callback:
                progress_callback("Khởi tạo Enhanced automation", 5)

            if not self.setup_driver():
                raise Exception("Không thể khởi tạo WebDriver")

            if progress_callback:
                progress_callback("Đăng nhập...", 20)

            if not self.login_to_one():
                raise Exception("Đăng nhập thất bại")

            if progress_callback:
                progress_callback("Truy cập trang đơn hàng...", 30)

            if not self.navigate_to_orders():
                raise Exception("Không thể truy cập trang đơn hàng")

            # Step 4: Enhanced data extraction
            if progress_callback:
                progress_callback("Lấy dữ liệu ENHANCED với chi tiết sản phẩm...", 50)

            orders = self.enhanced_scrape_order_data()
            if not orders:
                raise Exception("Không lấy được dữ liệu đơn hàng")

            # Step 5: Process enhanced data
            if progress_callback:
                progress_callback("Xử lý dữ liệu ENHANCED...", 70)

            df, sla_report = self.process_order_data(orders)
            if df.empty:
                raise Exception("Dữ liệu rỗng sau khi xử lý")

            # Step 6: Export enhanced data
            if progress_callback:
                progress_callback("Xuất dữ liệu ENHANCED...", 85)

            export_files = self.export_enhanced_data(df)
            # Upload + notify
            self.post_export_upload_and_notify(export_files)

            # Calculate enhanced metrics
            enhanced_count = len(df[df['product_count'] > 0]) if 'product_count' in df.columns else 0

            result.update({
                'success': True,
                'order_count': len(df),
                'enhanced_order_count': enhanced_count,
                'export_files': export_files,
                'end_time': datetime.now(),
                'duration': (datetime.now() - result['start_time']).total_seconds()
            })

            if progress_callback:
                progress_callback("Hoàn thành ENHANCED automation", 100)

            self.logger.info(f"🎉 ENHANCED automation hoàn thành: {len(df)} đơn hàng, {enhanced_count} có chi tiết sản phẩm")

            # 🎯 DASHBOARD INTEGRATION CODE
            try:
                self.logger.info("📊 Integrating with dashboard...")

                # Import dashboard integration
                from dashboard_integration import integrate_with_automation

                # Prepare data cho dashboard
                automation_result = {
                    'success': True,
                    'dataframe': df,
                    'products_dataframe': self.create_products_export(df) if 'products' in df.columns else None,
                    'sla_data': {
                        'shopee': {'total_orders': 2, 'overdue_confirm': 1, 'overdue_handover': 0},
                        'tiktok': {'total_orders': 1, 'overdue_handover': 0},
                        'alerts': [
                            {'type': 'WARNING', 'message': 'Có 1 đơn Shopee quá hạn xác nhận'},
                            {'type': 'INFO', 'message': 'TikTok orders trong thời hạn'}
                        ]
                    }
                }

                # Integrate với dashboard
                dashboard_files = integrate_with_automation(automation_result)
                result['dashboard_files'] = dashboard_files

                self.logger.info("✅ Dashboard integration completed successfully")

            except Exception as e:
                self.logger.warning(f"⚠️ Dashboard integration failed: {e}")
                # Không throw exception để không ảnh hưởng automation chính

        except Exception as e:
            result['error'] = str(e)
            self.logger.error(f"❌ Lỗi ENHANCED automation: {e}")
            if progress_callback:
                progress_callback(f"Lỗi: {e}", 0)

        finally:
            if self.driver:
                try:
                    self.driver.quit()
                except:
                    pass

            # Log results to Google Sheets
            if hasattr(self, 'sheets_config_service') and self.sheets_config_service:
                try:
                    self.log_to_sheets(result)
                except Exception as e:
                    self.logger.warning(f"⚠️ Google Sheets logging failed: {e}")

        return result

    def process_order_data(self, raw_data):
        """Process scraped order data with SLA analysis"""
        try:
            self.logger.info("📊 Processing order data with SLA analysis...")

            # Convert raw data to DataFrame
            if isinstance(raw_data, list) and raw_data:
                processed_data = pd.DataFrame(raw_data)
                self.logger.info(f"✅ Converted {len(processed_data)} orders to DataFrame")
            else:
                self.logger.warning("⚠️ No raw data to process")
                return pd.DataFrame(), None

            # Add SLA analysis if available
            if self.sla_monitor and not processed_data.empty:
                self.logger.info("🕐 Running SLA analysis...")
                sla_report = self.sla_monitor.analyze_orders_sla(processed_data)

                # Export SLA reports
                sla_files = self.sla_monitor.export_sla_report(sla_report)

                # Add SLA info to processed data
                processed_data = self.add_sla_info_to_orders(processed_data, sla_report)

                # Log SLA summary
                self.log_sla_summary(sla_report)

                return processed_data, sla_report

            return processed_data, None

        except Exception as e:
            self.logger.error(f"❌ Error processing order data: {e}")
            return pd.DataFrame(), None

    def add_sla_info_to_orders(self, orders_df, sla_report):
        """Add SLA information to orders dataframe"""
        try:
            # Add SLA columns
            orders_df['sla_platform'] = 'other'
            orders_df['sla_deadline'] = None
            orders_df['sla_status'] = 'normal'
            orders_df['sla_priority'] = 'low'

            # Process Shopee orders
            shopee_statuses = sla_report.get('shopee', {}).get('sla_status', [])
            for status in shopee_statuses:
                order_id = status.get('order_id')
                mask = orders_df['id'] == order_id
                orders_df.loc[mask, 'sla_platform'] = 'shopee'
                orders_df.loc[mask, 'sla_deadline'] = status.get('handover_deadline', '')

                if status.get('handover_overdue') or status.get('confirm_overdue'):
                    orders_df.loc[mask, 'sla_status'] = 'overdue'
                    orders_df.loc[mask, 'sla_priority'] = 'critical'
                elif status.get('time_to_handover', 24) < 2:
                    orders_df.loc[mask, 'sla_status'] = 'urgent'
                    orders_df.loc[mask, 'sla_priority'] = 'high'

            # Process TikTok orders
            tiktok_statuses = sla_report.get('tiktok', {}).get('sla_status', [])
            for status in tiktok_statuses:
                order_id = status.get('order_id')
                mask = orders_df['id'] == order_id
                orders_df.loc[mask, 'sla_platform'] = 'tiktok'
                orders_df.loc[mask, 'sla_deadline'] = status.get('handover_deadline', '')

                if status.get('handover_overdue'):
                    orders_df.loc[mask, 'sla_status'] = 'overdue'
                    orders_df.loc[mask, 'sla_priority'] = 'critical'
                elif status.get('time_to_handover', 24) < 4:
                    orders_df.loc[mask, 'sla_status'] = 'urgent'
                    orders_df.loc[mask, 'sla_priority'] = 'high'

            return orders_df

        except Exception as e:
            self.logger.error(f"❌ Error adding SLA info: {e}")
            return orders_df

    def log_sla_summary(self, sla_report):
        """Log SLA summary to console"""
        try:
            self.logger.info("📊 SLA SUMMARY:")
            self.logger.info("=" * 50)

            # Shopee summary
            shopee = sla_report.get('shopee', {})
            if shopee:
                self.logger.info(f"🛒 SHOPEE:")
                self.logger.info(f"   📦 Đơn sau 18h: {shopee.get('after_cutoff', 0)}")
                self.logger.info(f"   ✅ Cần xác nhận: {shopee.get('need_confirm', 0)}")
                self.logger.info(f"   🚚 Cần bàn giao: {shopee.get('need_handover', 0)}")
                if shopee.get('overdue_confirm', 0) > 0:
                    self.logger.warning(f"   🚨 QUÁ HẠN xác nhận: {shopee['overdue_confirm']}")
                if shopee.get('overdue_handover', 0) > 0:
                    self.logger.warning(f"   🚨 QUÁ HẠN bàn giao: {shopee['overdue_handover']}")

            # TikTok summary
            tiktok = sla_report.get('tiktok', {})
            if tiktok:
                self.logger.info(f"📱 TIKTOK:")
                self.logger.info(f"   📦 Đơn sau 14h: {tiktok.get('after_cutoff', 0)}")
                self.logger.info(f"   🚚 Cần bàn giao: {tiktok.get('need_handover', 0)}")
                if tiktok.get('overdue_handover', 0) > 0:
                    self.logger.warning(f"   🚨 QUÁ HẠN bàn giao: {tiktok['overdue_handover']}")

            # Alerts
            alerts = sla_report.get('alerts', [])
            critical_alerts = [a for a in alerts if a['type'] == 'CRITICAL']
            if critical_alerts:
                self.logger.warning("🚨 CẢNH BÁO NGHIÊM TRỌNG:")
                for alert in critical_alerts:
                    self.logger.warning(f"   {alert['message']}")

        except Exception as e:
            self.logger.error(f"❌ Error logging SLA summary: {e}")

    def log_to_sheets(self, automation_result):
        """Log automation results to Google Sheets"""
        try:
            if not self.sheets_config_service:
                return False

            # Add additional metadata
            enhanced_result = automation_result.copy()
            enhanced_result.update({
                'config_source': self.config.get('_metadata', {}).get('config_source', 'local'),
                'sheets_integration': bool(self.sheets_config_service),
                'system_url': self.config.get('system', {}).get('one_url', 'unknown'),
                'automation_version': '2.1_enhanced'
            })

            success = self.sheets_config_service.log_automation_run(enhanced_result)
            if success:
                self.logger.info("📊 Automation results logged to Google Sheets")
            else:
                self.logger.warning("⚠️ Failed to log to Google Sheets")

            return success

        except Exception as e:
            self.logger.error(f"❌ Error logging to Google Sheets: {e}")
            return False

    def update_config_in_sheets(self, config_key, config_value):
        """Update configuration in Google Sheets"""
        try:
            if not self.sheets_config_service:
                return False

            success = self.sheets_config_service.update_system_config(config_key, config_value)
            if success:
                self.logger.info(f"✅ Updated config '{config_key}' in Google Sheets")
            else:
                self.logger.warning(f"⚠️ Failed to update config '{config_key}' in Google Sheets")

            return success

        except Exception as e:
            self.logger.error(f"❌ Error updating config in Google Sheets: {e}")
            return False

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

        # Create logs directory if it doesn't exist
        os.makedirs(os.path.dirname(log_file), exist_ok=True)

        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

        self.logger.info("🚀 Khởi tạo Enhanced Automation System v2.1")


def main():
    """Main function with command line argument support"""
    # Setup command line arguments
    parser = argparse.ArgumentParser(description='Enhanced ONE Automation System v2.1')
    parser.add_argument('--mode', choices=['sla', 'enhanced', 'test'], default='test',
                       help='Automation mode: sla (SLA monitoring), enhanced (full enhanced mode), test (test mode)')
    parser.add_argument('--config', default='config/config.json',
                       help='Config file path')

    args = parser.parse_args()

    try:
        print(f"🚀 Starting Enhanced ONE Automation System v2.1 - Mode: {args.mode}")

        # Initialize enhanced system
        enhanced_system = EnhancedOneAutomationSystem(args.config)

        if args.mode == 'sla':
            # SLA Mode - Focus on SLA monitoring and alerts
            print("🕐 Running SLA Mode - Real-time SLA monitoring")
            result = enhanced_system.run_enhanced_automation()

            if result['success']:
                print(f"✅ SLA Automation completed successfully!")
                print(f"📦 Orders processed: {result['order_count']}")
                print(f"🚨 Check SLA alerts in exported files")

                # Output for backend parsing
                print(f"Orders scraped: {result['order_count']}")

            else:
                print(f"❌ SLA Automation failed: {result.get('error', 'Unknown error')}")
                exit(1)

        elif args.mode == 'enhanced':
            # Enhanced Mode - Full functionality
            print("🛍️ Running Enhanced Mode - Full product details extraction")
            result = enhanced_system.run_enhanced_automation()

            if result['success']:
                print(f"✅ Enhanced Automation completed!")
                print(f"📦 Total orders: {result['order_count']}")
                print(f"🛍️ Enhanced orders: {result['enhanced_order_count']}")
            else:
                print(f"❌ Enhanced Automation failed: {result.get('error', 'Unknown error')}")
                exit(1)

        else:
            # Test Mode - Quick test using config-driven limits
            print("🧪 Running Test Mode - Config-driven limits for quick testing")
            print("⚡ Configuring for fast execution...")

            # Ensure section exists
            enhanced_system.config.setdefault('data_processing', {})
            dp = enhanced_system.config['data_processing']

            # Backup originals
            original_max_rows = dp.get('max_rows_for_testing')
            original_fast_mode = dp.get('enable_fast_mode', False)

            # Enable fast mode; do NOT override max rows if user configured it
            dp['enable_fast_mode'] = True

            limit = dp.get('max_rows_for_testing')
            print(f"📊 Test limit from config: {limit if limit else 'not set (no limit)'}")

            result = enhanced_system.run_enhanced_automation()

            # Restore originals
            if original_max_rows is not None:
                dp['max_rows_for_testing'] = original_max_rows
            else:
                dp.pop('max_rows_for_testing', None)
            dp['enable_fast_mode'] = original_fast_mode

        # Print results summary
        print("\n" + "="*60)
        print(f"📊 AUTOMATION RESULTS - {args.mode.upper()} MODE")
        print("="*60)
        print(f"✅ Success: {result['success']}")
        print(f"📦 Total orders: {result['order_count']}")
        print(f"🛍️ Enhanced orders: {result['enhanced_order_count']}")
        print(f"⏱️ Duration: {result.get('duration', 0):.2f}s")

        if result['export_files']:
            print(f"📁 Export files:")
            for file_type, file_path in result['export_files'].items():
                print(f"  • {file_type}: {file_path}")

        if result['error']:
            print(f"❌ Error: {result['error']}")
            exit(1)

    except KeyboardInterrupt:
        print("\n⚠️ Automation interrupted by user")
        exit(1)
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        exit(1)


if __name__ == "__main__":
    main()
