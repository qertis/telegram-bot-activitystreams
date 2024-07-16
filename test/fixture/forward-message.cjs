module.exports = {
  message_id: 999,
  from: {
    id: 1,
    is_bot: false,
    first_name: 'First',
    last_name: 'Last',
    language_code: 'ru',
    is_premium: false
  },
  chat: {
    id: 1,
    first_name: 'First',
    last_name: 'Last',
    type: 'private'
  },
  date: 1721099628,
  // for hidden user:
  // forward_origin: { type: 'hidden_user', sender_user_name: 'UName', date: 1721067892 },
  // for visible user:
  forward_origin: {
    type: 'user',
    sender_user: {
      id: 2,
      is_bot: false,
      first_name: 'UName',
      username: 'Name',
      is_premium: true
    },
    date: 1721070620
  },
  forward_sender_name: 'UName',
  forward_from: {
    id: 2,
    is_bot: false,
    first_name: 'UName',
    username: 'Name',
    is_premium: true
  },
  forward_date: 1721067892,
  text: 'Text'
}
