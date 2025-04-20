import { useAtomValue } from "jotai";
import {
  isPlayingAtom,
  playerInstructionsAtom,
  screenshotAtom,
  turnAtom,
} from "@/atoms";
import { MemoizedMarkdown } from "../../components/memoized-markdown";
import Image from "next/image";

export const HorizontalTurnStatus = () => {
  const turn = useAtomValue(turnAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const playerInstructions = useAtomValue(playerInstructionsAtom);
  const screenshot = useAtomValue(screenshotAtom);
  return (
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
            {turn.includes("turn") && (
              <MemoizedMarkdown
                content={
                  turn.includes("getting turn")
                    ? "Waiting for move..."
                    : turn.includes("yellow")
                    ? `**Analysis:** ${
                        playerInstructions[playerInstructions.length - 1]
                          ?.analysis
                      }
				  \n\n**Best move:** ${
            playerInstructions[playerInstructions.length - 1]?.bestMove
          }` || "No move yet"
                    : `**Analysis:** ${
                        playerInstructions[playerInstructions.length - 1]
                          ?.analysis
                      }
				  \n\n**Best move:** ${
            playerInstructions[playerInstructions.length - 1]?.bestMove
          }` || "No move yet"
                }
                id={turn}
              />
            )}
            {screenshot && (
              <Image
                src={`data:image/png;base64,${screenshot}`}
                alt="Game board"
                className="mb-4 rounded-lg"
                width={1000}
                height={1000}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
