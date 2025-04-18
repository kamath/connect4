"use client";

import { useAtom } from "jotai";
import {
  player1debugUrlAtom,
  player1modelAtom,
  player1sessionIdAtom,
  player2debugUrlAtom,
  player2modelAtom,
  player2sessionIdAtom,
  turnAtom,
  winnerAtom,
} from "@/atoms";
import { StagehandEmbed } from "../components/stagehand/stagehandEmbed";
import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import {
  checkGameOver,
  getMove,
  makeMove,
  readyPlayer1,
  readyPlayer2,
  startGame,
} from "../stagehand/connect4";
import { startBBSSession } from "../stagehand/main";
import { MemoizedMarkdown } from "../components/memoized-markdown";

export default function Connect4() {
  const [player1model, setPlayer1model] = useAtom(player1modelAtom);
  const [player2model, setPlayer2model] = useAtom(player2modelAtom);
  const setPlayer2debugUrl = useSetAtom(player2debugUrlAtom);
  const setPlayer1SessionId = useSetAtom(player1sessionIdAtom);
  const setPlayer2SessionId = useSetAtom(player2sessionIdAtom);
  const setPlayer1debugUrl = useSetAtom(player1debugUrlAtom);
  const [winner, setWinner] = useAtom(winnerAtom);
  const [turn, setTurn] = useAtom(turnAtom);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerInstructions, setPlayerInstructions] = useState<{
    yellow: string[];
    red: string[];
  }>({
    yellow: [],
    red: [],
  });

  const startSession = useCallback(async () => {
    setIsPlaying(true);
    setTurn("starting up...");
    setPlayerInstructions({ yellow: [], red: [] }); // Reset instructions when starting new game
    console.log("startSession");
    const { sessionId: player1SessionId, debugUrl: player1DebugUrl } =
      await startBBSSession();
    const { sessionId: player2SessionId, debugUrl: player2DebugUrl } =
      await startBBSSession();
    setPlayer1debugUrl(player1DebugUrl);
    setPlayer2debugUrl(player2DebugUrl);
    setPlayer1SessionId(player1SessionId);
    setPlayer2SessionId(player2SessionId);
    setTurn("setting up player 1");
    const { url: gameUrl } = await readyPlayer1(player1SessionId, player1model);
    setTurn("setting up player 2");
    await readyPlayer2(gameUrl, player2SessionId, player2model);
    setTurn("yellow getting turn...");
    await startGame(player1SessionId, player1model);
    while (true) {
      const yellowPlayerInstruction = await getMove(
        player1SessionId,
        player1model,
        "yellow"
      );
      setPlayerInstructions((prev) => ({
        ...prev,
        yellow: [...prev.yellow, yellowPlayerInstruction],
      }));
      setTurn("yellow executing turn...");
      await makeMove(player1SessionId, "yellow", yellowPlayerInstruction);
      const gameOverPlayer1 = await checkGameOver(
        player1SessionId,
        player1model
      );
      if (gameOverPlayer1) {
        setWinner("yellow");
        break;
      }
      setTurn("red getting turn...");
      const redPlayerInstruction = await getMove(
        player2SessionId,
        player2model,
        "red"
      );
      setPlayerInstructions((prev) => ({
        ...prev,
        red: [...prev.red, redPlayerInstruction],
      }));
      setTurn("red executing turn...");
      await makeMove(player2SessionId, "red", redPlayerInstruction);
      const gameOverPlayer2 = await checkGameOver(
        player2SessionId,
        player2model
      );
      if (gameOverPlayer2) {
        setWinner("red");
        break;
      }
      setTurn("yellow getting turn...");
    }
  }, [
    player1model,
    player2model,
    setPlayer1debugUrl,
    setPlayer1SessionId,
    setPlayer2debugUrl,
    setPlayer2SessionId,
    setWinner,
    setTurn,
  ]);

  if (winner) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full p-8">
        <h1 className="text-2xl font-bold">Game Over - {winner} wins!</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full p-2 min-h-screen">
      {turn && (
        <>
          {isPlaying && (
            <div
              className={`w-full max-w-2xl p-4 rounded-lg mb-4 ${
                turn.includes("yellow")
                  ? "bg-yellow-100"
                  : turn.includes("red")
                  ? "bg-red-100"
                  : "bg-gray-100"
              }`}
            >
              <h1 className="text-lg font-bold mb-2">{turn}</h1>
              <MemoizedMarkdown
                content={
                  turn.includes("getting turn")
                    ? "Waiting for move..."
                    : turn.includes("yellow")
                    ? playerInstructions.yellow[
                        playerInstructions.yellow.length - 1
                      ] || "No move yet"
                    : playerInstructions.red[
                        playerInstructions.red.length - 1
                      ] || "No move yet"
                }
                id={turn}
              />
            </div>
          )}
        </>
      )}
      {isPlaying ? (
        <div className="bg-gray-100 rounded-lg w-full grid grid-cols-2 gap-2 p-2">
          <div className="flex flex-col">
            <div className="aspect-video">
              <StagehandEmbed player="player1" title={player1model} />
            </div>
            <div
              className={`mt-1 p-2 rounded-lg h-24 overflow-y-auto ${
                turn?.includes("yellow") ? "bg-yellow-100" : "bg-white"
              }`}
            >
              <h3 className="font-bold text-sm mb-1">
                Yellow Player Instructions:
              </h3>
              <ul className="list-disc pl-3 text-xs space-y-1">
                {playerInstructions.yellow.map((instruction, index) => (
                  <li key={index} className="text-yellow-600">
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="aspect-video">
              <StagehandEmbed player="player2" title={player2model} />
            </div>
            <div
              className={`mt-1 p-2 rounded-lg h-24 overflow-y-auto ${
                turn?.includes("red") ? "bg-red-100" : "bg-white"
              }`}
            >
              <h3 className="font-bold text-sm mb-1">
                Red Player Instructions:
              </h3>
              <ul className="list-disc pl-3 text-xs space-y-1">
                {playerInstructions.red.map((instruction, index) => (
                  <li key={index} className="text-red-600">
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen w-full p-8">
          <p className="text-lg">Player 1</p>
          <select
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            onChange={(e) => setPlayer1model(e.target.value)}
          >
            <option value="google/gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="google/gemini-2.5-flash-preview-04-17">
              Gemini 2.5 Flash Preview
            </option>
            <option value="openai/gpt-4o">GPT-4o</option>
            <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
            <option value="anthropic/claude-3-5-sonnet-latest">
              Claude 3.5 Sonnet
            </option>
            <option value="anthropic/claude-3-7-sonnet-latest">
              Claude 3.7 Sonnet
            </option>
          </select>
          <p className="text-sm">vs</p>
          <p className="text-lg">Player 2</p>
          <select
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            onChange={(e) => setPlayer2model(e.target.value)}
          >
            <option value="google/gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="google/gemini-2.5-flash-preview-04-17">
              Gemini 2.5 Flash Preview
            </option>
            <option value="openai/gpt-4o">GPT-4o</option>
            <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
            <option value="anthropic/claude-3-5-sonnet-latest">
              Claude 3.5 Sonnet
            </option>
            <option value="anthropic/claude-3-7-sonnet-latest">
              Claude 3.7 Sonnet
            </option>
          </select>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors mt-8"
            onClick={startSession}
          >
            Start Session
          </button>
        </div>
      )}
    </div>
  );
}
