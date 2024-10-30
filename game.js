// Set up canvas and context
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
canvas.width = 960;
canvas.height = 960;

// Constants and Game Variables
const box = 20;
const maxWidth = canvas.width;
const maxHeight = canvas.height;

let frameRate = 60;
let snakeSpeed = 15;
let timeSinceLastMove = 0;
let direction = "RIGHT";
let snake = [{ x: 200, y: 200 }];
let snakeLength = 1;
let gameRunning = false;
let directionSet = false;
let gameInterval;

// Apple Position
let apple = {
    x: Math.floor(Math.random() * (maxWidth / box)) * box,
    y: Math.floor(Math.random() * (maxHeight / box)) * box
};

// Reset Apple Position Randomly on Canvas and Check Snake Collision
function resetApplePosition() {
    let appleOnSnake;
    do {
        apple.x = Math.floor(Math.random() * (maxWidth / box)) * box;
        apple.y = Math.floor(Math.random() * (maxHeight / box)) * box;
        appleOnSnake = snake.some(segment => segment.x === apple.x && segment.y === apple.y);
    } while (appleOnSnake);
}

// Start Game Button Click Event
document.getElementById("startGame").addEventListener("click", startGame);

// Start Game and Set Up Interval
function startGame() {
    document.getElementById("startGame").style.display = "none";
    canvas.style.display = "block";
    document.getElementById("gameTitle").style.display = "none";
    document.getElementById("resetButton").style.display = "block";
    gameRunning = true;

    const interval = 1000 / frameRate;
    gameInterval = setInterval(() => {
        timeSinceLastMove += interval;
        if (timeSinceLastMove >= 1000 / snakeSpeed) {
            if (directionSet) updateSnakePosition();
            renderGame();
            timeSinceLastMove = 0;
        }
    }, interval);
}

// Enter Key for Start or Restart Game
document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        gameRunning ? resetGame() : startGame();
    } else if (event.key === "w" && direction !== "DOWN") {
        direction = "UP";
        directionSet = true;
    } else if (event.key === "s" && direction !== "UP") {
        direction = "DOWN";
        directionSet = true;
    } else if (event.key === "a" && direction !== "RIGHT") {
        direction = "LEFT";
        directionSet = true;
    } else if (event.key === "d" && direction !== "LEFT") {
        direction = "RIGHT";
        directionSet = true;
    }
});

// Check for Snake Collision
function snakeCollision(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// End Game and Display Game Over Screen
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "bold 50px Courier New";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);
    ctx.font = "bold 30px Courier New";
    ctx.fillText("Score: " + snakeLength, canvas.width / 2, canvas.height / 2);
    
    if (typeof playerName !== 'undefined') {
        ctx.fillText("Player: " + playerName, canvas.width / 2, canvas.height / 2 + 60);
    }
}

// Update Snake Position and Check for Collision
function updateSnakePosition() {
    const head = { x: snake[0].x, y: snake[0].y };
    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    if (head.x < 0 || head.x >= maxWidth || head.y < 0 || head.y >= maxHeight || snakeCollision(head.x, head.y)) {
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

// Render Game Canvas, Snake, Apple, and Score
function renderGame() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    for (const segment of snake) {
        ctx.fillStyle = "green";
        ctx.fillRect(segment.x, segment.y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, box, box);

    ctx.fillStyle = "green";
    ctx.font = "bold 20px Courier New";
    ctx.fillText("Score: " + snakeLength, 10, 30);
}

// Reset Game Function
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

// Reset Button Event
document.getElementById("resetButton").addEventListener("click", resetGame);

// Update Leaderboard
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
