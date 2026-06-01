import streamDeck, { type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

import {
  DEFAULT_WORKSPACE_PATH,
  readString,
  type WorkspaceActionSettings,
} from "../settings.js";

export abstract class WorkspaceAction extends SingletonAction<WorkspaceActionSettings> {
  protected async run(
    ev: KeyDownEvent<WorkspaceActionSettings>,
    operation: () => Promise<void>,
  ): Promise<void> {
    try {
      await operation();
      await ev.action.showOk();
    } catch (error) {
      streamDeck.logger.warn(`Workspace action failed: ${errorMessage(error)}`);
      await ev.action.showAlert();
    }
  }

  protected getWorkspacePath(settings: WorkspaceActionSettings): string {
    return readString(settings.workspacePath) ?? DEFAULT_WORKSPACE_PATH;
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

