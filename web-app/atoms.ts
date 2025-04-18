import { atom } from "jotai";

export const player1sessionIdAtom = atom<string | null>(null);
export const player2sessionIdAtom = atom<string | null>(null);
export const player1debugUrlAtom = atom<string | null>(null);
export const player2debugUrlAtom = atom<string | null>(null);
export const player1modelAtom = atom<string>("google/gemini-2.0-flash");
export const player2modelAtom = atom<string>(
  "google/gemini-2.5-flash-preview-04-17"
);
export const winnerAtom = atom<string | null>(null);
export const turnAtom = atom<
  | "press start"
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
