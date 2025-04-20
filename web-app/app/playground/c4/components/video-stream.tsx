import { useAtomValue } from "jotai";
import { player1debugUrlAtom } from "../atoms";
import { StagehandEmbed } from "../../components/stagehand/stagehandEmbed";

interface VideoStreamProps {
  playerName: string;
  className?: string;
}

export function VideoStream({ playerName, className }: VideoStreamProps) {
  const debugUrl = useAtomValue(player1debugUrlAtom);
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="absolute inset-0 flex items-center justify-center">
          <StagehandEmbed debugUrl={debugUrl} title={playerName} />
        </div>

        {/* Player info overlay */}
        <div className="absolute top-4 left-4 bg-zinc-900/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center">
          <div
            className={`w-2 h-2 rounded-full ${
              playerName === "Player 1" ? "bg-red-500" : "bg-yellow-500"
            } mr-2`}
          ></div>
          <span className="text-sm font-medium text-white">
            {playerName} AI
          </span>
        </div>
      </div>
    </div>
  );
}
