# clipto-bot
Assumes hosting on a linux machine.

Make a `.env` file with the following fields:
```
TWITTER_API_KEY= ''
TWITTER_API_SECRET= ''
TWITTER_ACCESS_TOKEN= ''
TWITTER_ACCESS_TOKEN_SECRET= ''
USD_FLOOR=
```


# Set up Crontab (after testing)
Every 2 minutes check new request and post pending to Twitter
```
*/2 * * * cd /opt/clipto-bot && node getCliptoRequests.js >> /opt/clipto-bot/debug.log && node postCliptoRequest.js >> /opt/clipto-bot/debug.log
```
