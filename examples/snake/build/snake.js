"use strict";
var config = {
    create: create,
    update: update,
    onKeyPress: onKeyPress
};
var game = new Game(config);
game.run();
function pointsEqual(a, b) {
    return a.x === b.x && a.y === b.y;
}
var score = 0;
// sectionsToAdd stores the number of dots to add to the snake. We add sections
// when the snake 'eats' a pill, to increase difficulty. As the game progesses,
// we add more and more sections per pill
var sectionsToAdd = 0;
// TODO: ransomise initial snakeDirection
var snakeDirection = Direction.Right;
// TODO: randomise snake start position
var snake = [
    { x: 7, y: 7 },
    { x: 6, y: 7 }
];
// This fixes a bug where you can turn back on yourself if you quickly type
// two arrow keys before the next time `update` is called
var snakeDirectionChangeThisFrame = false;
function setSnake(grid) {
    snake.forEach(function (dot) {
        grid.setDot(dot.x, dot.y, Color.Black);
    });
}
function createPill(grid) {
    var pill = {
        x: Math.floor(Math.random() * 24),
        y: Math.floor(Math.random() * 24)
    };
    // Don't create a pill on the snake
    function pointInSnake(p) {
        // Consider the point one ahead of the snake to be in the snake too
        if (pointsEqual(p, getNextLocation(snake[0], snakeDirection))) {
            return true;
        }
        for (var _i = 0, snake_1 = snake; _i < snake_1.length; _i++) {
            var dot = snake_1[_i];
            if (pointsEqual(dot, p)) {
                return true;
            }
        }
        return false;
    }
    while (pointInSnake(pill)) {
        pill = {
            x: Math.floor(Math.random() * 24),
            y: Math.floor(Math.random() * 24)
        };
    }
    grid.setDot(pill.x, pill.y, Color.Red);
}
function create(game, grid) {
    // Drop framerate
    game.setFrameRate(5);
    setSnake(grid);
    createPill(grid);
}
function update(game, grid) {
    snakeDirectionChangeThisFrame = false;
    var head = snake[0];
    var nextLocation = getNextLocation(head, snakeDirection);
    // If nextLocation is in the snake, end the game
    if (grid.getDot(nextLocation.x, nextLocation.y) === Color.Black) {
        // Color the snake in red
        snake.forEach(function (dot) {
            grid.setDot(dot.x, dot.y, Color.Red);
        });
        game.end();
        return;
    }
    // If nextLocation is a pill, increase snake size
    if (grid.getDot(nextLocation.x, nextLocation.y) === Color.Red) {
        sectionsToAdd += getSectionsForScore(score);
        createPill(grid);
        score++;
    }
    game.setText("Score: " + score);
    // Push the next location to the front of the snake
    snake.unshift(nextLocation);
    // Clear the back of the snake, if we don't have sections we need to add
    if (sectionsToAdd === 0) {
        var exLocation = snake.pop();
        if (exLocation) {
            grid.setDot(exLocation.x, exLocation.y, Color.Gray);
        }
    }
    else {
        sectionsToAdd--;
    }
    setSnake(grid);
}
function getSectionsForScore(score) {
    // N.B: this is quite a steep increase in difficulty
    return score + 1;
}
function getNextLocation(location, snakeDirection) {
    var nextLocation = { x: location.x, y: location.y };
    if (snakeDirection === Direction.Right) {
        nextLocation.x++;
    }
    if (snakeDirection === Direction.Left) {
        nextLocation.x--;
    }
    if (snakeDirection === Direction.Up) {
        nextLocation.y--;
    }
    if (snakeDirection === Direction.Down) {
        nextLocation.y++;
    }
    // Modulo x and y to wrap around
    if (nextLocation.x > 23) {
        nextLocation.x = 0;
    }
    if (nextLocation.y > 23) {
        nextLocation.y = 0;
    }
    if (nextLocation.x < 0) {
        nextLocation.x = 23;
    }
    if (nextLocation.y < 0) {
        nextLocation.y = 23;
    }
    return nextLocation;
}
function onKeyPress(direction) {
    if (snakeDirectionChangeThisFrame) {
        return;
    }
    switch (direction) {
        case Direction.Left:
            if (snakeDirection === Direction.Right) {
                return;
            }
            snakeDirection = Direction.Left;
            break;
        case Direction.Right:
            if (snakeDirection === Direction.Left) {
                return;
            }
            snakeDirection = Direction.Right;
            break;
        case Direction.Up:
            if (snakeDirection === Direction.Down) {
                return;
            }
            snakeDirection = Direction.Up;
            break;
        case Direction.Down:
            if (snakeDirection === Direction.Up) {
                return;
            }
            snakeDirection = Direction.Down;
            break;
    }
    snakeDirectionChangeThisFrame = true;
}