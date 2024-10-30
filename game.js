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
const maxWidth = 800;
let frameRate = 60;
let snakeSpeed = 15;
let timeSinceLastMove = 0;

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
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    ctx.fillStyle = "rgba(0, 0, 0, 0)";
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
}

// Update snake position
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

    // Check if snake eats the apple
    if (head.x === apple.x && head.y === apple.y) {
        snakeLength++;
        resetApplePosition();
    } else {
        snake.pop(); // Remove the last segment if not eating
    }

    if (snake.length > maxSnakeLength) {
        snake.length = maxSnakeLength; // Limit the snake length if necessary
    }
}

// Render the game visuals
function renderGame() {
    // Set the background to black
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines with thicker strokes
    ctx.strokeStyle = "#004400"; // Dark green for grid lines
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
        ctx.fillStyle = "green"; // Set snake color
        ctx.fillRect(snake[i].x, snake[i].y, box, box); // Draw each segment
    }

    // Draw the apple
    ctx.fillStyle = "red"; // Set apple color
    ctx.fillRect(apple.x, apple.y, box, box); // Draw the apple

    // Draw the score
    ctx.fillStyle = "green"; // Set score color
    ctx.font = "bold 20px Courier New"; // Set font style
    ctx.fillText("Score: " + snakeLength, 10, 30); // Display score on the canvas

}

// Function to reset the game without reloading the page
function resetGame() {
    clearInterval(gameInterval); // Stop current game loop

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

// Function to submit score (if it's not working, ensure it's called on game over)
function submitScore(playerName, snakeLength) {
    fetch("/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, score: snakeLength })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Score submitted successfully:", data);
        loadLeaderboard(); // Reload leaderboard after submitting score
    })
    .catch(error => console.error("Error submitting score:", error));
}

// Leaderboard display logic
function updateLeaderboard() {
    const url = '/leaderboard';
    fetch(url)
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

setInterval(updateLeaderboard, 5000); // Refresh leaderboard every 5 seconds
