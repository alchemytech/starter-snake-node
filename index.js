const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
    fallbackHandler,
    notFoundHandler,
    genericErrorHandler,
    poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

//  This function is called everytime your snake is entered into a game.
//  cherrypy.request.json contains information about the game that's about to be played.
// TODO: Use this function to decide how your snake is going to look on the board.
app.post('/start', (request, response) => {
    console.log("START");

    // Response data
    const data = {
        color: '#F2C66E',
        headType: "regular",
        tailType: "regular"
    }

    return response.json(data)
})

// This function is called on every turn of a game. It's how your snake decides where to move.
// Valid moves are "up", "down", "left", or "right".
// TODO: Use the information in cherrypy.request.json to decide your next move.
app.post('/move', (request, response) => {
    var data = request.body;
    console.log("data: ", JSON.stringify(data));

    // Choose a random direction to move in
    possible_moves = ["up", "down", "left", "right"]
    //var choice = Math.floor(Math.random() * possible_moves.length);
    var except = [];
    try {
        do {
            if (!!!snake_move) {
                except.push(snake_move);
            }
            var snake_move = snake_move_x(data.board.food, data.you, true, except);

            if (except.length === 4) {
                console.log("tote udd gaye! " + except);
                snake_move = except[0];
                break;
            }

        } while (is_colliding(data.you, snake_move));
    } catch (e) {
        console.log("Error: " + e);
    }
    console.log('now going: ' + snake_move);



    switch (snake_move) {
        case "up":
            if (data.you.body[0].y - 1 == data.you.body[1].y) {
                except.push("up")
                snake_move = snake_move_x(data.board.food, data.you, false, except);
                console.log("but can't go up, so now going: " + snake_move + " " + except);
            }
            break;
        case "down":
            if (data.you.body[0].y + 1 == data.you.body[1].y) {
                except.push("down");
                snake_move = snake_move_x(data.board.food, data.you, false, except);
                console.log("but can't go down, so now going: " + snake_move + " " + except);
            }
            break;
        case "left":
            if (data.you.body[0].x - 1 == data.you.body[1].x) {
                except.push("left");
                snake_move = snake_move_y(data.board.food, data.you, except);
                console.log("but can't go left, so now going: " + snake_move + " " + except);
            }
            break;
        case "right":
            if (data.you.body[0].x + 1 == data.you.body[1].x) {
                except.push("right");
                snake_move = snake_move_y(data.board.food, data.you, except);
                console.log("but can't go right, so now going: " + snake_move + " " + except);
            }
            break;
    }

    if (is_colliding(data.you, snake_move)) {
        except.push(snake_move);
        snake_move = snake_move_x(data.board.food, data.you, true, except);
    }


    console.log("MOVE: " + snake_move);
    return response.json({
        move: snake_move
    })
})

function snake_move_y(food, you, except) {
    if (food[0].y < you.body[0].y && except.indexOf("up") < 0) {
        return "up";
    } else if (food[0].y > you.body[0].y && except.indexOf("down") < 0) {
        return "down";
    }
}

function snake_move_x(food, you, allow_y, except) {
    if (food[0].x < you.body[0].x && except.indexOf("left") < 0) {
        return "left";
    } else if (food[0].x > you.body[0].x && except.indexOf("right") < 0) {
        return "right";
    } else if (allow_y || food[0].x == you.body[0].x) {
        return snake_move_y(food, you, except);
    }
}

function is_colliding(you, snake_move) {
	var new_x = you.body[0].x,
            new_y = you.body[0].y;
	    switch (snake_move) {
                case "up":
                    new_y--;
                    break;
                case "down":
                    new_y++;
                    break;
                case "left":
                    new_x--;
                    break;
                case "right":
                    new_x++;
                    break;
            }

    for (var i = 1; i < you.body.length; i++) {
        // Check if this piece collides with the first piece.
        if (new_x === you.body[i].x &&
            new_y === you.body[i].y) {
            return true; // collision
        }
    }
    return false;

}

// This function is called when a game your snake was in ends.
// It's purely for informational purposes, you don't have to make any decisions here.
app.post('/end', (request, response) => {
    console.log("END");
    return response.json({
        message: "ok"
    });
})

// The Battlesnake engine calls this function to make sure your snake is working.
app.post('/ping', (request, response) => {
    return response.json({
        message: "pong"
    });
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
    console.log('Server listening on port %s', app.get('port'))
})
