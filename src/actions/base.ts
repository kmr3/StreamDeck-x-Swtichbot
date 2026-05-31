import streamDeck, {
  type KeyAction,
  type KeyDownEvent,
  SingletonAction,
  type WillAppearEvent,
} from "@elgato/streamdeck";

import { logSwitchBotError } from "../logging.js";
import { type GlobalSettings, readString, type SwitchBotActionSettings } from "../settings.js";
import { SwitchBotClient } from "../switchbot/client.js";
import { SwitchBotError } from "../switchbot/errors.js";

export abstract class SwitchBotAction extends SingletonAction<SwitchBotActionSettings> {
  protected async createClient(): Promise<SwitchBotClient> {
    const settings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
    const token = readString(settings.token);
    const secret = readString(settings.secret);

    if (!token || !secret) {
      throw new SwitchBotError("configuration", "SwitchBot token and secret are required.");
    }

    return new SwitchBotClient({ secret, token });
  }

  protected getDeviceId(settings: SwitchBotActionSettings): string {
    const deviceId = readString(settings.deviceId);

    if (!deviceId) {
      throw new SwitchBotError("configuration", "SwitchBot deviceId is required.");
    }

    return deviceId;
  }

  protected async syncPowerState(ev: WillAppearEvent<SwitchBotActionSettings>): Promise<void> {
    const deviceId = readString(ev.payload.settings.deviceId);

    if (!deviceId || !ev.action.isKey()) {
      return;
    }

    try {
      const client = await this.createClient();
      const status = await client.getStatus(deviceId);
      await ev.action.setState(status.power?.toLowerCase() === "on" ? 1 : 0);
    } catch (error) {
      logSwitchBotError(error, `${this.manifestId ?? "unknown"}:syncPowerState`);
    }
  }

  protected async runKeyAction(
    ev: KeyDownEvent<SwitchBotActionSettings>,
    operation: (
      client: SwitchBotClient,
      action: KeyAction<SwitchBotActionSettings>,
    ) => Promise<void>,
  ): Promise<void> {
    try {
      const client = await this.createClient();
      await operation(client, ev.action);
      await ev.action.showOk();
    } catch (error) {
      logSwitchBotError(error, this.manifestId ?? "unknown");
      await ev.action.showAlert();
    }
  }
}
