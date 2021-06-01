import requests
from datetime import datetime
import urllib
from .bots.telegram import telegram_bot_sendtext

EMRIT_RATIO = 0.2


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
    last_7_days = 0
    total = 0

    idx = 0
    for item in resp_data:
        if item['total'] > 0.0:
            if idx == 0:
                last_day += item['total']
            if idx < 7:
                last_7_days += item['total']
            total += item['total']

        idx += 1

    return last_day, last_7_days, total


def get_hotspot_earnings(hotspot_name, latest_earnings_duration_in_hours=1, summary_duration_in_days=30):
    hotspot_details = get_hotspot_details(hotspot_name)

    if 'error' in hotspot_details:
        return {"error": "Couldn't find a matching device"}

    hotspot_id = hotspot_details['address']

    last_window_earnings = latest_earnings(
        hotspot_id, duration_in_hours=latest_earnings_duration_in_hours)
    last_day_earnings, last_7_days_earnings, summary_earnings = earnings_summary(
        hotspot_id, duration_in_days=summary_duration_in_days)

    price = get_price()

    return {
        "latest_window": last_window_earnings,
        "last_day": last_day_earnings,
        "summary_window": summary_earnings,
        "7_days_window": last_7_days_earnings,
        'price': price,
        'device_details': hotspot_details
    }


def get_hotspot_earnings_with_emrit_factor(hotspot_name, is_emrit):
    earnings = get_hotspot_earnings(hotspot_name)
    if is_emrit < 100:
        print('inside is emrit', hotspot_name)
        earnings["latest_window"] = earnings["latest_window"] * EMRIT_RATIO
        earnings["last_day"] = earnings["last_day"] * EMRIT_RATIO
        earnings["summary_window"] = earnings["summary_window"] * EMRIT_RATIO
        earnings["7_days_window"] = earnings["7_days_window"] * EMRIT_RATIO

    return earnings


def get_multi_hotspot_earnings(hotspots):
    device_wise_earnings = [get_hotspot_earnings_with_emrit_factor(
        hotspot_name, is_emrit) for (hotspot_name, is_emrit) in hotspots.items()]

    total_latest_window_earnings = 0.0
    total_last_day_earnings = 0.0
    total_summary_earnings = 0.0
    total_7_days_window_earnings = 0.0
    price = 0.0
    device_status = []

    for device in device_wise_earnings:
        total_latest_window_earnings += device['latest_window']
        total_last_day_earnings += device['last_day']
        total_summary_earnings += device['summary_window']
        total_7_days_window_earnings += device['7_days_window']
        price = device['price']
        device_status.append(device['device_details']['status'])

    overall_status = "offline" if "offline" in device_status else "online"

    return {
        "cumulative": {
            "latest_window": "%.2f" % total_latest_window_earnings,
            "last_day": "%.2f" % total_last_day_earnings,
            "summary_window": "%.2f" % total_summary_earnings,
            "7_days_window": "%.2f" % total_7_days_window_earnings,
            'price': price,
            'status': overall_status
        },
        "devices": device_wise_earnings
    }


def get_hotspot_earnings_with_emrit_factor_v2(hotspot_name, is_emrit):
    earnings = get_hotspot_earnings(hotspot_name)
    print('inside is emrit', hotspot_name)
    earnings["latest_window"] = earnings["latest_window"] * is_emrit / 100
    earnings["last_day"] = earnings["last_day"] * is_emrit / 100
    earnings["summary_window"] = earnings["summary_window"] * is_emrit / 100
    earnings["7_days_window"] = earnings["7_days_window"] * is_emrit / 100

    return earnings


def get_multi_hotspot_earnings_v2(hotspots):
    device_wise_earnings = [get_hotspot_earnings_with_emrit_factor_v2(
        hotspot_name, is_emrit) for (hotspot_name, is_emrit) in hotspots.items()]

    total_latest_window_earnings = 0.0
    total_last_day_earnings = 0.0
    total_summary_earnings = 0.0
    total_7_days_window_earnings = 0.0
    price = 0.0
    device_status = []

    for device in device_wise_earnings:
        total_latest_window_earnings += device['latest_window']
        total_last_day_earnings += device['last_day']
        total_summary_earnings += device['summary_window']
        total_7_days_window_earnings += device['7_days_window']
        price = device['price']
        device_status.append(device['device_details']['status'])

    overall_status = "offline" if "offline" in device_status else "online"

    return {
        "cumulative": {
            "latest_window": "%.2f" % total_latest_window_earnings,
            "last_day": "%.2f" % total_last_day_earnings,
            "summary_window": "%.2f" % total_summary_earnings,
            "7_days_window": "%.2f" % total_7_days_window_earnings,
            'price': price,
            'status': overall_status
        },
        "devices": device_wise_earnings
    }


def get_hotspot_details(hotspot_name):
    api_url = "https://api.helium.io/v1/hotspots/name?search={hotspot_name}"

    api_url = api_url.format(hotspot_name=hotspot_name)

    r = requests.get(api_url)

    resp_data = r.json()['data']

    for item in resp_data:
        if item['name'] == hotspot_name:
            return {
                'status': item['status']['online'],
                'address': item['address'],
                'name': item['name'],
                'city': item['geocode']['short_city'],
                'state': item['geocode']['short_state']
            }

    return {"error": "Couldn't find a matching device"}


def get_price():
    r = requests.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=helium&vs_currencies=usd')
    return r.json()['helium']['usd']


def send_earning_update_to_telegram(hotspot_name, token, chat_id):
    earnings = get_hotspot_earnings(hotspot_name)

    if float(earnings["latest_window"]) > 0:
        message = "You earned {latest_window} HNT in last 1 hour. \n\n Summary: \n Last 24 hours: {last_day} HNT \n Last 7 days: {last_7_day} HNT \n Last 30 days: {summary_window} HNT".format(
            latest_window=earnings["latest_window"], last_day=earnings["last_day"], last_7_day=earnings["7_days_window"], summary_window=earnings["summary_window"])
        telegram_bot_sendtext(token, chat_id, message)

    return {"status": "success"}
