"use client";

import { useAtom, useSetAtom } from "jotai";
import {
  isPlayingAtom,
  player1modelAtom,
  player2modelAtom,
  turnAtom,
} from "../atoms";

const MODELS = [
  {
    name: "Gemini 2.0 Flash",
    value: "google/gemini-2.0-flash",
  },
  {
    name: "Gemini 2.5 Flash Preview",
    value: "google/gemini-2.5-flash-preview-04-17",
  },
  {
    name: "Gemini 2.5 Pro",
    value: "google/gemini-2.5-pro-preview-03-25",
  },
  {
    name: "GPT-4o",
    value: "openai/gpt-4o",
  },
  {
    name: "GPT-4o Mini",
    value: "openai/gpt-4o-mini",
  },
  {
    name: "O4 Mini",
    value: "openai/o4-mini",
  },
  {
    name: "GPT-4.1",
    value: "openai/gpt-4.1",
  },
  {
    name: "GPT-4.1 Mini",
    value: "openai/gpt-4.1-mini",
  },
  {
    name: "GPT-4.1 Nano",
    value: "openai/gpt-4.1-nano",
  },
  {
    name: "Claude 3.5 Sonnet",
    value: "anthropic/claude-3-5-sonnet-latest",
  },
  {
    name: "Claude 3.7 Sonnet",
    value: "anthropic/claude-3-7-sonnet-latest",
  },
];

export const ChooseModels = () => {
  const [player1model, setPlayer1model] = useAtom(player1modelAtom);
  const [player2model, setPlayer2model] = useAtom(player2modelAtom);
  const [turn, setTurn] = useAtom(turnAtom);
  const setIsPlaying = useSetAtom(isPlayingAtom);
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full p-8">
      {turn === "error: models can't be the same" && (
        <div className="p-8">
          <h1 className="text-2xl font-bold">
            Error - Use different models for each player
          </h1>
        </div>
      )}
      <p className="text-lg">Player 1</p>
      <select
        value={player1model}
        onChange={(e) => setPlayer1model(e.target.value)}
        className="w-full max-w-xs p-2 border rounded-md"
      >
        <option value="">Select a model</option>
        {MODELS.filter((model) => model.value !== player2model).map((model) => (
          <option key={model.value} value={model.value}>
            {model.name}
          </option>
        ))}
      </select>
      <p className="text-sm">vs</p>
      <p className="text-lg">Player 2</p>
      <select
        value={player2model}
        onChange={(e) => setPlayer2model(e.target.value)}
        className="w-full max-w-xs p-2 border rounded-md"
      >
        <option value="">Select a model</option>
        {MODELS.filter((model) => model.value !== player1model).map((model) => (
          <option key={model.value} value={model.value}>
            {model.name}
          </option>
        ))}
      </select>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors mt-8"
        onClick={() => {
          if (player1model === player2model) {
            setTurn("error: models can't be the same");
            return;
          }
          setIsPlaying(true);
        }}
      >
        Start Session
      </button>
    </div>
  );
};
