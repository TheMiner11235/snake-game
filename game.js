let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Set game window to 1000x1000
const canvasSize = 1000;
canvas.width = canvasSize;
canvas.height = canvasSize;

// Snake segment size (each grid square size)
const box = 20; // Size of each snake segment (20x20)

// Calculate maximum snake length based on canvas size
const maxSnakeLength = Math.floor((canvasSize * canvasSize) / (box * box));

let frameRate = 60; // Game runs at 60 frames per second
let snakeSpeed = 15; // Speed control
let timeSinceLastMove = 0; // Time tracker for snake movement

// Snake and Apple Configuration
let direction = "RIGHT";
let snake = [{ x: 0, y: 0 }];
let snakeLength = 1;

// Apple configuration
let apple = {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box
};

// Function to reset apple position
function resetApplePosition() {
    let appleOnSnake = true;

    while (appleOnSnake) {
        apple = {
            x: Math.floor(Math.random() * (canvasSize / box)) * box,
            y: Math.floor(Math.random() * (canvasSize / box)) * box
        };

        // Ensure apple doesn't spawn on the snake
        appleOnSnake = snake.some(segment => segment.x === apple.x && segment.y === apple.y);
    }
}

// Add the start game button event listener
document.getElementById("startGame").addEventListener("click", () => {
    document.getElementById("startGame").style.display = "none"; // Hide the start button
    canvas.style.display = "block"; // Show the canvas
    startGame(); // Start the game logic
});

let directionSet = false; // Track if the player has set a direction

// Function to start the game
function startGame() {
    document.getElementById("gameTitle").style.display = "none"; // Hide title
    document.getElementById("resetButton").style.display = "block"; // Show reset button

    const interval = 1000 / frameRate;

    setInterval(() => {
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

// Handle key presses (WASD)
document.addEventListener("keydown", (event) => {
    if (event.key === "w" && direction !== "DOWN") {
        direction = "UP";
        directionSet = true;
    }
    if (event.key === "s" && direction !== "UP") {
        direction = "DOWN";
        directionSet = true;
    }
    if (event.key === "a" && direction !== "RIGHT") {
        direction = "LEFT";
        directionSet = true;
    }
    if (event.key === "d" && direction !== "LEFT") {
        direction = "RIGHT";
        directionSet = true;
    }
});

// Update snake position
function updateSnakePosition() {
    const head = { x: snake[0].x, y: snake[0].y };

    // Update position based on direction
    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    // Lock snake within canvas bounds
    if (head.x < 0) head.x = 0;
    if (head.x >= canvasSize) head.x = canvasSize - box;
    if (head.y < 0) head.y = 0;
    if (head.y >= canvasSize) head.y = canvasSize - box;

    // Add new head and remove tail if not eating an apple
    snake.unshift(head);
    if (head.x === apple.x && head.y === apple.y) {
        snakeLength++;
        resetApplePosition();
    } else {
        snake.pop();
    }

    // Limit snake length to max length
    if (snake.length > maxSnakeLength) {
        snake.length = maxSnakeLength;
    }
}

// Render the game
function renderGame() {
    // Draw grid lines
    ctx.strokeStyle = "#004400"; // Slightly lighter green for grid lines
    for (let x = 0; x <= canvasSize; x += box) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize);
        ctx.stroke();
    }
    for (let y = 0; y <= canvasSize; y += box) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize, y);
        ctx.stroke();
    }

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = "lime";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw apple
    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, box, box);

    // Draw score
    ctx.fillStyle = "lime";
    ctx.font = "bold 20px courier new";
    ctx.fillText("Score: " + snakeLength, 10, 30);
}
