"use client";

import { useAtom, useAtomValue } from "jotai";
import {
  activePlayerAtom,
  errorAtom,
  isPlayingAtom,
  MAX_RETRIES,
  player1debugUrlAtom,
  player1modelAtom,
  player1sessionIdAtom,
  player2debugUrlAtom,
  player2modelAtom,
  player2sessionIdAtom,
  playerInstructionsAtom,
  retriesAtom,
  scoresAtom,
  screenshotAtom,
  turnAtom,
  winnerAtom,
} from "./atoms";
import { useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";
import {
  checkGameOver,
  getMove,
  makeMove,
  readyPlayer1,
  readyPlayer2,
  startGame,
} from "../connect4";
import { startBBSSession } from "../main";
import { ChooseModels } from "./components/chooseModels";
import { StreamLayout } from "./components/stream-layout";
import { Board } from "@/types";

export default function Connect4() {
  const player1model = useAtomValue(player1modelAtom);
  const player2model = useAtomValue(player2modelAtom);
  const setPlayer1SessionId = useSetAtom(player1sessionIdAtom);
  const setPlayer2SessionId = useSetAtom(player2sessionIdAtom);
  const setPlayer1debugUrl = useSetAtom(player1debugUrlAtom);
  const setPlayer2debugUrl = useSetAtom(player2debugUrlAtom);
  const setWinner = useSetAtom(winnerAtom);
  const setTurn = useSetAtom(turnAtom);
  const setActivePlayer = useSetAtom(activePlayerAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const [playerInstructions, setPlayerInstructions] = useAtom(
    playerInstructionsAtom
  );
  const setScores = useSetAtom(scoresAtom);
  const setScreenshot = useSetAtom(screenshotAtom);
  useEffect(() => {
    console.log(playerInstructions);
  }, [playerInstructions]);
  const setError = useSetAtom(errorAtom);
  const setRetries = useSetAtom(retriesAtom);

  const startSession = useCallback(async () => {
    setTurn("starting up...");
    setPlayerInstructions([
      {
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        instruction: "starting up...",
      },
    ]); // Reset instructions when starting new game
    console.log("startSession");
    const { sessionId: player1SessionId, debugUrl: player1DebugUrl } =
      await startBBSSession();
    const { sessionId: player2SessionId, debugUrl: player2DebugUrl } =
      await startBBSSession();
    setPlayer1debugUrl(player1DebugUrl);
    setPlayer2debugUrl(player2DebugUrl);
    setPlayer1SessionId(player1SessionId);
    setPlayer2SessionId(player2SessionId);
    setActivePlayer("yellow");
    setTurn("setting up player 1");
    setPlayerInstructions((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        instruction: "setting up player 1",
      },
    ]);
    const { url: gameUrl } = await readyPlayer1(player1SessionId, player1model);
    setActivePlayer("red");
    setTurn("setting up player 2");
    setPlayerInstructions((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        instruction: "setting up player 2",
      },
    ]);
    await readyPlayer2(gameUrl, player2SessionId, player2model);
    setActivePlayer("yellow");
    setTurn("yellow getting turn...");
    await startGame(player1SessionId, player1model);
    let currentScreenshot: string | undefined = undefined;
    let currentBoard: Board | undefined = undefined;
    let currentScores:
      | { red: number; yellow: number; redDiff: number; yellowDiff: number }
      | undefined = undefined;
    while (true) {
      // Yellow's turn
      let yellowRetries = 0;
      while (yellowRetries < MAX_RETRIES) {
        try {
          const {
            playerInstruction: yellowPlayerInstruction,
            llmTelemetry: yellowLLMTelemetry,
          } = await getMove(player1SessionId, player1model, "yellow");
          setTurn("yellow executing turn...");
          setPlayerInstructions((prev) => [
            ...prev,
            {
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              instruction: yellowPlayerInstruction,
              screenshot: currentScreenshot,
              board: currentBoard,
              scores: currentScores,
              llmTelemetry: yellowLLMTelemetry,
            },
          ]);
          const {
            screenshot: yellowScreenshot,
            board: yellowBoard,
            scores: yellowScores,
          } = await makeMove(
            player1SessionId,
            player1model,
            player2model,
            "yellow",
            `Make move ${
              yellowPlayerInstruction.bestMove
            } and these alternative moves: ${yellowPlayerInstruction.alternativeMoves.join(
              ", "
            )}`,
            { y: currentScores?.yellow || 0, r: currentScores?.red || 0 }
          );
          setScreenshot(yellowScreenshot);
          currentScreenshot = yellowScreenshot;
          currentBoard = yellowBoard;
          setScores({
            red: yellowScores.r,
            yellow: yellowScores.y,
            redDiff:
              currentScores && currentScores.red
                ? yellowScores.r - currentScores.red
                : 0,
            yellowDiff:
              currentScores && currentScores.yellow
                ? yellowScores.y - currentScores.yellow
                : 0,
          });
          setPlayerInstructions((prev) => [
            ...prev.slice(0, -1),
            {
              ...prev[prev.length - 1],
              scores: {
                ...currentScores,
                red: yellowScores.r,
                yellow: yellowScores.y,
                redDiff:
                  currentScores && currentScores.red
                    ? yellowScores.r - currentScores.red
                    : 0,
                yellowDiff:
                  currentScores && currentScores.yellow
                    ? yellowScores.y - currentScores.yellow
                    : 0,
              },
            },
          ]);
          currentScores = {
            red: yellowScores.r,
            yellow: yellowScores.y,
            redDiff:
              currentScores && currentScores.red
                ? yellowScores.r - currentScores.red
                : 0,
            yellowDiff:
              currentScores && currentScores.yellow
                ? yellowScores.y - currentScores.yellow
                : 0,
          };
          const gameOverPlayer1 = await checkGameOver(
            player1SessionId,
            player1model
          );
          if (gameOverPlayer1 !== "in progress") {
            setWinner("yellow wins");
            break;
          }
          break; // Success, exit retry loop
        } catch (e) {
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError("Unknown error");
          }
          setRetries((prev) => prev + 1);
          yellowRetries++;
        }
      }
      if (yellowRetries >= MAX_RETRIES) {
        setWinner("yellow wins");
        break;
      }
      setRetries(0);

      // Red's turn
      let redRetries = 0;
      while (redRetries < MAX_RETRIES) {
        try {
          const {
            playerInstruction: redPlayerInstruction,
            llmTelemetry: redLLMTelemetry,
          } = await getMove(player2SessionId, player2model, "red");
          setPlayerInstructions((prev) => [
            ...prev,
            {
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              instruction: redPlayerInstruction,
              screenshot: currentScreenshot,
              board: currentBoard,
              scores: currentScores,
              llmTelemetry: redLLMTelemetry,
            },
          ]);
          const {
            board: redBoard,
            scores: redScores,
            screenshot: redScreenshot,
          } = await makeMove(
            player2SessionId,
            player1model,
            player2model,
            "red",
            `Make move ${
              redPlayerInstruction.bestMove
            } and these alternative moves: ${redPlayerInstruction.alternativeMoves.join(
              ", "
            )}`,
            { y: currentScores?.yellow || 0, r: currentScores?.red || 0 }
          );
          setScreenshot(redScreenshot);
          currentScreenshot = redScreenshot;
          currentBoard = redBoard;
          setScores({
            ...currentScores,
            red: redScores.r,
            yellow: redScores.y,
            redDiff:
              currentScores && currentScores.red
                ? redScores.r - currentScores.red
                : 0,
            yellowDiff:
              currentScores && currentScores.yellow
                ? redScores.y - currentScores.yellow
                : 0,
          });
          setPlayerInstructions((prev) => [
            ...prev.slice(0, -1),
            {
              ...prev[prev.length - 1],
              scores: {
                ...currentScores,
                red: redScores.r,
                yellow: redScores.y,
                redDiff:
                  currentScores && currentScores.red
                    ? redScores.r - currentScores.red
                    : 0,
                yellowDiff:
                  currentScores && currentScores.yellow
                    ? redScores.y - currentScores.yellow
                    : 0,
              },
            },
          ]);
          currentScores = {
            red: redScores.r,
            yellow: redScores.y,
            redDiff:
              currentScores && currentScores.red
                ? redScores.r - currentScores.red
                : 0,
            yellowDiff:
              currentScores && currentScores.yellow
                ? redScores.y - currentScores.yellow
                : 0,
          };
          break; // Success, exit retry loop
        } catch (e) {
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError("Unknown error");
          }
          setRetries((prev) => prev + 1);
          redRetries++;
        }
      }
      if (redRetries >= MAX_RETRIES) {
        setWinner("yellow wins");
        break;
      }
      setRetries(0);
      const gameOverPlayer2 = await checkGameOver(
        player2SessionId,
        player2model
      );
      if (gameOverPlayer2 !== "in progress") {
        setWinner("red wins");
        break;
      }
      setActivePlayer("yellow");
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
    setPlayerInstructions,
    setScreenshot,
    setScores,
    setActivePlayer,
    setError,
    setRetries,
  ]);

  useEffect(() => {
    if (isPlaying) startSession();
  }, [isPlaying, startSession]);

  //   if (winner && winner !== "in progress") {
  //     return <GameOver winner={winner} playerInstructions={playerInstructions} />;
  //   }

  if (isPlaying) {
    return <StreamLayout />;
  }
  return <ChooseModels />;
}
