export type SwitchBotErrorKind =
  | "api"
  | "auth"
  | "configuration"
  | "network"
  | "rate-limit"
  | "validation";

export class SwitchBotError extends Error {
  readonly kind: SwitchBotErrorKind;
  readonly httpStatus?: number;
  readonly statusCode?: number;

  constructor(
    kind: SwitchBotErrorKind,
    message: string,
    options: { cause?: unknown; httpStatus?: number; statusCode?: number } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "SwitchBotError";
    this.kind = kind;
    this.httpStatus = options.httpStatus;
    this.statusCode = options.statusCode;
  }
}

export function isSwitchBotError(error: unknown): error is SwitchBotError {
  return error instanceof SwitchBotError;
}
