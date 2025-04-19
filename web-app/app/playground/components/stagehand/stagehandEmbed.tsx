"use client";

import { player1debugUrlAtom, player2debugUrlAtom } from "@/atoms";
import { useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";

export function StagehandEmbed({
  player,
  title,
}: {
  player: "player1" | "player2";
  title: string;
}) {
  const debugUrl = useAtomValue(
    player === "player1" ? player1debugUrlAtom : player2debugUrlAtom
  );

  return (
    <div className="w-full h-full flex items-center justify-center flex-col">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-center">{title}</div>
        {debugUrl ? (
          <iframe src={debugUrl} className="w-full aspect-[1.3333]" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <button className="bg-red-500 font-bold text-white px-4 py-2 rounded-md flex items-center justify-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading
              Browserbase Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
