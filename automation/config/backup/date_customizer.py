#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🗓️ Date Customizer Module - Tuỳ chỉnh ngày lấy dữ liệu đơn hàng
Handles: date range selection, time type, limit settings, form submission
"""

import time
from datetime import datetime, timedelta
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


class DateCustomizer:
    """
    🗓️ Class xử lý tuỳ chỉnh ngày trang đơn hàng ONE system
    Based on: ONE_SYSTEM_STRUCTURE.md analysis
    """

    def __init__(self, driver, logger):
        self.driver = driver
        self.logger = logger

    def set_date_range(self, start_date, end_date, time_type="ecom"):
        """
        🎯 Set custom date range using direct JavaScript injection

        Args:
            start_date (str): Start date (YYYY-MM-DD)
            end_date (str): End date (YYYY-MM-DD)
            time_type (str): "odoo" or "ecom"
        """
        try:
            self.logger.info(f"📅 Setting date range: {start_date} to {end_date} ({time_type})")

            # Method 1: Direct JavaScript injection (fastest)
            js_script = f"""
            // Set hidden date inputs
            $('#date_from').val('{start_date}');
            $('#date_to').val('{end_date}');

            // Update date display
            $('#daterange-btn-detail').text('{start_date} - {end_date}');

            // Set time type
            $('#time_type').val('{time_type}');

            return true;
            """

            result = self.driver.execute_script(js_script)
            if result:
                self.logger.info(f"✅ Date range set: {start_date} to {end_date} ({time_type})")
                return True

        except Exception as e:
            self.logger.error(f"❌ Error setting date range via JS: {e}")

        # Fallback: Use Selenium direct manipulation
        return self._set_date_range_fallback(start_date, end_date, time_type)

    def _set_date_range_fallback(self, start_date, end_date, time_type):
        """Fallback method using Selenium element manipulation"""
        try:
            self.logger.info("🔄 Using fallback method for date setting...")

            # Set hidden inputs
            date_from_input = self.driver.find_element(By.ID, "date_from")
            date_to_input = self.driver.find_element(By.ID, "date_to")

            date_from_input.clear()
            date_from_input.send_keys(start_date)
            date_to_input.clear()
            date_to_input.send_keys(end_date)

            # Update display
            display_element = self.driver.find_element(By.ID, "daterange-btn-detail")
            self.driver.execute_script(
                f"arguments[0].textContent = '{start_date} - {end_date}';",
                display_element
            )

            # Set time type
            time_type_select = Select(self.driver.find_element(By.ID, "time_type"))
            time_type_select.select_by_value(time_type)

            self.logger.info("✅ Fallback date setting successful")
            return True

        except Exception as e:
            self.logger.error(f"❌ Fallback date setting failed: {e}")
            return False

    def set_display_limit(self, limit=2000):
        """
        📊 Set number of rows to display

        Args:
            limit (int): 100, 200, 300, 500, 1000, 2000
        """
        try:
            self.logger.info(f"📊 Setting display limit to {limit}")

            # Use JavaScript for speed
            js_script = f"$('#limit').val('{limit}');"
            self.driver.execute_script(js_script)

            self.logger.info(f"✅ Display limit set to {limit}")
            return True

        except Exception as e:
            self.logger.error(f"❌ Error setting display limit: {e}")
            return False

    def apply_filters(self, wait_for_load=True):
        """
        🔍 Apply filters and submit form

        Args:
            wait_for_load (bool): Wait for data to load after submission
        """
        try:
            self.logger.info("🔍 Applying filters...")

            # Submit form using JavaScript (more reliable)
            js_script = "$('#filter-form').submit();"
            self.driver.execute_script(js_script)

            if wait_for_load:
                return self._wait_for_data_load()

            self.logger.info("✅ Filters applied successfully")
            return True

        except Exception as e:
            self.logger.error(f"❌ Error applying filters: {e}")
            return False

    def _wait_for_data_load(self, timeout=30):
        """Wait for data table to load completely"""
        try:
            self.logger.info("⏳ Waiting for data to load...")

            # Wait for loading icon to appear then disappear
            try:
                # First wait for loading to start
                WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "#loading-filter"))
                )

                # Then wait for loading to finish
                WebDriverWait(self.driver, timeout).until_not(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "#loading-filter"))
                )
            except TimeoutException:
                # Loading might be too fast, continue
                pass

            # Wait for table to be present and populated
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "#orderTB tbody tr"))
            )

            # Additional stability wait
            time.sleep(2)

            self.logger.info("✅ Filters applied successfully")
            return True

        except TimeoutException:
            self.logger.error(f"❌ Timeout waiting for data load ({timeout}s)")
            return False

    def use_date_preset(self, preset_name):
        """
        🗓️ Use predefined date presets

        Args:
            preset_name (str): "today", "yesterday", "7days", "30days", "this_month", "last_month", "all"
        """
        try:
            self.logger.info(f"📅 Using date preset: {preset_name}")

            # Map preset names to JavaScript
            preset_map = {
                "today": "Hôm nay",
                "yesterday": "Hôm qua",
                "7days": "7 ngày trước",
                "30days": "30 ngày trước",
                "this_month": "Tháng này",
                "last_month": "Tháng trước",
                "all": "Tất cả"
            }

            if preset_name not in preset_map:
                raise ValueError(f"Invalid preset: {preset_name}")

            preset_text = preset_map[preset_name]

            # Click date range button
            self.driver.find_element(By.ID, "daterange-btn").click()
            time.sleep(1)

            # Find and click the preset
            preset_link = self.driver.find_element(
                By.XPATH, f"//li[contains(text(), '{preset_text}')]"
            )
            preset_link.click()

            self.logger.info(f"✅ Date preset '{preset_name}' applied")
            return True

        except Exception as e:
            self.logger.error(f"❌ Error using date preset '{preset_name}': {e}")
            return False

    def get_current_settings(self):
        """
        📋 Get current date range and filter settings

        Returns:
            dict: Current settings
        """
        try:
            # Get values using JavaScript
            js_script = """
            return {
                date_from: $('#date_from').val(),
                date_to: $('#date_to').val(),
                time_type: $('#time_type').val(),
                limit: $('#limit').val(),
                display_text: $('#daterange-btn-detail').text().trim()
            };
            """

            settings = self.driver.execute_script(js_script)
            self.logger.info(f"📋 Current settings: {settings}")
            return settings

        except Exception as e:
            self.logger.error(f"❌ Error getting current settings: {e}")
            return {}

    def quick_date_setup(self, days_back=7, time_type="ecom", limit=2000):
        """
        🚀 Quick setup for recent days

        Args:
            days_back (int): Number of days back from today
            time_type (str): "odoo" or "ecom"
            limit (int): Display limit
        """
        try:
            # Calculate dates
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days_back)

            start_str = start_date.strftime("%Y-%m-%d")
            end_str = end_date.strftime("%Y-%m-%d")

            self.logger.info(f"🚀 Quick setup: {days_back} days back ({start_str} to {end_str})")

            # Set everything in one go
            success = True
            success &= self.set_date_range(start_str, end_str, time_type)
            success &= self.set_display_limit(limit)

            if success:
                self.logger.info("✅ Quick date setup completed")
            else:
                self.logger.warning("⚠️ Quick date setup partially failed")

            return success

        except Exception as e:
            self.logger.error(f"❌ Quick date setup failed: {e}")
            return False


# Convenience functions
def customize_date_range(driver, logger, start_date, end_date, time_type="ecom", limit=2000, apply_now=True):
    """
    🎯 Convenience function to customize date range

    Args:
        driver: WebDriver instance
        logger: Logger instance
        start_date (str): Start date (YYYY-MM-DD)
        end_date (str): End date (YYYY-MM-DD)
        time_type (str): "odoo" or "ecom"
        limit (int): Display limit
        apply_now (bool): Apply filters immediately

    Returns:
        dict: Result with success status and settings
    """
    customizer = DateCustomizer(driver, logger)

    # Set date range
    date_success = customizer.set_date_range(start_date, end_date, time_type)
    limit_success = customizer.set_display_limit(limit)

    # Apply filters if requested
    apply_success = True
    if apply_now:
        apply_success = customizer.apply_filters()

    # Get final settings
    current_settings = customizer.get_current_settings()

    return {
        'success': date_success and limit_success and apply_success,
        'date_set': date_success,
        'limit_set': limit_success,
        'filters_applied': apply_success,
        'settings': current_settings
    }


def quick_recent_orders(driver, logger, days=7, time_type="ecom"):
    """
    ⚡ Quick function to get recent orders

    Args:
        driver: WebDriver instance
        logger: Logger instance
        days (int): Number of recent days
        time_type (str): "odoo" or "ecom"

    Returns:
        bool: Success status
    """
    customizer = DateCustomizer(driver, logger)
    return customizer.quick_date_setup(days, time_type, 2000)


if __name__ == "__main__":
    """Test the date customizer module"""
    print("🗓️ Date Customizer Module")
    print("Use this module after successful login to customize date ranges")
    print("Example: customize_date_range(driver, logger, '2025-06-01', '2025-06-30')")
