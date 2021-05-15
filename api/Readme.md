Env: 

```
export FLASK_APP=main.py
```

Run App:

```
flask run
```

Sample request: 

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