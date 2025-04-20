"use client";

import { VideoStream } from "./video-stream";
import { ChatBox } from "./chat-box";
import { Button } from "@/components/ui/button";

export function StreamLayout() {
  return (
    <div className="flex flex-col lg:flex-row h-screen w-full">
      <div className="flex-grow w-full h-full flex items-center justify-center flex-col gap-4">
        <VideoStream
          playerName="Player 1"
          className="w-full max-w-[1000px] aspect-[calc(1920/1080)] object-cover rounded-lg"
        />
        <div className="flex gap-2 w-full justify-center">
          <Button variant="outline">View Player 1</Button>
          <Button variant="outline">View Player 2</Button>
        </div>
      </div>
      <div className="w-full lg:max-w-[400px] lg:overflow-y-auto h-screen">
        <ChatBox className="h-full" />
      </div>
    </div>
  );
}
