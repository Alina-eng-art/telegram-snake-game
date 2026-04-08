const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 ВСТАВЬ СЮДА СВОЮ ССЫЛКУ ИЗ MONGODB
const MONGO_URI = "mongodb+srv://alina:12345678910@cluster0.d1si0kt.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB подключена"))
  .catch(err => console.log("❌ Ошибка MongoDB:", err));

// 📊 СХЕМА ИГРОКА
const scoreSchema = new mongoose.Schema({
  user_id: { type: String, unique: true },
  name: String,
  score: Number,
  avatar: String
});

const Score = mongoose.model("Score", scoreSchema);

// 💾 СОХРАНЕНИЕ СКОРА (ТОЛЬКО ЛУЧШИЙ)
app.post("/score", async (req, res) => {
  try {
    const { user_id, name, score, avatar } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "No user_id" });
    }

    let player = await Score.findOne({ user_id });

    if (!player) {
      player = new Score({
        user_id,
        name,
        score,
        avatar
      });
    } else {
      // 🔥 сохраняем только лучший результат
      if (score > player.score) {
        player.score = score;
      }
    }

    await player.save();

    res.json({ success: true });
  } catch (err) {
    console.log("❌ Ошибка /score:", err);
    res.sendStatus(500);
  }
});

// 🏆 ПОЛУЧИТЬ ТОП
app.get("/scores", async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ score: -1 })
      .limit(50);

    res.json(scores);
  } catch (err) {
    console.log("❌ Ошибка /scores:", err);
    res.sendStatus(500);
  }
});

// ❤️ ПРОВЕРКА СЕРВЕРА
app.get("/", (req, res) => {
  res.send("🚀 Snake server работает");
});

// 🚀 ЗАПУСК
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🔥 Server started on port ${PORT}`);
});
