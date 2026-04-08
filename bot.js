const { Telegraf, Markup } = require('telegraf');

// 🔑 ВСТАВЬ СВОЙ ТОКЕН
const bot = new Telegraf('8629708298:AAH5ZSfOgwRhi6wqGelgr3oiOXw2VRtf1EM');

// 🔥 ТВОЙ САЙТ (ВАЖНО — HTTPS)
const WEB_APP_URL = 'https://telegram-snake-game-eight.vercel.app';

// 🚀 СТАРТ
bot.start(async (ctx) => {
  try {
    await ctx.reply(
      `🐍 Snake Game\n\nНажми кнопку ниже, чтобы играть 👇`,
      Markup.inlineKeyboard([
        [
          Markup.button.webApp(
            '🎮 Играть',
            WEB_APP_URL
          )
        ],
        [
          Markup.button.callback('🏆 Рейтинг', 'rating')
        ]
      ])
    );
  } catch (err) {
    console.log('❌ Ошибка /start:', err);
  }
});

// 🏆 КНОПКА РЕЙТИНГА
bot.action('rating', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.reply('Открой игру → там есть рейтинг 😎');
  } catch (err) {
    console.log('❌ Ошибка rating:', err);
  }
});

// ❌ ЛОВИМ ВСЕ ОШИБКИ
bot.catch((err) => {
  console.log('❌ Глобальная ошибка:', err);
});

// 🛑 ОСТАНОВКА
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// ▶️ ЗАПУСК
bot.launch();

console.log('🤖 Snake бот запущен!');
