let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Desired base resolution for the game
const baseWidth = 800; // Desired width of the game canvas
const baseHeight = 600; // Desired height of the game canvas

// Snake segment size (width and height of each segment)
const box = 20; // Size of each snake segment

// Calculate maximum snake length based on the initial canvas size
const maxSnakeLength = Math.floor((baseWidth * baseHeight) / (box * box));

// New maximum height for the apple and snake
const maxHeight = 500; // Maximum height for apple and snake

let frameRate = 60; // Set the game to run at 60 frames per second
let snakeSpeed = 40; // Adjust this value to control the game speed (reduce to slow down)
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

// Function to initialize and start the game
function startGame() {
    // Hide the title when the game starts
    document.getElementById("gameTitle").style.display = "none";
    document.getElementById("resetButton").style.display = "block"; // Show the reset button

    const interval = 1000 / frameRate; // Calculate interval in milliseconds for frame updates

    setInterval(() => {
        timeSinceLastMove += interval; // Increment the time since the last snake movement

        if (timeSinceLastMove >= 1000 / snakeSpeed) {
            // Update snake position based on player control or AI logic
            if (!playerControlled) {
                const path = findPath(); // Find the path to the apple
                if (path && path.length > 1) {
                    const nextNode = path[1]; // Get the next move from the path

                    // Set direction based on the next move
                    if (nextNode.x < snake[0].x) direction = "LEFT";
                    if (nextNode.x > snake[0].x) direction = "RIGHT";
                    if (nextNode.y < snake[0].y) direction = "UP";
                    if (nextNode.y > snake[0].y) direction = "DOWN";
                }
            }

            updateSnakePosition(); // Update the snake's position
            timeSinceLastMove = 0; // Reset the time since the last movement
        }

        renderGame(); // Render the game visuals
    }, interval);
}

// A* node class for pathfinding
class Node {
    constructor(x, y, g, h) {
        this.x = x; // X-coordinate of the node
        this.y = y; // Y-coordinate of the node
        this.g = g; // Cost from the start node
        this.h = h; // Heuristic distance to the apple
        this.f = g + h; // Total cost
        this.parent = null; // Pointer to the parent node
    }
}

// Manhattan distance heuristic for pathfinding
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Check if two nodes are equal
function nodesAreEqual(a, b) {
    return a.x === b.x && a.y === b.y;
}

// Get neighboring nodes for the current node
function getNeighbors(node) {
    const neighbors = [];
    const directions = [
        { x: -box, y: 0 }, // Left
        { x: box, y: 0 },  // Right
        { x: 0, y: -box }, // Up
        { x: 0, y: box },  // Down
    ];

    directions.forEach((dir) => {
        const newX = node.x + dir.x;
        const newY = node.y + dir.y;

        // Ensure the new position is within the grid and doesn't hit the snake
        if (newX >= 0 && newX < canvas.width && newY >= 0 && newY < maxHeight && !snakeCollision(newX, newY)) {
            neighbors.push(new Node(newX, newY, 0, 0)); // Add valid neighbor nodes
        }
    });

    return neighbors; // Return the list of neighboring nodes
}

// Check if the position collides with the snake body
function snakeCollision(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y); // Check for collision
}

