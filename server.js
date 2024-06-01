// server.js
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
        games[gameCode] = { players: [socket.id], board: Array(9).fill(null) };
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
        if (games[gameCode]) {
            games[gameCode].board[index] = player;
            io.to(gameCode).emit('moveMade', { index, player });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Clean up games if necessary
    });
});

server.listen(4000, () => console.log('Server listening on port 4000'));
