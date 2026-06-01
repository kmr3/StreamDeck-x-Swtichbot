import { createHmac, randomUUID } from "node:crypto";

import { createCommandPayload, type SwitchBotCommand } from "./commands.js";
import { SwitchBotError } from "./errors.js";

const DEFAULT_BASE_URL = "https://api.switch-bot.com";

export type SwitchBotCredentials = {
  secret: string;
  token: string;
};

export type SwitchBotDevice = {
  deviceId: string;
  deviceName: string;
  deviceType?: string;
  enableCloudService?: boolean;
  hubDeviceId?: string;
  remoteType?: string;
};

export type SwitchBotStatus = {
  power?: string;
  [key: string]: unknown;
};

type SwitchBotApiResponse<TBody> = {
  body?: TBody;
  message?: string;
  statusCode?: number;
};

type DeviceListBody = {
  deviceList?: SwitchBotDevice[];
  infraredRemoteList?: SwitchBotDevice[];
};

type ClientOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
  nonceFactory?: () => string;
  timestampFactory?: () => number;
};

export function createSwitchBotSignature(
  token: string,
  secret: string,
  timestamp: number | string,
  nonce: string,
): string {
  return createHmac("sha256", secret).update(`${token}${timestamp}${nonce}`).digest("base64");
}

export class SwitchBotClient {
  readonly #baseUrl: string;
  readonly #credentials: SwitchBotCredentials;
  readonly #fetch: typeof fetch;
  readonly #nonceFactory: () => string;
  readonly #timestampFactory: () => number;

  constructor(credentials: SwitchBotCredentials, options: ClientOptions = {}) {
    if (!credentials.token.trim() || !credentials.secret.trim()) {
      throw new SwitchBotError("configuration", "SwitchBot token and secret are required.");
    }

    this.#baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.#credentials = credentials;
    this.#fetch = options.fetchFn ?? fetch;
    this.#nonceFactory = options.nonceFactory ?? randomUUID;
    this.#timestampFactory = options.timestampFactory ?? Date.now;
  }

  async listDevices(): Promise<SwitchBotDevice[]> {
    const body = await this.#request<DeviceListBody>("/v1.1/devices");
    return [...(body.deviceList ?? []), ...(body.infraredRemoteList ?? [])];
  }

  async getStatus(deviceId: string): Promise<SwitchBotStatus> {
    return this.#request<SwitchBotStatus>(`/v1.1/devices/${encodeURIComponent(deviceId)}/status`);
  }

  async sendCommand(
    deviceId: string,
    command: SwitchBotCommand,
    parameter = "default",
  ): Promise<void> {
    await this.#request(`/v1.1/devices/${encodeURIComponent(deviceId)}/commands`, {
      body: createCommandPayload(command, parameter),
      method: "POST",
    });
  }

  async executeScene(sceneId: string): Promise<void> {
    await this.#request(`/v1.1/scenes/${encodeURIComponent(sceneId)}/execute`, {
      body: {},
      method: "POST",
    });
  }

  async #request<TBody = unknown>(
    path: string,
    init: { body?: unknown; method?: "GET" | "POST" } = {},
  ): Promise<TBody> {
    const timestamp = this.#timestampFactory();
    const nonce = this.#nonceFactory();
    const sign = createSwitchBotSignature(
      this.#credentials.token,
      this.#credentials.secret,
      timestamp,
      nonce,
    );

    let response: Response;
    try {
      response = await this.#fetch(`${this.#baseUrl}${path}`, {
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        headers: {
          Authorization: this.#credentials.token,
          "Content-Type": "application/json; charset=utf-8",
          nonce,
          sign,
          t: String(timestamp),
        },
        method: init.method ?? "GET",
      });
    } catch (cause) {
      throw new SwitchBotError("network", "SwitchBot network request failed.", { cause });
    }

    const responseBody = await parseJsonResponse(response);

    if (!response.ok) {
      throw httpError(response.status, responseBody);
    }

    const statusCode = Number(responseBody.statusCode);
    if (Number.isFinite(statusCode) && statusCode !== 100) {
      throw apiError(statusCode, responseBody.message);
    }

    return (responseBody.body ?? {}) as TBody;
  }
}

async function parseJsonResponse(response: Response): Promise<SwitchBotApiResponse<unknown>> {
  try {
    return (await response.json()) as SwitchBotApiResponse<unknown>;
  } catch {
    return {};
  }
}

function httpError(httpStatus: number, body: SwitchBotApiResponse<unknown>): SwitchBotError {
  if (httpStatus === 401 || httpStatus === 403) {
    return new SwitchBotError("auth", "SwitchBot authentication failed.", { httpStatus });
  }

  if (httpStatus === 429) {
    return new SwitchBotError("rate-limit", "SwitchBot rate limit reached.", { httpStatus });
  }

  return new SwitchBotError("api", body.message ?? "SwitchBot API request failed.", {
    httpStatus,
    statusCode: body.statusCode,
  });
}

function apiError(statusCode: number, message = "SwitchBot API request failed."): SwitchBotError {
  const normalized = message.toLowerCase();

  if (
    statusCode === 401 ||
    statusCode === 403 ||
    normalized.includes("auth") ||
    normalized.includes("sign") ||
    normalized.includes("token")
  ) {
    return new SwitchBotError("auth", "SwitchBot authentication failed.", { statusCode });
  }

  if (normalized.includes("limit") || normalized.includes("too many")) {
    return new SwitchBotError("rate-limit", "SwitchBot rate limit reached.", { statusCode });
  }

  return new SwitchBotError("api", message, { statusCode });
}
