let hp = 100;
let attackPower = 10;
let enemyHp = 50;

function update() {
  document.getElementById('hp').innerText = hp;
  document.getElementById('enemy').innerText = enemyHp;
}

function attack() {
  enemyHp -= attackPower;

  if (enemyHp <= 0) {
    enemyHp = 50;
    document.getElementById('log').innerText = "👹 Враг побежден!";
  } else {
    hp -= 5;
    document.getElementById('log').innerText = "⚔️ Бой идет!";
  }

  if (hp <= 0) {
    hp = 100;
    document.getElementById('log').innerText = "💀 Ты умер и возродился!";
  }

  update();
}

function heal() {
  hp += 10;
  if (hp > 100) hp = 100;

  document.getElementById('log').innerText = "❤️ Ты вылечился!";
  update();
}

update();
