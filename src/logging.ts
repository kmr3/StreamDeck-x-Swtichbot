import streamDeck from "@elgato/streamdeck";

import { isSwitchBotError } from "./switchbot/errors.js";

export function logSwitchBotError(error: unknown, context: string): void {
  if (isSwitchBotError(error)) {
    const data = {
      context,
      httpStatus: error.httpStatus,
      kind: error.kind,
      message: error.message,
      statusCode: error.statusCode,
    };

    if (error.kind === "auth" || error.kind === "rate-limit" || error.kind === "validation") {
      streamDeck.logger.warn("SwitchBot request warning", data);
      return;
    }

    streamDeck.logger.error("SwitchBot request error", data);
    return;
  }

  streamDeck.logger.error("Unexpected SwitchBot error", {
    context,
    message: error instanceof Error ? error.message : String(error),
  });
}
