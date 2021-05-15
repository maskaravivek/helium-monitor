from . import api, services, tests
from flask import Flask, make_response, jsonify
from flask_cors import CORS
from os.path import join, isfile
from sentry_sdk.integrations.flask import FlaskIntegration
import sentry_sdk
from .cache import cache
import os

app = Flask(__name__)
app.config.from_pyfile('flask.cfg')

dsn = os.environ.get('SENTRY_DSN_API')
# if dsn != None:
#     sentry_sdk.init(
#         dsn=dsn,
#         integrations=[FlaskIntegration()],
#         environment=os.environ.get('ENVIRONMENT', 'development'),
#         release=os.environ.get('VERSION')
#     )

@app.errorhandler(404)
def not_found_error(error):
    return make_response(jsonify({"status": "failure", "message": 'Not Found'})), 404

@app.errorhandler(500)
def internal_error(error):
    return make_response(jsonify({"status": "failure", "message": error.message})), 500

CORS(app)
api.init_app(app)
services.init_app(app)
tests.init_app(app)
cache.init_app(app)
