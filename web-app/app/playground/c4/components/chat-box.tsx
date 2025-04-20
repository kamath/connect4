"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { playerInstructionsAtom } from "../atoms";
import "./loadingDots.css";
interface ChatBoxProps {
  className?: string;
}

export function ChatBox({ className }: ChatBoxProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const playerInstructions = useAtomValue(playerInstructionsAtom);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [playerInstructions]);

  return (
    <div
      className={cn(
        "bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden h-full flex flex-col shadow-sm",
        className
      )}
    >
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <h2 className="font-medium text-sm">Move History</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {playerInstructions.map((step, index) => {
          if (typeof step.instruction === "string") {
            return (
              <div key={index} className={`flex flex-col`}>
                <div className="flex items-center mb-1">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {step.timestamp}
                  </span>
                </div>

                <div
                  className={`
					max-w-[85%] rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 rounded-tl-sm`}
                >
                  <div className="px-4 py-2.5">
                    <p className="text-sm">{step.instruction}</p>
                  </div>
                </div>
              </div>
            );
          }

          const instruction = step.instruction;
          return (
            <div key={index} className={`flex flex-col`}>
              <div className="flex items-center mb-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {instruction.turn}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div
                className={`
                  max-w-[85%] rounded-2xl overflow-hidden
                  ${
                    instruction.turn === "red"
                      ? "bg-red-500 text-white rounded-tl-sm"
                      : "bg-yellow-500 text-zinc-900 rounded-tl-sm"
                  }
                `}
              >
                {true && (
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 border-b border-zinc-300 dark:border-zinc-600">
                    <Image
                      src={`data:image/png;base64,${step.screenshot}`}
                      alt="Game board"
                      className="mb-0 rounded-lg"
                      width={1000}
                      height={10}
                    />
                  </div>
                )}
                <div className="px-4 py-2.5 flex flex-col gap-4">
                  <p className="text-sm">
                    <span className="font-bold">Analysis:</span>{" "}
                    {instruction.analysis}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold">Best move:</span>{" "}
                    {instruction.bestMove}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div className={`flex flex-col`}>
          <div className="flex items-center mb-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div
            className={`max-w-[85%] w-fit rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 rounded-tl-sm`}
          >
            <div className="px-4 py-2.5 w-fit">
              <div className="loading-dots" />
            </div>
          </div>
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
