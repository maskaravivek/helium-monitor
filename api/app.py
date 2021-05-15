import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "."))

from helium import app
from flask import Flask, jsonify
from flask_cors import CORS
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logging.getLogger('flask_cors').level = logging.DEBUG

if __name__ == "__main__":
    app.run()
