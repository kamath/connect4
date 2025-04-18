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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Connect4Instruction } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export default function Connect4() {
  const [player1model, setPlayer1model] = useAtom(player1modelAtom);
  const [player2model, setPlayer2model] = useAtom(player2modelAtom);
  const setPlayer2debugUrl = useSetAtom(player2debugUrlAtom);
  const setPlayer1SessionId = useSetAtom(player1sessionIdAtom);
  const setPlayer2SessionId = useSetAtom(player2sessionIdAtom);
  const setPlayer1debugUrl = useSetAtom(player1debugUrlAtom);
  const [winner, setWinner] = useState<
    "yellow wins" | "red wins" | "tie" | "in progress"
  >("in progress");
  const [turn, setTurn] = useAtom(turnAtom);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerInstructions, setPlayerInstructions] = useState<
    Connect4Instruction[]
  >([]);
  const [instructionIndex, setInstructionIndex] = useState(0);

  const startSession = useCallback(async () => {
    if (player1model === player2model) {
      setTurn("error: models can't be the same");
      return;
    }
    setIsPlaying(true);
    setTurn("starting up...");
    setPlayerInstructions([]); // Reset instructions when starting new game
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
      setPlayerInstructions((prev) => [...prev, yellowPlayerInstruction]);
      setTurn("yellow executing turn...");
      await makeMove(
        player1SessionId,
        "yellow",
        `Make move ${
          yellowPlayerInstruction.bestMove
        } and these alternative moves: ${yellowPlayerInstruction.alternativeMoves.join(
          ", "
        )}`
      );
      const gameOverPlayer1 = await checkGameOver(
        player1SessionId,
        player1model
      );
      if (gameOverPlayer1 !== "in progress") {
        setWinner(gameOverPlayer1);
        break;
      }
      setTurn("red getting turn...");
      const redPlayerInstruction = await getMove(
        player2SessionId,
        player2model,
        "red"
      );
      setPlayerInstructions((prev) => [...prev, redPlayerInstruction]);
      setTurn("red executing turn...");
      await makeMove(
        player2SessionId,
        "red",
        `Make move ${
          redPlayerInstruction.bestMove
        } and these alternative moves: ${redPlayerInstruction.alternativeMoves.join(
          ", "
        )}`
      );
      const gameOverPlayer2 = await checkGameOver(
        player2SessionId,
        player2model
      );
      if (gameOverPlayer2 !== "in progress") {
        setWinner(gameOverPlayer2);
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

  if (winner !== "in progress") {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full p-8">
        <h1 className="text-2xl font-bold">Game Over - {winner}!</h1>
        <Card>
          <CardHeader>
            <CardTitle>{playerInstructions[instructionIndex].turn}</CardTitle>
            <CardDescription>
              {playerInstructions[instructionIndex].analysis}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{playerInstructions[instructionIndex].bestMove}</p>
            <p>
              {playerInstructions[instructionIndex].alternativeMoves.join(", ")}
            </p>
          </CardContent>
          <CardFooter>
            {instructionIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => setInstructionIndex(instructionIndex - 1)}
              >
                Previous
              </Button>
            )}
            {instructionIndex < playerInstructions.length - 1 && (
              <Button onClick={() => setInstructionIndex(instructionIndex + 1)}>
                Next
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full p-2 h-screen">
      {turn && (
        <div className="h-full flex-1 overflow-auto not-last-of-type:bg-gray-100 rounded-lg w-full grid grid-cols-2 gap-2 p-2">
          {turn.includes("red") && <div />}
          <div className="flex items-center justify-center h-full flex-grow">
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
                      ? playerInstructions[playerInstructions.length - 1]
                          ?.analysis +
                          `\n\n\n\n**Best move:** ${
                            playerInstructions[playerInstructions.length - 1]
                              ?.bestMove
                          }` || "No move yet"
                      : playerInstructions[playerInstructions.length - 1]
                          ?.analysis +
                          `<br /><br />**Best move:** ${
                            playerInstructions[playerInstructions.length - 1]
                              ?.bestMove
                          }` || "No move yet"
                  }
                  id={turn}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {isPlaying ? (
        <div className="not-last-of-type:bg-gray-100 rounded-lg w-full grid grid-cols-2 gap-2 p-2">
          <div
            className={cn(
              "flex flex-col",
              turn.includes("yellow") ? "bg-yellow-100" : "bg-gray-100"
            )}
          >
            <div className="aspect-video">
              <StagehandEmbed player="player1" title={player1model} />
            </div>
          </div>
          <div
            className={cn(
              "flex flex-col",
              turn.includes("red") ? "bg-red-100" : "bg-gray-100"
            )}
          >
            <div className="aspect-video">
              <StagehandEmbed player="player2" title={player2model} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen w-full p-8">
          {turn === "error: models can't be the same" && (
            <div className="p-8">
              <h1 className="text-2xl font-bold">
                Error - Use different models for each player
              </h1>
            </div>
          )}
          <p className="text-lg">Player 1</p>
          <Select
            value={player1model}
            onValueChange={(value) => setPlayer1model(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google/gemini-2.0-flash">
                Gemini 2.0 Flash
              </SelectItem>
              <SelectItem value="google/gemini-2.5-flash-preview-04-17">
                Gemini 2.5 Flash Preview
              </SelectItem>
              <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
              <SelectItem value="anthropic/claude-3-5-sonnet-latest">
                Claude 3.5 Sonnet
              </SelectItem>
              <SelectItem value="anthropic/claude-3-7-sonnet-latest">
                Claude 3.7 Sonnet
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm">vs</p>
          <p className="text-lg">Player 2</p>
          <Select
            value={player2model}
            onValueChange={(value) => setPlayer2model(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google/gemini-2.0-flash">
                Gemini 2.0 Flash
              </SelectItem>
              <SelectItem value="google/gemini-2.5-flash-preview-04-17">
                Gemini 2.5 Flash Preview
              </SelectItem>
              <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
              <SelectItem value="anthropic/claude-3-5-sonnet-latest">
                Claude 3.5 Sonnet
              </SelectItem>
              <SelectItem value="anthropic/claude-3-7-sonnet-latest">
                Claude 3.7 Sonnet
              </SelectItem>
            </SelectContent>
          </Select>
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
