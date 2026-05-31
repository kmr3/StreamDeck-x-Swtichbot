import { cp, mkdir } from "node:fs/promises";

await mkdir("com.example.switchbot.sdPlugin/bin", { recursive: true });
await cp("com.example.switchbot.sdPlugin/manifest.json", "manifest.json");
