import streamDeck from "@elgato/streamdeck";
import type { JsonObject, JsonValue } from "@elgato/utils";

import { logSwitchBotError } from "./logging.js";
import { type GlobalSettings, readString } from "./settings.js";
import { SwitchBotClient } from "./switchbot/client.js";
import { isSwitchBotError } from "./switchbot/errors.js";

type PropertyInspectorRequest = JsonObject & {
  request?: JsonValue;
};

export function registerPropertyInspectorMessages(): void {
  streamDeck.ui.onSendToPlugin<PropertyInspectorRequest>(async (ev) => {
    if (ev.payload.request !== "listDevices") {
      return;
    }

    await sendDeviceListToPropertyInspector();
  });

  streamDeck.ui.onDidAppear(async () => {
    await sendDeviceListToPropertyInspector();
  });
}

async function sendDeviceListToPropertyInspector(): Promise<void> {
  try {
    const settings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
    const token = readString(settings.token);
    const secret = readString(settings.secret);

    if (!token || !secret) {
      await streamDeck.ui.sendToPropertyInspector({
        message: "SwitchBot の token / secret を入力してください。",
        request: "listDevices",
        status: "missingCredentials",
      });
      return;
    }

    const client = new SwitchBotClient({ secret, token });
    const devices = await client.listDevices();

    await streamDeck.ui.sendToPropertyInspector({
      devices: devices.map((device) => ({
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        isInfraredRemote: device.deviceType === undefined,
        deviceType: device.deviceType ?? device.remoteType ?? "Unknown",
        remoteType: device.remoteType,
      })),
      request: "listDevices",
      status: "ok",
    });
  } catch (error) {
    logSwitchBotError(error, "propertyInspector:listDevices");
    await streamDeck.ui.sendToPropertyInspector({
      message:
        isSwitchBotError(error) && error.kind === "auth"
          ? "認証に失敗しました"
          : "デバイス一覧を取得できませんでした",
      request: "listDevices",
      status: isSwitchBotError(error) ? error.kind : "api",
    });
  }
}
