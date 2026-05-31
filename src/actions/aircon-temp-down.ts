import { action, type KeyDownEvent } from "@elgato/streamdeck";

import { type SwitchBotActionSettings } from "../settings.js";
import { AirconAction } from "./aircon-base.js";

@action({ UUID: "com.example.switchbot.aircon-temp-down" })
export class AirconTempDownAction extends AirconAction {
  override async onKeyDown(ev: KeyDownEvent<SwitchBotActionSettings>): Promise<void> {
    await this.adjustTemperature(ev, -1);
  }
}
