import { action, type KeyDownEvent } from "@elgato/streamdeck";

import { runProcess } from "../lib/process.js";
import { type WorkspaceActionSettings } from "../settings.js";
import { WorkspaceAction } from "./base.js";

@action({ UUID: "com.example.workspace.open-wezterm" })
export class OpenWezTermAction extends WorkspaceAction {
  override async onKeyDown(ev: KeyDownEvent<WorkspaceActionSettings>): Promise<void> {
    await this.run(ev, async () => {
      const workspacePath = this.getWorkspacePath(ev.payload.settings);

      if (process.platform === "darwin") {
        await openMacWezTerm(workspacePath);
        return;
      }

      if (process.platform === "win32") {
        await runProcess("wezterm.exe", ["start", "--cwd", workspacePath]);
        return;
      }

      await runProcess("wezterm", ["start", "--cwd", workspacePath]);
    });
  }
}

async function openMacWezTerm(workspacePath: string): Promise<void> {
  const candidates = [
    "/Applications/WezTerm.app/Contents/MacOS/wezterm",
    "/opt/homebrew/bin/wezterm",
    "/usr/local/bin/wezterm",
    "wezterm",
  ];

  for (const candidate of candidates) {
    try {
      await runProcess(candidate, ["start", "--cwd", workspacePath]);
      return;
    } catch {
      // Try the next common install location.
    }
  }

  await runProcess("open", ["-a", "WezTerm"]);
}
