"use client";

import { useAtom, useAtomValue } from "jotai";
import {
  isPlayingAtom,
  player1debugUrlAtom,
  player1modelAtom,
  player1sessionIdAtom,
  player2debugUrlAtom,
  player2modelAtom,
  player2sessionIdAtom,
  playerInstructionsAtom,
  screenshotAtom,
  turnAtom,
  winnerAtom,
} from "./atoms";
import { StagehandEmbed } from "../components/stagehand/stagehandEmbed";
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
import { cn } from "@/lib/utils";
import { ChooseModels } from "../c4/components/chooseModels";
import { GameOver } from "../components/stagehand/gameOver";
import { HorizontalTurnStatus } from "./components/horizontalTurnStatus";
export default function Connect4() {
  const player1model = useAtomValue(player1modelAtom);
  const player2model = useAtomValue(player2modelAtom);
  const setPlayer2debugUrl = useSetAtom(player2debugUrlAtom);
  const setPlayer1SessionId = useSetAtom(player1sessionIdAtom);
  const setPlayer2SessionId = useSetAtom(player2sessionIdAtom);
  const setPlayer1debugUrl = useSetAtom(player1debugUrlAtom);
  const [winner, setWinner] = useAtom(winnerAtom);
  const [turn, setTurn] = useAtom(turnAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const setPlayerInstructions = useSetAtom(playerInstructionsAtom);
  const setScreenshot = useSetAtom(screenshotAtom);

  const startSession = useCallback(async () => {
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
      const { screenshot: yellowScreenshot } = await makeMove(
        player1SessionId,
        "yellow",
        `Make move ${
          yellowPlayerInstruction.bestMove
        } and these alternative moves: ${yellowPlayerInstruction.alternativeMoves.join(
          ", "
        )}`
      );
      setScreenshot(yellowScreenshot);
      const gameOverPlayer1 = await checkGameOver(
        player1SessionId,
        player1model
      );
      if (gameOverPlayer1 !== "in progress") {
        setWinner("yellow wins");
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
      const { screenshot: redScreenshot } = await makeMove(
        player2SessionId,
        "red",
        `Make move ${
          redPlayerInstruction.bestMove
        } and these alternative moves: ${redPlayerInstruction.alternativeMoves.join(
          ", "
        )}`
      );
      setScreenshot(redScreenshot);
      const gameOverPlayer2 = await checkGameOver(
        player2SessionId,
        player2model
      );
      if (gameOverPlayer2 !== "in progress") {
        setWinner("red wins");
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
    setPlayerInstructions,
    setScreenshot,
  ]);

  useEffect(() => {
    if (isPlaying) startSession();
  }, [isPlaying, startSession]);

  if (winner && winner !== "in progress") {
    return <GameOver />;
  }

  return (
    <div className="flex flex-col items-center w-full p-2 h-screen">
      {turn && <HorizontalTurnStatus />}
      {isPlaying ? (
        <div className="not-last-of-type:bg-gray-100 rounded-lg w-full grid grid-cols-2 gap-2 p-2">
          <div
            className={cn(
              "flex flex-col",
              turn.includes("yellow") ? "bg-yellow-100" : "bg-gray-100"
            )}
          >
            <div className="aspect-video">
              <StagehandEmbed debugUrl={player1debugUrl} title={player1model} />
            </div>
          </div>
          <div
            className={cn(
              "flex flex-col",
              turn.includes("red") ? "bg-red-100" : "bg-gray-100"
            )}
          >
            <div className="aspect-video">
              <StagehandEmbed debugUrl={player2debugUrl} title={player2model} />
            </div>
          </div>
        </div>
      ) : (
        <ChooseModels />
      )}
    </div>
  );
}
