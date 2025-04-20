"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface Message {
  id: number;
  author: string;
  text: string;
  hasScreenshot?: boolean;
}

interface ChatBoxProps {
  messages: Message[];
  className?: string;
}

export function ChatBox({ messages, className }: ChatBoxProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        {messages.map((message) => {
          const isPlayer1 = message.author === "Player 1";
          return (
            <div key={message.id} className={`flex flex-col`}>
              <div className="flex items-center mb-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {message.author}
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
                    isPlayer1
                      ? "bg-red-500 text-white rounded-tl-sm"
                      : "bg-yellow-500 text-zinc-900 rounded-tl-sm"
                  }
                `}
              >
                {message.hasScreenshot && (
                  <div className="w-full aspect-square bg-zinc-200 dark:bg-zinc-700 border-b border-zinc-300 dark:border-zinc-600">
                    {/* Screenshot placeholder */}
                  </div>
                )}
                <div className="px-4 py-2.5">
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
