"use server";

import { Cell, Player } from "@/types";

import { Board } from "@/types";

/**
 * Estimate win probabilities by running N random‐play simulations.
 */
export async function estimateWinProbabilities(
  initBoard: Board,
  toMove: Player,
  simulations: number = 10000
): Promise<{ r: number; y: number }> {
  const ROWS = 6,
    COLS = 7;

  // Deep‐copy helper
  const clone = (b: Board): Board => b.map((row) => row.slice() as Cell[]);

  // Return list of columns [0..6] that are not full
  const legalMoves = (b: Board): number[] =>
    Array.from({ length: COLS }, (_, c) => c).filter((c) => b[0][c] === "o");

  // Drop a disc of `player` into column `col` (mutates)
  const applyMove = (b: Board, player: Player, col: number) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (b[r][col] === "o") {
        b[r][col] = player;
        return;
      }
    }
    throw new Error(`cannot apply move to full column ${col}`);
  };

  // Check if `player` has 4 in a row anywhere
  const checkWin = (b: Board, player: Player): boolean => {
    const dirs = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diag down‑right
      [1, -1], // diag down‑left
    ] as const;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (b[r][c] !== player) continue;
        for (const [dr, dc] of dirs) {
          let cnt = 0;
          let rr = r,
            cc = c;
          while (
            rr >= 0 &&
            rr < ROWS &&
            cc >= 0 &&
            cc < COLS &&
            b[rr][cc] === player
          ) {
            cnt++;
            rr += dr;
            cc += dc;
          }
          if (cnt >= 4) return true;
        }
      }
    }
    return false;
  };

  let redWins = 0;
  let yellowWins = 0;

  for (let i = 0; i < simulations; i++) {
    const board = clone(initBoard);
    let player = toMove as Player;

    // play until terminal
    while (true) {
      const moves = legalMoves(board);
      if (moves.length === 0) break; // draw
      const col = moves[Math.floor(Math.random() * moves.length)];
      applyMove(board, player, col);
      if (checkWin(board, player)) {
        if (player === "r") redWins++;
        else yellowWins++;
        break;
      }
      player = player === "r" ? "y" : "r";
    }
  }

  return {
    r: redWins / simulations,
    y: yellowWins / simulations,
  };
}
