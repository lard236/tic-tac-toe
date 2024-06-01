const socket = io('http://localhost:4000');

const cells = document.querySelectorAll('.cell');
const board = document.getElementById('board');
const restartButton = document.getElementById('restartButton');
const modeSelect = document.getElementById('modeSelect');
const multiplayerOptions = document.getElementById('multiplayerOptions');
const createGameButton = document.getElementById('createGameButton');
const joinCodeInput = document.getElementById('joinCode');
const joinGameButton = document.getElementById('joinGameButton');

let currentPlayer = 'X';
let gameMode = 'local';
let gameCode = null;

const handleClick = (e) => {
    const cell = e.target;
    const index = cell.getAttribute('data-index');
    if (cell.textContent === '') {
        cell.textContent = currentPlayer;
        if (gameMode === 'multiplayer') {
            socket.emit('makeMove', { gameCode, index, player: currentPlayer });
        } else {
            if (checkWin(currentPlayer)) {
                setTimeout(() => alert(`${currentPlayer} wins!`), 100);
            } else if (isDraw()) {
                setTimeout(() => alert('Draw!'), 100);
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                if (gameMode === 'computer' && currentPlayer === 'O') {
                    setTimeout(computerMove, 500);
                }
            }
        }
    }
};

const computerMove = () => {
    const availableCells = [...cells].filter(cell => cell.textContent === '');
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const cell = availableCells[randomIndex];
    cell.textContent = 'O';
    if (checkWin('O')) {
        setTimeout(() => alert(`O wins!`), 100);
    } else if (isDraw()) {
        setTimeout(() => alert('Draw!'), 100);
    } else {
        currentPlayer = 'X';
    }
};

const checkWin = (player) => {
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
    return winPatterns.some(pattern => {
        return pattern.every(index => {
            return cells[index].textContent === player;
        });
    });
};

const isDraw = () => {
    return [...cells].every(cell => cell.textContent !== '');
};

const restartGame = () => {
    cells.forEach(cell => cell.textContent = '');
    currentPlayer = 'X';
};

const handleModeChange = (e) => {
    gameMode = e.target.value;
    multiplayerOptions.style.display = gameMode === 'multiplayer' ? 'block' : 'none';
    restartGame();
};

const createGame = () => {
    socket.emit('createGame');
};

const joinGame = () => {
    const code = joinCodeInput.value;
    socket.emit('joinGame', code);
};

socket.on('gameCreated', (code) => {
    gameCode = code;
    alert(`Game created. Share this code to join: ${gameCode}`);
});

socket.on('gameJoined', (code) => {
    gameCode = code;
    alert('Successfully joined the game!');
});

socket.on('startGame', (code) => {
    alert('Game started!');
});

socket.on('moveMade', ({ index, player }) => {
    cells[index].textContent = player;
    if (checkWin(player)) {
        setTimeout(() => alert(`${player} wins!`), 100);
    } else if (isDraw()) {
        setTimeout(() => alert('Draw!'), 100);
    } else {
        currentPlayer = player === 'X' ? 'O' : 'X';
    }
});

socket.on('gameOver', (message) => {
    alert(message);
});

cells.forEach(cell => cell.addEventListener('click', handleClick));
restartButton.addEventListener('click', restartGame);
modeSelect.addEventListener('change', handleModeChange);
createGameButton.addEventListener('click', createGame);
joinGameButton.addEventListener('click', joinGame);
