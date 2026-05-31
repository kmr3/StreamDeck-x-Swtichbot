import { describe, expect, it } from "vitest";

import {
  AIRCON_FAN_SPEEDS,
  AIRCON_MODES,
  clampAirconTemperature,
  createAirconParameter,
  normalizeAirconFanSpeed,
  normalizeAirconTemperature,
} from "../src/switchbot/aircon.js";
import {
  createCommandPayload,
  normalizeBrightness,
  normalizeColorInput,
} from "../src/switchbot/commands.js";
import { createSwitchBotSignature } from "../src/switchbot/client.js";

describe("SwitchBot API v1.1 helpers", () => {
  it("generates the HMAC-SHA256 signature as base64(token + t + nonce)", () => {
    expect(
      createSwitchBotSignature(
        "token-123",
        "secret-abc",
        "1700000000000",
        "123e4567-e89b-12d3-a456-426614174000",
      ),
    ).toBe("8PWrCcq/LB7Gc9/bOSjuxiR0ryc6EfMWs5TfYHVSD3s=");
  });

  it("formats command payloads for the device command endpoint", () => {
    expect(createCommandPayload("turnOn")).toEqual({
      command: "turnOn",
      commandType: "command",
      parameter: "default",
    });

    expect(createCommandPayload("setBrightness", normalizeBrightness(42))).toEqual({
      command: "setBrightness",
      commandType: "command",
      parameter: "42",
    });
  });

  it("normalizes #RRGGBB color input to R:G:B", () => {
    expect(normalizeColorInput("#FFAA00")).toBe("255:170:0");
    expect(normalizeColorInput("336699")).toBe("51:102:153");
  });

  it("rejects invalid brightness and color values", () => {
    expect(() => normalizeBrightness(0)).toThrow();
    expect(() => normalizeBrightness(101)).toThrow();
    expect(() => normalizeColorInput("#bad")).toThrow();
  });

  it("formats air conditioner setAll parameters", () => {
    expect(
      createAirconParameter({
        fanSpeed: AIRCON_FAN_SPEEDS.auto,
        mode: AIRCON_MODES.cool,
        powerState: "on",
        temperature: 26,
      }),
    ).toBe("26,2,1,on");

    expect(
      createCommandPayload(
        "setAll",
        createAirconParameter({
          fanSpeed: AIRCON_FAN_SPEEDS.auto,
          mode: AIRCON_MODES.heat,
          powerState: "on",
          temperature: 22,
        }),
      ),
    ).toEqual({
      command: "setAll",
      commandType: "command",
      parameter: "22,5,1,on",
    });
  });

  it("normalizes air conditioner temperature and fan speed", () => {
    expect(normalizeAirconTemperature("26", 24)).toBe(26);
    expect(clampAirconTemperature(31)).toBe(30);
    expect(clampAirconTemperature(15)).toBe(16);
    expect(normalizeAirconFanSpeed("4")).toBe(4);
  });
});
