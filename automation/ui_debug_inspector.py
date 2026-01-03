#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UI Debug Inspector - Find correct selectors for ONE system
This script will inspect the current UI and help identify the correct selectors
"""

import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

class UIInspector:
    def __init__(self):
        self.driver = None
        self.setup_driver()

    def setup_driver(self):
        """Setup Chrome driver for UI inspection"""
        try:
            options = Options()
            # Use visible browser for debugging
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--disable-blink-features=AutomationControlled')

            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=options)

            print("✅ WebDriver setup complete")
            return True

        except Exception as e:
            print(f"❌ Error setting up WebDriver: {e}")
            return False

    def inspect_page_elements(self):
        """Inspect current page to find selectors"""
        if not self.driver:
            print("❌ WebDriver not initialized")
            return None

        try:
            print("🔍 Inspecting page elements...")

            # Wait for page to load
            time.sleep(3)

            # Get all form elements
            selects = self.driver.find_elements(By.CSS_SELECTOR, "select")
            buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")
            inputs = self.driver.find_elements(By.CSS_SELECTOR, "input")
            tabs = self.driver.find_elements(By.CSS_SELECTOR, "a, .tab, .nav-link")

            results = {
                "page_url": self.driver.current_url,
                "page_title": self.driver.title,
                "selects": [],
                "buttons": [],
                "inputs": [],
                "tabs": [],
                "all_clickable": []
            }

            # Analyze SELECT elements (dropdowns)
            print(f"📋 Found {len(selects)} SELECT elements:")
            for i, select in enumerate(selects):
                try:
                    select_info = {
                        "index": i,
                        "tag": select.tag_name,
                        "id": select.get_attribute("id") or "",
                        "name": select.get_attribute("name") or "",
                        "class": select.get_attribute("class") or "",
                        "text": select.text[:100] if select.text else "",
                        "options": []
                    }

                    # Get options
                    options = select.find_elements(By.CSS_SELECTOR, "option")
                    for option in options[:10]:  # Limit to first 10 options
                        select_info["options"].append({
                            "value": option.get_attribute("value") or "",
                            "text": option.text[:50] if option.text else ""
                        })

                    results["selects"].append(select_info)
                    print(f"  #{i}: id='{select_info['id']}' name='{select_info['name']}' class='{select_info['class']}'")

                except Exception as e:
                    print(f"  Error inspecting select #{i}: {e}")

            # Analyze BUTTON elements
            print(f"\n🔘 Found {len(buttons)} BUTTON elements:")
            for i, button in enumerate(buttons):
                try:
                    button_info = {
                        "index": i,
                        "tag": button.tag_name,
                        "id": button.get_attribute("id") or "",
                        "class": button.get_attribute("class") or "",
                        "type": button.get_attribute("type") or "",
                        "text": button.text[:50] if button.text else "",
                        "onclick": button.get_attribute("onclick") or ""
                    }

                    results["buttons"].append(button_info)
                    if any(keyword in button_info["text"].lower()
                           for keyword in ["tìm", "search", "filter", "áp dụng"]):
                        print(f"  🎯 #{i}: class='{button_info['class']}' text='{button_info['text']}' type='{button_info['type']}'")

                except Exception as e:
                    print(f"  Error inspecting button #{i}: {e}")

            # Analyze TAB/LINK elements
            print(f"\n📑 Found {len(tabs)} TAB/LINK elements:")
            for i, tab in enumerate(tabs):
                try:
                    tab_info = {
                        "index": i,
                        "tag": tab.tag_name,
                        "id": tab.get_attribute("id") or "",
                        "class": tab.get_attribute("class") or "",
                        "href": tab.get_attribute("href") or "",
                        "text": tab.text[:50] if tab.text else ""
                    }

                    results["tabs"].append(tab_info)
                    if any(keyword in tab_info["text"].lower()
                           for keyword in ["chờ xuất", "pending", "export", "xuất kho"]):
                        print(f"  🎯 #{i}: class='{tab_info['class']}' text='{tab_info['text']}' href='{tab_info['href']}'")

                except Exception as e:
                    print(f"  Error inspecting tab #{i}: {e}")

            # Save results to file
            with open("ui_inspection_results.json", "w", encoding="utf-8") as f:
                json.dump(results, f, indent=2, ensure_ascii=False)

            print(f"\n💾 Results saved to ui_inspection_results.json")
            return results

        except Exception as e:
            print(f"❌ Error inspecting page: {e}")
            return None

    def test_selectors(self):
        """Test various selector strategies"""
        if not self.driver:
            print("❌ WebDriver not initialized")
            return

        try:
            print("\n🧪 Testing selector strategies...")

            # Test dropdown selectors
            dropdown_tests = [
                ("select[name*='limit']", "Name contains limit"),
                ("select[name*='page']", "Name contains page"),
                ("select[name*='size']", "Name contains size"),
                (".limit-select", "Class limit-select"),
                (".page-size", "Class page-size"),
                ("select:has(option[value='100'])", "Has option 100"),
                ("select:has(option[value='2000'])", "Has option 2000")
            ]

            for selector, description in dropdown_tests:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if elements:
                        print(f"  ✅ {description}: Found {len(elements)} elements")
                        for i, elem in enumerate(elements[:3]):
                            print(f"    #{i}: id='{elem.get_attribute('id')}' name='{elem.get_attribute('name')}'")
                    else:
                        print(f"  ❌ {description}: No elements found")
                except Exception as e:
                    print(f"  ⚠️ {description}: Error - {e}")

            # Test button selectors
            button_tests = [
                ("button[type='submit']", "Submit button"),
                (".btn-primary", "Primary button"),
                (".btn-search", "Search button"),
                ("button:contains('Tìm')", "Contains 'Tìm'"),
                ("button:contains('Search')", "Contains 'Search'")
            ]

            print("\n🔘 Testing button selectors:")
            for selector, description in button_tests:
                try:
                    if ":contains(" in selector:
                        # Convert to XPath for contains
                        search_text = selector.split('(')[1].split(')')[0].strip("'\"")
                        xpath_selector = f"//button[contains(text(), '{search_text}')]"
                        elements = self.driver.find_elements(By.XPATH, xpath_selector)
                    else:
                        elements = self.driver.find_elements(By.CSS_SELECTOR, selector)

                    if elements:
                        print(f"  ✅ {description}: Found {len(elements)} elements")
                        for i, elem in enumerate(elements[:3]):
                            print(f"    #{i}: class='{elem.get_attribute('class')}' text='{elem.text[:30]}'")
                    else:
                        print(f"  ❌ {description}: No elements found")
                except Exception as e:
                    print(f"  ⚠️ {description}: Error - {e}")

        except Exception as e:
            print(f"❌ Error testing selectors: {e}")

    def run_full_inspection(self, url):
        """Run complete UI inspection"""
        try:
            print(f"🚀 Starting UI inspection for: {url}")

            if not self.driver:
                print("❌ WebDriver not available")
                return None

            # Navigate to the page
            self.driver.get(url)
            print(f"📄 Loaded page: {self.driver.title}")

            # Wait for page to fully load
            time.sleep(5)

            # Run inspections
            results = self.inspect_page_elements()
            self.test_selectors()

            print("\n✅ UI inspection complete!")
            print("📋 Check ui_inspection_results.json for detailed results")

            return results

        except Exception as e:
            print(f"❌ Error during inspection: {e}")
            return None

        finally:
            if self.driver:
                input("\n⏸️ Press Enter to close browser and continue...")
                self.driver.quit()

def main():
    """Main function"""
    print("🔍 ONE System UI Inspector")
    print("=" * 50)

    # Get URL from user or use default
    url = input("Enter ONE system URL (or press Enter for default): ").strip()
    if not url:
        url = "https://one.tga.com.vn/so/"

    inspector = UIInspector()

    if inspector.driver:
        results = inspector.run_full_inspection(url)

        if results:
            print("\n📊 Quick Summary:")
            print(f"  📋 Selects found: {len(results['selects'])}")
            print(f"  🔘 Buttons found: {len(results['buttons'])}")
            print(f"  📑 Tabs found: {len(results['tabs'])}")

            # Suggest fixes
            print("\n💡 Suggested selector fixes:")

            # Dropdown suggestions
            limit_dropdowns = [s for s in results['selects']
                             if any(opt['value'] in ['100', '2000'] for opt in s['options'])]
            if limit_dropdowns:
                dropdown = limit_dropdowns[0]
                print(f"  🎯 Page limit dropdown:")
                if dropdown['id']:
                    print(f"    Use: #{dropdown['id']}")
                elif dropdown['name']:
                    print(f"    Use: select[name='{dropdown['name']}']")
                else:
                    print(f"    Use: select.{dropdown['class'].split()[0] if dropdown['class'] else 'unknown'}")

            # Search button suggestions
            search_buttons = [b for b in results['buttons']
                            if any(keyword in b['text'].lower()
                                 for keyword in ['tìm', 'search', 'filter'])]
            if search_buttons:
                button = search_buttons[0]
                print(f"  🎯 Search button:")
                if button['id']:
                    print(f"    Use: #{button['id']}")
                elif 'btn-primary' in button['class']:
                    print(f"    Use: .btn-primary")
                else:
                    print(f"    Use: button.{button['class'].split()[0] if button['class'] else 'unknown'}")

    print("\n🎉 Inspection completed!")

if __name__ == "__main__":
    main()
