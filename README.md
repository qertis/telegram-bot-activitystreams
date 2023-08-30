# Telegram Bot Messages to ActivityStreams 2.0

## ActivityStreams 2.0 

- [Terms](https://www.w3.org/ns/activitystreams)
- [Specification](https://www.w3.org/TR/activitystreams-core)
- [Vocabulary](https://www.w3.org/TR/activitystreams-vocabulary)

| Activity   | Available |
|------------|-----------|
| summary    | ✅         |
| instrument | ✅         |
| actor      | ✅         |
| origin     | ✅         |
| target     | ✅         |
| origin     | ✅         |
| startTime  | ✅         |
| endTime    | ✅         |

| Objects  | Available   |
|----------|-------------|
| Person   | ✅           |
| Profile  | ✅           |
| Note     | ✅           |
| Audio    | ✅           |
| Video    | ✅           |
| Document | ✅           |
| Event    | ✅           |
| Place    | ✅           |

## Example 
> Example use [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)

```javascript
const activitystreams = require('telegram-bot-activitystreams');
const TelegramBot = require('node-telegram-bot-api');

const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
  const activity = activitystreams(msg);
  bot.sendMessage(msg.chat.id, 'Hello ' + activity.actor.name);
});
```
