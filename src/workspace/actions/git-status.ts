import { action, type KeyDownEvent } from "@elgato/streamdeck";

import { getGitStatus } from "../lib/git.js";
import { type WorkspaceActionSettings } from "../settings.js";
import { WorkspaceAction } from "./base.js";

@action({ UUID: "com.example.workspace.git-status" })
export class GitStatusAction extends WorkspaceAction {
  override async onKeyDown(ev: KeyDownEvent<WorkspaceActionSettings>): Promise<void> {
    await this.run(ev, async () => {
      const status = await getGitStatus(this.getWorkspacePath(ev.payload.settings));
      await ev.action.setTitle(status.title);
    });
  }
}

