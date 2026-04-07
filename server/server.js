const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// 📁 файл базы
const DB_FILE = 'scores.json';

// если нет файла → создаём
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// 🏠 главная страница
app.get('/', (req, res) => {
  res.send('🐍 Snake Server работает!');
});

// 🏆 получить топ игроков
app.get('/scores', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB_FILE));
  
  const top = data
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  res.json(top);
});

// 💾 сохранить результат
app.post('/score', (req, res) => {
  const { name, score } = req.body;

  if (!name || !score) {
    return res.status(400).json({ error: 'bad data' });
  }

  const data = JSON.parse(fs.readFileSync(DB_FILE));

  data.push({
    name,
    score,
    date: Date.now()
  });

  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

  res.json({ success: true });
});

// 🚀 запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server started: http://localhost:${PORT}`);
});
