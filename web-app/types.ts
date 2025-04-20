export type Connect4Instruction = {
  turn: string;
  analysis: string;
  bestMove: string;
  alternativeMoves: string[];
};

export type StatusUpdate = {
  timestamp: string;
  instruction: string | Connect4Instruction;
  screenshot?: string;
  board?: Board;
  scores?: { red: number; yellow: number };
};

export type Player = "r" | "y";
export type Cell = Player | "o";
export type Board = Cell[][];
