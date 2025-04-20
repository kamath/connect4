import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Connect4Instruction, StatusUpdate } from "@/types";

export const GameOver = ({
  winner,
  playerInstructions,
}: {
  winner: string;
  playerInstructions: StatusUpdate[];
}) => {
  const [instructionIndex, setInstructionIndex] = useState(0);
  const currentInstruction: Connect4Instruction = playerInstructions[
    instructionIndex
  ].instruction as Connect4Instruction;
  useEffect(() => {
    if (typeof currentInstruction.turn === "string") {
      if (instructionIndex == playerInstructions.length - 1) {
        setInstructionIndex(0);
      } else {
        setInstructionIndex(instructionIndex + 1);
      }
    }
  }, [currentInstruction, instructionIndex, playerInstructions]);
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full p-8">
      <h1 className="text-2xl font-bold">Game Over - {winner}!</h1>
      <Card>
        <CardHeader>
          <CardTitle>{currentInstruction.turn}</CardTitle>
          <CardDescription>{currentInstruction.analysis}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{currentInstruction.bestMove}</p>
          <p>{currentInstruction.alternativeMoves.join(", ")}</p>
        </CardContent>
        <CardFooter>
          {instructionIndex > 0 && (
            <Button
              variant="outline"
              onClick={() => setInstructionIndex(instructionIndex - 1)}
            >
              Previous
            </Button>
          )}
          {instructionIndex < playerInstructions.length - 1 && (
            <Button onClick={() => setInstructionIndex(instructionIndex + 1)}>
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
