// file object params used, but not required - see https://github.com/qertis/telegram-bot-express
const fromUnixTime = require('date-fns/fromUnixTime');

const getFullName = (x) => {
  return (x.first_name + ' ' + (x.last_name ?? '')).trimEnd()
}

const person = (x) => ({
  type: 'Person',
  name: getFullName(x),
  id: String(x.id),
});

const origin = (x) => ({
  type: 'Object',
  name: 'Telegram Bot Message',
  id: String(x?.channel_post?.message_id ?? x.message_id),
});

const instrument = (x) => ({
  type: 'Service',
  name: x.channel_post ? 'telegram channel' : 'telegram',
});

const group = (x) => ({
  type: 'Group',
  name: x.username,
  id: String(x.id),
});

const profile = (x) => ({
  type: 'Profile',
  name: getFullName(x.contact),
  id: String(x.contact.user_id),
  to: x.contact.phone_number ? `tel:+${x.contact.phone_number}` : null,
});

const note = (x) => ({
  type: 'Note',
  content: x.text,
  mediaType: 'text/plain',
});

const audio = (x) => ({
  type: 'Audio',
  url: x.voice?.file?.url,
  duration: x.voice.duration,
  mediaType: x.voice.mime_type,
});

const video = (x) => ({
  type: 'Video',
  summary: x.caption,
  url: x.video?.file?.url,
  duration: x.video.duration,
  width: x.video.width,
  height: x.video.height,
  mediaType: x.video.mime_type,
  icon: x.video.thumb ? {
    type: 'Image',
    url: x.video.thumb?.file?.url,
    width: x.video.thumb.width,
    height: x.video.thumb.height,
  } : null,
});

const document = (x) => ({
  type: 'Document',
  summary: x.caption,
  url: x.document?.file?.url,
  mediaType: x.document.mime_type,
  name: x.document.file_name,
  icon: x.document.thumb ? {
    type: 'Image',
    url: x.document.thumb?.file?.url,
    width: x.document.thumb.width,
    height: x.document.thumb.height,
  } : null,
});

const tag = (x) => ({
  id: x,
  name: '#' + x,
});

const event = (x) => ({
  type: 'Event',
  name: x.text,
});

const place = (x) => ({
  type: 'Place',
  latitude: x.location.latitude,
  longitude: x.location.longitude,
});

const getHashtagsFromEntities = (entities, text) => {
  return entities
      .filter((entity) => entity.type === 'hashtag')
      .map(entity => {
        // eslint-disable-next-line unicorn/prefer-string-slice
        const hashtag = text.substr(
            entity.offset + 1,
            entity.length - 1,
        );
        return hashtag;
      });
}

function getHashtagsFromText(message) {
  const hashtags = new Set();
  if (Array.isArray(message.entities) && message.entities.length > 0) {
    getHashtagsFromEntities(message.entities, message.text).forEach((hashtag) => {
      hashtags.add(hashtag);
    });
  }
  return [...hashtags];
}

function getHashtagsFromCaption(message) {
  const hashtags = new Set();
  if (Array.isArray(message.caption_entities) && message.caption_entities.length > 0) {
    getHashtagsFromEntities(message.caption_entities, message.caption).forEach((hashtag) => {
      hashtags.add(hashtag);
    });
  }
  return [...hashtags];
}

function objects(message) {
  const objects = [];

  if (message.text) {
    const textHashtags = getHashtagsFromText(message);
    let n;
    if (Array.isArray(message.entities) &&  message.entities.some(e => e.type === 'bot_command')) {
      n = event(message);
    } else {
      n = note(message);
    }

    if (textHashtags.length > 0) {
      n.tag = textHashtags.map(h => tag(h));
    }
    objects.push(n);
  }
  if (message.contact) {
    objects.push(profile(message));
  }
  if (message.photo) {
    const captionHashtags = getHashtagsFromCaption(message);

    message.photo.forEach(photo => {
      const image = {
        type: 'Image',
        width: photo.width,
        height: photo.height,
        url: photo?.file?.url,
        summary: message.caption,
      };
      if (captionHashtags.length > 0) {
        image.tag = captionHashtags.map(h => tag(h));
      }
      objects.push(image);
    });
  }
  if (message.video) {
    objects.push(video(message));
  }
  if (message.document) {
    objects.push(document(message));
  }
  if (message.voice) {
    objects.push(audio(message));
  }
  if (message.location) {
    objects.push(place(message));
  }

  return objects;
}

function time(date) {
  return fromUnixTime(date).toISOString()
}

module.exports = (message) => {
  const now = Math.round(new Date().getTime() / 1000)
  const context = 'https://www.w3.org/ns/activitystreams'
  if (message.channel_post) {
    return {
      '@context': context,
      type: 'Activity',
      instrument: instrument(message),
      object: objects(message.channel_post),
      actor: group(message.channel_post.chat),
      origin: origin(message),
      startTime: time(message.channel_post.date),
      endTime: time(now),
    }
  } else if (message.sender_chat) {
    return {
      '@context': context,
      type: 'Activity',
      instrument: instrument(message),
      object: objects(message),
      actor: group(message.sender_chat),
      origin: origin(message),
      startTime: time(message.date),
      endTime: time(now),
    }
  }

  return {
    '@context': context,
    type: 'Activity',
    summary: message.type,
    instrument: instrument(message),
    actor: person(message.from),
    object: objects(message),
    target: person(message.chat),
    origin: origin(message),
    startTime: time(message.date),
    endTime: time(now),
  }
}
