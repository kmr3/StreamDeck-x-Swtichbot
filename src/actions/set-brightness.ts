import { action, type KeyDownEvent } from "@elgato/streamdeck";

import { type SwitchBotActionSettings } from "../settings.js";
import { normalizeBrightness } from "../switchbot/commands.js";
import { SwitchBotAction } from "./base.js";

@action({ UUID: "com.example.switchbot.set-brightness" })
export class SetBrightnessAction extends SwitchBotAction {
  override async onKeyDown(ev: KeyDownEvent<SwitchBotActionSettings>): Promise<void> {
    await this.runKeyAction(ev, async (client) => {
      await client.sendCommand(
        this.getDeviceId(ev.payload.settings),
        "setBrightness",
        normalizeBrightness(ev.payload.settings.brightness),
      );
    });
  }
}
