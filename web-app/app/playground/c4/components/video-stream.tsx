import { User } from "lucide-react";

interface VideoStreamProps {
  playerName: string;
  streamId: string;
  className?: string;
}

export function VideoStream({
  playerName,
  streamId,
  className,
}: VideoStreamProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-zinc-400 flex flex-col items-center">
            <User size={48} strokeWidth={1.5} />
            <p className="mt-2 text-sm font-light">AI agent playing checkers</p>
          </div>
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
