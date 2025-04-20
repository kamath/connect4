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
};
