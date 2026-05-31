import { action, type KeyDownEvent, type WillAppearEvent } from "@elgato/streamdeck";

import { type SwitchBotActionSettings } from "../settings.js";
import { SwitchBotAction } from "./base.js";

@action({ UUID: "com.example.switchbot.turn-off" })
export class TurnOffAction extends SwitchBotAction {
  override async onWillAppear(ev: WillAppearEvent<SwitchBotActionSettings>): Promise<void> {
    await this.syncPowerState(ev);
  }

  override async onKeyDown(ev: KeyDownEvent<SwitchBotActionSettings>): Promise<void> {
    await this.runKeyAction(ev, async (client, key) => {
      await client.sendCommand(this.getDeviceId(ev.payload.settings), "turnOff");
      await key.setState(0);
    });
  }
}
