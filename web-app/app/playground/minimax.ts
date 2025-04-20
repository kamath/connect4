import { Board, Cell } from "@/types";

const ROWS = 6;
const COLS = 7;
const MAX_DEPTH = 4; // Adjustable

// Check if a move wins the game
function checkWin(board: Board, player: Cell): boolean {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] !== player) continue;

      for (const [dr, dc] of directions) {
        let count = 0;
        for (let i = 0; i < 4; i++) {
          const r = row + dr * i;
          const c = col + dc * i;
          if (
            r >= 0 &&
            r < ROWS &&
            c >= 0 &&
            c < COLS &&
            board[r][c] === player
          ) {
            count++;
          }
        }
        if (count === 4) return true;
      }
    }
  }
  return false;
}

// Score based on count of 2/3-in-a-row
function evaluateBoard(board: Board, player: Cell): number {
  const opponent: Cell = player === "r" ? "y" : "r";

  // First check for immediate wins
  if (checkWin(board, player)) return 1.0;
  if (checkWin(board, opponent)) return 0.0;

  let playerScore = 0;
  let opponentScore = 0;
  let playerThreats = 0;
  let opponentThreats = 0;

  const checkLine = (
    cells: Cell[]
  ): { playerScore: number; opponentScore: number } => {
    const countPlayer = cells.filter((c) => c === player).length;
    const countOpponent = cells.filter((c) => c === opponent).length;
    const countEmpty = cells.filter((c) => c === "o").length;

    // If line is blocked by opponent, no score
    if (countPlayer > 0 && countOpponent > 0) {
      return { playerScore: 0, opponentScore: 0 };
    }

    // Calculate threat scores
    if (countPlayer === 3 && countEmpty === 1) playerThreats++;
    if (countOpponent === 3 && countEmpty === 1) opponentThreats++;

    return {
      playerScore: countPlayer === 2 ? 0.2 : countPlayer === 3 ? 0.5 : 0,
      opponentScore: countOpponent === 2 ? 0.2 : countOpponent === 3 ? 0.5 : 0,
    };
  };

  // Check all possible lines
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const { playerScore: ps, opponentScore: os } = checkLine([
        board[r][c],
        board[r][c + 1],
        board[r][c + 2],
        board[r][c + 3],
      ]);
      playerScore += ps;
      opponentScore += os;
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      const { playerScore: ps, opponentScore: os } = checkLine([
        board[r][c],
        board[r + 1][c],
        board[r + 2][c],
        board[r + 3][c],
      ]);
      playerScore += ps;
      opponentScore += os;
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const { playerScore: ps, opponentScore: os } = checkLine([
        board[r][c],
        board[r + 1][c + 1],
        board[r + 2][c + 2],
        board[r + 3][c + 3],
      ]);
      playerScore += ps;
      opponentScore += os;
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 3; c < COLS; c++) {
      const { playerScore: ps, opponentScore: os } = checkLine([
        board[r][c],
        board[r + 1][c - 1],
        board[r + 2][c - 2],
        board[r + 3][c - 3],
      ]);
      playerScore += ps;
      opponentScore += os;
    }
  }

  // Add threat bonus
  if (playerThreats > 0) playerScore += 0.3;
  if (opponentThreats > 0) opponentScore += 0.3;

  // Normalize scores to ensure they sum to 1
  const totalScore = playerScore + opponentScore;
  if (totalScore === 0) return 0.5; // Neutral position

  // Return normalized player score (0 to 1)
  return playerScore / totalScore;
}

function isTerminal(board: Board): boolean {
  return (
    checkWin(board, "r") ||
    checkWin(board, "y") ||
    board[0].every((cell) => cell !== "o")
  );
}

function getValidMoves(board: Board): number[] {
  return Array.from({ length: COLS }, (_, i) => i).filter(
    (col) => board[0][col] === "o"
  );
}

function makeMove(board: Board, col: number, player: Cell): Board {
  const newBoard = board.map((row) => [...row]);
  for (let row = ROWS - 1; row >= 0; row--) {
    if (newBoard[row][col] === "o") {
      newBoard[row][col] = player;
      break;
    }
  }
  return newBoard;
}

// Minimax with Alpha-Beta
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  player: Cell
): number {
  const opponent: Cell = player === "r" ? "y" : "r";

  if (depth === 0 || isTerminal(board)) {
    return evaluateBoard(board, player);
  }

  const validMoves = getValidMoves(board);

  if (maximizing) {
    let maxEval = -Infinity;
    for (const col of validMoves) {
      const evalValue = minimax(
        makeMove(board, col, player),
        depth - 1,
        alpha,
        beta,
        false,
        player
      );
      maxEval = Math.max(maxEval, evalValue);
      alpha = Math.max(alpha, evalValue);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const col of validMoves) {
      const evalValue = minimax(
        makeMove(board, col, opponent),
        depth - 1,
        alpha,
        beta,
        true,
        player
      );
      minEval = Math.min(minEval, evalValue);
      beta = Math.min(beta, evalValue);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// Helper to get score for each player
export function getPlayerScores(board: Board): { red: number; yellow: number } {
  const redScore = minimax(board, MAX_DEPTH, -Infinity, Infinity, true, "r");
  const yellowScore = minimax(board, MAX_DEPTH, -Infinity, Infinity, true, "y");
  return {
    red: parseFloat(redScore.toFixed(3)),
    yellow: parseFloat(yellowScore.toFixed(3)),
  };
}
