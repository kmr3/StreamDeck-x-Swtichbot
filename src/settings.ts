import type { JsonObject, JsonValue } from "@elgato/utils";

export type GlobalSettings = JsonObject & {
  airconStates?: JsonObject;
  secret?: string;
  token?: string;
};

export type SwitchBotActionSettings = JsonObject & {
  airconFanSpeed?: JsonValue;
  airconTemperature?: JsonValue;
  brightness?: JsonValue;
  color?: JsonValue;
  deviceId?: JsonValue;
  sceneId?: JsonValue;
};

export function readString(value: JsonValue | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
