import { atom } from "jotai";
import { StatusUpdate } from "@/types";

export const player1sessionIdAtom = atom<string | null>(null);
export const player2sessionIdAtom = atom<string | null>(null);
export const player1debugUrlAtom = atom<string | null>(null);
export const player2debugUrlAtom = atom<string | null>(null);
export const player1modelAtom = atom<string>("openai/gpt-4.1-nano");
export const player2modelAtom = atom<string>("google/gemini-2.0-flash");
export const winnerAtom = atom<string | null>(null);
export const turnAtom = atom<
  | "press start"
  | "error: models can't be the same"
  | "starting up..."
  | "setting up player 1"
  | "setting up player 2"
  | "yellow getting turn..."
  | "red getting turn..."
  | "yellow executing turn..."
  | "red executing turn..."
  | "yellow win"
  | "red win"
>("press start");
export const isPlayingAtom = atom(false);

export const playerInstructionsAtom = atom<StatusUpdate[]>([]);
export const instructionIndexAtom = atom(0);
export const screenshotAtom = atom<string | null>(null);
export const scoresAtom = atom<{
  red: number;
  yellow: number;
  redDiff: number;
  yellowDiff: number;
} | null>(null);
export const errorAtom = atom<string | null>(null);
export const MAX_RETRIES = 3;
export const retriesAtom = atom(0);
export const activePlayerAtom = atom<"red" | "yellow">("yellow");
