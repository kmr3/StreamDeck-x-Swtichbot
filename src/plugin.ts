import streamDeck from "@elgato/streamdeck";

import { AirconCoolAction } from "./actions/aircon-cool.js";
import { AirconHeatAction } from "./actions/aircon-heat.js";
import { AirconTempDownAction } from "./actions/aircon-temp-down.js";
import { AirconTempUpAction } from "./actions/aircon-temp-up.js";
import { SceneAction } from "./actions/scene.js";
import { SetBrightnessAction } from "./actions/set-brightness.js";
import { SetColorAction } from "./actions/set-color.js";
import { ToggleAction } from "./actions/toggle.js";
import { TurnOffAction } from "./actions/turn-off.js";
import { TurnOnAction } from "./actions/turn-on.js";
import { registerPropertyInspectorMessages } from "./pi-messages.js";

streamDeck.actions.registerAction(new ToggleAction());
streamDeck.actions.registerAction(new TurnOnAction());
streamDeck.actions.registerAction(new TurnOffAction());
streamDeck.actions.registerAction(new SetBrightnessAction());
streamDeck.actions.registerAction(new SetColorAction());
streamDeck.actions.registerAction(new SceneAction());
streamDeck.actions.registerAction(new AirconCoolAction());
streamDeck.actions.registerAction(new AirconHeatAction());
streamDeck.actions.registerAction(new AirconTempUpAction());
streamDeck.actions.registerAction(new AirconTempDownAction());

registerPropertyInspectorMessages();

await streamDeck.connect();
