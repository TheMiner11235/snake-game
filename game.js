let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Desired base resolution for the game
const baseWidth = 800;
const baseHeight = 800;
const box = 20;
const maxSnakeLength = Math.floor((baseWidth * baseHeight) / (box * box));
const maxHeight = 800;

let frameRate = 60;
let snakeSpeed = 15;
let scoreMilestone = 10;
let nextColorChangeMilestone = 50;
let nextSpeedMilestone = 70;
let timeSinceLastMove = 0;
let isAIToggled = false; // Tracks AI status
let aiInterval; // Interval for AI movement

let direction = "RIGHT";
let snake = [{ x: 200, y: 200 }];
let snakeLength = 1;
let directionSet = false;
let gameInterval;

let apple = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (maxHeight / box)) * box
};

// Player name
let playerName = "";

// Reset Apple Position function with 40px spawn avoidance
function resetApplePosition() {
    let appleOnSnake = true;
    while (appleOnSnake) {
        apple = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (maxHeight / box)) * box
        };
        const distToSnakeHead = Math.sqrt((apple.x - snake[0].x) ** 2 + (apple.y - snake[0].y) ** 2);
        appleOnSnake = snake.some(segment => segment.x === apple.x && segment.y === apple.y) || distToSnakeHead < 40;
    }
}

// AI Movement logic
function aiMove() {
    if (!isAIToggled || gameInterval === undefined) return;

    const head = snake[0];
    const dx = apple.x - head.x;
    const dy = apple.y - head.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? "RIGHT" : "LEFT";
    } else {
        direction = dy > 0 ? "DOWN" : "UP";
    }

    const nextX = direction === "LEFT" ? head.x - box : direction === "RIGHT" ? head.x + box : head.x;
    const nextY = direction === "UP" ? head.y - box : direction === "DOWN" ? head.y + box : head.y;

    if (snakeCollision(nextX, nextY) || nextX < 0 || nextX >= canvas.width || nextY < 0 || nextY >= maxHeight) {
        if (direction === "LEFT" || direction === "RIGHT") {
            direction = head.y > apple.y ? "UP" : "DOWN";
        } else {
            direction = head.x > apple.x ? "LEFT" : "RIGHT";
        }
    }
    directionSet = true;
}

// Resize Canvas Function
function resizeCanvas() {
    const aspectRatio = baseWidth / baseHeight;
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

// Event Listener for Start Game
document.getElementById("startGame").addEventListener("click", () => {
    playerName = document.getElementById("playerNameInput").value;
    document.getElementById("startGame").style.display = "none";
    canvas.style.display = "block";
    startGame();
});

// AI Toggle Listener
document.addEventListener("keydown", (event) => {
    if (event.key === "Shift" && event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
        isAIToggled = !isAIToggled;
        if (isAIToggled) {
            aiInterval = setInterval(aiMove, 1000 / snakeSpeed);
        } else {
            clearInterval(aiInterval);
        }
    }
});

// Game Start Function
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

// Update Snake Position
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
        let scoreIncrement = playerName === "host" ? 10 : 1;
        snakeLength += scoreIncrement;
        resetApplePosition();
        snakeSpeed += (snakeLength >= scoreMilestone) ? 5 : 0;
        scoreMilestone += 10;
        nextColorChangeMilestone = (snakeLength >= nextColorChangeMilestone) ? Infinity : nextColorChangeMilestone;
        document.body.style.backgroundColor = (snakeLength >= 50) ? "darkred" : "";
        clearInterval(gameInterval);
        gameInterval = setInterval(startGame, 1000 / snakeSpeed);
    } else {
        snake.pop();
    }
}

// Render Game
function renderGame() {
    ctx.fillStyle = snakeLength >= 50 ? "darkred" : "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    ctx.fillStyle = snakeLength >= 50 ? "darkred" : "green";
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, box, box));
    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, box, box);
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Courier New";
    ctx.fillText("Score: " + snakeLength, 10, 30);
}

// Collision detection
function snakeCollision(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
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

document.getElementById("resetButton").addEventListener("click", resetGame);
