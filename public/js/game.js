// ========================================
// DEVOPS ADVENTURE - GAME ENGINE
// ========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const coinElement = document.getElementById("coinCount");
const livesElement = document.getElementById("lives");

const overlay = document.getElementById("gameOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMessage = document.getElementById("overlayMessage");
const startButton = document.getElementById("startButton");

const WIDTH = 960;
const HEIGHT = 540;
const WORLD_WIDTH = 2200;

let score = 0;
let coinsCollected = 0;
let lives = 3;
let gameStarted = false;
let gameEnded = false;
let cameraX = 0;
let animationId = null;

const player = {
    x: 60, y: 380, width: 32, height: 44,
    velocityX: 0, velocityY: 0,
    speed: 4, jumpPower: 13, gravity: 0.6,
    grounded: false, invincible: 0
};

const keys = { left: false, right: false, jump: false };

// ========================================
// INPUT: KEYBOARD
// ========================================

document.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) {
        event.preventDefault();
    }

    if (event.code === "ArrowLeft" || event.code === "KeyA") keys.left = true;
    if (event.code === "ArrowRight" || event.code === "KeyD") keys.right = true;

    if (event.code === "ArrowUp" || event.code === "Space" || event.code === "KeyW") {
        if (!keys.jump && gameStarted && !gameEnded) jump();
        keys.jump = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft" || event.code === "KeyA") keys.left = false;
    if (event.code === "ArrowRight" || event.code === "KeyD") keys.right = false;
    if (event.code === "ArrowUp" || event.code === "Space" || event.code === "KeyW") {
        keys.jump = false;
    }
});

// ========================================
// INPUT: MOBILE BUTTONS
// ========================================

function setupMobileButton(id, key) {
    const button = document.getElementById(id);

    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();

        if (key === "jump") {
            if (!keys.jump && gameStarted && !gameEnded) jump();
            keys.jump = true;
        } else {
            keys[key] = true;
        }
    });

    const release = () => { keys[key] = false; };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointerleave", release);
    button.addEventListener("pointercancel", release);
}

setupMobileButton("leftButton", "left");
setupMobileButton("rightButton", "right");
setupMobileButton("jumpButton", "jump");

// ========================================
// LEVEL DATA
// ========================================

const platforms = [
    { x: 0, y: 480, width: 500, height: 60 },
    { x: 550, y: 480, width: 400, height: 60 },
    { x: 1000, y: 480, width: 500, height: 60 },
    { x: 1550, y: 480, width: 650, height: 60 },
    { x: 220, y: 390, width: 120, height: 20 },
    { x: 430, y: 320, width: 120, height: 20 },
    { x: 680, y: 390, width: 140, height: 20 },
    { x: 930, y: 330, width: 130, height: 20 },
    { x: 1200, y: 390, width: 140, height: 20 },
    { x: 1450, y: 310, width: 140, height: 20 },
    { x: 1750, y: 390, width: 150, height: 20 }
];

const initialCoins = [
    { x: 250, y: 350 }, { x: 300, y: 350 },
    { x: 460, y: 280 }, { x: 510, y: 280 },
    { x: 720, y: 350 }, { x: 770, y: 350 },
    { x: 970, y: 290 }, { x: 1020, y: 290 },
    { x: 1250, y: 350 }, { x: 1500, y: 270 },
    { x: 1550, y: 270 }, { x: 1800, y: 350 },
    { x: 1900, y: 440 }
];

let coins = [];

const initialEnemies = [
    { x: 370, y: 448, start: 350, end: 470, speed: 1.5, width: 30, height: 32, alive: true },
    { x: 800, y: 448, start: 760, end: 900, speed: 1.8, width: 30, height: 32, alive: true },
    { x: 1300, y: 448, start: 1200, end: 1430, speed: 2, width: 30, height: 32, alive: true }
];

let enemies = [];

const goal = { x: 2110, y: 300, width: 30, height: 180 };

// ========================================
// GAME MECHANICS
// ========================================

function jump() {
    if (player.grounded) {
        player.velocityY = -player.jumpPower;
        player.grounded = false;
    }
}

function collision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function updatePlayer() {
    player.velocityX = 0;
    if (keys.left) player.velocityX = -player.speed;
    if (keys.right) player.velocityX = player.speed;

    player.x += player.velocityX;
    player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x));

    const previousBottom = player.y + player.height;
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    player.grounded = false;

    platforms.forEach((platform) => {
        const horizontalCollision =
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width;

        const newBottom = player.y + player.height;

        if (
            horizontalCollision &&
            player.velocityY >= 0 &&
            previousBottom <= platform.y &&
            newBottom >= platform.y
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.grounded = true;
        }
    });

    if (player.y > HEIGHT + 100) loseLife();
    if (player.invincible > 0) player.invincible--;
}

function updateEnemies() {
    enemies.forEach((enemy) => {
        if (!enemy.alive) return;

        enemy.x += enemy.speed;

        if (enemy.x <= enemy.start || enemy.x + enemy.width >= enemy.end) {
            enemy.speed *= -1;
        }

        if (player.invincible === 0 && collision(player, enemy)) {
            if (player.velocityY > 0 && player.y + player.height - enemy.y < 18) {
                enemy.alive = false;
                player.velocityY = -8;
                score += 100;
                scoreElement.textContent = score;
            } else {
                loseLife();
            }
        }
    });
}

function updateCoins() {
    coins.forEach((coin) => {
        if (coin.collected) return;

        const coinBox = { x: coin.x - 10, y: coin.y - 10, width: 20, height: 20 };

        if (collision(player, coinBox)) {
            coin.collected = true;
            coinsCollected++;
            score += 50;
            scoreElement.textContent = score;
            coinElement.textContent = coinsCollected;
        }
    });
}

