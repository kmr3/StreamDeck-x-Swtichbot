import { action, type KeyDownEvent } from "@elgato/streamdeck";

import { openApplication, openUrl } from "../lib/process.js";
import { readString, type WorkspaceActionSettings } from "../settings.js";
import { WorkspaceAction } from "./base.js";

@action({ UUID: "com.example.workspace.open-chatgpt" })
export class OpenChatGptAction extends WorkspaceAction {
  override async onKeyDown(ev: KeyDownEvent<WorkspaceActionSettings>): Promise<void> {
    await this.run(ev, async () => {
      const appName = readString(ev.payload.settings.appName) ?? "ChatGPT";
      const url = readString(ev.payload.settings.chatGptUrl) ?? "https://chatgpt.com";

      try {
        await openApplication(appName);
      } catch {
        await openUrl(url);
      }
    });
  }
}

