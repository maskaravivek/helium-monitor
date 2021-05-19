import logging
from flask_cors import CORS
from flask import Flask, jsonify
from helium import app
from moesifwsgi import MoesifMiddleware
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "."))


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logging.getLogger('flask_cors').level = logging.DEBUG

moesif_settings = {
    'APPLICATION_ID': os.getenv('MOESIF_APPLICATION_ID'),
    'CAPTURE_OUTGOING_REQUESTS': False,
}

app.wsgi_app = MoesifMiddleware(app.wsgi_app, moesif_settings)

if __name__ == "__main__":
    app.run()
