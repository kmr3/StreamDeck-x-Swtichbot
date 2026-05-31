import { action, type KeyDownEvent } from "@elgato/streamdeck";

import { type SwitchBotActionSettings } from "../settings.js";
import { normalizeColorInput } from "../switchbot/commands.js";
import { SwitchBotAction } from "./base.js";

@action({ UUID: "com.example.switchbot.set-color" })
export class SetColorAction extends SwitchBotAction {
  override async onKeyDown(ev: KeyDownEvent<SwitchBotActionSettings>): Promise<void> {
    await this.runKeyAction(ev, async (client) => {
      await client.sendCommand(
        this.getDeviceId(ev.payload.settings),
        "setColor",
        normalizeColorInput(String(ev.payload.settings.color ?? "")),
      );
    });
  }
}
