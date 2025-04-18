import { Stagehand, Page, BrowserContext } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import chalk from "chalk";
import boxen from "boxen";
import { announce } from "./utils.js";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { AISdkClient } from "./llm_clients/aisdk_client.js";
import { generateText, CoreMessage } from "ai";

const MODEL_1 = google("gemini-2.5-flash-preview-04-17");
const MODEL_2 = openai("gpt-4.1");

const ROOM_NAME = `stagehand-${crypto.randomUUID()}`;

async function playGame(
  stagehandPlayer1: Stagehand,
  stagehandPlayer2: Stagehand
) {
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
      "yellow"
    );
    announce(yellowPlayerInstruction, chalk.yellow(MODEL_1.modelId));

    await yellowPlayer.execute({
      instruction: `You are the yellow player playing connect 4. Make ONLY ONE move. The move is described in the following instruction: "${yellowPlayerInstruction}"`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const redPlayerInstruction = await getPlayerInstructions(
      stagehandPlayer2,
      "red"
    );
    announce(redPlayerInstruction, chalk.red(MODEL_2.modelId));
    await redPlayer.execute({
      instruction: `You are the red player playing connect 4. Make ONLY ONE move. The move is described in the following instruction: "${redPlayerInstruction}"`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function readyPlayer1({
  page,
  context,
  stagehand,
}: {
  page: Page; // Playwright Page with act, extract, and observe methods
  context: BrowserContext; // Playwright BrowserContext
  stagehand: Stagehand; // Stagehand instance
}) {
  await page.goto("https://buddyboardgames.com/connect4");
  await page.act({
    action: "type %name% in the name field",
    variables: {
      name: MODEL_1.modelId.replace(/[^a-zA-Z0-9]/g, ""),
    },
  });

  await page.act({
    action: "Type %roomname% in the room name field",
    variables: {
      roomname: ROOM_NAME,
    },
  });

  await page.act("click the play button");
  return page.url().split("&")[0];
}

async function readyPlayer2(
  {
    page,
    context,
    stagehand,
  }: { page: Page; context: BrowserContext; stagehand: Stagehand },
  url: string
) {
  await page.goto(url);
  await page.act({
    action: "type %name% in the name field",
    variables: {
      name: MODEL_2.modelId.replace(/[^a-zA-Z0-9]/g, ""),
    },
  });

  await page.act("click the play button");
}

async function getPlayerInstructions(
  stagehandPlayer: Stagehand,
  player: "yellow" | "red"
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
    model: MODEL_1,
    messages: messages,
  });

  return instruction;
}

/**
 * This is the main function that runs when you do npm run start
 *
 * YOU PROBABLY DON'T NEED TO MODIFY ANYTHING BELOW THIS POINT!
 *
 */
async function run() {
  const stagehandPlayer1 = new Stagehand({
    ...StagehandConfig,
    llmClient: new AISdkClient({ model: MODEL_1 }),
  });
  await stagehandPlayer1.init();

  if (
    StagehandConfig.env === "BROWSERBASE" &&
    stagehandPlayer1.browserbaseSessionID
  ) {
    console.log(
      boxen(
        `View this session live in your browser: \n${chalk.blue(
          `https://browserbase.com/sessions/${stagehandPlayer1.browserbaseSessionID}`
        )}`,
        {
          title: "Browserbase",
          padding: 1,
          margin: 3,
        }
      )
    );
  }

  const url = await readyPlayer1({
    page: stagehandPlayer1.page,
    context: stagehandPlayer1.context,
    stagehand: stagehandPlayer1,
  });

  console.log("URL", url);

  const stagehandPlayer2 = new Stagehand({
    ...StagehandConfig,
    llmClient: new AISdkClient({ model: MODEL_2 }),
  });
  await stagehandPlayer2.init();

  if (
    StagehandConfig.env === "BROWSERBASE" &&
    stagehandPlayer2.browserbaseSessionID
  ) {
    console.log(
      boxen(
        `View this session live in your browser: \n${chalk.blue(
          `https://browserbase.com/sessions/${stagehandPlayer2.browserbaseSessionID}`
        )}`,
        {
          title: "Browserbase",
          padding: 1,
          margin: 3,
        }
      )
    );
  }

  await readyPlayer2(
    {
      page: stagehandPlayer2.page,
      context: stagehandPlayer2.context,
      stagehand: stagehandPlayer2,
    },
    url
  );

  await stagehandPlayer1.page.act("click 'start game'");

  await playGame(stagehandPlayer1, stagehandPlayer2);

  await stagehandPlayer1.close();
  await stagehandPlayer2.close();
  console.log(
    `\n🤘 Thanks so much for using Stagehand! Reach out to us on Slack if you have any feedback: ${chalk.blue(
      "https://stagehand.dev/slack"
    )}\n`
  );
}

run();
