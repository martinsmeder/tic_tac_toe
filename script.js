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

// AI Module
const AI = (() => {
  const randomMove = (board) => {
    const availableMoves = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((index) => index !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  return {
    randomMove,
  };
})();

// GameController Module
const GameController = (() => {
  let currentPlayer = player;

  const playTurn = (index) => {
    const { marker } = currentPlayer;
    Gameboard.makeMove(index, marker);

    if (WinningConditions.checkWin(Gameboard.getBoard(), currentPlayer)) {
      console.log(`${currentPlayer.name} wins!`);
      currentPlayer = player;
    } else if (WinningConditions.checkTie(Gameboard.getBoard())) {
      console.log('Its a tie!');
      currentPlayer = player;
    } else {
      currentPlayer = currentPlayer === player ? ai : player;

      if (currentPlayer === ai) {
        setTimeout(() => {
          const aiMoveIndex = AI.randomMove(Gameboard.getBoard());
          playTurn(aiMoveIndex);
        }, 500);
      }
    }

    DisplayController.displayBoard();
  };

  return {
    playTurn,
    currentPlayer,
  };
})();

// DisplayController Module
const DisplayController = (() => {
  const squares = document.querySelectorAll('#gameBoard > div');
  const restartButton = document.querySelector('#restartButton button');
  const playerXButton = document.querySelector('#playerX');
  const playerOButton = document.querySelector('#playerO');

  const setMarkers = (playerMarker, aiMarker) => {
    player.marker = playerMarker;
    ai.marker = aiMarker;
  };

  const displayBoard = () => {
    const board = Gameboard.getBoard();
    squares.forEach((square, index) => {
      square.textContent = board[index] || '';
    });
  };

  const clearBoard = () => {
    squares.forEach((square) => (square.textContent = ''));
    GameController.currentPlayer = player;
  };

  squares.forEach((square, index) => {
    square.addEventListener('click', () => {
      if (!Gameboard.getBoard()[index]) {
        GameController.playTurn(index);
        square.textContent = GameController.currentPlayer.marker;
      }
    });
  });

  const restartGame = () => {
    Gameboard.getBoard().fill(null);
    clearBoard();
  };

  restartButton.addEventListener('click', () => {
    restartGame();
  });

  playerXButton.addEventListener('click', () => {
    setMarkers('x', 'o');
    playerXButton.disabled = true;
    playerOButton.disabled = false;
  });

  playerOButton.addEventListener('click', () => {
    setMarkers('o', 'x');
    playerOButton.disabled = true;
    playerXButton.disabled = false;
  });

  return {
    clearBoard,
    displayBoard,
    restartGame,
  };
})();
