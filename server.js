const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let games = {}; // Store game states

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createGame', () => {
        const gameCode = Math.random().toString(36).substring(2, 7);
        games[gameCode] = { players: [socket.id], board: Array(9).fill(null), currentPlayer: 'X' };
        socket.join(gameCode);
        socket.emit('gameCreated', gameCode);
    });

    socket.on('joinGame', (gameCode) => {
        if (games[gameCode] && games[gameCode].players.length < 2) {
            games[gameCode].players.push(socket.id);
            socket.join(gameCode);
            socket.emit('gameJoined', gameCode);
            io.to(gameCode).emit('startGame', gameCode);
        } else {
            socket.emit('error', 'Invalid game code or game full');
        }
    });

    socket.on('makeMove', ({ gameCode, index, player }) => {
        if (games[gameCode] && games[gameCode].currentPlayer === player && games[gameCode].board[index] === null) {
            games[gameCode].board[index] = player;
            games[gameCode].currentPlayer = player === 'X' ? 'O' : 'X';
            io.to(gameCode).emit('moveMade', { index, player });
            if (checkWin(games[gameCode].board, player)) {
                io.to(gameCode).emit('gameOver', `${player} wins!`);
            } else if (isDraw(games[gameCode].board)) {
                io.to(gameCode).emit('gameOver', 'Draw!');
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Clean up games if necessary
    });
});

const checkWin = (board, player) => {
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    return winPatterns.some(pattern => pattern.every(index => board[index] === player));
};

const isDraw = (board) => {
    return board.every(cell => cell !== null);
};

server.listen(4000, () => console.log('Server listening on port 4000'));
