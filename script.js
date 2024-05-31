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
let gameCode = null; // Placeholder for game code logic

const handleClick = (e) => {
    const cell = e.target;
    const index = cell.getAttribute('data-index');

    if (cell.textContent === '') {
        cell.textContent = currentPlayer;
        if (checkWin(currentPlayer)) {
            setTimeout(() => alert(`${currentPlayer} wins!`), 100);
        } else if (isDraw()) {
            setTimeout(() => alert('Draw!'), 100);
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            if (gameMode === 'computer' && currentPlayer === 'O') {
                setTimeout(computerMove, 500); // Delay computer move for better UX
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
    gameCode = Math.random().toString(36).substring(2, 7); // Generate a simple game code
    alert(`Game created. Share this code to join: ${gameCode}`);
    // Here, you would typically send the game code to the server
};

const joinGame = () => {
    const code = joinCodeInput.value;
    if (code === gameCode) {
        alert('Successfully joined the game!');
        // Here, you would typically validate the game code with the server
    } else {
        alert('Invalid game code.');
    }
};

cells.forEach(cell => cell.addEventListener('click', handleClick));
restartButton.addEventListener('click', restartGame);
modeSelect.addEventListener('change', handleModeChange);
createGameButton.addEventListener('click', createGame);
joinGameButton.addEventListener('click', joinGame);
