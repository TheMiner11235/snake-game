// Select game elements
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Game settings
const baseWidth = 800;
const baseHeight = 800;
const box = 20;
const frameRate = 60;
let snakeSpeed = 15;
let snake = [{ x: 200, y: 200 }];
let snakeLength = 1;
let direction = "RIGHT";
let gameInterval;
let directionSet = false;
let playerName = "";
let isAIToggled = false;
let aiInterval;
let timeSinceLastMove = 0;
let apple = { x: 0, y: 0 };

// Initialize elements display
document.getElementById("resetButton").style.display = "none"; // Hide reset button initially
canvas.style.display = "none"; // Hide canvas initially

// Function to reset apple position
function resetApplePosition() {
    let appleOnSnake = true;
    while (appleOnSnake) {
        apple = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };
        appleOnSnake = snake.some(segment => segment.x === apple.x && segment.y === apple.y);
    }
}

// Resize the canvas to keep its aspect ratio on window resize
function resizeCanvas() {
    const aspectRatio = baseWidth / baseHeight;
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
resizeCanvas(); // Set initial canvas size

// Handle game start
document.getElementById("startGame").addEventListener("click", () => {
    playerName = document.getElementById("playerNameInput").value; // Capture player name
    document.getElementById("startGame").style.display = "none"; // Hide start button
    document.getElementById("gameTitle").style.display = "none"; // Hide title
    document.getElementById("resetButton").style.display = "block"; // Show reset button
    canvas.style.display = "block"; // Show canvas

    startGame(); // Start game logic
});

// Start game function
function startGame() {
    clearInterval(gameInterval); // Clear any previous game intervals
    resetApplePosition(); // Set apple in initial position
    directionSet = false; // Reset direction control
    gameInterval = setInterval(gameLoop, 1000 / frameRate); // Start the game loop
}

// Main game loop
function gameLoop() {
    timeSinceLastMove += 1000 / frameRate;
    if (timeSinceLastMove >= 1000 / snakeSpeed) {
        updateSnakePosition();
        renderGame();
        timeSinceLastMove = 0;
    }
}

// Update snake position
function updateSnakePosition() {
    const head = { ...snake[0] };
    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    // Check for collisions with walls or self
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || snakeCollision(head)) {
        gameOver();
        return;
    }

    snake.unshift(head); // Add new head
    if (head.x === apple.x && head.y === apple.y) {
        snakeLength++; // Increase length
        resetApplePosition(); // Reset apple position
    } else {
        snake.pop(); // Remove last segment
    }
}

// Render game visuals
function renderGame() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "green";
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, box, box));

    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, box, box);

    ctx.fillStyle = "white";
    ctx.font = "20px Courier New";
    ctx.fillText("Score: " + snakeLength, 10, 30);
}

// Game over handling
function gameOver() {
    clearInterval(gameInterval);
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "50px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
}

// Detect direction change
document.addEventListener("keydown", (event) => {
    if (event.key === "w" && direction !== "DOWN") direction = "UP";
    if (event.key === "s" && direction !== "UP") direction = "DOWN";
    if (event.key === "a" && direction !== "RIGHT") direction = "LEFT";
    if (event.key === "d" && direction !== "LEFT") direction = "RIGHT";
    directionSet = true;
});

// Collision detection with the snake itself
function snakeCollision(head) {
    return snake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y);
}

// Reset game functionality
document.getElementById("resetButton").addEventListener("click", resetGame);

function resetGame() {
    snake = [{ x: 200, y: 200 }];
    snakeLength = 1;
    direction = "RIGHT";
    directionSet = false;
    resetApplePosition();
    clearInterval(gameInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startGame();
}
