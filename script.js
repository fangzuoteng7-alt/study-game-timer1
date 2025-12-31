const studyEl = document.getElementById("study");
const gameEl = document.getElementById("game");
const rateSlider = document.getElementById("rate");
const rateValue = document.getElementById("rateValue");
const streakEl = document.getElementById("streak");
const bonusEl = document.getElementById("bonusRate");
const logEl = document.getElementById("log");

let mode = null;
let timerId = null;
let lastTime = 0;

let studyTime = 0;
let gameTime = 0;

let rate = Number(localStorage.getItem("rate")) || 1;
let streak = 0;
let bonusRate = 0;
let currentStudySession = 0;

let studyLogs = JSON.parse(localStorage.getItem("studyLogs")) || [];

rateSlider.value = rate;
rateValue.textContent = rate.toFixed(1);

rateSlider.oninput = () => {
  rate = Number(rateSlider.value);
  rateValue.textContent = rate.toFixed(1);
  localStorage.setItem("rate", rate);
};

function updateBonus() {
  if (streak >= 5) bonusRate = 0.5;
  else if (streak >= 3) bonusRate = 0.2;
  else if (streak >= 2) bonusRate = 0.1;
  else bonusRate = 0;

  streakEl.textContent = streak;
  bonusEl.textContent = bonusRate.toFixed(1);
}

function update() {
  const now = Date.now();
  const diff = now - lastTime;
  lastTime = now;

  if (mode === "study") {
    studyTime += diff;
    currentStudySession += diff;
    gameTime += diff * (rate + bonusRate);
  }

  if (mode === "game") {
    gameTime -= diff;
    if (gameTime <= 0) {
      gameTime = 0;
      stop();
      alert("ゲーム時間終了！");
    }
  }

  studyEl.textContent = (studyTime / 1000).toFixed(1);
  gameEl.textContent = (gameTime / 1000).toFixed(1);
}

function start(newMode) {
  stop();
  mode = newMode;
  lastTime = Date.now();
  timerId = setInterval(update, 50);
}

function stop() {
  clearInterval(timerId);
  timerId = null;

  if (mode === "study" && currentStudySession >= 60000) {
    streak++;
    updateBonus();

    const now = new Date();
    studyLogs.push({
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      minutes: (currentStudySession / 60000).toFixed(1)
    });

    localStorage.setItem("studyLogs", JSON.stringify(studyLogs));
    renderLogs();
  }

  if (mode === "study") currentStudySession = 0;
  mode = null;
}

function resetAll() {
  stop();
  studyTime = 0;
  gameTime = 0;
  streak = 0;
  bonusRate = 0;
  currentStudySession = 0;
  updateBonus();
  studyEl.textContent = "0.0";
  gameEl.textContent = "0.0";
}

function renderLogs() {
  logEl.innerHTML = "";
  studyLogs.slice().reverse().forEach(l => {
    const li = document.createElement("li");
    li.textContent = `${l.date} ${l.time}｜${l.minutes}分`;
    logEl.appendChild(li);
  });
}

document.getElementById("studyBtn").onclick = () => start("study");
document.getElementById("gameBtn").onclick = () => {
  if (gameTime > 0) start("game");
};
document.getElementById("stopBtn").onclick = stop;
document.getElementById("resetBtn").onclick = resetAll;

renderLogs();
updateBonus();
