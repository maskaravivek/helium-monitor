import requests
from datetime import datetime
import urllib
from .bots.telegram import telegram_bot_sendtext


def latest_earnings(hotspot_id, duration_in_hours=1):
    from_time = "-{hours}%20hour".format(hours=duration_in_hours)

    time = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    to_time = urllib.parse.quote_plus(time)

    api_url = "https://api.helium.io/v1/hotspots/{hotspot_id}/rewards/sum?min_time={from_time}&max_time={to_time}&bucket=hour"

    api_url = api_url.format(hotspot_id=hotspot_id,
                             from_time=from_time, to_time=to_time)

    r = requests.get(api_url)

    resp_data = r.json()['data']

    total = 0
    for item in resp_data:
        if item['total'] > 0.0:
            total += item['total']

    return total


def earnings_summary(hotspot_id, duration_in_days=30):
    from_time = "-{days}%20day".format(days=duration_in_days)

    time = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    to_time = urllib.parse.quote_plus(time)

    api_url = "https://api.helium.io/v1/hotspots/{hotspot_id}/rewards/sum?min_time={from_time}&max_time={to_time}&bucket=day"

    api_url = api_url.format(hotspot_id=hotspot_id,
                             from_time=from_time, to_time=to_time)

    r = requests.get(api_url)

    resp_data = r.json()['data']

    last_day = 0
    total = 0

    idx = 0
    for item in resp_data:
        if item['total'] > 0.0:
            if idx == 0:
                last_day += item['total']
            total += item['total']

        idx += 1

    return last_day, total


def get_hotspot_earnings(hotspot_id, latest_earnings_duration_in_hours=1, summary_duration_in_days=30):
    last_window_earnings = latest_earnings(
        hotspot_id, duration_in_hours=latest_earnings_duration_in_hours)
    last_day_earnings, summary_earnings = earnings_summary(
        hotspot_id, duration_in_days=summary_duration_in_days)

    price = get_price()

    return {
        "latest_window": "%.2f" % last_window_earnings,
        "last_day": "%.2f" % last_day_earnings,
        "summary_window": "%.2f" % summary_earnings,
        'price': price
    }

def get_price():
    r = requests.get('https://api.coingecko.com/api/v3/simple/price?ids=helium&vs_currencies=usd')
    return r.json()['helium']['usd']

def send_earning_update_to_telegram(hotspot_id, token, chat_id):
    earnings = get_hotspot_earnings(hotspot_id)

    if float(earnings["latest_window"]) > 0:
        message = "You earned {latest_window} HNT in last 1 hour. \n\n Summary: \n Last 24 hours: {last_day} HNT \n Last 30 days: {summary_window} HNT".format(
            latest_window=earnings["latest_window"], last_day=earnings["last_day"], summary_window=earnings["summary_window"])
        telegram_bot_sendtext(token, chat_id, message)
    
    return {"status": "success"}
