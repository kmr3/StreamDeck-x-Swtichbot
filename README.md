# SwitchBot Stream Deck Plugin

Unofficial Elgato Stream Deck plugin for SwitchBot API v1.1. It uses the current
HMAC-SHA256 signing flow and the official `@elgato/streamdeck` SDK.

Plugin UUID: `com.example.switchbot`

This repository also contains a separate local productivity plugin:

- Workspace Buttons UUID: `com.example.workspace`
- Plugin folder: `com.example.workspace.sdPlugin`

## Actions

- Toggle: reads `/v1.1/devices/{deviceId}/status` and flips `turnOn` / `turnOff`
- Turn On: sends `turnOn`
- Turn Off: sends `turnOff`
- Set Brightness: sends `setBrightness` with `1` to `100`
- Set Color: converts `#RRGGBB` to `R:G:B` and sends `setColor`
- Scene: calls `/v1.1/scenes/{sceneId}/execute`
- Aircon Cool: sends `setAll` for cooling mode
- Aircon Heat: sends `setAll` for heating mode
- Aircon +1°C: raises the remembered air conditioner temperature by 1°C
- Aircon -1°C: lowers the remembered air conditioner temperature by 1°C

## SwitchBot Token And Secret

1. Open the SwitchBot app.
2. Go to Profile.
3. Open Settings.
4. Tap the app version 10 times.
5. Open Developer Options.
6. Copy the token and secret into the Stream Deck Property Inspector.

The token and secret are saved with Stream Deck global settings only. The plugin
does not write them to logs.

## Air Conditioner Notes

Air conditioner controls use SwitchBot virtual infrared remote commands through a
SwitchBot Hub. The plugin sends `setAll` parameters in this format:

```text
temperature,mode,fanSpeed,powerState
```

For example, cooling at 26°C with auto fan and power on is:

```text
26,2,1,on
```

The `+1°C` and `-1°C` actions use the last air conditioner settings sent by this
plugin as their base. If you change the air conditioner with a physical remote or
the SwitchBot app, press the cooling or heating preset again to reset the
remembered state.

## Development

```bash
npm install
npm run generate:assets
npm run lint
npm run test
npm run build
streamdeck link com.example.switchbot.sdPlugin
streamdeck link com.example.workspace.sdPlugin
```

## Workspace Buttons

The Workspace plugin is separate from SwitchBot and adds local helper buttons:

- Left Half: moves the active window to the left half of the usable screen area
- Right Half: moves the active window to the right half of the usable screen area
- Work Area Max: fills the usable screen area without using macOS fullscreen
- Open Codex: opens Codex with the configured workspace folder
- Open ChatGPT: opens the ChatGPT app, or `https://chatgpt.com` as a fallback
- Git Status: shows a compact branch/change count on the key
- Copy Git Diff: copies `git diff --stat` to the clipboard
- Open WezTerm: opens WezTerm in the configured workspace folder

Window controls may require macOS Accessibility permission for Stream Deck.

## Notes

- Requires Node.js 24+, Stream Deck 7.1+, macOS 12+ or Windows 10+.
- Uses `https://api.switch-bot.com` and only `/v1.1/*` endpoints.
- SwitchBot has a daily request limit. HTTP 429 is logged as a rate-limit
  warning, while API status code 190 keeps the API message for debugging.

## License

MIT
