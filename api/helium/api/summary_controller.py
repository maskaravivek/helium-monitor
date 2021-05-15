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
@docache(minutes=5)
def get_earnings_api():
    hotspot_id = request.args.get('hotspot_id')
    response = helium_service.get_hotspot_earnings(hotspot_id)

    return response

@summary_api.route(COMMON_PREFIX + "/earnings-bot", methods=['GET'])
@docache(minutes=5)
def earnings_bot_api():
    hotspot_id = request.args.get('hotspot_id')
    token = request.args.get('token')
    chat_id = request.args.get('chat_id')
    bot_type = request.args.get('bot_type')
    response = helium_service.send_earning_update_to_telegram(hotspot_id, token, chat_id)

    return response