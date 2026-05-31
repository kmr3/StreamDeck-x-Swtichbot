import type { JsonObject } from "@elgato/utils";

import { SwitchBotError } from "./errors.js";

export const AIRCON_MODES = {
  auto: 1,
  cool: 2,
  dry: 3,
  fan: 4,
  heat: 5,
} as const;

export const AIRCON_FAN_SPEEDS = {
  auto: 1,
  high: 4,
  low: 2,
  medium: 3,
} as const;

export type AirconMode = (typeof AIRCON_MODES)[keyof typeof AIRCON_MODES];
export type AirconFanSpeed = (typeof AIRCON_FAN_SPEEDS)[keyof typeof AIRCON_FAN_SPEEDS];
export type AirconPowerState = "off" | "on";

export type AirconState = JsonObject & {
  fanSpeed: AirconFanSpeed;
  mode: AirconMode;
  powerState: AirconPowerState;
  temperature: number;
};

export function createAirconParameter(state: AirconState): string {
  return `${state.temperature},${state.mode},${state.fanSpeed},${state.powerState}`;
}

export function normalizeAirconTemperature(value: unknown, fallback: number): number {
  const temperature =
    value === undefined || value === null || value === "" ? fallback : Number(value);

  if (!Number.isInteger(temperature)) {
    throw new SwitchBotError("validation", "Air conditioner temperature must be an integer.");
  }

  return clampAirconTemperature(temperature);
}

export function clampAirconTemperature(value: number): number {
  return Math.min(30, Math.max(16, value));
}

export function normalizeAirconFanSpeed(value: unknown): AirconFanSpeed {
  const fanSpeed = Number(value ?? AIRCON_FAN_SPEEDS.auto);

  if (!isAirconFanSpeed(fanSpeed)) {
    throw new SwitchBotError("validation", "Air conditioner fan speed must be 1, 2, 3, or 4.");
  }

  return fanSpeed;
}

export function isAirconMode(value: unknown): value is AirconMode {
  return (
    value === AIRCON_MODES.auto ||
    value === AIRCON_MODES.cool ||
    value === AIRCON_MODES.dry ||
    value === AIRCON_MODES.fan ||
    value === AIRCON_MODES.heat
  );
}

export function isAirconFanSpeed(value: unknown): value is AirconFanSpeed {
  return (
    value === AIRCON_FAN_SPEEDS.auto ||
    value === AIRCON_FAN_SPEEDS.low ||
    value === AIRCON_FAN_SPEEDS.medium ||
    value === AIRCON_FAN_SPEEDS.high
  );
}

export function readAirconState(value: unknown): AirconState | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = value as Record<string, unknown>;
  const temperature = Number(candidate.temperature);
  const mode = Number(candidate.mode);
  const fanSpeed = Number(candidate.fanSpeed);
  const powerState = candidate.powerState === "off" ? "off" : "on";

  if (!Number.isInteger(temperature) || !isAirconMode(mode) || !isAirconFanSpeed(fanSpeed)) {
    return undefined;
  }

  return {
    fanSpeed,
    mode,
    powerState,
    temperature: clampAirconTemperature(temperature),
  };
}
