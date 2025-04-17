import { Stagehand, Page, BrowserContext } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import chalk from "chalk";
import boxen from "boxen";
import { drawObserveOverlay, clearOverlays, actWithCache } from "./utils.js";
import { z } from "zod";

const MODEL_1 = "gemini-2.0-flash";
const MODEL_2 = "gemini-2.0-flash";

const ROOM_NAME = `stagehandarena426`;

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
      name: "model 1",
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
      name: "model 2",
    },
  });

  await page.act("click the play button");
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
    modelName: MODEL_1,
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

  const stagehandPlayer2 = new Stagehand({
    ...StagehandConfig,
    modelName: MODEL_2,
  });
  await stagehandPlayer2.init();

  console.log("URL", url);
  await readyPlayer2(
    {
      page: stagehandPlayer2.page,
      context: stagehandPlayer2.context,
      stagehand: stagehandPlayer2,
    },
    url
  );

  await stagehandPlayer1.page.act("click 'start game'");

  while (true) {
    const agent1 = await stagehandPlayer1.agent({
      provider: "openai",
      model: "computer-use-preview",
    });
    const agent2 = await stagehandPlayer2.agent({
      provider: "anthropic",
      model: "claude-3-7-sonnet-20250219",
    });
    await agent1.execute({
      instruction:
        "you are the yellow player playing connect 4, make ONLY ONE move",
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await agent2.execute({
      instruction:
        "you are the red player playing connect 4, make ONLY ONE move",
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  await new Promise((resolve) => setTimeout(resolve, 100_000));
  await stagehandPlayer1.close();
  await stagehandPlayer2.close();
  console.log(
    `\n🤘 Thanks so much for using Stagehand! Reach out to us on Slack if you have any feedback: ${chalk.blue(
      "https://stagehand.dev/slack"
    )}\n`
  );
}

run();
