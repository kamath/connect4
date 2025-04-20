import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAtom, useAtomValue } from "jotai";
import {
  instructionIndexAtom,
  playerInstructionsAtom,
  winnerAtom,
} from "@/atoms";

export const GameOver = () => {
  const winner = useAtomValue(winnerAtom);
  const playerInstructions = useAtomValue(playerInstructionsAtom);
  const [instructionIndex, setInstructionIndex] = useAtom(instructionIndexAtom);
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full p-8">
      <h1 className="text-2xl font-bold">Game Over - {winner}!</h1>
      <Card>
        <CardHeader>
          <CardTitle>{playerInstructions[instructionIndex].turn}</CardTitle>
          <CardDescription>
            {playerInstructions[instructionIndex].analysis}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{playerInstructions[instructionIndex].bestMove}</p>
          <p>
            {playerInstructions[instructionIndex].alternativeMoves.join(", ")}
          </p>
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
