import { action, type KeyDownEvent } from "@elgato/streamdeck";

import { openApplication } from "../lib/process.js";
import { readString, type WorkspaceActionSettings } from "../settings.js";
import { WorkspaceAction } from "./base.js";

@action({ UUID: "com.example.workspace.open-codex" })
export class OpenCodexAction extends WorkspaceAction {
  override async onKeyDown(ev: KeyDownEvent<WorkspaceActionSettings>): Promise<void> {
    await this.run(ev, async () => {
      const appName = readString(ev.payload.settings.appName) ?? "Codex";
      await openApplication(appName, this.getWorkspacePath(ev.payload.settings));
    });
  }
}

