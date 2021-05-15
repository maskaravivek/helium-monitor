from .test_basic import BasicTest
from covid19 import app
from covid19.constants.global_constants import COMMON_PREFIX
import os
import unittest

class RoutesTests(BasicTest):
    def test_main_page(self):
        response = self.app.get(COMMON_PREFIX, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
