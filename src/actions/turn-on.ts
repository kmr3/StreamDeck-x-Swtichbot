import { action, type KeyDownEvent, type WillAppearEvent } from "@elgato/streamdeck";

import { type SwitchBotActionSettings } from "../settings.js";
import { SwitchBotAction } from "./base.js";

@action({ UUID: "com.example.switchbot.turn-on" })
export class TurnOnAction extends SwitchBotAction {
  override async onWillAppear(ev: WillAppearEvent<SwitchBotActionSettings>): Promise<void> {
    await this.syncPowerState(ev);
  }

  override async onKeyDown(ev: KeyDownEvent<SwitchBotActionSettings>): Promise<void> {
    await this.runKeyAction(ev, async (client, key) => {
      await client.sendCommand(this.getDeviceId(ev.payload.settings), "turnOn");
      await key.setState(1);
    });
  }
}
