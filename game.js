let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Set canvas dimensions based on device and OS
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

// Snake segment size
const box = 20;
const maxWidth = canvas.width;
const maxHeight = canvas.height;
const maxSnakeLength = Math.floor((maxWidth * maxHeight) / (box * box));

// Rule Set
let frameRate = 60;
let snakeSpeed = 15;
let timeSinceLastMove = 0;
let direction = "RIGHT";
let snake = [{ x: 200, y: 200 }];
let snakeLength = 1;

let userInfo = null; // Store the signed-in user's information

function onGoogleSignIn(response) {
    const credential = response.credential;
    const userPayload = JSON.parse(atob(credential.split('.')[1]));

    userInfo = {
        name: userPayload.name,
        email: userPayload.email,
        userId: userPayload.sub
    };

    // Send user info to your server to save user details
    fetch("/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo)
    })
    .then(response => response.json())
    .then(data => console.log("User info saved:", data))
    .catch(error => console.error("Error saving user info:", error));
}
// Apple configuration
let apple = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (maxHeight / box)) * box
};

// Enhanced Reset Apple Position function
function resetApplePosition() {
    let appleOnSnake = true;
    while (appleOnSnake) {
        const newX = Math.floor(Math.random() * (canvas.width / box)) * box;
        const newY = Math.floor(Math.random() * (canvas.height / box)) * box;

        // Set new apple position only if it doesn't overlap the snake
        if (!snake.some(segment => segment.x === newX && segment.y === newY)) {
            apple.x = newX;
            apple.y = newY;
            appleOnSnake = false;
        }
    }
}

let touchStartX = 0;
let touchStartY = 0;

// Detects swipe direction and prevents default page behavior
canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Prevent default scrolling/reload behavior
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Check for the dominant direction of the swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && direction !== "LEFT") {
            direction = "RIGHT";
        } else if (diffX < 0 && direction !== "RIGHT") {
            direction = "LEFT";
        }
    } else {
        if (diffY > 0 && direction !== "UP") {
            direction = "DOWN";
        } else if (diffY < 0 && direction !== "DOWN") {
            direction = "UP";
        }
    }
});
// Resize canvas while maintaining aspect ratio
function resizeCanvas() {
    const aspectRatio = maxWidth / maxHeight;

    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    if (Math.abs(newWidth - canvas.width) < 10 && Math.abs(newHeight - canvas.height) < 10) {
        return;
    }

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
resizeCanvas();

// Enhanced Reset Apple Position function
function resetApplePosition() {
    let appleOnSnake = true;
    while (appleOnSnake) {
        const newX = Math.floor(Math.random() * (canvas.width / box)) * box;
        const newY = Math.floor(Math.random() * (canvas.height / box)) * box;

        // Set new apple position only if it doesn't overlap the snake
        if (!snake.some(segment => segment.x === newX && segment.y === newY)) {
            apple.x = newX;
            apple.y = newY;
            appleOnSnake = false;
        }
    }
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

function submitScore(playerName, snakeLength) {
    fetch("/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, score: snakeLength })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Score submitted successfully:", data);
        loadLeaderboard();
    })
    .catch(error => console.error("Error submitting score:", error));
}

function submitScore(snakeLength) {
    if (!userInfo) {
        console.error("User is not signed in.");
        return;
    }

    fetch("/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userInfo.name, userId: userInfo.userId, score: snakeLength })
    })
    .then(response => response.json())
    .then(data => console.log("Score submitted successfully:", data))
    .catch(error => console.error("Error submitting score:", error));
}

function updateLeaderboard() {
    fetch('/leaderboard')
        .then(response => response.json())
        .then(data => {
            const leaderboardElement = document.getElementById("leaderboard");
            leaderboardElement.innerHTML = "";
            leaderboardElement.style.font = "18px Courier New"; // Styling leaderboard text
            leaderboardElement.style.color = "lime";

            data.forEach(entry => {
                const entryElement = document.createElement("div");
                entryElement.textContent = `${entry.username}: ${entry.score}`;
                leaderboardElement.appendChild(entryElement);
            });
        })
        .catch(error => console.error('Error fetching leaderboard:', error));
}

setInterval(updateLeaderboard, 5000);
