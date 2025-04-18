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
import { useAtomValue, useSetAtom } from "jotai";
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

export default function Connect4() {
  const player1model = useAtomValue(player1modelAtom);
  const player2model = useAtomValue(player2modelAtom);
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
    const { url: gameUrl } = await readyPlayer1(player1SessionId, player1model);
    await readyPlayer2(gameUrl, player2SessionId, player2model);
    await startGame(player1SessionId, player1model);
    setTurn("yellow");
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
      await makeMove(player1SessionId, "yellow", yellowPlayerInstruction);
      const gameOverPlayer1 = await checkGameOver(
        player1SessionId,
        player1model
      );
      if (gameOverPlayer1) {
        setWinner("yellow");
        break;
      }
      setTurn("red");
      const redPlayerInstruction = await getMove(
        player2SessionId,
        player2model,
        "red"
      );
      setPlayerInstructions((prev) => ({
        ...prev,
        red: [...prev.red, redPlayerInstruction],
      }));
      await makeMove(player2SessionId, "red", redPlayerInstruction);
      const gameOverPlayer2 = await checkGameOver(
        player2SessionId,
        player2model
      );
      if (gameOverPlayer2) {
        setWinner("red");
        break;
      }
      setTurn("yellow");
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
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-8">
        <h1 className="text-2xl font-bold">Game Over - {winner} wins!</h1>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-8">
        {turn && (
          <h1 className="text-2xl font-bold">
            {turn === "yellow" ? "Yellow" : "Red"} Turn
          </h1>
        )}
        {isPlaying ? (
          <div className="bg-gray-100 rounded-lg w-full grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <div>
                <StagehandEmbed player="player1" title={player1model} />
              </div>
              <div className="mt-4 p-4 bg-white rounded-lg h-1/5 overflow-y-auto">
                <h3 className="font-bold mb-2">Yellow Player Instructions:</h3>
                <ul className="list-disc pl-4">
                  {playerInstructions.yellow.map((instruction, index) => (
                    <li key={index} className="text-yellow-600">
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col">
              <div>
                <StagehandEmbed player="player2" title={player2model} />
              </div>
              <div className="mt-4 p-4 bg-white rounded-lg h-1/5 overflow-y-auto">
                <h3 className="font-bold mb-2">Red Player Instructions:</h3>
                <ul className="list-disc pl-4">
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
          <a
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={startSession}
            href={"#"}
          >
            Start Session
          </a>
        )}
      </div>
    </>
  );
}
