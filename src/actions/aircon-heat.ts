import { action, type KeyDownEvent } from "@elgato/streamdeck";

import { type SwitchBotActionSettings } from "../settings.js";
import { AIRCON_MODES } from "../switchbot/aircon.js";
import { AirconAction } from "./aircon-base.js";

@action({ UUID: "com.example.switchbot.aircon-heat" })
export class AirconHeatAction extends AirconAction {
  override async onKeyDown(ev: KeyDownEvent<SwitchBotActionSettings>): Promise<void> {
    await this.sendPreset(ev, AIRCON_MODES.heat, 22);
  }
}
