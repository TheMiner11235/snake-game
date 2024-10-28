
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Desired base resolution for the game
const baseWidth = 800;
const baseHeight = 800;

// Snake segment size
const box = 20;

// Calculate maximum snake length based on canvas size
const maxSnakeLength = Math.floor((baseWidth * baseHeight) / (box * box));

// New maximum height for apple and snake
const maxHeight = 800;

let frameRate = 60;
let snakeSpeed = 15;
let scoreMilestone = 5;
let nextColorChangeMilestone = 25; // Score at which color changes and speed boosts further
let nextSpeedMilestone = 70; // First milestone after color change to increase speed by 10
let timeSinceLastMove = 0;
let isGameOver = false;

// Snake and Apple configuration
let direction = "RIGHT";
let snake = [{ x: 200, y: 200 }];
let snakeLength = 1;

// Apple configuration
let apple = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (maxHeight / box)) * box
};

// Function to reset the apple position randomly within the canvas
function resetApplePosition() {
    let appleOnSnake = true;

    while (appleOnSnake) {
        apple = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (maxHeight / box)) * box
        };
        // Ensure the apple doesn't land on the snake
        appleOnSnake = snake.some(segment => segment.x === apple.x && segment.y === apple.y);
    }
}

// Resize the canvas while maintaining aspect ratio
function resizeCanvas() {
    const aspectRatio = baseWidth / baseHeight;

    // Check if the window size changed significantly enough to trigger a resize
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    // If the change in size is very small (like when opening dev tools), don't resize
    if (Math.abs(newWidth - canvas.width) < 10 && Math.abs(newHeight - canvas.height) < 10) {
        return; // Exit function, no need to resize
    }

    if (newWidth / newHeight < aspectRatio) {
        // Adjust based on window's width
        canvas.width = newWidth;
        canvas.height = newWidth / aspectRatio;
    } else {
        // Adjust based on window's height
        canvas.height = newHeight;
        canvas.width = newHeight * aspectRatio;
    }

    resetApplePosition(); // Reinitialize apple position after resizing
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initialize canvas on load

document.getElementById("startGame").addEventListener("click", () => {
    document.getElementById("startGame").style.display = "none"; // Hide start button
    canvas.style.display = "block"; // Show the game canvas
    startGame();
});

let directionSet = false;
let gameInterval;

// Function to start the game
function startGame() {
    document.getElementById("gameTitle").style.display = "none";
    document.getElementById("resetButton").style.display = "block"; // Show reset button

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

// Handle snake direction change
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

// Snake collision detection
function snakeCollision(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// Game over function
function gameOver() {
    clearInterval(gameInterval); // Stop the game loop
    isGameOver = true; // Set the game-over flag

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "bold 50px Courier New";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText("Score: " + snakeLength, canvas.width / 2, canvas.height / 2);

    if (playerName) {
        ctx.fillText("Player: " + playerName, canvas.width / 2, canvas.height / 2 + 40);
    }

    // Call submitScore function to send score on game over
    submitScore(playerName, snakeLength);
}

// Update snake position
// Set this variable when the game starts
let playerName = "";

document.getElementById("startGame").addEventListener("click", () => {
    playerName = document.getElementById("playerNameInput").value; // Get player name from input
    document.getElementById("startGame").style.display = "none";
    canvas.style.display = "block";
    startGame(); // Start the game logic
});

function updateSnakePosition() {
    const head = { x: snake[0].x, y: snake[0].y };

    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    // Check for wall collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= maxHeight) {
        gameOver();
        return;
    }

    // Check for collision with self
    if (snakeCollision(head.x, head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head); // Add new head

     if (head.x === apple.x && head.y === apple.y) {
        // Apply score multiplier if the player name is "Host"
        let scoreIncrement = playerName === "host" ? 10 : 1;
        snakeLength += scoreIncrement;

        // Reset apple position after eating
        resetApplePosition();	

        // Increase speed and change color milestones
        if (snakeLength >= scoreMilestone) {
            snakeSpeed += 5;
            scoreMilestone += 10;
        }
        
        // Change color to deep red and set speed to 30 when reaching 50 points
        if (snakeLength >= nextColorChangeMilestone) {
            snakeSpeed = 40;
            nextColorChangeMilestone = Infinity; // Prevent multiple color changes
            document.body.style.backgroundColor = "darkred"; // Change game background
        }
        
        // Further increase speed by 10 every 20 points after 50
        if (snakeLength >= nextSpeedMilestone) {
            snakeSpeed += 10;
            nextSpeedMilestone += 20;

            clearInterval(gameInterval); // Clear the current interval
            gameInterval = setInterval(gameLoop, 1000 / frameRate); // Restart interval with new speed
        }
    } else {
        snake.pop(); // Remove the last segment if the snake didn't eat an apple
    }

    if (snake.length > maxSnakeLength) snake.length = maxSnakeLength;
}

// Render the game visuals
function renderGame() {
    // Set background and grid color based on score
    if (snakeLength >= 50) {
        ctx.fillStyle = "darkred"; // Deep red background for score 50+
        ctx.strokeStyle = "#880000"; // Darker red grid lines for contrast in red mode
    } else {
        ctx.fillStyle = "black"; // Default black background
        ctx.strokeStyle = "#004400"; // Dark green grid lines
    }

    // Draw background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.lineWidth = 2; // Set line width for grid lines
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

    // Draw the snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = snakeLength >= 50 ? "darkred" : "green"; // Deep red snake at score 50+
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw the apple
    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, box, box);

    // Draw the score
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Courier New";
    ctx.fillText("Score: " + snakeLength, 10, 30);

    function renderGame() {
    if (isGameOver) return; // Stop rendering if game is over
}

// Function to reset the game without reloading the page
function resetGame() {
      clearInterval(gameInterval); // Stop current game loop
    isGameOver = false; // Reset game-over flag

    // Reset snake, apple, and score
    snake = [{ x: 200, y: 200 }];
    snakeLength = 1;
    direction = "RIGHT";
    directionSet = false;

    resetApplePosition(); // Reset apple position

    // Clear the canvas and reinitialize the game loop
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startGame(); // Start game loop again
}

// Add reset button event listener
document.getElementById("resetButton").addEventListener("click", resetGame);
