import { SwitchBotError } from "./errors.js";

export type SwitchBotCommand =
  | "setBrightness"
  | "setColor"
  | "setColorTemperature"
  | "setAll"
  | "turnOff"
  | "turnOn";

export type SwitchBotCommandPayload = {
  command: SwitchBotCommand;
  commandType: "command";
  parameter: string;
};

export function createCommandPayload(
  command: SwitchBotCommand,
  parameter = "default",
): SwitchBotCommandPayload {
  return {
    command,
    commandType: "command",
    parameter,
  };
}

export function normalizeBrightness(value: unknown): string {
  const brightness = Number(value);

  if (!Number.isInteger(brightness) || brightness < 1 || brightness > 100) {
    throw new SwitchBotError("validation", "Brightness must be an integer from 1 to 100.");
  }

  return String(brightness);
}

export function normalizeColorInput(value: string | undefined): string {
  const color = value?.trim();
  const match = /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(color ?? "");

  if (!match) {
    throw new SwitchBotError("validation", "Color must use #RRGGBB format.");
  }

  const redHex = match[1];
  const greenHex = match[2];
  const blueHex = match[3];

  if (!redHex || !greenHex || !blueHex) {
    throw new SwitchBotError("validation", "Color must use #RRGGBB format.");
  }

  const channels = [redHex, greenHex, blueHex].map((hex) => Number.parseInt(hex, 16));
  return channels.join(":");
}
