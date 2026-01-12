// ===== ELEMENTS =====
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const withdrawBtn = document.getElementById("withdrawBtn");
const historyBtn = document.getElementById("historyBtn");
const historyBox = document.getElementById("historyBox");
const coinsEl = document.getElementById("coins");
const watchAdBtn = document.getElementById("watchAdBtn");

// ===== MONETAG LINK =====
const monetagLink = "https://otieu.com/4/10444354";

// ===== WHEEL SETUP =====
const center = 150;
const radius = 150;

const colors = [
  "#00c3ff",
  "#ff2d95",
  "#8e2de2",
  "#ff9800",
  "#ff0000",
  "#b000b5",
  "#00c853",
  "#ffd600"
];

const rewards = [5, 10, 5, 10, 20, 5, 10, 50];

let startAngle = 0;
let isSpinning = false;

// ===== COINS =====
let coins = parseInt(localStorage.getItem("coins") || "0");
coinsEl.innerText = coins;

// ===== ADS & SPINS =====
let extraSpins = parseInt(localStorage.getItem("extraSpins") || "0");
let adsWatched = parseInt(localStorage.getItem("adsWatched") || "0");

// ===== DAILY RESET =====
const todayStr = new Date().toDateString();
let savedDate = localStorage.getItem("spinDate");
let spinsToday = parseInt(localStorage.getItem("spinsToday") || "0");

if (savedDate !== todayStr) {
  localStorage.setItem("spinDate", todayStr);
  localStorage.setItem("spinsToday", 0);
  localStorage.setItem("adsWatched", 0);
  localStorage.setItem("taskSpins", 0);
  localStorage.setItem("taskDone", "no");

  spinsToday = 0;
  adsWatched = 0;
}

// ===== DAILY TASK =====
let taskSpins = parseInt(localStorage.getItem("taskSpins") || "0");
let taskDone = localStorage.getItem("taskDone") === "yes";

// ===== PROGRESS =====
function updateProgress() {
  const target = 300;
  const percent = Math.min((coins / target) * 100, 100);
  document.getElementById("progressFill").style.width = percent + "%";
  document.getElementById("progressText").innerText =
    "You are " + Math.floor(percent) + "% close to ₹5 reward";
}

// ===== DRAW WHEEL =====
function drawWheel() {
  const slice = (2 * Math.PI) / rewards.length;
  ctx.clearRect(0, 0, 300, 300);

  for (let i = 0; i < rewards.length; i++) {
    ctx.beginPath();
    ctx.fillStyle = colors[i];
    ctx.moveTo(center, center);
    ctx.arc(
      center,
      center,
      radius,
      startAngle + i * slice,
      startAngle + (i + 1) * slice
    );
    ctx.fill();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + i * slice + slice / 2);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "right";
    ctx.fillText(rewards[i], radius - 15, 6);
    ctx.restore();
  }
}

// ===== SPIN =====
function spinWheel() {
  if (isSpinning) return;

  if (spinsToday >= 5 && extraSpins <= 0) {
    alert("❌ Daily spin limit reached");
    return;
  }

  isSpinning = true;

  if (extraSpins > 0) {
    extraSpins--;
    localStorage.setItem("extraSpins", extraSpins);
  } else {
    spinsToday++;
    localStorage.setItem("spinsToday", spinsToday);
  }

  let spinAngle = Math.random() * 2000 + 3000;
  let time = 0;

  const interval = setInterval(() => {
    time += 30;
    startAngle += (spinAngle * Math.PI / 180) / 30;
    drawWheel();

    if (time >= 3000) {
      clearInterval(interval);
      isSpinning = false;

      const index = Math.floor(
        (rewards.length -
          ((startAngle / (2 * Math.PI)) % rewards.length)) %
          rewards.length
      );

      let reward = rewards[index];

      if (new Date().getDay() === 0) reward += 5; // Sunday bonus

      coins += reward;
      taskSpins++;

      localStorage.setItem("coins", coins);
      localStorage.setItem("taskSpins", taskSpins);

      if (taskSpins >= 3 && !taskDone) {
        coins += 10;
        taskDone = true;
        localStorage.setItem("taskDone", "yes");
        alert("🎉 Daily task completed +10");
      }

      coinsEl.innerText = coins;
      updateProgress();

      alert("🎉 You won " + reward + " points");
    }
  }, 30);
}

