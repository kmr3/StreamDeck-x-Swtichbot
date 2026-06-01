const ACTIONS = {
  GIT_DIFF: "com.example.workspace.git-diff",
  GIT_STATUS: "com.example.workspace.git-status",
  OPEN_CHATGPT: "com.example.workspace.open-chatgpt",
  OPEN_CODEX: "com.example.workspace.open-codex",
  OPEN_WEZTERM: "com.example.workspace.open-wezterm",
};

const DEFAULT_WORKSPACE_PATH = "/Users/kmurama/Documents/Streamdeck x Switchbot";

let websocket;
let context;
let action;
let settings = {};

const controls = {
  appName: document.querySelector("#appName"),
  chatGptUrl: document.querySelector("#chatGptUrl"),
  workspacePath: document.querySelector("#workspacePath"),
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
    send({ context, event: "getSettings" });
  });
  websocket.addEventListener("message", (event) => {
    handleMessage(JSON.parse(event.data));
  });

  renderActionFields();
  renderSettings();
};

for (const key of ["appName", "chatGptUrl", "workspacePath"]) {
  controls[key].addEventListener("input", () => {
    settings = { ...settings, [key]: controls[key].value };
    send({ context, event: "setSettings", payload: settings });
  });
}

function handleMessage(message) {
  if (message.event === "didReceiveSettings") {
    settings = message.payload?.settings ?? {};
    renderSettings();
  }
}

function renderActionFields() {
  const isAppAction = action === ACTIONS.OPEN_CODEX || action === ACTIONS.OPEN_CHATGPT;
  const needsWorkspace = [
    ACTIONS.GIT_DIFF,
    ACTIONS.GIT_STATUS,
    ACTIONS.OPEN_CODEX,
    ACTIONS.OPEN_WEZTERM,
  ].includes(action);

  document.querySelector('[data-field="workspace"]').hidden = !needsWorkspace;
  document.querySelector('[data-section="app"]').hidden = !isAppAction;
  document.querySelector('[data-field="chatgpt-url"]').hidden = action !== ACTIONS.OPEN_CHATGPT;
}

function renderSettings() {
  controls.workspacePath.value = settings.workspacePath ?? DEFAULT_WORKSPACE_PATH;
  controls.appName.value = settings.appName ?? defaultAppName();
  controls.chatGptUrl.value = settings.chatGptUrl ?? "https://chatgpt.com";
}

function defaultAppName() {
  if (action === ACTIONS.OPEN_CHATGPT) {
    return "ChatGPT";
  }

  return "Codex";
}

function send(message) {
  if (websocket?.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(message));
  }
}
