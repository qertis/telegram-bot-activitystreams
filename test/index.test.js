import test from 'node:test';
import assert from 'node:assert/strict';
import activitystreams from '../index.js';
import audioFixture from './fixture/audio.cjs';
import botOutputFixture from './fixture/bot_output.cjs';
import channelFixture from './fixture/channel.cjs';
import channelMessageFixture from './fixture/channel-message.cjs';
import commandFixture from './fixture/command.cjs';
import documentFixture from './fixture/document.cjs';
import forwardMessageFixture from './fixture/forward-message.cjs';
import inlineQueryFixture from './fixture/inline-query.cjs';
import locationFixture from './fixture/location.cjs';
import messageFixture from './fixture/message.cjs';
import photoFixture from './fixture/photo.cjs';
import stickerFixture from './fixture/sticker.cjs';
import videoFixture from './fixture/video.cjs';
import voiceFixture from './fixture/voice.cjs';

test('Public Message', async (t) => {
  await t.test('channel-message', () => {
    const commandMessage = channelMessageFixture;
    const activity = activitystreams(commandMessage);
    assert.equal(activity.actor.type, 'Group');
  });
  await t.test('channel', () => {
    const commandMessage = channelFixture;
    const activity = activitystreams(commandMessage);
    assert.equal(activity.actor.type, 'Group');
  });
});

test('Bot Message', async (t) => {
  await t.test('bot_message', () => {
    const commandMessage = botOutputFixture;
    const activity = activitystreams(commandMessage);
    assert.equal(activity.actor.type, 'Service');
    assert.equal(activity.actor.name, 'Dev');
  });
  await t.test('forward_message', () => {
    const commandMessage = forwardMessageFixture;
    const activity = activitystreams(commandMessage);
    assert.equal(activity.origin.type, 'Person');
    assert.equal(activity.origin.name, 'UName');
  });
  await t.test('sticker', () => {
    const commandMessage = stickerFixture;
    const activity = activitystreams(commandMessage);
    assert.equal(activity.object[0].content, '👋');
  });
  await t.test('event', () => {
    const commandMessage = commandFixture;
    const activity = activitystreams(commandMessage);
    const [command] = activity.object;
    assert.equal(command.type, 'Event');
    assert.equal(command.name, '/ping');
  });
  await t.test('document', () => {
    const documentMessage = documentFixture;
    const activity = activitystreams(documentMessage);
    const [command] = activity.object;
    assert.equal(command.type, 'Document');
    assert.equal(command.mediaType, 'image/png');
  });
  await t.test('location', () => {
    const locationMessage = locationFixture;
    const activity = activitystreams(locationMessage);
    const [place] = activity.object;
    assert.equal(place.type, 'Place');
    assert.equal(place.latitude, 34.120768);
    assert.equal(place.longitude, 84.826858);
  });
  await t.test('message', () => {
    const message = messageFixture;
    const activity = activitystreams(message);
    const [object] = activity.object;
    assert.equal(activity.origin.id, '1')
    assert.equal(object.type, 'Note');
    assert.equal(object.content, 'hello world');
  });
  await t.test('photo', () => {
    const photo = photoFixture;
    const activity = activitystreams(photo);
    const [object] = activity.object;
    assert.equal(object.type, 'Image');
    assert.equal(object.width, 35);
    assert.equal(object.height, 79);
  });
  await t.test('video', () => {
    const video = videoFixture;
    const activity = activitystreams(video);
    const [object] = activity.object;
    assert.equal(object.type, 'Video');
    assert.equal(object.width, 480);
    assert.equal(object.height, 368);
    assert.equal(object.summary, 'text caption');
  });
  await t.test('voice', () => {
    const voice = voiceFixture;
    const activity = activitystreams(voice);
    const [object] = activity.object;
    assert.equal(object.type, 'Audio');
    assert.equal(object.mediaType, 'audio/ogg');
  });
  await t.test('audio', () => {
    const voice = audioFixture;
    const activity = activitystreams(voice);
    const [object] = activity.object;
    assert.equal(object.type, 'Audio');
    assert.equal(object.mediaType, 'audio/x-m4a');
  });
  await t.test('inline_query', () => {
    const inlineQuery = inlineQueryFixture;
    const activity = activitystreams(inlineQuery);
    const [object] = activity.object;
    assert.equal(activity.summary, 'inline_query');
    assert.equal(activity.actor.type, 'Person');
    assert.equal(activity.actor.name, 'First');
    assert.equal(activity.target.type, 'Group');
    assert.equal(object.type, 'Question');
    assert.equal(object.content, '');
  });
  await t.test('inline_query_supergroup', () => {
    const inlineQuery = {
      ...inlineQueryFixture,
      chat_type: 'supergroup',
    };
    const activity = activitystreams(inlineQuery);
    assert.equal(activity.target.type, 'Group');
    assert.equal(activity.target.name, 'supergroup');
  });
});
