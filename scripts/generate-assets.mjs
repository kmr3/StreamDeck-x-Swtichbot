import { mkdir, writeFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import { deflateSync } from "node:zlib";

await mkdir("com.example.switchbot.sdPlugin/imgs/actions", { recursive: true });
await mkdir("com.example.workspace.sdPlugin/imgs", { recursive: true });

const icons = {
  "com.example.switchbot.sdPlugin/imgs/actions/aircon.svg": airconIcon(),
  "com.example.switchbot.sdPlugin/imgs/actions/brightness.svg": sunIcon(),
  "com.example.switchbot.sdPlugin/imgs/actions/color.svg": colorIcon(),
  "com.example.switchbot.sdPlugin/imgs/actions/power.svg": powerIcon(),
  "com.example.switchbot.sdPlugin/imgs/actions/scene.svg": sceneIcon(),
  "com.example.switchbot.sdPlugin/imgs/actions/temp-down.svg": tempIcon("-"),
  "com.example.switchbot.sdPlugin/imgs/actions/temp-up.svg": tempIcon("+"),
  "com.example.switchbot.sdPlugin/imgs/category.svg": powerIcon(),
};

for (const [path, svg] of Object.entries(icons)) {
  await writeFile(path, svg);
}

await writeFile("com.example.switchbot.sdPlugin/imgs/plugin.png", createPng(256, 256));
await writeFile("com.example.switchbot.sdPlugin/imgs/plugin@2x.png", createPng(512, 512));
await writeFile("com.example.workspace.sdPlugin/imgs/plugin.png", createPng(256, 256));
await writeFile("com.example.workspace.sdPlugin/imgs/plugin@2x.png", createPng(512, 512));

function powerIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><path fill="#fff" d="M33 8h6v28h-6z"/><path fill="none" stroke="#fff" stroke-linecap="round" stroke-width="6" d="M24 18a24 24 0 1 0 24 0"/></svg>`;
}

function sunIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><circle cx="36" cy="36" r="12" fill="#fff"/><path fill="none" stroke="#fff" stroke-linecap="round" stroke-width="5" d="M36 7v10M36 55v10M7 36h10M55 36h10M15 15l7 7M50 50l7 7M57 15l-7 7M22 50l-7 7"/></svg>`;
}

function colorIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><path fill="#fff" d="M36 8a28 28 0 0 0 0 56h5a7 7 0 0 0 0-14h-2a5 5 0 0 1 0-10h7A16 16 0 0 0 62 24C62 15 51 8 36 8ZM22 32a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm14-8a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm14 8a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/></svg>`;
}

function sceneIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><path fill="#fff" d="M14 16h44a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6Zm8 10v20l17-10-17-10Z"/></svg>`;
}

function airconIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><path fill="#fff" d="M12 16h48a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6Zm4 10v8h40v-8H16Zm8 29h6v9h-6v-9Zm18 0h6v9h-6v-9Zm-9-1h6v12h-6V54Z"/></svg>`;
}

function tempIcon(sign) {
  const symbol =
    sign === "+"
      ? '<path fill="#fff" d="M47 16h7v12h12v7H54v12h-7V35H35v-7h12z"/>'
      : '<path fill="#fff" d="M36 28h30v8H36z"/>';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><path fill="#fff" d="M22 8a10 10 0 0 0-10 10v26a18 18 0 1 0 20 0V18A10 10 0 0 0 22 8Zm-4 10a4 4 0 0 1 8 0v29l2 2a12 12 0 1 1-12 0l2-2V18Z"/>${symbol}</svg>`;
}

function createPng(width, height) {
  const bytesPerPixel = 4;
  const raw = Buffer.alloc((width * bytesPerPixel + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * bytesPerPixel + 1);
    raw[rowStart] = 0;

    for (let x = 0; x < width; x += 1) {
      const offset = rowStart + 1 + x * bytesPerPixel;
      const distance = Math.hypot(x - width / 2, y - height / 2);
      const isCircle = distance < width * 0.38;
      raw[offset] = isCircle ? 44 : 0;
      raw[offset + 1] = isCircle ? 137 : 0;
      raw[offset + 2] = isCircle ? 255 : 0;
      raw[offset + 3] = isCircle ? 255 : 0;
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr(width, height)),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function ihdr(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = 8;
  data[9] = 6;
  return data;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
