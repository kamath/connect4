"use client";

import { VideoStream } from "./video-stream";
import { ChatBox } from "./chat-box";
import {
  activePlayerAtom,
  player1debugUrlAtom,
  player1modelAtom,
  player2debugUrlAtom,
  player2modelAtom,
  scoresAtom,
  turnAtom,
} from "@/app/playground/c4/atoms";
import { useAtom, useAtomValue } from "jotai";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const providerLogos = {
  alibaba: "/icons/alibabaicon.svg",
  openai: "/icons/openaiicon.svg",
  anthropic: "/icons/claudeicon.png",
  google: "/icons/googleicon.svg",
  deepseek: "/icons/deepseekicon.png",
  meta: "/icons/metaicon.svg",
};

export function StreamLayout() {
  const scores = useAtomValue(scoresAtom);
  const turn = useAtomValue(turnAtom);
  const redRatio = scores ? scores?.red / (scores?.red + scores?.yellow) : 0;
  const yellowRatio = scores
    ? scores?.yellow / (scores?.red + scores?.yellow)
    : 0;
  const player1Model = useAtomValue(player1modelAtom);
  const player2Model = useAtomValue(player2modelAtom);
  const player1debugUrl = useAtomValue(player1debugUrlAtom);
  const player2debugUrl = useAtomValue(player2debugUrlAtom);
  const [activePlayer, setActivePlayer] = useAtom(activePlayerAtom);

  useEffect(() => {
    if (turn.includes("red")) {
      setActivePlayer("red");
    } else if (turn.includes("yellow")) {
      setActivePlayer("yellow");
    }
  }, [turn, setActivePlayer]);

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] w-full overflow-hidden justify-items-stretch">
      <div className="flex-grow w-full flex items-center justify-between flex-col gap-4">
        <div className="flex w-full justify-between py-4">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold text-black w-16 aspect-square p-4">
                <Image
                  src={
                    providerLogos[
                      player1Model.split("/")[0] as keyof typeof providerLogos
                    ]
                  }
                  alt={player1Model}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </h1>
            </div>
          </div>
          <div className="flex flex-grow">
            <div
              style={{
                width: scores
                  ? `${(scores.yellow / (scores.red + scores.yellow)) * 100}%`
                  : "50%",
              }}
              className="h-full bg-yellow-500 flex items-center justify-end px-4 py-2 rounded-l-xl"
            >
              {yellowRatio > 0.5 && (
                <h1 className="text-4xl font-bold text-white pl-4 flex items-center gap-2">
                  <span className="text-sm">
                    ({scores?.yellowDiff && scores?.yellowDiff > 0 ? "+" : ""}
                    {Math.floor((scores?.yellowDiff || 0) * 10_000) / 100})
                  </span>
                  {Math.floor(yellowRatio * 100)}%{" "}
                </h1>
              )}
            </div>
            <div
              style={{
                width: scores
                  ? `${(scores.red / (scores.red + scores.yellow)) * 100}%`
                  : "50%",
              }}
              className="h-full bg-red-500 flex items-center justify-start py-2 px-4 gap-4 rounded-r-xl"
            >
              {redRatio > 0.5 && (
                <h1 className="text-4xl font-bold text-white flex items-center gap-2">
                  {Math.floor(redRatio * 100)}%{" "}
                  <span className="text-sm">
                    ({scores?.redDiff && scores?.redDiff > 0 ? "+" : ""}
                    {Math.floor((scores?.redDiff || 0) * 10_000) / 100})
                  </span>
                </h1>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold text-black w-16 aspect-square p-4">
                <Image
                  src={
                    providerLogos[
                      player2Model.split("/")[0] as keyof typeof providerLogos
                    ]
                  }
                  alt={player2Model}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </h1>
            </div>
          </div>
        </div>
        <div className="flex-grow flex flex-col w-full items-center justify-center gap-4">
          <VideoStream
            playerName={player1Model}
            debugUrl={player1debugUrl || ""}
            className={cn(
              "w-full max-w-[1000px] aspect-[calc(1920/1080)] object-cover rounded-lg",
              activePlayer === "yellow" ? "block" : "hidden"
            )}
          />
          <VideoStream
            playerName={player2Model}
            debugUrl={player2debugUrl || ""}
            className={cn(
              "w-full max-w-[1000px] aspect-[calc(1920/1080)] object-cover rounded-lg",
              activePlayer === "red" ? "block" : "hidden"
            )}
          />
        </div>
      </div>
      <div className="w-full lg:w-[400px] h-full overflow-y-auto">
        <ChatBox className="h-full" />
      </div>
    </div>
  );
}
