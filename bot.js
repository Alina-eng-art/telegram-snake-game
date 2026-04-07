const { Telegraf, Markup } = require('telegraf')

// ❗ ВСТАВЬ СВОЙ НОВЫЙ ТОКЕН
const bot = new Telegraf('8629708298:AAGnJCGef_FPr8rzqp_WMyWK8-KDMyhEnAI')

// ===== ГРАВЦІ =====
const players = {}
const enemies = {}

function getPlayer(id) {
  if (!players[id]) {
    players[id] = {
      hp: 100,
      maxHp: 100,
      attack: 10,
      level: 1,
      exp: 0,
      gold: 0
    }
  }
  return players[id]
}

function createEnemy(level) {
  return {
    hp: 30 + level * 10,
    attack: 5 + level * 2
  }
}

// ===== СТАРТ =====
bot.start((ctx) => {
  getPlayer(ctx.from.id)

  ctx.reply(
    `🎮 RPG Game

Обери режим 👇`,
    Markup.keyboard([
      ['🎮 Грати (з персонажем)'],
      ['⚔️ Текстова RPG'],
      ['📊 Статистика']
    ]).resize()
  )
})

// ===== WEBAPP ГРА =====
bot.hears('🎮 Грати (з персонажем)', (ctx) => {
  ctx.reply(
    'Натисни PLAY 👇',
    Markup.inlineKeyboard([
      Markup.button.webApp(
        '▶️ PLAY',
        'https://telegram-rpg-bot.vercel.app' // ← ТВОЯ ССЫЛКА
      )
    ])
  )
})

// ===== ТЕКСТОВА RPG =====
bot.hears('⚔️ Текстова RPG', (ctx) => {
  const player = getPlayer(ctx.from.id)
  enemies[ctx.from.id] = createEnemy(player.level)

  ctx.reply(
    `🧙 RPG режим

❤️ HP: ${player.hp}
⚔️ Атака: ${player.attack}
⭐ Рівень: ${player.level}`,
    Markup.keyboard([
      ['⚔️ Атакувати'],
      ['❤️ Лікуватись', '📊 Статистика'],
      ['⬅️ Назад']
    ]).resize()
  )
})

// ===== АТАКА =====
bot.hears('⚔️ Атакувати', (ctx) => {
  const player = getPlayer(ctx.from.id)
  const enemy = enemies[ctx.from.id]

  if (!enemy) return ctx.reply('Спочатку натисни "Текстова RPG"')

  enemy.hp -= player.attack

  if (enemy.hp <= 0) {
    player.exp += 10
    player.gold += 5

    if (player.exp >= 20) {
      player.level++
      player.exp = 0
      player.attack += 2
      player.maxHp += 10
      player.hp = player.maxHp
      ctx.reply('🎉 Рівень підвищено!')
    }

    enemies[ctx.from.id] = createEnemy(player.level)

    return ctx.reply(`👹 Ворог переможений!
+10 досвіду
+5 золота`)
  }

  player.hp -= enemy.attack

  if (player.hp <= 0) {
    player.hp = player.maxHp
    player.gold = Math.max(0, player.gold - 5)
    enemies[ctx.from.id] = createEnemy(player.level)

    return ctx.reply('💀 Ти загинув... -5 золота')
  }

  ctx.reply(`⚔️ Бій!

❤️ Твоє HP: ${player.hp}
👹 HP ворога: ${enemy.hp}`)
})

// ===== ЛІКУВАННЯ =====
bot.hears('❤️ Лікуватись', (ctx) => {
  const player = getPlayer(ctx.from.id)

  player.hp += 20
  if (player.hp > player.maxHp) player.hp = player.maxHp

  ctx.reply(`❤️ Ти відновив HP: ${player.hp}`)
})

// ===== СТАТИСТИКА =====
bot.hears('📊 Статистика', (ctx) => {
  const player = getPlayer(ctx.from.id)

  ctx.reply(`📊 Твій герой:

❤️ ${player.hp}/${player.maxHp}
⚔️ ${player.attack}
⭐ ${player.level}
✨ ${player.exp}/20
💰 ${player.gold}`)
})

// ===== НАЗАД =====
bot.hears('⬅️ Назад', (ctx) => {
  ctx.reply(
    'Головне меню',
    Markup.keyboard([
      ['🎮 Грати (з персонажем)'],
      ['⚔️ Текстова RPG'],
      ['📊 Статистика']
    ]).resize()
  )
})

// ===== ЗАПУСК =====
bot.launch()
console.log('🤖 RPG бот запущено!')
