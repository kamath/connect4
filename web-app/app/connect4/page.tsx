"use client";

import {
  player1debugUrlAtom,
  player1modelAtom,
  player1sessionIdAtom,
  player2debugUrlAtom,
  player2modelAtom,
  player2sessionIdAtom,
} from "@/atoms";
import { StagehandEmbed } from "../components/stagehand/stagehandEmbed";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { readyPlayer1, readyPlayer2, startGame } from "../stagehand/connect4";
import { startBBSSession } from "../stagehand/main";

export default function Connect4() {
  const player1model = useAtomValue(player1modelAtom);
  const player2model = useAtomValue(player2modelAtom);
  const setPlayer2debugUrl = useSetAtom(player2debugUrlAtom);
  const setPlayer1SessionId = useSetAtom(player1sessionIdAtom);
  const setPlayer2SessionId = useSetAtom(player2sessionIdAtom);
  const setPlayer1debugUrl = useSetAtom(player1debugUrlAtom);

  const [isPlaying, setIsPlaying] = useState(false);

  const startSession = useCallback(async () => {
    setIsPlaying(true);
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
    await startGame(
      player1SessionId,
      player1model,
      player2SessionId,
      player2model
    );
  }, [
    player1model,
    player2model,
    setPlayer1debugUrl,
    setPlayer1SessionId,
    setPlayer2debugUrl,
    setPlayer2SessionId,
  ]);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-8">
        {isPlaying ? (
          <div className="bg-gray-100 rounded-lg w-full h-full flex-grow grid grid-cols-2 gap-4">
            <div className="">
              <StagehandEmbed player="player1" title={player1model} />
            </div>
            <div className="">
              <StagehandEmbed player="player2" title={player2model} />
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
