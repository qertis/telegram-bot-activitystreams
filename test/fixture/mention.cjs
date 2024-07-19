module.exports = {
  message_id: 4,
  from: {
    id: 1,
    is_bot: false,
    first_name: 'First',
    last_name: 'Name',
    language_code: 'en',
    is_premium: true
  },
  chat: {
    id: 1,
    first_name: 'First',
    last_name: 'Name',
    type: 'private'
  },
  date: 1721373798,
  forward_origin: {
    type: 'chat',
    sender_chat: {
      id: -1,
      title: 'Super Group',
      type: 'supergroup'
    },
    date: 1721321637
  },
  forward_from_chat: {
    id: -1,
    title: 'Super Group',
    type: 'supergroup'
  },
  forward_date: 1721321637,
  text: 'Уважаемые участники, добрый день!\n' +
    'Завтра состоится демо-день по направлению «Искусственный интеллект».\n' +
    ' \n' +
    'Время проведения: 16:00-20:00 по Сахалину (08:00-12:00 по Москве).\n' +
    'Вам необходимо до 23:59 18.07.2024 г. прикрепить в рамках вашей заявки на платформе https://baskovsky.ru/:\n' +
    '- презентацию проекта\n' +
    '- дорожную карту развития проекта\n' +
    'Ссылка для онлайн участников: https://www.youtube.com/c/DenisBaskovsky\n' +
    'Очно: Гимназия №1, ауд. 123 (г. Санкт-Петербург)\n' +
    ' \n' +
    'Просьба подключаться к началу защит, т.к. время может измениться, если кто-то из участников не подключится.\n' +
    ' \n' +
    'Контактное лицо для связи:\n' +
    'Иван Иванов, Telegram — https://t.me/ivanov (@ivanov)',
  entities: [
    { offset: 126, length: 66, type: 'bold' },
    {
      offset: 120,
      length: 28,
      type: 'text_link',
      url: 'https://t.me/ivanov'
    },
    { offset: 200, length: 28, type: 'underline' },
    { offset: 300, length: 16, type: 'mention' }
  ],
  link_preview_options: { is_disabled: true }
}
