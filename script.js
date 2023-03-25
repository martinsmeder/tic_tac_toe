const Gameboard = (() => {
  // Initialize the gameboard array with a length of 9 and all cells set to null (empty)
  const board = new Array(9).fill(null);

  // Method to get the current state of the gameboard array
  const getBoard = () => board;

  // Method to make a move on the gameboard array at the specified index for the specified player
  const makeMove = (index, player) => {
    board[index] = player;
  };

  // Return one object containing both the getBoard and makeMove methods, making them public and
  // accessible outside of the module
  return {
    getBoard,
    makeMove,
  };
})();

console.log(Gameboard);
console.log(Gameboard.getBoard());
console.log(Gameboard.makeMove());
