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
  const getAvailableMoves = (board) =>
    board
      .map((cell, index) => (cell === null ? index : null))
      .filter((index) => index !== null);

  // Random Move AI
  const randomMove = (board) => {
    const availableMoves = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((index) => index !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  // Semi-strategic Move AI
  const getIntermediateMoveIndex = (board) => {
    const availableMoves = getAvailableMoves(board);
    let selectedMoveIndex = null;

    // Check if there is a winning move available
    for (let i = 0; i < availableMoves.length; i++) {
      const testBoard = [...board];
      testBoard[availableMoves[i]] = ai.marker;
      if (WinningConditions.checkWin(testBoard, ai)) {
        selectedMoveIndex = availableMoves[i];
        break;
      }
    }

    // If no winning move is available, select a move based on probability distribution
    if (selectedMoveIndex === null) {
      const distribution = [2, 1, 2, 1, 4, 1, 2, 1, 2]; // probability distribution
      const weightedMoves = availableMoves.map((move) => ({
        move,
        weight: distribution[move],
      }));
      const totalWeight = weightedMoves.reduce(
        (accumulator, { weight }) => accumulator + weight,
        0
      );
      const randomWeight = Math.floor(Math.random() * totalWeight) + 1;
      let cumulativeWeight = 0;
      for (let i = 0; i < weightedMoves.length; i++) {
        cumulativeWeight += weightedMoves[i].weight;
        if (cumulativeWeight >= randomWeight) {
          selectedMoveIndex = weightedMoves[i].move;
          break;
        }
      }
    }

    return selectedMoveIndex;
  };

  // Best Move AI
  const getBestMove = (board, depth, isMaximizing) => {
    const scores = {
      x: -10,
      o: 10,
      tie: 0,
    };

    if (WinningConditions.checkWin(board, player)) {
      return scores.x;
    }
    if (WinningConditions.checkWin(board, ai)) {
      return scores.o;
    }
    if (WinningConditions.checkTie(board)) {
      return scores.tie;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = ai.marker;
          const score = getBestMove(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    }
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = player.marker;
        const score = getBestMove(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  };

  const getBestMoveIndex = (board) => {
    let bestScore = -Infinity;
    let bestMoveIndex = null;
    const availableMoves = getAvailableMoves(board);
    for (let i = 0; i < availableMoves.length; i++) {
      const index = availableMoves[i];
      board[index] = ai.marker;
      const score = getBestMove(board, 0, false);
      board[index] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMoveIndex = index;
      }
    }
    return bestMoveIndex;
  };

  return {
    randomMove,
    getIntermediateMoveIndex,
    getBestMoveIndex,
  };
})();

// GameController Module
const GameController = (() => {
  let currentPlayer = player;
  let winnerMessage = null;

  const playTurn = (index) => {
    const { marker } = currentPlayer;
    Gameboard.makeMove(index, marker);

    if (WinningConditions.checkWin(Gameboard.getBoard(), currentPlayer)) {
      winnerMessage = `${currentPlayer.name.toUpperCase()} WON!`;
      DisplayController.displayWinner();
      currentPlayer = player;
    } else if (WinningConditions.checkTie(Gameboard.getBoard())) {
      winnerMessage = 'ITS A TIE!';
      DisplayController.displayWinner();
      currentPlayer = player;
    } else {
      currentPlayer = currentPlayer === player ? ai : player;

      if (currentPlayer === ai) {
        if (DisplayController.difficulty === 'dumb') {
          setTimeout(() => {
            const aiMoveIndex = AI.randomMove(Gameboard.getBoard());
            playTurn(aiMoveIndex);
          }, 500);
        } else if (DisplayController.difficulty === 'strategic') {
          setTimeout(() => {
            const aiMoveIndex = AI.getIntermediateMoveIndex(
              Gameboard.getBoard()
            );
            playTurn(aiMoveIndex);
          }, 500);
        } else if (DisplayController.difficulty === 'unbeatable') {
          setTimeout(() => {
            const aiMoveIndex = AI.getBestMoveIndex(Gameboard.getBoard());
            playTurn(aiMoveIndex);
          }, 500);
        } else {
          setTimeout(() => {
            const aiMoveIndex = AI.randomMove(Gameboard.getBoard());
            playTurn(aiMoveIndex);
          }, 500);
        }
      }
    }

    DisplayController.displayBoard();
  };

  return {
    playTurn,
    currentPlayer,
    getWinner: () => winnerMessage,
  };
})();

// DisplayController Module
const DisplayController = (() => {
  const squares = document.querySelectorAll('#gameBoard > div');
  const restartButton = document.querySelector('#restartButton button');
  const dropdownMenu = document.querySelector('#difficulty');

  const difficulty = null;

  const displayWinner = () => {
    const winnerMessage = GameController.getWinner();

    const overlay = document.querySelector('#overlay');
    overlay.style.display = 'flex';

    const popup = document.querySelector('#popup');

    const roundResult = document.createElement('p');
    roundResult.textContent = winnerMessage;
    popup.appendChild(roundResult);

    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Restart';
    popup.appendChild(restartBtn);

    restartBtn.addEventListener('click', () => {
      DisplayController.restartGame();
      popup.removeChild(roundResult);
      popup.removeChild(restartBtn);
      overlay.style.display = 'none';
    });
  };

  dropdownMenu.addEventListener('change', (e) => {
    handleDifficulty(e);
  });

  const handleDifficulty = (e) => {
    if (e.target.value === 'dumb') {
      DisplayController.difficulty = 'dumb';
    } else if (e.target.value === 'strategic') {
      DisplayController.difficulty = 'strategic';
    } else if (e.target.value === 'unbeatable') {
      DisplayController.difficulty = 'unbeatable';
    }
    return DisplayController.difficulty;
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

  return {
    handleDifficulty,
    clearBoard,
    displayBoard,
    displayWinner,
    restartGame,
    difficulty,
  };
})();
