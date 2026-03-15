import os
import sys
import unittest

# Thêm thư mục gốc automation vào path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class TestAutomationHealth(unittest.TestCase):
    def test_module_import(self):
        """Kiểm tra import các module cốt lõi của automation."""
        core_modules = ['selenium', 'pandas', 'requests', 'dotenv']
        for mod in core_modules:
            try:
                __import__(mod)
            except ImportError:
                self.fail(f"Core module '{mod}' không import được")

if __name__ == '__main__':
    unittest.main()
