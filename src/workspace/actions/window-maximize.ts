import { action, type KeyDownEvent } from "@elgato/streamdeck";

import { moveActiveWindow } from "../lib/window.js";
import { type WorkspaceActionSettings } from "../settings.js";
import { WorkspaceAction } from "./base.js";

@action({ UUID: "com.example.workspace.window-maximize" })
export class WindowMaximizeAction extends WorkspaceAction {
  override async onKeyDown(ev: KeyDownEvent<WorkspaceActionSettings>): Promise<void> {
    await this.run(ev, async () => {
      await moveActiveWindow("maximize");
    });
  }
}

