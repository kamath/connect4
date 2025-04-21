export type Connect4Instruction = {
  turn: string;
  analysis: string;
  bestMove: string;
  alternativeMoves: string[];
  llmTelemetry: {
    timeToFirstTokenMs?: number;
    totalInferenceMs: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export type StatusUpdate = {
  timestamp: string;
  instruction: string | Connect4Instruction;
  screenshot?: string;
  board?: Board;
  scores?: { red: number; yellow: number; redDiff: number; yellowDiff: number };
};

export type Player = "r" | "y";
export type Cell = Player | "o";
export type Board = Cell[][];
