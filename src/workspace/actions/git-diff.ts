import { action, type KeyDownEvent } from "@elgato/streamdeck";

import { copyGitDiffStat } from "../lib/git.js";
import { type WorkspaceActionSettings } from "../settings.js";
import { WorkspaceAction } from "./base.js";

@action({ UUID: "com.example.workspace.git-diff" })
export class GitDiffAction extends WorkspaceAction {
  override async onKeyDown(ev: KeyDownEvent<WorkspaceActionSettings>): Promise<void> {
    await this.run(ev, async () => {
      const diff = await copyGitDiffStat(this.getWorkspacePath(ev.payload.settings));
      await ev.action.setTitle(diff === "No unstaged diff." ? "Diff\nclean" : "Diff\ncopied");
    });
  }
}

