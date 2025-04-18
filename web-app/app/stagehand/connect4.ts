"use server";

import { Stagehand } from "@browserbasehq/stagehand";
import { initFromSessionId } from "./main";
import { generateObject, LanguageModel } from "ai";
import { CoreMessage } from "ai";
import { getModel } from "./utils";
import { z } from "zod";
import { Connect4Instruction } from "@/types";

const ROOM_NAME = `stagehand-${crypto.randomUUID()}`;

export async function readyPlayer1(sessionId: string, model: string) {
  const stagehand = await initFromSessionId(sessionId, model);
  const page = stagehand.page;
  await page.goto("https://buddyboardgames.com/connect4");
  await page.act({
    action: "type %name% in the name field",
    variables: {
      name: model.replace(/[^a-zA-Z0-9]/g, ""),
    },
  });

  await page.act({
    action: "Type %roomname% in the room name field",
    variables: {
      roomname: ROOM_NAME,
    },
  });

  await page.act("click the play button");
  return {
    url: page.url().split("&")[0],
  };
}

export async function readyPlayer2(
  url: string,
  sessionId: string,
  model: string
) {
  const stagehand = await initFromSessionId(sessionId, model);
  const page = stagehand.page;
  await page.goto(url);
  await page.act({
    action: "type %name% in the name field",
    variables: {
      name: model.replace(/[^a-zA-Z0-9]/g, ""),
    },
  });

  await page.act("click the play button");
}

async function getPlayerInstructions(
  stagehandPlayer: Stagehand,
  player: "yellow" | "red",
  model: LanguageModel
): Promise<Connect4Instruction> {
  const screenshotData = await stagehandPlayer.page.screenshot();
  const messages: CoreMessage[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `You are an assistant helping the ${player} player playing connect 4.
		  First, start by describing the current state of the board, especially as it relates to ${player}'s strengths and weaknesses.
		  Then, reference the current state of the board to tell the ${player} player what move to make as clearly and concisely as possible.
			Column numbers are 1-indexed, so the first column is 1, the second is 2, etc.
			You can only make one move, you must also provide 2 alternative moves that you think are good.
			`,
        },
        {
          type: "image",
          image: screenshotData,
        },
      ],
    },
  ];
  const { object: instruction } = await generateObject({
    model: model,
    messages: messages,
    schema: z.object({
      analysis: z
        .string()
        .describe(
          "A description of the current state of the board, especially as it relates to the ${player}'s strengths and weaknesses."
        ),
      bestMove: z
        .string()
        .describe("The best move to make, i.e. 'Make a move in column 1'"),
      alternativeMoves: z
        .array(z.string())
        .describe(
          "2 alternative moves that you think are good, i.e. 'Make a move in column 2' and 'Make a move in column 3'"
        ),
    }),
  });

  return {
    turn: `${player} player turn`,
    analysis: instruction.analysis,
    bestMove: instruction.bestMove,
    alternativeMoves: instruction.alternativeMoves,
  };
}

export async function startGame(
  player1SessionId: string,
  player1Model: string
) {
  const stagehandPlayer1 = await initFromSessionId(
    player1SessionId,
    player1Model
  );
  await stagehandPlayer1.page.act("click 'start game'");
}

export async function checkGameOver(sessionId: string, model: string) {
  const stagehandPlayer = await initFromSessionId(sessionId, model);
  const page = stagehandPlayer.page;
  const { winner } = await page.extract({
    instruction: "Check if the game is over",
    schema: z.object({
      winner: z.enum(["yellow wins", "red wins", "tie", "in progress"]),
    }),
  });
  return winner;
}

// async function playGame(
//   stagehandPlayer1: Stagehand,
//   model1: string,
//   stagehandPlayer2: Stagehand,
//   model2: string
// ) {
//   const client1 = getModel(model1);
//   const client2 = getModel(model2);
//   while (true) {
//     const yellowPlayer = stagehandPlayer1.agent({
//       provider: "anthropic",
//       model: "claude-3-7-sonnet-20250219",
//     });
//     const redPlayer = stagehandPlayer2.agent({
//       provider: "anthropic",
//       model: "claude-3-7-sonnet-20250219",
//     });

//     const yellowPlayerInstruction = await getPlayerInstructions(
//       stagehandPlayer1,
//       "yellow",
//       client1
//     );
//     announce(yellowPlayerInstruction, chalk.yellow(model1));

//     await yellowPlayer.execute({
//       instruction: `You are the yellow player playing connect 4. Make ONLY ONE move. The move is described in the following instruction, where COLUMNS ARE 1-INDEXED: "${yellowPlayerInstruction}"`,
//     });
//     await new Promise((resolve) => setTimeout(resolve, 1000));

//     const redPlayerInstruction = await getPlayerInstructions(
//       stagehandPlayer2,
//       "red",
//       client2
//     );
//     announce(redPlayerInstruction, chalk.red(model2));
//     await redPlayer.execute({
//       instruction: `You are the red player playing connect 4. Make ONLY ONE move. The move is described in the following instruction, where COLUMNS ARE 1-INDEXED: "${redPlayerInstruction}"`,
//     });
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//   }
// }

export async function getMove(
  sessionId: string,
  model: string,
  player: "yellow" | "red"
) {
  const client = getModel(model);
  const stagehandPlayer = await initFromSessionId(sessionId, model);
  const instruction = await getPlayerInstructions(
    stagehandPlayer,
    player,
    client
  );
  return instruction;
}

export async function makeMove(
  sessionId: string,
  player: "yellow" | "red",
  instruction: string
) {
  const stagehandPlayer = await initFromSessionId(
    sessionId,
    "google/gemini-2.0-flash"
  );
  const agent = stagehandPlayer.agent({
    provider: "anthropic",
    model: "claude-3-7-sonnet-20250219",
  });

  await agent.execute({
    instruction: `You are the ${player} player playing connect 4. Make ONLY ONE move. The move is described in the following instruction, where COLUMNS ARE 1-INDEXED: "${instruction}". It is imperative that you ONLY make the move in the column specified in the instruction.`,
    maxSteps: 5,
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
