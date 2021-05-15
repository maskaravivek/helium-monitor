Env: 

```
export FLASK_APP=main.py
```

Run App:

```
flask run
```

## APIs

**Fetch earnings**

Sample request for getting earnings: 

```
http://127.0.0.1:5000/api/v1/earnings?hotspot_id=11MqWgd3Hn3HMnJt8Mrw1QFjZqcCh1febgUNk4YaDEjm5fQXAmQ
```

Response:

```
{
  "last_day": "0.74",
  "latest_window": "0.00",
  "summary_window": "0.74"
}
```

**Send earnings to telegram bot**

Sample request for getting earnings: 

```
http://127.0.0.1:5000/api/v1/earnings-bot?hotspot_id=11MqWgd3Hn3HMnJt8Mrw1QFjZqcCh1febgUNk4YaDEjm5fQXAmQ&token=<bot_token>&chat_id=<bot_chat_id>
```

Response:

```
{
  "last_day": "0.74",
  "latest_window": "0.00",
  "summary_window": "0.74"
}
```

## Deployment

```
git subtree split --prefix api -b deploy && git push heroku deploy:master
```