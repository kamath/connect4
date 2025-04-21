import { StagehandEmbed } from "../../components/stagehand/stagehandEmbed";

import { useAtom, useAtomValue } from "jotai";
import { activePlayerAtom } from "../atoms";
import { player1modelAtom } from "../atoms";
interface VideoStreamProps {
  playerName: string;
  className?: string;
  debugUrl: string;
}

export function VideoStream({
  playerName,
  className,
  debugUrl,
}: VideoStreamProps) {
  const player1Model = useAtomValue(player1modelAtom);
  const [activePlayer, setActivePlayer] = useAtom(activePlayerAtom);
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="absolute inset-0">
          {/* Player 2 stream (bottom layer) */}
          <div className="absolute inset-0">
            <StagehandEmbed debugUrl={debugUrl} title={playerName} />
          </div>
          {/* Player 1 stream (top layer) */}
          <div className="absolute inset-0">
            <StagehandEmbed debugUrl={debugUrl} title={playerName} />
          </div>
        </div>

        {/* Player info overlay */}
        <div className="absolute top-4 left-4 bg-zinc-900/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center">
          <div
            className={`w-4 h-4 rounded-full ${
              playerName === player1Model ? "bg-yellow-500" : "bg-red-500"
            } mr-2`}
          ></div>
          <span className="text-lg font-medium text-white">
            {playerName}{" "}
            <a
              href="#"
              className="text-blue-300 hover:text-zinc-300"
              onClick={() =>
                setActivePlayer(activePlayer === "yellow" ? "red" : "yellow")
              }
            >
              (switch)
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
