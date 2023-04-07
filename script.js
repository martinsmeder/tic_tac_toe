// Player Factory Function
const Player = (name, marker) => ({ name, marker });

// Initialize Players
const player = Player('player', 'x');
const ai = Player('ai', 'o');

// Gameboard Module
const Gameboard = (() => {
  // Array with 9 elements that is filled with null
  const board = new Array(9).fill(null);

  // Returns the current state of the board
  const getBoard = () => board;

  // Allows player to move on the board by setting their marker in the specified index
  const makeMove = (index, player) => {
    board[index] = player;

    // Get the square and marker element for the given index
    const square = document.querySelector(
      `#gameBoard > div:nth-child(${index + 1})`
    );
    const marker = square.querySelector('span');

    // Add a CSS class to the marker element based on the player's marker
    marker.classList.add(player.marker);

    // Add an additional CSS class to trigger the animation
    marker.classList.add('marker');

    // Remove the animation class after a short delay
    setTimeout(() => {
      marker.classList.remove('marker');
    }, 1000);
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

  // Check if the given player has won
  const checkWin = (board, player) =>
    winningCombos.some((combo) =>
      combo.every((index) => board[index] === player.marker)
    );

  // Check if the game is tied
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

  // Dumb AI (makes random move)
  const randomMove = (board) => {
    const availableMoves = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((index) => index !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  // Strategic AI (makes winning moves and uses probability distribution)
  const strategicMove = (board) => {
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
      // Define a probability distribution for each cell of the board
      const distribution = [2, 1, 2, 1, 4, 1, 2, 1, 2];

      // Assign a weight to each available move based on the probability distribution
      const weightedMoves = availableMoves.map((move) => ({
        move,
        weight: distribution[move],
      }));

      // Calculate the total weight of all available moves
      const totalWeight = weightedMoves.reduce(
        (accumulator, { weight }) => accumulator + weight,
        0
      );

      // Choose a random weight from 1 to the total weight and select the corresponding move
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

  // Unbeatable AI (makes move based on board configuration)
  const unbeatableMove = (board) => {
    // Defines a set of scores for different game outcomes
    const scores = {
      x: -10, // represents the score for when the human player wins
      o: 10, // represents the score for when the AI wins
      tie: 0, // represents the score for when the game is tied
    };

    // Recursively determine the best possible move for the AI, given the current board state.
    const getBestMove = (board, depth, isMaximizing) => {
      // Check if AI has won
      if (WinningConditions.checkWin(board, ai)) {
        return scores.o;
      }
      // Check if human player has won
      if (WinningConditions.checkWin(board, player)) {
        return scores.x;
      }
      // Check if game is tied
      if (WinningConditions.checkTie(board)) {
        return scores.tie;
      }

      // If none of the above conditions are true, explore all possible moves and find the best one.
      let bestScore = isMaximizing ? -Infinity : Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = isMaximizing ? ai.marker : player.marker;
          const score = getBestMove(board, depth + 1, !isMaximizing);
          board[i] = null;
          bestScore = isMaximizing
            ? Math.max(score, bestScore)
            : Math.min(score, bestScore);
        }
      }
      return bestScore;
    };

    let bestScore = -Infinity;
    let bestMoveIndex = null;

    // Get the available moves for the current board configuration and explore them to determine the
    // best move.
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
    strategicMove,
    unbeatableMove,
  };
})();

// GameController Module
const GameController = (() => {
  let currentPlayer = player;
  let winnerMessage = null;

  const playTurn = (index) => {
    const { marker } = currentPlayer;
    Gameboard.makeMove(index, marker);

    // Check if current player has won
    if (WinningConditions.checkWin(Gameboard.getBoard(), currentPlayer)) {
      setTimeout(() => {
        winnerMessage = `THE WINNER IS... ${currentPlayer.marker.toUpperCase()}!`;
        DisplayController.displayWinner();
        currentPlayer = player;
      }, 500);
      // Check if there is a tie game
    } else if (WinningConditions.checkTie(Gameboard.getBoard())) {
      winnerMessage = 'ITS A TIE!';
      DisplayController.displayWinner();
      currentPlayer = player;
      // If neither a player win or a tie game, then it's the AI's turn
    } else {
      currentPlayer = currentPlayer === player ? ai : player;
      // If the current player is the AI, determine the AI's move
      if (currentPlayer === ai) {
        let aiMoveIndex;
        // Depending on the difficulty level, choose a different AI move
        switch (DisplayController.difficulty) {
          case 'dumb':
            aiMoveIndex = AI.randomMove(Gameboard.getBoard());
            break;
          case 'strategic':
            aiMoveIndex = AI.strategicMove(Gameboard.getBoard());
            break;
          case 'unbeatable':
            aiMoveIndex = AI.unbeatableMove(Gameboard.getBoard());
            break;
          default:
            aiMoveIndex = AI.randomMove(Gameboard.getBoard());
            break;
        }
        // Wait for 0.5 seconds before making the AI move
        setTimeout(() => {
          playTurn(aiMoveIndex);
        }, 500);
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
  const markers = document.querySelectorAll('#gameBoard > div > span');
  const restartButton = document.querySelector('#restartButton button');
  const dropdownMenu = document.querySelectorAll('#difficulty > a');
  const dropdownBtn = document.querySelector('#dropdownBtn');
  const overlay = document.querySelector('#overlay');
  const popup = document.querySelector('#popup');

  const difficulty = null;

  const displayWinner = () => {
    const winnerMessage = GameController.getWinner();
    overlay.style.display = 'flex';
    popup.classList.add('popup');

    // Create and display the round result message
    const roundResult = document.createElement('p');
    roundResult.textContent = winnerMessage;
    popup.appendChild(roundResult);

    // Create and display the restart button
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'PLAY AGAIN';
    popup.appendChild(restartBtn);

    restartBtn.addEventListener('click', () => {
      DisplayController.restartGame();
      popup.removeChild(roundResult);
      popup.removeChild(restartBtn);
      overlay.style.display = 'none';
      popup.classList.remove('popup');
    });
  };

  // Add classes to dropdownBtn for styling purposes
  dropdownBtn.addEventListener('click', () => {
    dropdownBtn.classList.toggle('showDifficulty');
  });

  // Update the difficulty level based on the user's selection
  const handleDifficulty = (e) => {
    // Display opponent choice
    if (e.target.getAttribute('data-value') === 'dumb') {
      DisplayController.difficulty = 'dumb';
    } else if (e.target.getAttribute('data-value') === 'strategic') {
      DisplayController.difficulty = 'strategic';
    } else if (e.target.getAttribute('data-value') === 'unbeatable') {
      DisplayController.difficulty = 'unbeatable';
    }
    dropdownBtn.textContent = `OPPONENT: ${DisplayController.difficulty.toUpperCase()} AI`;

    // Change opponent difficulty
    if (e.target.getAttribute('data-value') === 'dumb') {
      DisplayController.difficulty = 'dumb';
    } else if (e.target.getAttribute('data-value') === 'strategic') {
      DisplayController.difficulty = 'strategic';
    } else if (e.target.getAttribute('data-value') === 'unbeatable') {
      DisplayController.difficulty = 'unbeatable';
    }
    return DisplayController.difficulty;
  };

  // Add event listener to all links
  Array.from(dropdownMenu).forEach((link) => {
    link.addEventListener('click', (e) => {
      handleDifficulty(e);
      dropdownBtn.classList.remove('showDifficulty');
    });
  });

  // Update the game board display with the current board state
  const displayBoard = () => {
    const board = Gameboard.getBoard();
    markers.forEach((marker, index) => {
      marker.textContent = board[index] || '';
    });
  };

  const clearBoard = () => {
    markers.forEach((marker) => {
      marker.textContent = '';
    });
    GameController.currentPlayer = player;
  };

  // Add event listeners to each game board square
  squares.forEach((square, index) => {
    const markerIndex = index;
    square.setAttribute('data-marker', markerIndex);

    square.addEventListener('click', () => {
      if (!Gameboard.getBoard()[index]) {
        GameController.playTurn(index);
        const marker = markers[markerIndex];
        marker.textContent = GameController.currentPlayer.marker;
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
