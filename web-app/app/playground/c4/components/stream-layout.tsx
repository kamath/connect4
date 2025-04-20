"use client";

import { useState } from "react";
import { VideoStream } from "./video-stream";
import { ChatBox } from "./chat-box";
import { Button } from "@/components/ui/button";

export function StreamLayout() {
  const [messages, setMessages] = useState<
    { id: number; author: string; text: string; hasScreenshot: boolean }[]
  >([
    {
      id: 1,
      author: "Player 1",
      text: "Initializing checkers algorithm...",
      hasScreenshot: false,
    },
    {
      id: 2,
      author: "Player 2",
      text: "Ready to play. Waiting for first move.",
      hasScreenshot: false,
    },
    {
      id: 3,
      author: "Player 1",
      text: "Moving piece from C3 to D4",
      hasScreenshot: true,
    },
    {
      id: 4,
      author: "Player 2",
      text: "Analyzing board state...",
      hasScreenshot: false,
    },
    {
      id: 5,
      author: "Player 2",
      text: "Moving piece from E5 to C3, capturing opponent's piece",
      hasScreenshot: true,
    },
    {
      id: 6,
      author: "Player 1",
      text: "Calculating optimal response...",
      hasScreenshot: false,
    },
    {
      id: 7,
      author: "Player 1",
      text: "Moving piece from B2 to D4, capturing opponent's piece",
      hasScreenshot: true,
    },
  ]);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full">
      <div className="flex-grow w-full h-full flex items-center justify-center flex-col gap-4">
        <VideoStream
          playerName="Player 1"
          streamId="stream1"
          className="w-full max-w-[1000px] aspect-[calc(1920/1080)] object-cover rounded-lg"
        />
        <div className="flex gap-2 w-full justify-center">
          <Button variant="outline">View Player 1</Button>
          <Button variant="outline">View Player 2</Button>
          <Button
            onClick={() => {
              setMessages([
                ...messages,
                {
                  id: 8,
                  author: "Player 3",
                  text: "Ready to play. Waiting for first move.",
                  hasScreenshot: false,
                },
              ]);
            }}
          >
            Add message
          </Button>
        </div>
      </div>
      <div className="w-full lg:max-w-[400px] lg:overflow-y-auto h-screen">
        <ChatBox messages={messages} className="h-full" />
      </div>
    </div>
  );
}