// A* Pathfinding function to find the path to the apple
function findPath() {
    const start = new Node(snake[0].x, snake[0].y, 0, heuristic(snake[0], apple)); // Starting node
    const end = new Node(apple.x, apple.y, 0, 0); // End node (apple's position)
    const openList = [start]; // Nodes to be evaluated
    const closedList = []; // Nodes already evaluated

    while (openList.length > 0) {
        let lowestIndex = 0; // Initialize lowest index for pathfinding
        for (let i = 1; i < openList.length; i++) {
            if (openList[i].f < openList[lowestIndex].f) {
                lowestIndex = i; // Find the node with the lowest cost
            }
        }

        const currentNode = openList[lowestIndex]; // Get the current node with the lowest cost

        // If we reached the goal (the apple), backtrack to find the path
        if (nodesAreEqual(currentNode, end)) {
            const path = [];
            let temp = currentNode;
            while (temp) {
                path.push(temp); // Build the path by following parent nodes
                temp = temp.parent; // Move to the parent node
            }
            return path.reverse(); // Return the path from start to end
        }

        // Move current node from open to closed list
        openList.splice(lowestIndex, 1); // Remove current node from open list
        closedList.push(currentNode); // Add current node to closed list

        // Get neighbors and evaluate them
        const neighbors = getNeighbors(currentNode);
        for (const neighbor of neighbors) {
            if (closedList.some((closedNode) => nodesAreEqual(closedNode, neighbor))) {
                continue; // Skip if already evaluated
            }

            const tentativeG = currentNode.g + 1; // Calculate tentative G cost
            const existingOpenNode = openList.find((openNode) => nodesAreEqual(openNode, neighbor)); // Check if neighbor is in open list

            if (!existingOpenNode || tentativeG < neighbor.g) {
                neighbor.g = tentativeG; // Update G cost for neighbor
                neighbor.h = heuristic(neighbor, end); // Update heuristic distance to end
                neighbor.f = neighbor.g + neighbor.h; // Update total cost
                neighbor.parent = currentNode; // Set the parent for the neighbor

                // If it's not in the open list, add it
                if (!existingOpenNode) {
                    openList.push(neighbor); // Add neighbor to open list
                }
            }
        }
    }

    return null; // Return null if no path is found
}

// Add event listener for the AI toggle switch
document.getElementById("aiToggle").addEventListener("change", (event) => {
    playerControlled = !event.target.checked; // Set playerControlled based on toggle state
});

// Inside startGame function, replace the AI logic check with:
if (!playerControlled) {
    const path = findPath(); // Find the path to the apple
    if (path && path.length > 1) {
        const nextNode = path[1]; // Get the next move from the path

        // Set direction based on the next move
        if (nextNode.x < snake[0].x) direction = "LEFT";
        if (nextNode.x > snake[0].x) direction = "RIGHT";
        if (nextNode.y < snake[0].y) direction = "UP";
        if (nextNode.y > snake[0].y) direction = "DOWN";
    }
}

// Update snake position based on current direction
function updateSnakePosition() {
    const head = { x: snake[0].x, y: snake[0].y }; // Create a new head based on the current head position

    // Update the head position based on the current direction
    if (direction === "LEFT") head.x -= box; // Move left
    if (direction === "RIGHT") head.x += box; // Move right
    if (direction === "UP") head.y -= box; // Move up
    if (direction === "DOWN") head.y += box; // Move down

    // Check if the snake goes off-screen horizontally
    if (head.x < 0) head.x = canvas.width - box; // Wrap around to the right
    if (head.x >= canvas.width) head.x = 0; // Wrap around to the left

    // Check if the snake goes off-screen vertically
    if (head.y < 0) head.y = 0; // Prevent going above the canvas
    if (head.y >= maxHeight) head.y = maxHeight - box; // Prevent going below the maximum height

    // Add new head to the snake
    snake.unshift(head); // Add new head to the front of the snake

    // Check if the snake has eaten the apple
    if (head.x === apple.x && head.y === apple.y) {
        snakeLength++; // Increase snake length
        resetApplePosition(); // Reset apple position after eating
    } else {
        snake.pop(); // Remove the last segment of the snake if not eating
    }

    // Limit snake length to max length
    if (snakeLength > maxSnakeLength) {
        snakeLength = maxSnakeLength; // Cap the snake length
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
    ctx.fillStyle = "black"; // Set score color
    ctx.font = "20px Arial"; // Set font style
    ctx.fillText("Score: " + snakeLength, 10, 30); // Display score on the canvas
}

// Handle key presses for snake control
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP"; // Change direction to up
    if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN"; // Change direction to down
    if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT"; // Change direction to left
    if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT"; // Change direction to right
    playerControlled = true; // Set player controlled to true
});

// Function to submit score to the server
function submitScore(score) {
    const url = '/submit_score'; // Your server endpoint for score submission
    const data = { score: score }; // Data to send to server

    fetch(url, {
        method: 'POST', // HTTP method
        headers: {
            'Content-Type': 'application/json', // Content type for the request
        },
        body: JSON.stringify(data), // Stringify the data for the request
    })
    .then(response => response.json()) // Parse the JSON response
    .then(data => {
        console.log('Score submitted:', data); // Log response data
    })
    .catch(error => {
        console.error('Error submitting score:', error); // Log any errors
    });
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
