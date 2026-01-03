import unittest
import sys
import os

sys.path.append(os.path.abspath('../'))

class TestAutomationHealth(unittest.TestCase):
    def test_module_import(self):
        try:
            import one_automation
            self.assertTrue(True)
        except ImportError:
            self.fail("Module import failed")

if __name__ == '__main__':
    unittest.main()
