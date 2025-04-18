import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { LanguageModel } from "ai";
import boxen from "boxen";

export function getModel(model: string): LanguageModel {
  const providerMap = {
    google: google,
    openai: openai,
  };
  const [provider, ...modelId] = model.split("/");
  return providerMap[provider as keyof typeof providerMap](modelId.join("/"));
}

export function announce(message: string, title?: string) {
  console.log(
    boxen(message, {
      padding: 1,
      margin: 3,
      title: title || "Stagehand",
    })
  );
}
