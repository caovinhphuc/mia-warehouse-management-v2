#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
📄 Pagination Handler Module - Xử lý phân trang để lấy hết dữ liệu
Handles: total records extraction, page navigation, complete data collection
"""

import time
import re
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException


class PaginationHandler:
    """
    📄 Class xử lý phân trang DataTables để lấy hết dữ liệu
    Based on: ONE_SYSTEM_STRUCTURE.md pagination analysis
    """

    def __init__(self, driver, logger):
        self.driver = driver
        self.logger = logger

    def get_total_records(self):
        """
        📊 Lấy tổng số dòng từ DataTables info

        Returns:
            int: Tổng số records hoặc 0 nếu không tìm thấy
        """
        try:
            # Đợi info element xuất hiện
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "orderTB_info"))
            )

            info_element = self.driver.find_element(By.ID, "orderTB_info")
            info_text = info_element.text.strip()

            self.logger.info(f"📊 DataTables info: {info_text}")

            # Parse text: "Hiển thị 1 đến 2,000 trong tổng số 15,847 dòng"
            # Hoặc: "Showing 1 to 2,000 of 15,847 entries"
            patterns = [
                r"trong tổng số ([\d,]+) dòng",  # Vietnamese
                r"of ([\d,]+) entries",          # English
                r"tổng cộng ([\d,]+)",           # Alternative Vietnamese
                r"total ([\d,]+)"                # Alternative English
            ]

            for pattern in patterns:
                match = re.search(pattern, info_text, re.IGNORECASE)
                if match:
                    total_str = match.group(1).replace(',', '')
                    total_records = int(total_str)
                    self.logger.info(f"✅ Total records found: {total_records:,}")
                    return total_records

            # Fallback: try to find numbers in text
            numbers = re.findall(r'[\d,]+', info_text)
            if numbers:
                # Take the largest number as total
                largest = max([int(n.replace(',', '')) for n in numbers])
                self.logger.warning(f"⚠️ Using fallback total: {largest:,}")
                return largest

            self.logger.warning(f"⚠️ Could not parse total from: {info_text}")
            return 0

        except Exception as e:
            self.logger.error(f"❌ Error getting total records: {e}")
            return 0

    def get_current_page_info(self):
        """
        📄 Lấy thông tin trang hiện tại

        Returns:
            dict: {current_page: int, has_next: bool, has_previous: bool}
        """
        try:
            # Tìm current page
            current_page = 1
            try:
                current_element = self.driver.find_element(By.CSS_SELECTOR, ".paginate_button.current")
                current_page = int(current_element.text.strip())
            except:
                pass

            # Kiểm tra next button
            has_next = True
            try:
                next_button = self.driver.find_element(By.CSS_SELECTOR, ".paginate_button.next")
                if "disabled" in next_button.get_attribute("class"):
                    has_next = False
            except:
                has_next = False

            # Kiểm tra previous button
            has_previous = True
            try:
                prev_button = self.driver.find_element(By.CSS_SELECTOR, ".paginate_button.previous")
                if "disabled" in prev_button.get_attribute("class"):
                    has_previous = False
            except:
                has_previous = False

            return {
                'current_page': current_page,
                'has_next': has_next,
                'has_previous': has_previous
            }

        except Exception as e:
            self.logger.error(f"❌ Error getting page info: {e}")
            return {'current_page': 1, 'has_next': False, 'has_previous': False}

    def go_to_next_page(self, wait_timeout=30):
        """
        ➡️ Chuyển sang trang tiếp theo với proper waiting và content change detection

        Args:
            wait_timeout (int): Timeout chờ trang load

        Returns:
            bool: True nếu thành công, False nếu không có trang tiếp
        """
        try:
            # Kiểm tra có next button không
            page_info = self.get_current_page_info()
            if not page_info['has_next']:
                self.logger.info("📄 No more pages available")
                return False

            current_page = page_info['current_page']
            self.logger.info(f"📄 Attempting to go from page {current_page} to next page...")

            # Capture current table content để so sánh sau
            old_content = self._get_table_content_snapshot()
            self.logger.info(f"📸 Captured current table content: {len(old_content)} items")

            # STRATEGY 1: Scroll to pagination area first
            try:
                self.logger.info("🔄 Strategy 1: Scroll to pagination area...")
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)

                # Find pagination container and scroll to it
                pagination_container = self.driver.find_element(By.CSS_SELECTOR, ".dataTables_paginate")
                self.driver.execute_script("arguments[0].scrollIntoView(true);", pagination_container)
                time.sleep(1)

            except Exception as e:
                self.logger.warning(f"⚠️ Scroll strategy failed: {e}")

            # STRATEGY 2: Try JavaScript click first
            try:
                self.logger.info("🔄 Strategy 2: JavaScript click...")

                js_click_script = """
                var nextButtons = document.querySelectorAll('.paginate_button.next');
                for (var i = 0; i < nextButtons.length; i++) {
                    var btn = nextButtons[i];
                    if (!btn.classList.contains('disabled') && btn.offsetWidth > 0 && btn.offsetHeight > 0) {
                        btn.click();
                        return true;
                    }
                }
                return false;
                """

                clicked = self.driver.execute_script(js_click_script)
                if clicked:
                    self.logger.info("✅ JavaScript click successful")

                    # Đợi table content thay đổi
                    if self._wait_for_table_content_change(old_content, timeout=15):
                        new_page_info = self.get_current_page_info()
                        if new_page_info['current_page'] > current_page:
                            self.logger.info(f"📄 Successfully moved to page {new_page_info['current_page']}")
                            return True

            except Exception as e:
                self.logger.warning(f"⚠️ JavaScript strategy failed: {e}")

            # STRATEGY 3: Try Selenium click with multiple selectors
            try:
                self.logger.info("🔄 Strategy 3: Selenium click with multiple selectors...")

                selectors = [
                    ".paginate_button.next:not(.disabled)",
                    "a.paginate_button.next",
                    ".dataTables_paginate .next",
                    ".paginate_button[data-dt-idx]:last-child"
                ]

                for selector in selectors:
                    try:
                        next_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                        if next_button.is_displayed() and next_button.is_enabled():
                            # Scroll to button
                            self.driver.execute_script("arguments[0].scrollIntoView(true);", next_button)
                            time.sleep(0.5)

                            # Try click
                            next_button.click()
                            self.logger.info(f"✅ Clicked with selector: {selector}")

                            # Đợi table content thay đổi
                            if self._wait_for_table_content_change(old_content, timeout=15):
                                new_page_info = self.get_current_page_info()
                                if new_page_info['current_page'] > current_page:
                                    self.logger.info(f"📄 Successfully moved to page {new_page_info['current_page']}")
                                    return True

                    except Exception as e:
                        self.logger.debug(f"Selector {selector} failed: {e}")
                        continue

            except Exception as e:
                self.logger.warning(f"⚠️ Selenium strategy failed: {e}")

            # STRATEGY 4: Direct page navigation via URL manipulation
            try:
                self.logger.info("🔄 Strategy 4: Direct URL navigation...")

                current_url = self.driver.current_url

                # Try to increment page in URL if it exists
                if "page=" in current_url:
                    import re
                    new_url = re.sub(r'page=(\d+)', lambda m: f"page={int(m.group(1)) + 1}", current_url)
                    self.driver.get(new_url)
                    time.sleep(3)

                    new_page_info = self.get_current_page_info()
                    if new_page_info['current_page'] > current_page:
                        self.logger.info(f"📄 URL navigation successful to page {new_page_info['current_page']}")
                        return True

            except Exception as e:
                self.logger.warning(f"⚠️ URL navigation failed: {e}")

            # STRATEGY 5: DataTables API direct navigation
            try:
                self.logger.info("🔄 Strategy 5: DataTables API navigation...")

                dt_script = """
                if (typeof $ !== 'undefined' && $('#orderTB').length > 0) {
                    var table = $('#orderTB').DataTable();
                    table.page('next').draw('page');
                    return true;
                }
                return false;
                """

                api_success = self.driver.execute_script(dt_script)
                if api_success:
                    self.logger.info("✅ DataTables API navigation successful")

                    # Đợi table content thay đổi
                    if self._wait_for_table_content_change(old_content, timeout=20):
                        new_page_info = self.get_current_page_info()
                        if new_page_info['current_page'] > current_page:
                            self.logger.info(f"📄 Successfully moved to page {new_page_info['current_page']}")
                            return True

            except Exception as e:
                self.logger.warning(f"⚠️ DataTables API failed: {e}")

            # All strategies failed
            self.logger.error(f"❌ All pagination strategies failed for page {current_page}")
            return False

        except Exception as e:
            self.logger.error(f"❌ Error in go_to_next_page: {e}")
            return False

    def _get_table_content_snapshot(self):
        """📸 Capture table content snapshot để detect changes"""
        try:
            js_script = """
            var rows = document.querySelectorAll('#orderTB tbody tr');
            var snapshot = [];
            for (var i = 0; i < Math.min(rows.length, 3); i++) {
                var row = rows[i];
                var cells = row.querySelectorAll('td');
                if (cells.length > 0) {
                    snapshot.push(cells[0].textContent.trim() + '|' + cells[1].textContent.trim());
                }
            }
            return snapshot;
            """

            result = self.driver.execute_script(js_script)
            return result if result else []

        except Exception as e:
            self.logger.debug(f"⚠️ Error capturing table snapshot: {e}")
            return []

    def _wait_for_table_content_change(self, old_content, timeout=30):
        """⏳ Đợi table content thay đổi"""
        try:
            self.logger.info(f"⏳ Waiting for table content to change (timeout: {timeout}s)...")

            start_time = time.time()
            check_interval = 0.5

            while time.time() - start_time < timeout:
                # Đợi một chút trước khi check
                time.sleep(check_interval)

                # Lấy content mới
                new_content = self._get_table_content_snapshot()

                # So sánh với content cũ
                if new_content != old_content and len(new_content) > 0:
                    self.logger.info(f"✅ Table content changed! New content: {len(new_content)} items")

                    # Đợi thêm một chút cho table ổn định
                    time.sleep(2)
                    return True

                # Tăng interval để không spam request
                check_interval = min(check_interval * 1.1, 2.0)

            self.logger.warning(f"❌ Timeout waiting for table content change ({timeout}s)")
            return False

        except Exception as e:
            self.logger.error(f"❌ Error waiting for table content change: {e}")
            return False

    def extract_all_pages_data(self, extract_function, max_pages=50):
        """
        📊 Lấy dữ liệu từ tất cả các trang

        Args:
            extract_function: Function để extract data từ 1 trang
            max_pages (int): Giới hạn số trang tối đa để tránh infinite loop

        Returns:
            dict: {all_data: list, total_extracted: int, total_expected: int, pages_processed: int}
        """
        try:
            self.logger.info("📊 Starting complete data extraction across all pages...")

            # Get total expected records
            total_expected = self.get_total_records()
            if total_expected == 0:
                self.logger.warning("⚠️ No total records found, proceeding with available data")

            all_data = []
            pages_processed = 0

            while pages_processed < max_pages:
                pages_processed += 1
                page_info = self.get_current_page_info()
                current_page = page_info['current_page']

                self.logger.info(f"📄 Processing page {current_page} ({pages_processed}/{max_pages})...")

                # Extract data from current page
                try:
                    page_data = extract_function()
                    if page_data:
                        all_data.extend(page_data)
                        self.logger.info(f"✅ Page {current_page}: extracted {len(page_data)} records")
                    else:
                        self.logger.warning(f"⚠️ Page {current_page}: no data extracted")

                except Exception as e:
                    self.logger.error(f"❌ Page {current_page}: extraction failed - {e}")

                # Check if we have next page
                if not page_info['has_next']:
                    self.logger.info(f"📄 Reached last page ({current_page})")
                    break

                # Go to next page
                if not self.go_to_next_page():
                    self.logger.warning("⚠️ Failed to go to next page, stopping")
                    break

            # Summary
            total_extracted = len(all_data)
            completion_rate = (total_extracted / total_expected * 100) if total_expected > 0 else 0

            self.logger.info(f"📊 Extraction complete:")
            self.logger.info(f"   📦 Total extracted: {total_extracted:,}")
            self.logger.info(f"   🎯 Total expected: {total_expected:,}")
            self.logger.info(f"   📈 Completion rate: {completion_rate:.1f}%")
            self.logger.info(f"   📄 Pages processed: {pages_processed}")

            return {
                'all_data': all_data,
                'total_extracted': total_extracted,
                'total_expected': total_expected,
                'pages_processed': pages_processed,
                'completion_rate': completion_rate,
                'success': total_extracted > 0
            }

        except Exception as e:
            self.logger.error(f"❌ Complete extraction failed: {e}")
            return {
                'all_data': [],
                'total_extracted': 0,
                'total_expected': 0,
                'pages_processed': 0,
                'completion_rate': 0,
                'success': False,
                'error': str(e)
            }

    def quick_page_count_estimate(self):
        """
        ⚡ Ước tính nhanh số trang dựa trên total records

        Returns:
            dict: {estimated_pages: int, records_per_page: int}
        """
        try:
            total_records = self.get_total_records()
            if total_records == 0:
                return {'estimated_pages': 0, 'records_per_page': 0}

            # Assume 2000 records per page (max limit)
            records_per_page = 2000
            estimated_pages = (total_records + records_per_page - 1) // records_per_page

            self.logger.info(f"📊 Estimated: {estimated_pages} pages for {total_records:,} records")

            return {
                'estimated_pages': estimated_pages,
                'records_per_page': records_per_page,
                'total_records': total_records
            }

        except Exception as e:
            self.logger.error(f"❌ Error estimating pages: {e}")
            return {'estimated_pages': 0, 'records_per_page': 0, 'total_records': 0}


# Convenience functions
def extract_complete_data(driver, logger, extract_function, max_pages=50):
    """
    🎯 Convenience function để extract hết dữ liệu từ tất cả trang

    Args:
        driver: WebDriver instance
        logger: Logger instance
        extract_function: Function để extract data từ 1 trang
        max_pages (int): Giới hạn số trang

    Returns:
        dict: Complete extraction result
    """
    handler = PaginationHandler(driver, logger)
    return handler.extract_all_pages_data(extract_function, max_pages)


def get_total_records_count(driver, logger):
    """
    📊 Quick function để lấy tổng số records

    Returns:
        int: Total records count
    """
    handler = PaginationHandler(driver, logger)
    return handler.get_total_records()


if __name__ == "__main__":
    """Test the pagination handler module"""
    print("📄 Pagination Handler Module")
    print("Use this module to extract complete data across all pages")
    print("Example: extract_complete_data(driver, logger, your_extract_function)")