function loseLife() {
    if (player.invincible > 0 || gameEnded) return;

    lives--;
    livesElement.textContent = lives > 0 ? "❤️ ".repeat(lives).trim() : "0";

    if (lives <= 0) {
        endGame("GAME OVER", "You ran out of lives! Try again.");
        return;
    }

    player.x = Math.max(60, cameraX + 60);
    player.y = 380;
    player.velocityX = 0;
    player.velocityY = 0;
    player.invincible = 100;
}

function updateCamera() {
    cameraX = player.x - WIDTH / 2;
    cameraX = Math.max(0, Math.min(WORLD_WIDTH - WIDTH, cameraX));
}

// ========================================
// RENDERING
// ========================================

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, "#55c9f5");
    gradient.addColorStop(1, "#b7edff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#ffdf59";
    ctx.beginPath();
    ctx.arc(820, 85, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 6; i++) {
        const x = (i * 250 - cameraX * 0.3) % 1100;
        const cloudX = x < -100 ? x + 1100 : x;
        const cloudY = 100 + (i % 3) * 35;

        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 25, 0, Math.PI * 2);
        ctx.arc(cloudX + 30, cloudY - 10, 30, 0, Math.PI * 2);
        ctx.arc(cloudX + 60, cloudY, 25, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = "#76cf71";
    for (let i = 0; i < 8; i++) {
        const x = i * 350 - cameraX * 0.5;
        ctx.beginPath();
        ctx.arc(x, 510, 150, Math.PI, 0);
        ctx.fill();
    }
}

function drawPlatforms() {
    platforms.forEach((platform) => {
        ctx.fillStyle = "#8b4b25";
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.fillStyle = "#39b54a";
        ctx.fillRect(platform.x, platform.y, platform.width, 8);
        ctx.strokeStyle = "#5c2e18";
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawPlayer() {
    if (player.invincible > 0 && Math.floor(player.invincible / 6) % 2 === 0) return;

    ctx.fillStyle = "#e84141";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = "#ffd6a5";
    ctx.fillRect(player.x + 7, player.y + 8, 19, 17);

    ctx.fillStyle = "#111827";
    ctx.fillRect(player.x + 21, player.y + 13, 3, 4);

    ctx.fillStyle = "#b91c1c";
    ctx.fillRect(player.x - 3, player.y, 38, 9);

    ctx.fillStyle = "#274c9b";
    ctx.fillRect(player.x + 3, player.y + 34, 12, 10);
    ctx.fillRect(player.x + 18, player.y + 34, 12, 10);
}

function drawCoins() {
    coins.forEach((coin) => {
        if (coin.collected) return;

        ctx.fillStyle = "#ffcf33";
        ctx.beginPath();
        ctx.ellipse(coin.x, coin.y, 9, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#d18a00";
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function drawEnemies() {
    enemies.forEach((enemy) => {
        if (!enemy.alive) return;

        ctx.fillStyle = "#8b36b5";
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(enemy.x + 6, enemy.y + 8, 6, 7);
        ctx.fillRect(enemy.x + 19, enemy.y + 8, 6, 7);

        ctx.fillStyle = "#111827";
        ctx.fillRect(enemy.x + 8, enemy.y + 10, 3, 4);
        ctx.fillRect(enemy.x + 21, enemy.y + 10, 3, 4);
    });
}

function drawGoal() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(goal.x, goal.y, 6, goal.height);

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.moveTo(goal.x + 6, goal.y);
    ctx.lineTo(goal.x + 65, goal.y + 20);
    ctx.lineTo(goal.x + 6, goal.y + 40);
    ctx.closePath();
    ctx.fill();
}

function render() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawBackground();

    ctx.save();
    ctx.translate(-cameraX, 0);
    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawGoal();
    drawPlayer();
    ctx.restore();
}

// ========================================
// GAME FLOW
// ========================================

function endGame(title, message) {
    gameEnded = true;
    gameStarted = false;
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    startButton.textContent = "PLAY AGAIN";
    overlay.classList.remove("hidden");
}

function checkWin() {
    if (
        player.x + player.width >= goal.x &&
        player.y + player.height > goal.y
    ) {
        score += 500;
        scoreElement.textContent = score;
        endGame("YOU WIN!", "Congratulations! You completed DevOps Adventure!");
    }
}

function update() {
    if (!gameStarted || gameEnded) return;
    updatePlayer();
    updateEnemies();
    updateCoins();
    updateCamera();
    checkWin();
}

function gameLoop() {
    update();
    render();

    if (gameStarted && !gameEnded) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    if (animationId) cancelAnimationFrame(animationId);

    score = 0;
    coinsCollected = 0;
    lives = 3;
    cameraX = 0;

    player.x = 60;
    player.y = 380;
    player.velocityX = 0;
    player.velocityY = 0;
    player.grounded = false;
    player.invincible = 0;

    coins = initialCoins.map((coin) => ({ ...coin, collected: false }));
    enemies = initialEnemies.map((enemy) => ({ ...enemy, alive: true }));

    scoreElement.textContent = score;
    coinElement.textContent = coinsCollected;
    livesElement.textContent = "❤️ ❤️ ❤️";

    keys.left = false;
    keys.right = false;
    keys.jump = false;

    gameEnded = false;
    gameStarted = true;
    overlay.classList.add("hidden");

    gameLoop();
}

startButton.addEventListener("click", startGame);

// Draw the initial game scene behind the start overlay.
render();
