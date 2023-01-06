module.exports = {
  message_id: 1,
  from: {
    id: 2,
    is_bot: false,
    first_name: 'First',
    last_name: 'Second',
    language_code: 'en'
  },
  chat: {
    id: 2,
    first_name: 'First',
    last_name: 'Second',
    type: 'private'
  },
  date: 1672852301,
  text: '/ping',
  entities: [ { offset: 0, length: 5, type: 'bot_command' } ],
  type: 'message'
}
