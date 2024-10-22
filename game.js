let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Desired base resolution for the game
const baseWidth = 800; // Desired width of the game canvas
const baseHeight = 1200; // Desired height of the game canvas

// Snake segment size (width and height of each segment)
const box = 20; // Size of each snake segment

// Calculate maximum snake length based on the initial canvas size
const maxSnakeLength = Math.floor((baseWidth * baseHeight) / (box * box));

// New maximum height for the apple and snake
const maxHeight = 500; // Maximum height for apple and snake

let frameRate = 60; // Set the game to run at 60 frames per second
let snakeSpeed = 20; // Adjust this value to control the game speed (reduce to slow down)
let timeSinceLastMove = 0; // Time tracker for snake movement

// Snake and Apple Configuration
let direction = "RIGHT"; // Initial direction of the snake
let snake = [{ x: 200, y: 200 }]; // Initial position of the snake
let snakeLength = 1; // Initialize snake length counter

// Apple configuration
let apple = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (maxHeight / box)) * box // Use maxHeight here for apple's y-coordinate
};

// Function to reset the apple position randomly within the defined canvas
function resetApplePosition() {
    let appleOnSnake = true;

    while (appleOnSnake) {
        apple = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (maxHeight / box)) * box
        };

        // Check if the new apple position is on the snake
        appleOnSnake = snake.some(segment => segment.x === apple.x && segment.y === apple.y);
    }
}

// Resize the canvas to fit the window while maintaining aspect ratio
function resizeCanvas() {
    const aspectRatio = baseWidth / baseHeight;

    if (window.innerWidth / window.innerHeight < aspectRatio) {
        // Adjust based on window's width
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth / aspectRatio;
    } else {
        // Adjust based on window's height
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * aspectRatio;
    }

    resetApplePosition(); // Reinitialize apple position after resizing
}

// Handle window resizing events
window.addEventListener('resize', resizeCanvas);

// Initialize the canvas size on load
resizeCanvas();

// Add the start game button event listener
document.getElementById("startGame").addEventListener("click", () => {
    document.getElementById("startGame").style.display = "none"; // Hide the start button
    canvas.style.display = "block"; // Show the canvas
    startGame(); // Start the game logic
});

// Control variable for player input
let playerControlled = false; // Variable to track if the player is controlling the snake
let lastSubmittedScore = 0; // Track the last submitted score

let directionSet = false; // Track if the player has set a direction

// Function to initialize and start the game
function startGame() {
    // Hide the title when the game starts
    document.getElementById("gameTitle").style.display = "none";
    document.getElementById("resetButton").style.display = "block"; // Show the reset button

    const interval = 1000 / frameRate; // Calculate interval in milliseconds for frame updates

    setInterval(() => {
        timeSinceLastMove += interval; // Increment the time since the last snake movement

        if (timeSinceLastMove >= 1000 / snakeSpeed) {
            if (directionSet) { // Only move the snake if the player has set a direction
                updateSnakePosition(); // Update the snake's position
            }
            renderGame(); // Render the game visuals
            timeSinceLastMove = 0; // Reset the time since last movement
        }
    }, interval);
}

// Handle key presses for snake control (WASD)
document.addEventListener("keydown", (event) => {
    if (event.key === "w" && direction !== "DOWN") {
        direction = "UP";
        directionSet = true; // Mark that a direction has been set
    }
    if (event.key === "s" && direction !== "UP") {
        direction = "DOWN";
        directionSet = true; // Mark that a direction has been set
    }
    if (event.key === "a" && direction !== "RIGHT") {
        direction = "LEFT";
        directionSet = true; // Mark that a direction has been set
    }
    if (event.key === "d" && direction !== "LEFT") {
        direction = "RIGHT";
        directionSet = true; // Mark that a direction has been set
    }
});

// Check if the position collides with the snake body
function snakeCollision(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y); // Check for collision
}

// Update snake position based on current direction and lock it within the game bounds
function updateSnakePosition() {
    // Create a new head based on the current head position
    const head = { x: snake[0].x, y: snake[0].y };

    // Update the head's position based on the current direction
    if (direction === "UP") {
        head.y -= box; // Move the head up by one box
    }
    if (direction === "DOWN") {
        head.y += box; // Move the head down by one box
    }
    if (direction === "LEFT") {
        head.x -= box; // Move the head left by one box
    }
    if (direction === "RIGHT") {
        head.x += box; // Move the head right by one box
    }

    // Check for wall collisions and lock the snake within the canvas bounds (no wrapping)
    if (head.x < 0) head.x = 0; // Prevent going off the left side
    if (head.x >= canvas.width) head.x = canvas.width - box; // Prevent going off the right side
    if (head.y < 0) head.y = 0; // Prevent going off the top
    if (head.y >= maxHeight) head.y = maxHeight - box; // Prevent going below the max height

    // Add new head to the front of the snake
    snake.unshift(head);

    // Check if the snake has eaten the apple
    if (head.x === apple.x && head.y === apple.y) {
        snakeLength++; // Increase snake length
        resetApplePosition(); // Reset apple position after eating
    } else {
        // Remove the last segment of the snake if it hasn't eaten the apple
        snake.pop();
    }

    // Limit snake length to max length (if you have a reason to limit the snake)
    if (snake.length > maxSnakeLength) {
        snake.length = maxSnakeLength; // Cap the snake length
    }
}

// Render the game visuals
function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

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
    ctx.font = "bold 20px courier new"; // Set font style
    ctx.fillText("Score: " + snakeLength, 10, 30); // Display score on the canvas
}

// Submit score to the server
if (playerName) {
    fetch("/submit-score", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: playerName }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Score submitted successfully:", data);
        loadLeaderboard(); // Refresh leaderboard after submitting score
    })
    .catch(error => {
        console.error("Error submitting score:", error);
    });
} else {
    alert("Please enter a valid name.");
}

// Reset the game
document.getElementById("resetButton").addEventListener("click", () => {
    location.reload(); // Reload the page to reset the game
});

// Leaderboard display logic (Example)
function updateLeaderboard() {
    const url = '/leaderboard'; // Your server endpoint for fetching leaderboard data
    fetch(url)
    .then(response => response.json()) // Parse the JSON response
    .then(data => {
        const leaderboardElement = document.getElementById("leaderboard"); // Get leaderboard element
        leaderboardElement.innerHTML = ""; // Clear current leaderboard

        data.forEach(entry => {
            const entryElement = document.createElement("div"); // Create entry element
            entryElement.textContent = `${entry.username}: ${entry.score}`; // Set entry text
            leaderboardElement.appendChild(entryElement); // Add entry to leaderboard
        });
    })
    .catch(error => {
        console.error('Error fetching leaderboard:', error); // Log any errors
    });
}

// Call updateLeaderboard periodically
setInterval(updateLeaderboard, 5000); // Update leaderboard every 5 seconds
