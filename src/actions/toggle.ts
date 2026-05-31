import { action, type KeyDownEvent, type WillAppearEvent } from "@elgato/streamdeck";

import { type SwitchBotActionSettings } from "../settings.js";
import { SwitchBotAction } from "./base.js";

@action({ UUID: "com.example.switchbot.toggle" })
export class ToggleAction extends SwitchBotAction {
  override async onWillAppear(ev: WillAppearEvent<SwitchBotActionSettings>): Promise<void> {
    await this.syncPowerState(ev);
  }

  override async onKeyDown(ev: KeyDownEvent<SwitchBotActionSettings>): Promise<void> {
    await this.runKeyAction(ev, async (client, key) => {
      const deviceId = this.getDeviceId(ev.payload.settings);
      const status = await client.getStatus(deviceId);
      const isOn = status.power?.toLowerCase() === "on";
      const nextCommand = isOn ? "turnOff" : "turnOn";

      await client.sendCommand(deviceId, nextCommand);
      await key.setState(isOn ? 0 : 1);
    });
  }
}