spinBtn.onclick = spinWheel;

// ===== WATCH AD =====
watchAdBtn.onclick = () => {
  if (adsWatched >= 3) {
    alert("❌ Daily ad limit reached"); 
    return;
  }

  window.open(monetagLink, "_blank");

  setTimeout(() => {
    extraSpins += 3;
    adsWatched++;

    localStorage.setItem("extraSpins", extraSpins);
    localStorage.setItem("adsWatched", adsWatched);

    alert("🎉 Ad watched! +3 Extra Spins added");
  }, 8000);
};

// ===== WITHDRAW =====
withdrawBtn.onclick = () => {
  let last = localStorage.getItem("lastWithdraw");
  let now = new Date();

  if (last && (now - new Date(last)) / (1000 * 60 * 60 * 24) < 7) {
    alert("❌ Withdraw once per week only");
    return;
  }

  if (coins < 300) {
    alert("❌ Minimum 300 points required");
    return;
  }

  let rewardText = "";
  if (coins >= 5000) {
    rewardText = "Big Reward";
    coins -= 5000;
  } else if (coins >= 1500) {
    rewardText = "Zomato Coupon";
    coins -= 1500;
  } else if (coins >= 1000) {
    rewardText = "₹20";
    coins -= 1000;
  } else if (coins >= 500) {
    rewardText = "Zomato Coupon";
    coins -= 500;
  } else {
    rewardText = "₹5";
    coins -= 300;
  }

  let history = JSON.parse(localStorage.getItem("withdrawHistory")) || [];
  history.unshift(new Date().toLocaleDateString() + " - " + rewardText);
  localStorage.setItem("withdrawHistory", JSON.stringify(history));

  localStorage.setItem("coins", coins);
  localStorage.setItem("lastWithdraw", now.toISOString());
  coinsEl.innerText = coins;

  loadHistory();
  updateProgress();
  alert("✅ Withdraw successful");
};

// ===== HISTORY =====
function loadHistory() {
  let history = JSON.parse(localStorage.getItem("withdrawHistory")) || [];
  let list = document.getElementById("historyList");
  list.innerHTML = "";

  if (history.length === 0) {
    list.innerHTML = "<li>No withdrawals yet</li>";
    return;
  }

  history.forEach(h => {
    let li = document.createElement("li");
    li.innerText = h;
    list.appendChild(li);
  });
}

historyBtn.onclick = () => {
  historyBox.style.display =
    historyBox.style.display === "none" ? "block" : "none";
  loadHistory();
};

// ===== DAILY LOGIN BONUS =====
const loginToday = new Date().toDateString();
let lastLogin = localStorage.getItem("lastLogin");
let loginStreak = parseInt(localStorage.getItem("loginStreak") || "0");

if (lastLogin !== loginToday) {
  loginStreak++;

  let bonus = 5;
  if (loginStreak === 7) bonus = 20;
  if (loginStreak === 15) bonus = 50;
  if (loginStreak === 30) bonus = 200;

  coins += bonus;

  localStorage.setItem("coins", coins);
  localStorage.setItem("loginStreak", loginStreak);
  localStorage.setItem("lastLogin", loginToday);

  coinsEl.innerText = coins;

  alert(
    loginStreak === 30
      ? "🎉 30 Days Login! You earned 200 bonus points!"
      : `🔥 Daily Login Bonus: +${bonus} points`
  );
}

// ===== INIT =====
drawWheel();
updateProgress();
loadHistory();
