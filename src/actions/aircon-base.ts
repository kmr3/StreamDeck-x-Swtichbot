import streamDeck, { type KeyDownEvent } from "@elgato/streamdeck";

import { type GlobalSettings, type SwitchBotActionSettings } from "../settings.js";
import {
  AIRCON_FAN_SPEEDS,
  AIRCON_MODES,
  clampAirconTemperature,
  createAirconParameter,
  normalizeAirconFanSpeed,
  normalizeAirconTemperature,
  readAirconState,
  type AirconFanSpeed,
  type AirconMode,
  type AirconState,
} from "../switchbot/aircon.js";
import { SwitchBotAction } from "./base.js";

export abstract class AirconAction extends SwitchBotAction {
  protected async sendPreset(
    ev: KeyDownEvent<SwitchBotActionSettings>,
    mode: AirconMode,
    defaultTemperature: number,
  ): Promise<void> {
    await this.runKeyAction(ev, async (client, action) => {
      const deviceId = this.getDeviceId(ev.payload.settings);
      const state: AirconState = {
        fanSpeed: this.readFanSpeed(ev.payload.settings),
        mode,
        powerState: "on",
        temperature: normalizeAirconTemperature(
          ev.payload.settings.airconTemperature,
          defaultTemperature,
        ),
      };

      await client.sendCommand(deviceId, "setAll", createAirconParameter(state));
      await this.saveState(deviceId, state);
      await action.setTitle(this.createTitle(state));
    });
  }

  protected async adjustTemperature(
    ev: KeyDownEvent<SwitchBotActionSettings>,
    delta: 1 | -1,
  ): Promise<void> {
    await this.runKeyAction(ev, async (client, action) => {
      const deviceId = this.getDeviceId(ev.payload.settings);
      const currentState =
        (await this.readSavedState(deviceId)) ?? this.createFallbackState(ev.payload.settings);
      const nextState: AirconState = {
        ...currentState,
        powerState: "on",
        temperature: clampAirconTemperature(currentState.temperature + delta),
      };

      await client.sendCommand(deviceId, "setAll", createAirconParameter(nextState));
      await this.saveState(deviceId, nextState);
      await action.setTitle(this.createTitle(nextState));
    });
  }

  private createFallbackState(settings: SwitchBotActionSettings): AirconState {
    return {
      fanSpeed: this.readFanSpeed(settings),
      mode: AIRCON_MODES.cool,
      powerState: "on",
      temperature: normalizeAirconTemperature(settings.airconTemperature, 26),
    };
  }

  private readFanSpeed(settings: SwitchBotActionSettings): AirconFanSpeed {
    return normalizeAirconFanSpeed(settings.airconFanSpeed ?? AIRCON_FAN_SPEEDS.auto);
  }

  private async readSavedState(deviceId: string): Promise<AirconState | undefined> {
    const globalSettings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
    return readAirconState(globalSettings.airconStates?.[deviceId]);
  }

  private async saveState(deviceId: string, state: AirconState): Promise<void> {
    const globalSettings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
    await streamDeck.settings.setGlobalSettings<GlobalSettings>({
      ...globalSettings,
      airconStates: {
        ...(globalSettings.airconStates ?? {}),
        [deviceId]: state,
      },
    });
  }

  private createTitle(state: AirconState): string {
    const mode = state.mode === AIRCON_MODES.heat ? "暖房" : "冷房";
    return `${mode}\n${state.temperature}°C`;
  }
}
