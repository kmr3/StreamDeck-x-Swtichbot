import { action, type KeyDownEvent } from "@elgato/streamdeck";

import { type SwitchBotActionSettings } from "../settings.js";
import { AIRCON_MODES } from "../switchbot/aircon.js";
import { AirconAction } from "./aircon-base.js";

@action({ UUID: "com.example.switchbot.aircon-cool" })
export class AirconCoolAction extends AirconAction {
  override async onKeyDown(ev: KeyDownEvent<SwitchBotActionSettings>): Promise<void> {
    await this.sendPreset(ev, AIRCON_MODES.cool, 26);
  }
}
