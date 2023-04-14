const test = require('node:test');
const assert = require('node:assert/strict');
const activitystreams = require('../index.cjs');

test('Public Message', async (t) => {
    await t.test('channel-message', () => {
        const commandMessage = require('./fixture/channel-message.cjs');
        const activity = activitystreams(commandMessage);
        assert.equal(activity.actor.type, 'Group');
    });
});

test('Bot Message', async (t) => {
    await t.test('event', () => {
        const commandMessage = require('./fixture/command.cjs');
        const activity = activitystreams(commandMessage);
        const [command] = activity.object;

        assert.equal(command.type, 'Event');
        assert.equal(command.name, '/ping');
    });

    await t.test('document', () => {
        const documentMessage = require('./fixture/document.cjs');
        const activity = activitystreams(documentMessage);
        const [command] = activity.object;

        assert.equal(command.type, 'Document');
        assert.equal(command.mediaType, 'image/png');
    });

    await t.test('location', () => {
        const locationMessage = require('./fixture/location.cjs');
        const activity = activitystreams(locationMessage);
        const [place] = activity.object;

        assert.equal(place.type, 'Place');
        assert.equal(place.latitude, 34.120768);
        assert.equal(place.longitude, 84.826858);
    });

    await t.test('message', () => {
        const message = require('./fixture/message.cjs');
        const activity = activitystreams(message);
        const [object] = activity.object;

        assert.equal(activity.origin.id, '4')
        assert.equal(object.type, 'Note');
        assert.equal(object.content, 'hello world');
    });

    await t.test('photo', () => {
        const photo = require('./fixture/photo.cjs');
        const activity = activitystreams(photo);
        const [object] = activity.object;

        assert.equal(object.type, 'Image');
        assert.equal(object.width, 35);
        assert.equal(object.height, 79);
    });

    await t.test('video', () => {
        const video = require('./fixture/video.cjs');
        const activity = activitystreams(video);
        const [object] = activity.object;

        assert.equal(object.type, 'Video');
        assert.equal(object.width, 480);
        assert.equal(object.height, 368);
        assert.equal(object.summary, 'text caption');
    });

    await t.test('voice', () => {
        const voice = require('./fixture/voice.cjs');
        const activity = activitystreams(voice);
        const [object] = activity.object;

        assert.equal(object.type, 'Audio');
        assert.equal(object.mediaType, 'audio/ogg');
    });
});
