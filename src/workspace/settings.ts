import type { JsonObject, JsonValue } from "@elgato/utils";

export const DEFAULT_WORKSPACE_PATH = "/Users/kmurama/Documents/Streamdeck x Switchbot";

export type WorkspaceActionSettings = JsonObject & {
  appName?: JsonValue;
  chatGptUrl?: JsonValue;
  workspacePath?: JsonValue;
};

export function readString(value: JsonValue | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

