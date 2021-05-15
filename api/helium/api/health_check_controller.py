import os

from flask import Blueprint, jsonify
from ..constants.global_constants import COMMON_PREFIX
from ..utils.api import handle_response

health_check_api = Blueprint('health_check', __name__)

@health_check_api.route(COMMON_PREFIX + "/status")
def check_health():
    return handle_response({ "status": "healthy" })

@health_check_api.route(COMMON_PREFIX + "/env")
def check_env():
    return handle_response(str(os.environ))
