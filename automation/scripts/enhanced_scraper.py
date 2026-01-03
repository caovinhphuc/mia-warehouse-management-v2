#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enhanced Scraper Module - Scraping nâng cao với JavaScript optimization
Handles: enhanced data extraction, JavaScript acceleration, progress tracking
"""

import time
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


class EnhancedScraper:
    """Class xử lý scraping nâng cao với tối ưu JavaScript"""

    def __init__(self, driver, logger):
        self.driver = driver
        self.logger = logger

    def scrape_order_data_basic(self):
        """Lấy dữ liệu đơn hàng cơ bản với JavaScript acceleration"""
        try:
            self.logger.info("📊 Bắt đầu lấy dữ liệu đơn hàng cơ bản...")

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
                    rows_data = self._fallback_scraping_method()

                if rows_data:
                    orders = self._process_rows_data(rows_data)

            except Exception as e:
                self.logger.error(f"❌ Lỗi JavaScript scraping: {e}")
                # Fallback method
                orders = self._fallback_scraping_method()

            duration = time.time() - start_time
            self.logger.info(f"✅ Lấy được {len(orders)} đơn hàng trong {duration:.2f}s")
            return orders

        except Exception as e:
            self.logger.error(f"❌ Lỗi scrape data cơ bản: {e}")
            return []

    def _fallback_scraping_method(self):
        """Phương pháp fallback khi JavaScript fail"""
        try:
            self.logger.info("🔄 Sử dụng fallback scraping method...")

            simple_selectors = ["table tbody tr", "tbody tr", ".table tbody tr"]
            rows_data = []

            for selector in simple_selectors:
                try:
                    rows = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if rows:
                        for row in rows:
                            cells = row.find_elements(By.CSS_SELECTOR, "td")
                            if len(cells) > 0:
                                cell_texts = [cell.text.strip() for cell in cells]
                                rows_data.append(cell_texts)
                        break
                except Exception:
                    continue

            return self._process_rows_data(rows_data)

        except Exception as e:
            self.logger.error(f"❌ Fallback method failed: {e}")
            return []

    def _process_rows_data(self, rows_data):
        """Xử lý raw rows data thành structured orders"""
        try:
            orders = []

            for i, row_cells in enumerate(rows_data):
                if len(row_cells) < 3:  # Skip invalid rows
                    continue

                # Tạo order data structure
                order_data = {
                    'row_index': i + 1,
                    'total_columns': len(row_cells),
                    'scraped_at': datetime.now().isoformat()
                }

                # Map cells to columns
                for j, cell_text in enumerate(row_cells):
                    order_data[f'col_{j+1}'] = cell_text

                # Extract order ID using various patterns
                order_id = self._extract_order_id(row_cells)
                if order_id:
                    order_data['id'] = order_id

                # Extract customer name (usually in specific columns)
                customer = self._extract_customer_name(row_cells)
                if customer:
                    order_data['customer'] = customer

                # Extract order code (usually first clickable column)
                order_code = self._extract_order_code(row_cells)
                if order_code:
                    order_data['order_code'] = order_code

                orders.append(order_data)

                # Progress logging
                if (i + 1) % 50 == 0:
                    self.logger.info(f"⚡ Processed {i + 1}/{len(rows_data)} rows")

            return orders

        except Exception as e:
            self.logger.error(f"❌ Error processing rows data: {e}")
            return []

    def _extract_order_id(self, row_cells):
        """Extract order ID from row cells"""
        try:
            # Try to find order ID patterns
            for cell in row_cells[:3]:  # Usually in first 3 columns
                if cell and cell.isdigit() and len(cell) >= 4:
                    return cell
            return None
        except:
            return None

    def _extract_customer_name(self, row_cells):
        """Extract customer name from row cells"""
        try:
            # Customer name usually in columns 4-6
            for i in range(3, min(7, len(row_cells))):
                if i < len(row_cells) and row_cells[i]:
                    cell = row_cells[i].strip()
                    if cell and len(cell) > 2 and not cell.isdigit():
                        return cell
            return None
        except:
            return None

    def _extract_order_code(self, row_cells):
        """Extract order code from row cells"""
        try:
            # Order code usually in first column
            if len(row_cells) > 0 and row_cells[0]:
                return row_cells[0].strip()
            return None
        except:
            return None

    def enhanced_scrape_order_data(self):
        """Enhanced scraping với order ID extraction nâng cao"""
        try:
            self.logger.info("📊 Bắt đầu lấy dữ liệu đơn hàng ENHANCED...")

            # Step 1: Get basic order data
            orders = self.scrape_order_data_basic()

            if not orders:
                self.logger.warning("⚠️ Không có dữ liệu cơ bản để enhance")
                return []

            # Step 2: Extract order IDs cho việc lấy chi tiết sau này
            order_ids = []
            orders_with_ids = []

            for order in orders:
                order_id = order.get('id')
                if order_id:
                    order_ids.append(order_id)
                    orders_with_ids.append(order)
                else:
                    # Try harder to extract ID from DOM
                    enhanced_id = self._extract_id_from_dom(order)
                    if enhanced_id:
                        order['id'] = enhanced_id
                        order_ids.append(enhanced_id)
                        orders_with_ids.append(order)

            self.logger.info(f"📦 Tìm thấy {len(order_ids)} order IDs từ {len(orders)} đơn hàng")

            # Step 3: Add metadata for further processing
            for order in orders_with_ids:
                order['has_id'] = True
                order['ready_for_enhancement'] = True

            self.logger.info(f"✅ Enhanced {len(orders_with_ids)} đơn hàng với order IDs")
            return {
                'orders': orders_with_ids,
                'order_ids': order_ids,
                'total_orders': len(orders),
                'enhanced_orders': len(orders_with_ids),
                'enhancement_rate': len(orders_with_ids) / len(orders) * 100 if orders else 0
            }

        except Exception as e:
            self.logger.error(f"❌ Lỗi enhanced scraping: {e}")
            return {
                'orders': [],
                'order_ids': [],
                'total_orders': 0,
                'enhanced_orders': 0,
                'enhancement_rate': 0
            }

    def _extract_id_from_dom(self, order):
        """Trích xuất order ID từ DOM bằng JavaScript nâng cao"""
        try:
            # Sử dụng row index để tìm order ID từ DOM
            row_index = order.get('row_index', 0)
            if row_index == 0:
                return None

            js_script = f"""
            try {{
                const rows = document.querySelectorAll('table tbody tr, tbody tr, .table tbody tr');
                if (rows.length >= {row_index}) {{
                    const targetRow = rows[{row_index - 1}];
                    const links = targetRow.querySelectorAll('a[href*="/so/detail/"]');
                    if (links.length > 0) {{
                        const href = links[0].getAttribute('href');
                        const match = href.match(/\\/so\\/detail\\/(\\d+)/);
                        return match ? match[1] : null;
                    }}
                }}
                return null;
            }} catch(e) {{
                return null;
            }}
            """

            result = self.driver.execute_script(js_script)
            return result

        except Exception as e:
            self.logger.debug(f"⚠️ Không thể extract ID từ DOM cho row {order.get('row_index', 'unknown')}: {e}")
            return None

    def get_table_structure_info(self):
        """Lấy thông tin cấu trúc bảng để debug"""
        try:
            js_script = """
            const tables = document.querySelectorAll('table');
            const result = [];

            tables.forEach((table, index) => {
                const headers = Array.from(table.querySelectorAll('thead th, tbody tr:first-child td'))
                    .map(th => th.textContent.trim());
                const rowCount = table.querySelectorAll('tbody tr').length;

                result.push({
                    tableIndex: index,
                    headers: headers,
                    rowCount: rowCount,
                    id: table.id || 'no-id',
                    className: table.className || 'no-class'
                });
            });

            return result;
            """

            structure_info = self.driver.execute_script(js_script)
            self.logger.info(f"📋 Table structure info: {structure_info}")
            return structure_info

        except Exception as e:
            self.logger.warning(f"⚠️ Cannot get table structure: {e}")
            return []

    def wait_for_table_load(self, timeout=30):
        """Chờ bảng dữ liệu load hoàn toàn"""
        try:
            self.logger.info("⏳ Chờ bảng dữ liệu load...")

            # Wait for table presence
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr"))
            )

            # Wait for AJAX completion if jQuery is available
            try:
                WebDriverWait(self.driver, timeout).until(
                    lambda driver: driver.execute_script("return typeof $ !== 'undefined' && $.active == 0")
                )
                self.logger.info("✅ AJAX requests completed")
            except:
                self.logger.info("⚠️ jQuery not available, skipping AJAX wait")

            # Additional stability wait
            time.sleep(1)

            self.logger.info("✅ Bảng dữ liệu đã load hoàn toàn")
            return True

        except TimeoutException:
            self.logger.error(f"❌ Timeout waiting for table load ({timeout}s)")
            return False
        except Exception as e:
            self.logger.error(f"❌ Error waiting for table load: {e}")
            return False


    def extract_single_page_data(self):
        """
        📄 Extract data từ trang hiện tại (sử dụng cho pagination)

        Returns:
            list: Orders data from current page
        """
        try:
            # Wait for table to be ready
            if not self.wait_for_table_load(timeout=15):
                self.logger.warning("⚠️ Table load timeout for current page")
                return []

            # Extract data from current page only
            orders = self.scrape_order_data_basic()
            return orders

        except Exception as e:
            self.logger.error(f"❌ Error extracting single page data: {e}")
            return []

    def enhanced_scrape_all_pages(self):
        """
        📊 Enhanced scraping với pagination - lấy hết tất cả trang

        Returns:
            dict: Complete extraction result with all pages data
        """
        try:
            from scripts.pagination_handler import PaginationHandler

            self.logger.info("📊 Starting enhanced scraping with pagination...")

            # Initialize pagination handler
            pagination_handler = PaginationHandler(self.driver, self.logger)

            # Get total records estimate
            page_estimate = pagination_handler.quick_page_count_estimate()
            if page_estimate['estimated_pages'] > 0:
                self.logger.info(f"📊 Estimated: {page_estimate['estimated_pages']} pages for {page_estimate['total_records']:,} records")

            # Extract data from all pages
            result = pagination_handler.extract_all_pages_data(
                extract_function=self.extract_single_page_data,
                max_pages=50  # Safety limit
            )

            if not result['success']:
                self.logger.error("❌ Pagination extraction failed")
                return {
                    'orders': [],
                    'order_ids': [],
                    'total_orders': 0,
                    'enhanced_orders': 0,
                    'enhancement_rate': 0,
                    'pages_processed': 0,
                    'success': False
                }

            # Process all collected orders
            all_orders = result['all_data']
            order_ids = []
            enhanced_orders = []

            # Extract order IDs and enhance data
            for order in all_orders:
                order_id = order.get('id')
                if order_id:
                    order_ids.append(order_id)
                    enhanced_orders.append(order)
                    order['has_id'] = True
                    order['ready_for_enhancement'] = True

            enhancement_rate = len(enhanced_orders) / len(all_orders) * 100 if all_orders else 0

            self.logger.info(f"📊 Complete extraction summary:")
            self.logger.info(f"   📦 Total orders: {len(all_orders):,}")
            self.logger.info(f"   🆔 Enhanced orders: {len(enhanced_orders):,}")
            self.logger.info(f"   📈 Enhancement rate: {enhancement_rate:.1f}%")
            self.logger.info(f"   📄 Pages processed: {result['pages_processed']}")
            self.logger.info(f"   📊 Completion rate: {result['completion_rate']:.1f}%")

            return {
                'orders': enhanced_orders,
                'order_ids': order_ids,
                'total_orders': len(all_orders),
                'enhanced_orders': len(enhanced_orders),
                'enhancement_rate': enhancement_rate,
                'pages_processed': result['pages_processed'],
                'completion_rate': result['completion_rate'],
                'total_expected': result['total_expected'],
                'success': True
            }

        except Exception as e:
            self.logger.error(f"❌ Enhanced scraping with pagination failed: {e}")
            return {
                'orders': [],
                'order_ids': [],
                'total_orders': 0,
                'enhanced_orders': 0,
                'enhancement_rate': 0,
                'pages_processed': 0,
                'success': False,
                'error': str(e)
            }


def enhanced_scrape_orders(driver, logger):
    """Convenience function để scrape enhanced orders (single page)"""
    scraper = EnhancedScraper(driver, logger)

    # Wait for table to load first
    if not scraper.wait_for_table_load():
        return {
            'success': False,
            'error': 'Table load timeout',
            'orders': [],
            'order_ids': []
        }

    # Get table structure for debugging
    scraper.get_table_structure_info()

    # Perform enhanced scraping
    result = scraper.enhanced_scrape_order_data()

    return {
        'success': len(result['orders']) > 0,
        'orders': result['orders'],
        'order_ids': result['order_ids'],
        'total_orders': result['total_orders'],
        'enhanced_orders': result['enhanced_orders'],
        'enhancement_rate': result['enhancement_rate']
    }


def enhanced_scrape_all_orders(driver, logger):
    """Convenience function để scrape ALL orders với pagination"""
    scraper = EnhancedScraper(driver, logger)

    # Wait for table to load first
    if not scraper.wait_for_table_load():
        return {
            'success': False,
            'error': 'Table load timeout',
            'orders': [],
            'order_ids': []
        }

    # Get table structure for debugging
    scraper.get_table_structure_info()

    # Perform complete enhanced scraping with pagination
    result = scraper.enhanced_scrape_all_pages()

    return result
