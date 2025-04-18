"use server";

import { Stagehand } from "@browserbasehq/stagehand";
import { initFromSessionId } from "./main";
import { generateText, LanguageModel } from "ai";
import { CoreMessage } from "ai";
import { getModel } from "./utils";

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
) {
  const screenshotData = await stagehandPlayer.page.screenshot();
  const messages: CoreMessage[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `You are an assistant helping the ${player} player playing connect 4.
			Analyze the game and tell the ${player} player what move to make as clearly and concisely as possible.
			`,
        },
        {
          type: "image",
          image: screenshotData,
        },
      ],
    },
  ];
  const { text: instruction } = await generateText({
    model: model,
    messages: messages,
  });

  return instruction;
}

async function playGame(
  stagehandPlayer1: Stagehand,
  model1: string,
  stagehandPlayer2: Stagehand,
  model2: string
) {
  const client1 = getModel(model1);
  const client2 = getModel(model2);
  while (true) {
    const yellowPlayer = stagehandPlayer1.agent({
      provider: "openai",
      model: "computer-use-preview",
    });
    const redPlayer = stagehandPlayer2.agent({
      provider: "openai",
      model: "computer-use-preview",
    });

    const yellowPlayerInstruction = await getPlayerInstructions(
      stagehandPlayer1,
      "yellow",
      client1
    );
    // announce(yellowPlayerInstruction, chalk.yellow(MODEL_1.modelId));

    await yellowPlayer.execute({
      instruction: `You are the yellow player playing connect 4. Make ONLY ONE move. The move is described in the following instruction: "${yellowPlayerInstruction}"`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const redPlayerInstruction = await getPlayerInstructions(
      stagehandPlayer2,
      "red",
      client2
    );
    // announce(redPlayerInstruction, chalk.red(MODEL_2.modelId));
    await redPlayer.execute({
      instruction: `You are the red player playing connect 4. Make ONLY ONE move. The move is described in the following instruction: "${redPlayerInstruction}"`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export async function startGame(
  player1SessionId: string,
  player1Model: string,
  player2SessionId: string,
  player2Model: string
) {
  const stagehandPlayer1 = await initFromSessionId(
    player1SessionId,
    player1Model
  );
  const stagehandPlayer2 = await initFromSessionId(
    player2SessionId,
    player2Model
  );
  await stagehandPlayer1.page.act("click 'start game'");

  await playGame(
    stagehandPlayer1,
    player1Model,
    stagehandPlayer2,
    player2Model
  );
}
