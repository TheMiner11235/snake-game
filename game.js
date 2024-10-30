let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Set canvas dimensions to 960x960
canvas.width = 800;
canvas.height = 800;

// Snake segment size
const box = 20;

// Set dimensions for a 40x48 grid (960x960)
const maxWidth = canvas.width;
const maxHeight = canvas.height;

// Viewport dimensions (same as canvas for full screen view)
const viewportWidth = 960;
const viewportHeight = 960;

let frameRate = 60;
let snakeSpeed = 15;
let timeSinceLastMove = 0;

let direction = "RIGHT";
let snake = [{ x: 200, y: 200 }];
let snakeLength = 1;

let apple = {
    x: Math.floor(Math.random() * (maxWidth / box)) * box,
    y: Math.floor(Math.random() * (maxHeight / box)) * box
};

// Function to reset the apple position randomly within the canvas
function resetApplePosition() {
    let appleOnSnake = true;
    while (appleOnSnake) {
        apple = {
            x: Math.floor(Math.random() * (maxWidth / box)) * box,
            y: Math.floor(Math.random() * (maxHeight / box)) * box
        };
        appleOnSnake = snake.some(segment => segment.x === apple.x && segment.y === apple.y);
    }
}

document.getElementById("startGame").addEventListener("click", () => {
    document.getElementById("startGame").style.display = "none";
    canvas.style.display = "block";
    startGame();
});

let directionSet = false;
let gameInterval;

function startGame() {
    document.getElementById("gameTitle").style.display = "none";
    document.getElementById("resetButton").style.display = "block";

    const interval = 1000 / frameRate;
    gameInterval = setInterval(() => {
        timeSinceLastMove += interval;
        if (timeSinceLastMove >= 1000 / snakeSpeed) {
            if (directionSet) {
                updateSnakePosition();
            }
            renderGame();
            timeSinceLastMove = 0;
        }
    }, interval);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "w" && direction !== "DOWN") direction = "UP";
    if (event.key === "s" && direction !== "UP") direction = "DOWN";
    if (event.key === "a" && direction !== "RIGHT") direction = "LEFT";
    if (event.key === "d" && direction !== "LEFT") direction = "RIGHT";
    directionSet = true;
});

function snakeCollision(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

function gameOver() {
    clearInterval(gameInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "bold 50px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText("Score: " + snakeLength, canvas.width / 2, canvas.height / 2);
    if (playerName) {
        ctx.fillText("Player: " + playerName, canvas.width / 2, canvas.height / 2 + 40);
    }
}

function updateSnakePosition() {
    const head = { x: snake[0].x, y: snake[0].y };
    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    if (head.x < 0 || head.x >= maxWidth || head.y < 0 || head.y >= maxHeight) {
        gameOver();
        return;
    }

    if (snakeCollision(head.x, head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === apple.x && head.y === apple.y) {
        snakeLength++;
        resetApplePosition();
    } else {
        snake.pop();
    }
}

function renderGame() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines with thicker strokes
    ctx.strokeStyle = "#004400";
    ctx.lineWidth = 2;
    for (let x = 0; x <= maxWidth; x += box) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, maxHeight);
        ctx.stroke();
    }
    for (let y = 0; y <= maxHeight; y += box) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(maxWidth, y);
        ctx.stroke();
    }

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = "green";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, box, box);

    ctx.fillStyle = "green";
    ctx.font = "bold 20px Courier New";
    ctx.fillText("Score: " + snakeLength, 10, 30);
}

function resetGame() {
    clearInterval(gameInterval);
    snake = [{ x: 200, y: 200 }];
    snakeLength = 1;
    direction = "RIGHT";
    directionSet = false;

    resetApplePosition();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startGame();
}

document.getElementById("resetButton").addEventListener("click", resetGame);

function updateLeaderboard() {
    fetch('/leaderboard')
        .then(response => response.json())
        .then(data => {
            const leaderboardElement = document.getElementById("leaderboard");
            leaderboardElement.innerHTML = "";
            data.forEach(entry => {
                const entryElement = document.createElement("div");
                entryElement.textContent = `${entry.username}: ${entry.score}`;
                leaderboardElement.appendChild(entryElement);
            });
        })
        .catch(error => console.error('Error fetching leaderboard:', error));
}

setInterval(updateLeaderboard, 5000);
