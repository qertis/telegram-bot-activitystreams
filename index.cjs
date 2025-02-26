// file object params used, but not required - see https://github.com/qertis/telegram-bot-express
const {fromUnixTime} = require('date-fns/fromUnixTime');

const isTextLikeMarkdown = (text) => {
  // Consecutive lines beginning with 1.
  if (/(^|[\n\r])\s*1\.\s.*\s+1\.\s/gm.test(text)) {
    return true;
  }
  // Link markdown
  if (/!?\[([^\]]*)\]\(([^\)]+)\)/gm.test(text)) {
    return true;
  }
  // Double underscores or asterisks when a left-right pair
  if (/\s(__|\*\*)(?!\s)(.(?!\1))+(?!\s(?=\1))/gm.test(text)) {
    return true;
  }
  return false;
}

const getFullName = (x) => {
  if (x.first_name) {
    return (x.first_name + ' ' + (x.last_name ?? '')).trimEnd();
  }
  return x.username;
}

const actor = (x) => {
  let type, name, id

  if (x.channel_post) {
    type = 'Group'
    name = getFullName(x.channel_post.chat)
    id = x.channel_post?.message_id
  } else if (x.type === 'channel') {
    type = 'Group'
    name = getFullName(x)
    id = x.id
  } else if (x.sender_chat) {
    type = 'Group'
    name = getFullName(x.sender_chat) || x.sender_chat.username
    id = String(x.sender_chat);
  } else if (x.from) {
    type = x.is_bot ? 'Service' : 'Person'
    name = getFullName(x.from)
    if (x.from.id) {
      id = String(x.from.id)
    }
  } else {
    type = x.is_bot ? 'Service' : 'Person'
    name = getFullName(x)
    if (x.id) {
      id = String(x.id)
    }
  }

  return {
    type,
    name,
    id,
  }
};

const origin = (x) => {
  switch (x.forward_origin?.type) {
    case 'user': {
      const user = x.forward_from ?? x.forward_origin.sender_user
      return {
        type: 'Person',
        name: getFullName(user),
        id: String(user.id),
      }
    }
    case 'hidden_user': {
      console.log(x)
      return {
        type: 'Person',
        name: x.forward_sender_name,
      }
    }
    default: {
      return actor(x)
    }
  }
};

const instrument = () => ({
  type: 'Application',
  name: 'Telegram',
});

const sticker = ({sticker}) => ({
  type: 'Object',
  id: 'https://t.me/stickers' + '#' + sticker.set_name,
  name: sticker.set_name,
  content: sticker.emoji,
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
  mediaType: isTextLikeMarkdown(x.text) ? 'text/markdown' : 'text/plain',
});

const voice = (x) => ({
  type: 'Audio',
  url: x.voice?.file?.url,
  duration: x.voice.duration,
  mediaType: x.voice.mime_type,
})

const audio = (x) => ({
  type: 'Audio',
  url: x.audio?.file?.url,
  duration: x.audio.duration,
  mediaType: x.audio.mime_type,
  summary: x.caption,
  name: x.audio.file_name,
});

const thumbnail = (x) => {
  const thumb = x.thumb || x.thumbnail;
  if (thumb) {
    return {
      type: 'Image',
      id: x.file_unique_id,
      url: thumb?.file?.url,
      width: thumb.width,
      height: thumb.height,
    }
  }
  return null
}

const video = (x) => ({
  type: 'Video',
  summary: x.caption,
  url: x.video?.file?.url,
  duration: x.video.duration,
  width: x.video.width,
  height: x.video.height,
  mediaType: x.video.mime_type,
  icon: thumbnail(x.video),
});

const videoNote = (x) => ({
  type: 'Video',
  url: x.video_note?.file?.url,
  duration: x.video_note.duration,
  icon: thumbnail(x.video_note),
});

const document = (x) => ({
  type: 'Document',
  summary: x.caption,
  url: x.document?.file?.url,
  mediaType: x.document.mime_type,
  name: x.document.file_name,
  icon: thumbnail(x.document),
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
    if (Array.isArray(message.entities)) {
      let dub = message.text;
      message.entities.filter(entity => entity.type === 'text_link').reverse().forEach(entity => {
        const text = message.text.substring(entity.offset, entity.offset + entity.length);
        dub = dub.replace(text, `[${text}](${entity.url})`);
      });
      message.text = dub;
    }

    const textHashtags = getHashtagsFromText(message);
    let n;
    if (Array.isArray(message.entities) && message.entities.some(e => e.type === 'bot_command')) {
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
    const photoHQ = message.photo.map(photo => {
      const image = {
        type: 'Image',
        width: photo.width,
        height: photo.height,
        url: photo?.file?.url,
        summary: message?.caption,
      };
      if (captionHashtags.length > 0) {
        image.tag = captionHashtags.map(h => tag(h));
      }
      return image;
    }).reduce((acc, photo) => {
      if (acc.width < photo.width) {
        acc = photo;
      }
      return acc;
    }, {width: 0});
    objects.push(photoHQ);
  }
  if (message.video) {
    objects.push(video(message));
  }
  if (message.document) {
    objects.push(document(message));
  }
  if (message.voice) {
    objects.push(voice(message));
  }
  if (message.location) {
    objects.push(place(message));
  }
  if (message.sticker) {
    objects.push(sticker(message));
  }
  if (message.audio) {
    objects.push(audio(message));
  }
  if (message.video_note) {
    objects.push(videoNote(message));
  }

  return objects;
}

function time(date = Math.round(new Date().getTime() / 1000)) {
  return fromUnixTime(date).toISOString();
}

module.exports = (message) => {
  const context = 'https://www.w3.org/ns/activitystreams';

  if (message.channel_post) {
    return {
      '@context': context,
      type: 'Activity',
      instrument: instrument(),
      object: objects(message.channel_post),
      actor: actor(message.channel_post.chat),
      origin: origin(message),
      startTime: time(message.channel_post.date),
    }
  } else if (message.sender_chat) {
    return {
      '@context': context,
      type: 'Activity',
      instrument: instrument(),
      object: objects(message),
      actor: actor(message.sender_chat),
      origin: origin(message),
      startTime: time(message.date),
    }
  }
  return {
    '@context': context,
    type: 'Activity',
    summary: message.type,
    instrument: instrument(),
    actor: actor(message.from),
    object: objects(message),
    target: actor(message.chat),
    origin: origin(message),
    startTime: time(message.date),
  }
}
