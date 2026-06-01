const ACTIONS = {
  AIRCON_COOL: "com.example.switchbot.aircon-cool",
  AIRCON_HEAT: "com.example.switchbot.aircon-heat",
  AIRCON_TEMP_DOWN: "com.example.switchbot.aircon-temp-down",
  AIRCON_TEMP_UP: "com.example.switchbot.aircon-temp-up",
  BRIGHTNESS: "com.example.switchbot.set-brightness",
  COLOR: "com.example.switchbot.set-color",
  SCENE: "com.example.switchbot.scene",
};

let websocket;
let context;
let action;
let settings = {};
let globalSettings = {};

const controls = {
  airconFanSpeed: document.querySelector("#airconFanSpeed"),
  airconTemperature: document.querySelector("#airconTemperature"),
  brightness: document.querySelector("#brightness"),
  color: document.querySelector("#color"),
  deviceId: document.querySelector("#deviceId"),
  sceneId: document.querySelector("#sceneId"),
  secret: document.querySelector("#secret"),
  status: document.querySelector("#status"),
  token: document.querySelector("#token"),
};

window.connectElgatoStreamDeckSocket = (
  port,
  propertyInspectorUuid,
  registerEvent,
  info,
  actionInfo,
) => {
  context = propertyInspectorUuid;
  const parsedActionInfo = JSON.parse(actionInfo);
  action = parsedActionInfo.action;
  settings = parsedActionInfo.payload?.settings ?? {};

  websocket = new WebSocket(`ws://127.0.0.1:${port}`);
  websocket.addEventListener("open", () => {
    send({ event: registerEvent, uuid: propertyInspectorUuid });
    send({ context, event: "getGlobalSettings" });
    send({ context, event: "getSettings" });
    sendToPlugin({ request: "listDevices" });
  });
  websocket.addEventListener("message", (event) => {
    handleMessage(JSON.parse(event.data));
  });

  renderActionFields();
  renderSettings();
};

for (const key of [
  "deviceId",
  "brightness",
  "airconTemperature",
  "airconFanSpeed",
  "color",
  "sceneId",
]) {
  controls[key].addEventListener("input", () => {
    settings = { ...settings, [key]: controls[key].value };
    send({ context, event: "setSettings", payload: settings });
  });
}

for (const key of ["token", "secret"]) {
  controls[key].addEventListener("input", () => {
    globalSettings = { ...globalSettings, [key]: controls[key].value };
    send({ context, event: "setGlobalSettings", payload: globalSettings });
  });

  controls[key].addEventListener("change", () => {
    sendToPlugin({ request: "listDevices" });
  });
}

function handleMessage(message) {
  if (message.event === "didReceiveSettings") {
    settings = message.payload?.settings ?? {};
    renderSettings();
    return;
  }

  if (message.event === "didReceiveGlobalSettings") {
    globalSettings = message.payload?.settings ?? {};
    controls.token.value = globalSettings.token ?? "";
    controls.secret.value = globalSettings.secret ?? "";
    sendToPlugin({ request: "listDevices" });
    return;
  }

  if (message.event === "sendToPropertyInspector" && message.payload?.request === "listDevices") {
    renderDevices(message.payload);
  }
}

function renderSettings() {
  controls.deviceId.value = settings.deviceId ?? "";
  controls.brightness.value = settings.brightness ?? "100";
  controls.airconTemperature.value = settings.airconTemperature ?? defaultAirconTemperature();
  controls.airconFanSpeed.value = settings.airconFanSpeed ?? "1";
  controls.color.value = settings.color ?? "#FFFFFF";
  controls.sceneId.value = settings.sceneId ?? "";
}

function renderActionFields() {
  const isAircon = [
    ACTIONS.AIRCON_COOL,
    ACTIONS.AIRCON_HEAT,
    ACTIONS.AIRCON_TEMP_DOWN,
    ACTIONS.AIRCON_TEMP_UP,
  ].includes(action);

  document.querySelector('[data-field="device"]').hidden = action === ACTIONS.SCENE;
  document.querySelector('[data-field="brightness"]').hidden = action !== ACTIONS.BRIGHTNESS;
  document.querySelector('[data-field="aircon-temperature"]').hidden = !isAircon;
  document.querySelector('[data-field="aircon-fan-speed"]').hidden = !isAircon;
  document.querySelector('[data-field="color"]').hidden = action !== ACTIONS.COLOR;
  document.querySelector('[data-field="scene"]').hidden = action !== ACTIONS.SCENE;
}

function defaultAirconTemperature() {
  return action === ACTIONS.AIRCON_HEAT ? "22" : "26";
}

function renderDevices(payload) {
  controls.status.textContent = payload.message ?? "";

  if (payload.status === "auth") {
    controls.status.textContent = "認証に失敗しました";
  }

  if (payload.status !== "ok") {
    controls.deviceId.replaceChildren(new Option("デバイスを取得できません", ""));
    return;
  }

  const devices = isAirconAction()
    ? (payload.devices ?? []).filter(
        (device) => device.isInfraredRemote && isAirconRemoteType(device.remoteType),
      )
    : (payload.devices ?? []);

  const options = [new Option("デバイスを選択", "")];
  for (const device of devices) {
    options.push(new Option(`${device.deviceName} (${device.deviceType})`, device.deviceId));
  }

  controls.deviceId.replaceChildren(...options);
  controls.deviceId.value = settings.deviceId ?? "";
  controls.status.textContent =
    options.length > 1
      ? ""
      : isAirconAction()
        ? "Air Conditioner の赤外線リモコンが見つかりませんでした"
        : "デバイスが見つかりませんでした";
}

function isAirconRemoteType(remoteType) {
  return remoteType === "Air Conditioner" || remoteType === "DIY Air Conditioner";
}

function isAirconAction() {
  return [
    ACTIONS.AIRCON_COOL,
    ACTIONS.AIRCON_HEAT,
    ACTIONS.AIRCON_TEMP_DOWN,
    ACTIONS.AIRCON_TEMP_UP,
  ].includes(action);
}

function sendToPlugin(payload) {
  send({ action, context, event: "sendToPlugin", payload });
}

function send(message) {
  if (websocket?.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(message));
  }
}
