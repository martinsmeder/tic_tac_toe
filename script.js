// Player Factory Function
const Player = (name, marker) => ({ name, marker });

// Initialize Players
const player = Player('player', 'x');
const ai = Player('ai', 'o');

// GameBoard Module
const Gameboard = (() => {
  const board = new Array(9).fill(null);

  const getBoard = () => board;
  const makeMove = (index, player) => {
    board[index] = player;
  };

  return {
    getBoard,
    makeMove,
  };
})();

// DisplayController Module
const DisplayController = (() => {
  window.addEventListener('DOMContentLoaded', () => {
    const squares = document.querySelectorAll('#gameBoard > div');

    squares.forEach((square, index) => {
      square.addEventListener('click', () => {
        const { marker } = player;
        Gameboard.makeMove(index, marker);
        square.textContent = marker;
      });
    });
  });
})();

// WinningConditions Module
const WinningConditions = (() => {
  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWin = (board, player) =>
    winningCombos.some((combo) =>
      combo.every((index) => board[index] === player.marker)
    );

  const checkTie = (board) => board.every((cell) => cell !== null);

  return {
    checkWin,
    checkTie,
  };
})();

// GameController Module
const GameController = (() => {
  const squares = document.querySelectorAll('#gameBoard > div');
  squares.forEach((square, index) => {
    square.addEventListener('click', () => {
      GameController.makeMove(index);
    });
  });

  let currentPlayer = player;

  const makeMove = (index) => {
    Gameboard.makeMove(index, currentPlayer.marker);

    const square = document.getElementById(`square${index + 1}`);
    if (square) {
      square.textContent = currentPlayer.marker;
    }

    if (WinningConditions.checkWin(Gameboard.getBoard(), currentPlayer)) {
      console.log(`${currentPlayer.name} wins!`);
    } else if (WinningConditions.checkTie(Gameboard.getBoard())) {
      console.log('Its a tie!');
    } else {
      currentPlayer = currentPlayer === player ? ai : player;
    }
  };

  return {
    makeMove,
  };
})();

console.log(player, ai);
console.log(Gameboard);
console.log(DisplayController);
console.log(WinningConditions);
console.log(GameController);
