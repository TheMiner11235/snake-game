let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Variables
const baseWidth = 800;
const baseHeight = 800;
const box = 20;
const maxHeight = 800;
let frameRate = 60;
let snakeSpeed = 15;
let scoreMilestone = 5;
let nextColorChangeMilestone = 25;
let nextSpeedMilestone = 70;
let timeSinceLastMove = 0;
let isGameOver = false;
let playerName = "";

// Snake and Apple configuration
let direction = "RIGHT";
let snake = [{ x: 200, y: 200 }];
let snakeLength = 1;
let apple = { x: Math.floor(Math.random() * (canvas.width / box)) * box, y: Math.floor(Math.random() * (maxHeight / box)) * box };

// Helper functions
function resetApplePosition() {
    let appleOnSnake = true;
    while (appleOnSnake) {
        apple = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (maxHeight / box)) * box
        };
        appleOnSnake = snake.some(segment => segment.x === apple.x && segment.y === apple.y);
    }
}

// Resize canvas to maintain aspect ratio
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
resizeCanvas(); // Initialize canvas on load

console.log("JavaScript file loaded"); // Check if the script is loading

document.getElementById("startGame").addEventListener("click", () => {
    console.log("Start button clicked"); // Check if the event listener works
    playerName = document.getElementById("playerNameInput").value;
    console.log("Player Name:", playerName); // Check the player name value
    document.getElementById("startGame").style.display = "none";
    canvas.style.display = "block";
    startGame();
});

function startGame() {
    console.log("Game started");
    document.getElementById("gameTitle").style.display = "none";
    document.getElementById("resetButton").style.display = "block"; // Show reset button
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

document.getElementById("startGame").addEventListener("click", () => {
    playerName = document.getElementById("playerNameInput").value;
    document.getElementById("startGame").style.display = "none";
    canvas.style.display = "block";
    startGame();
});

// Handle snake direction change
document.addEventListener("keydown", (event) => {
    if (event.key === "w" && direction !== "DOWN") direction = "UP";
    else if (event.key === "s" && direction !== "UP") direction = "DOWN";
    else if (event.key === "a" && direction !== "RIGHT") direction = "LEFT";
    else if (event.key === "d" && direction !== "LEFT") direction = "RIGHT";
});

// Snake collision detection
function snakeCollision(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// Game over function with correct text positioning
function gameOver() {
    clearInterval(gameInterval);
    isGameOver = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "bold 50px Courier New";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText("Score: " + snakeLength, canvas.width / 2, canvas.height / 2);
    if (playerName) ctx.fillText("Player: " + playerName, canvas.width / 2, canvas.height / 2 + 50);
    submitScore(playerName, snakeLength);
}

// Update snake position
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
}

// Render game visuals
function renderGame() {
    if (isGameOver) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, i) => {
        ctx.fillStyle = i === 0 ? "yellow" : "green";
        ctx.fillRect(segment.x, segment.y, box, box);
    });

    // Draw apple
    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, box, box);

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Courier New";
    ctx.fillText("Score: " + snakeLength, 10, 30);
}

// Function to submit score
function submitScore(playerName, snakeLength) {
    fetch("/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, score: snakeLength })
    })
    .then(response => response.json())
    .then(data => console.log("Score submitted successfully:", data))
    .catch(error => console.error("Error submitting score:", error));
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
