from flask import Blueprint
import uuid
import hashlib
from ..constants.global_constants import COMMON_PREFIX
from ..services import helium_service
from ..utils.api import handle_response, docache
from helium.cache import cache
from flask import request

summary_api = Blueprint('summary', __name__)


@summary_api.route(COMMON_PREFIX + "/earnings", methods=['GET'])
@docache(minutes=1)
def get_earnings_api():
    hotspot_name = request.args.get('hotspot_name')
    response = helium_service.get_hotspot_earnings(hotspot_name)

    return response


@summary_api.route(COMMON_PREFIX + "/earnings", methods=['POST'])
@docache(minutes=1)
def get_multi_device_earnings_api():
    data = request.json
    hotspots = data['hotspots']
    response = helium_service.get_multi_hotspot_earnings(hotspots)

    return response


@summary_api.route(COMMON_PREFIX + "/device", methods=['GET'])
@docache(minutes=1)
def get_device_details():
    hotspot_name = request.args.get('hotspot_name')
    response = helium_service.get_hotspot_details(hotspot_name)

    return response


@summary_api.route(COMMON_PREFIX + "/earnings-bot", methods=['GET'])
@docache(minutes=1)
def earnings_bot_api():
    hotspot_name = request.args.get('hotspot_name')
    token = request.args.get('token')
    chat_id = request.args.get('chat_id')
    bot_type = request.args.get('bot_type')
    response = helium_service.send_earning_update_to_telegram(
        hotspot_name, token, chat_id)

    return response
