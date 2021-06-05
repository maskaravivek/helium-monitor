from flask import Blueprint
import uuid
import hashlib
from ..constants.global_constants import COMMON_PREFIX
from ..services import helium_service
from ..utils.api import handle_response
from helium.cache import cache
from flask import request

summary_api = Blueprint('summary', __name__)


@summary_api.route(COMMON_PREFIX + "/earnings", methods=['GET'])
@cache.cached(timeout=30)
def get_earnings_api():
    hotspot_name = request.args.get('hotspot_name')
    response = helium_service.get_hotspot_earnings(hotspot_name)

    return handle_response(response)


@summary_api.route(COMMON_PREFIX + "/earnings", methods=['POST'])
@cache.cached(timeout=30)
def get_multi_device_earnings_api():
    data = request.json
    hotspots = data['hotspots']
    response = helium_service.get_multi_hotspot_earnings(hotspots)

    return handle_response(response)


@summary_api.route(COMMON_PREFIX + "/earningsv2", methods=['POST'])
@cache.cached(timeout=30)
def get_multi_device_earnings_api_v2():
    data = request.json
    hotspots = data['hotspots']
    response = helium_service.get_multi_hotspot_earnings_v2(hotspots)
    return handle_response(response)


@summary_api.route(COMMON_PREFIX + "/device", methods=['GET'])
@cache.cached(timeout=300)
def get_device_details():
    hotspot_name = request.args.get('hotspot_name')
    response = helium_service.get_hotspot_details(hotspot_name)

    return handle_response(response)


@summary_api.route(COMMON_PREFIX + "/config", methods=['GET'])
@cache.cached(timeout=300)
def get_config():
    response = helium_service.get_app_config()

    return handle_response(response)


@summary_api.route(COMMON_PREFIX + "/earnings-bot", methods=['GET'])
@cache.cached(timeout=30)
def earnings_bot_api():
    hotspot_name = request.args.get('hotspot_name')
    token = request.args.get('token')
    chat_id = request.args.get('chat_id')
    bot_type = request.args.get('bot_type')
    response = helium_service.send_earning_update_to_telegram(
        hotspot_name, token, chat_id)

    return handle_response(response)
