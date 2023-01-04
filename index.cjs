// file object params used - see https://github.com/qertis/telegram-bot-express
const dateFns = require('date-fns');

const person = (x) => ({
  type: 'Person',
  name: x.first_name + ' ' + x.last_name,
  id: String(x.id),
});

const note = (x) => ({
  type: 'Note',
  content: x.text,
});

const audio = (x) => ({
  type: 'Audio',
  url: x.voice.file ?? x.voice.file.url,
  duration: x.voice.duration,
  mediaType: x.voice.mime_type,
});

const video = (x) => ({
  type: 'Video',
  summary: x.caption ?? x.caption,
  url: x.video.file ?? x.video.file.url,
  duration: x.video.duration,
  width: x.video.width,
  height: x.video.height,
  mediaType: x.video.mime_type,
  icon: x.video.thumb.file ?? {
    type: 'Image',
    url: x.video.thumb.file.url,
    width: x.video.thumb.width,
    height: x.video.thumb.height,
  },
});

const document = (x) => ({
  type: 'Document',
  summary: x.caption ?? x.caption,
  url: x.document.file ?? x.video.document.url,
  mediaType: x.document.mime_type,
  name: x.document.file_name,
  icon: x.document.thumb.file ?? {
    type: 'Image',
    url: x.document.thumb.file.url,
    width: x.document.thumb.width,
    height: x.document.thumb.height,
  },
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

module.exports = (message) => {
  const objects = [];

  if (message.text && Array.isArray(message.entities) && message.entities.length > 0) {
    objects.push(event(message));
  } else if (message.text) {
    objects.push(note(message));
  }

  if (message.photo) {
    message.photo.forEach(photo => {
      objects.push({
        type: 'Image',
        width: photo.width,
        height: photo.height,
        url: photo.file ?? photo.file.url,
        summary: message.caption ?? message.caption,
      });
    });
  }
  if (message.video) {
    objects.push(video(message));
  }
  if (message.document) {
    objects.push(document(message));
  }
  if (message.audio) {
    objects.push(audio(message));
  }
  if (message.location) {
    objects.push(place(message));
  }

  return {
    '@context': 'https://www.w3.org/ns/activitystreams',
    type: 'Activity',
    summary: message.type,
    instrument: {
      type: 'Service',
      name: 'telegram',
    },
    actor: person(message.from),
    object: objects,
    target: person(message.chat),
    origin: {
      type: 'Object',
      name: 'Telegram Bot Message',
      id: String(message.message_id),
    },
    startTime: dateFns.fromUnixTime(message.date).toISOString(),
    endTime: dateFns.fromUnixTime(Math.round(new Date().getTime() / 1000)).toISOString(),
  }
}