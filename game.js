// Set up canvas and context
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Set canvas dimensions based on device and OS
function setCanvasDimensions() {
    if (window.innerWidth <= 768) {
        canvas.width = 700;
        canvas.height = 700;
    } else if (navigator.userAgent.includes("iPad")) {
        canvas.width = 1300;
        canvas.height = 1100;
    } else if (navigator.userAgent.includes("Mac OS")) {
        canvas.width = 848;
        canvas.height = 848;
    } else {
        canvas.width = 800;
        canvas.height = 800;
    }
}

setCanvasDimensions(); // Initial call to set dimensions

// Game configuration
const box = 20;
const maxWidth = canvas.width;
const maxHeight = canvas.height;
const maxSnakeLength = Math.floor((maxWidth * maxHeight) / (box * box));
let frameRate = 60;
let snakeSpeed = 15;
let timeSinceLastMove = 0;
let direction = "DOWN";
let snake = [{ x: 200, y: 200 }];
let snakeLength = 1;
let gameInterval;

// Apple setup and position reset
let apple = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (maxHeight / box)) * box
};

function resetApplePosition() {
    let appleOnSnake = true;
    while (appleOnSnake) {
        const newX = Math.floor(Math.random() * (canvas.width / box)) * box;
        const newY = Math.floor(Math.random() * (canvas.height / box)) * box;

        if (!snake.some(segment => segment.x === newX && segment.y === newY)) {
            apple.x = newX;
            apple.y = newY;
            appleOnSnake = false;
        }
    }
}

// Swipe handling for touch devices
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && direction !== "LEFT") direction = "RIGHT";
        else if (diffX < 0 && direction !== "RIGHT") direction = "LEFT";
    } else {
        if (diffY > 0 && direction !== "UP") direction = "DOWN";
        else if (diffY < 0 && direction !== "DOWN") direction = "UP";
    }
});

// Resize canvas while maintaining aspect ratio
function resizeCanvas() {
    const aspectRatio = maxWidth / maxHeight;
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    if (newWidth / newHeight < aspectRatio) {
        canvas.width = newWidth;
        canvas.height = newWidth / aspectRatio;
    } else {
        canvas.height = newHeight;
        canvas.width = newHeight * aspectRatio;
    }

    resetApplePosition();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial resize on load

// Start button event listener
document.getElementById("startGame").addEventListener("click", () => {
    document.getElementById("startGame").style.display = "none";
    canvas.style.display = "block";
    startGame();
});

// Game functions
function startGame() {
    document.getElementById("gameTitle").style.display = "none";
    document.getElementById("resetButton").style.display = "block";

    const interval = 1000 / frameRate;
    gameInterval = setInterval(() => {
        timeSinceLastMove += interval;
        if (timeSinceLastMove >= 1000 / snakeSpeed) {
            updateSnakePosition();
            renderGame();
            timeSinceLastMove = 0;
        }
    }, interval);
}

// Snake movement handling
document.addEventListener("keydown", (event) => {
    if (event.key === "w" && direction !== "DOWN") direction = "UP";
    if (event.key === "s" && direction !== "UP") direction = "DOWN";
    if (event.key === "a" && direction !== "RIGHT") direction = "LEFT";
    if (event.key === "d" && direction !== "LEFT") direction = "RIGHT";
});

function snakeCollision(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

function gameOver() {
    clearInterval(gameInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "bold 50px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText("Score: " + snakeLength, canvas.width / 2, canvas.height / 2);
}

// Update snake position and handle game over scenarios
function updateSnakePosition() {
    const head = { x: snake[0].x, y: snake[0].y };

    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= maxHeight || snakeCollision(head.x, head.y)) {
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

    if (snake.length > maxSnakeLength) snake.length = maxSnakeLength;
}

// Render the game visuals
function renderGame() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#004400";
    ctx.lineWidth = 2;
    for (let x = 0; x <= canvas.width; x += box) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += box) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
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

// Reset the game state
function resetGame() {
    clearInterval(gameInterval); // Stop current game loop

    // Reset snake, apple, and score
    snake = [{ x: 200, y: 200 }];
    snakeLength = 1;
    direction = "RIGHT";
    resetApplePosition(); // Reset apple position

    // Clear the canvas and reinitialize the game loop
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startGame(); // Restart the game loop
}

// Leaderboard updates
function updateLeaderboard() {
    fetch('/leaderboard')
    .then(response => response.json())
    .then(data => {
        const leaderboardElement = document.getElementById("leaderboard");
        leaderboardElement.innerHTML = "";
        leaderboardElement.style.font = "18px Courier New";
        leaderboardElement.style.color = "lime";

        data.forEach(entry => {
            const entryElement = document.createElement("div");
            entryElement.textContent = `${entry.username}: ${entry.score}`;
            leaderboardElement.appendChild(entryElement);
        });
    })
    .catch(error => console.error("Failed to update leaderboard:", error));
}

// Refresh leaderboard every 5 seconds
setInterval(updateLeaderboard, 5000);
