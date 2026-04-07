const { Telegraf, Markup } = require('telegraf')

const bot = new Telegraf('8629708298:AAGnJCGef_FPr8rzqp_WMyWK8-KDMyhEnAI')

bot.start((ctx) => {
  ctx.reply(
    '🐍 Snake PvE',
    Markup.inlineKeyboard([
      Markup.button.webApp(
        '▶️ Грати',
        'https://telegram-snake-game-eight.vercel.app'
      )
    ])
  )
})

bot.launch()
console.log('🤖 Snake бот запущено!')
