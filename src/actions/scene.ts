import { action, type KeyDownEvent } from "@elgato/streamdeck";

import { readString, type SwitchBotActionSettings } from "../settings.js";
import { SwitchBotError } from "../switchbot/errors.js";
import { SwitchBotAction } from "./base.js";

@action({ UUID: "com.example.switchbot.scene" })
export class SceneAction extends SwitchBotAction {
  override async onKeyDown(ev: KeyDownEvent<SwitchBotActionSettings>): Promise<void> {
    await this.runKeyAction(ev, async (client) => {
      const sceneId = readString(ev.payload.settings.sceneId);

      if (!sceneId) {
        throw new SwitchBotError("configuration", "SwitchBot sceneId is required.");
      }

      await client.executeScene(sceneId);
    });
  }
}
