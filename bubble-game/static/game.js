let score = 0;
let missed = 0;
let spawned = 0;
let gameDuration = 30;
let timeLeft = gameDuration;

let bubbleInterval = null;
let timerInterval = null;
let gameRunning = false;

const bubbleLifetimeMs = 1200;
const bubbleSpawnRateMs = 700;

const colors = [
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899"
];

function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function updateStats() {
    document.getElementById("score").innerText = score;
    document.getElementById("missed").innerText = missed;
    document.getElementById("spawned").innerText = spawned;
    document.getElementById("time-left").innerText = timeLeft;

    let accuracy = 0;
    if (spawned > 0) {
        accuracy = ((score / spawned) * 100).toFixed(2);
    }

    document.getElementById("accuracy").innerText = `${accuracy}%`;
}

async function sendEvent(eventType) {
    try {
        await fetch("/api/game/event", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                event: eventType
            })
        });
    } catch (error) {
        console.error(`Failed to send event ${eventType}:`, error);
    }
}

async function notifyGameStart() {
    try {
        await fetch("/api/game/start", {
            method: "POST"
        });
    } catch (error) {
        console.error("Failed to notify game start:", error);
    }
}

async function notifyGameEnd() {
    try {
        await fetch("/api/game/end", {
            method: "POST"
        });
    } catch (error) {
        console.error("Failed to notify game end:", error);
    }
}

function clearGameArea() {
    const gameArea = document.getElementById("game-area");
    gameArea.innerHTML = "";
}

function createBubble() {
    if (!gameRunning) {
        return;
    }

    const gameArea = document.getElementById("game-area");
    const bubble = document.createElement("div");

    bubble.className = "bubble";
    bubble.style.background = randomColor();

    const bubbleSize = 60;
    const maxX = gameArea.clientWidth - bubbleSize;
    const maxY = gameArea.clientHeight - bubbleSize;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    const bubbleNumber = spawned + 1;
    bubble.innerText = "●";

    let clicked = false;

    bubble.addEventListener("click", () => {
        if (!gameRunning || clicked) {
            return;
        }

        clicked = true;
        score += 1;
        bubble.remove();
        updateStats();
        sendEvent("click");
    });

    gameArea.appendChild(bubble);

    spawned += 1;
    updateStats();
    sendEvent("spawn");

    setTimeout(() => {
        if (bubble.parentElement && !clicked) {
            bubble.remove();
            missed += 1;
            updateStats();
            sendEvent("miss");
        }
    }, bubbleLifetimeMs);
}

function endGame() {
    gameRunning = false;

    clearInterval(bubbleInterval);
    clearInterval(timerInterval);

    document.getElementById("start-btn").disabled = false;
    document.getElementById("restart-btn").disabled = false;

    const accuracy = spawned > 0 ? ((score / spawned) * 100).toFixed(2) : "0.00";

    document.getElementById("final-spawned").innerText = spawned;
    document.getElementById("final-clicked").innerText = score;
    document.getElementById("final-missed").innerText = missed;
    document.getElementById("final-accuracy").innerText = `${accuracy}%`;

    document.getElementById("result-panel").classList.remove("hidden");

    notifyGameEnd();
}

async function startGame() {
    if (gameRunning) {
        return;
    }

    score = 0;
    missed = 0;
    spawned = 0;
    timeLeft = gameDuration;
    gameRunning = true;

    clearGameArea();
    updateStats();

    document.getElementById("result-panel").classList.add("hidden");
    document.getElementById("start-btn").disabled = true;
    document.getElementById("restart-btn").disabled = true;

    await notifyGameStart();

    createBubble();

    bubbleInterval = setInterval(() => {
        createBubble();
    }, bubbleSpawnRateMs);

    timerInterval = setInterval(() => {
        timeLeft -= 1;
        updateStats();

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function restartGame() {
    clearGameArea();
    document.getElementById("result-panel").classList.add("hidden");
    startGame();
}

updateStats();
