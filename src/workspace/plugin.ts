import streamDeck from "@elgato/streamdeck";

import { GitDiffAction } from "./actions/git-diff.js";
import { GitStatusAction } from "./actions/git-status.js";
import { OpenChatGptAction } from "./actions/open-chatgpt.js";
import { OpenCodexAction } from "./actions/open-codex.js";
import { OpenWezTermAction } from "./actions/open-wezterm.js";
import { WindowLeftAction } from "./actions/window-left.js";
import { WindowMaximizeAction } from "./actions/window-maximize.js";
import { WindowRightAction } from "./actions/window-right.js";

streamDeck.actions.registerAction(new WindowLeftAction());
streamDeck.actions.registerAction(new WindowRightAction());
streamDeck.actions.registerAction(new WindowMaximizeAction());
streamDeck.actions.registerAction(new OpenCodexAction());
streamDeck.actions.registerAction(new OpenChatGptAction());
streamDeck.actions.registerAction(new GitStatusAction());
streamDeck.actions.registerAction(new GitDiffAction());
streamDeck.actions.registerAction(new OpenWezTermAction());

await streamDeck.connect();
