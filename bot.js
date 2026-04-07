const { Telegraf, Markup } = require('telegraf')

const bot = new Telegraf('8629708298:AAHo4o10gYQKngSegE59gTvEY0WPOlmbOWU')

// ===== ИГРОКИ =====
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

// ===== START =====
bot.start((ctx) => {
  const player = getPlayer(ctx.from.id)
  enemies[ctx.from.id] = createEnemy(player.level)

  ctx.reply(
    `🎮 Добро пожаловать!

Выбери режим игры 👇`,
    Markup.keyboard([
      ['🎮 Играть (Block Blast)'],
      ['⚔️ RPG режим'],
      ['📊 Статус']
    ]).resize()
  )    
})

// ===== WEB APP КНОПКА =====
bot.hears('🎮 Играть (Block Blast)', (ctx) => {
  ctx.reply(
    'Жми играть 👇',
    Markup.inlineKeyboard([
      Markup.button.webApp(
        '▶️ PLAY',
        'https://ТВОЯ-ССЫЛКА.vercel.app'
      )
    ])
  )
})

// ===== RPG START =====
bot.hears('⚔️ RPG режим', (ctx) => {
  const player = getPlayer(ctx.from.id)
  enemies[ctx.from.id] = createEnemy(player.level)

  ctx.reply(
    `🧙 RPG режим

❤️ HP: ${player.hp}
⚔️ Атака: ${player.attack}
⭐ Уровень: ${player.level}`,
    Markup.keyboard([
      ['⚔️ Атаковать'],
      ['❤️ Лечиться', '📊 Статус'],
      ['⬅️ Назад']
    ]).resize()
  )
})

// ===== АТАКА =====
bot.hears('⚔️ Атаковать', (ctx) => {
  const player = getPlayer(ctx.from.id)
  const enemy = enemies[ctx.from.id]

  if (!enemy) return ctx.reply('Нажми RPG режим')

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
      ctx.reply('🎉 УРОВЕНЬ ПОВЫШЕН!')
    }

    enemies[ctx.from.id] = createEnemy(player.level)

    return ctx.reply(`👹 Враг убит!
+10 EXP
+5 золота`)
  }

  player.hp -= enemy.attack

  if (player.hp <= 0) {
    player.hp = player.maxHp
    player.gold = Math.max(0, player.gold - 5)
    enemies[ctx.from.id] = createEnemy(player.level)

    return ctx.reply('💀 Ты умер... -5 золота')
  }

  ctx.reply(`⚔️ Бой

❤️ Твоё HP: ${player.hp}
👹 HP врага: ${enemy.hp}`)
})

// ===== ЛЕЧЕНИЕ =====
bot.hears('❤️ Лечиться', (ctx) => {
  const player = getPlayer(ctx.from.id)

  player.hp += 20
  if (player.hp > player.maxHp) player.hp = player.maxHp

  ctx.reply(`❤️ Ты вылечился: ${player.hp}`)
})

// ===== СТАТУС =====
bot.hears('📊 Статус', (ctx) => {
  const player = getPlayer(ctx.from.id)

  ctx.reply(`📊 Статистика

❤️ ${player.hp}/${player.maxHp}
⚔️ ${player.attack}
⭐ ${player.level}
✨ ${player.exp}/20
💰 ${player.gold}`)
})

// ===== НАЗАД =====
bot.hears('⬅️ Назад', (ctx) => {
  ctx.reply(
    'Главное меню',
    Markup.keyboard([
      ['🎮 Играть (Block Blast)'],
      ['⚔️ RPG режим'],
      ['📊 Статус']
    ]).resize()
  )
})

// ===== ЗАПУСК =====
bot.launch()

console.log('🤖 Бот запущен!')
