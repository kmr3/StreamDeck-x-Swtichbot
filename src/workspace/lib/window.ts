import { runProcess } from "./process.js";

export type WindowLayout = "left" | "right" | "maximize";

export async function moveActiveWindow(layout: WindowLayout): Promise<void> {
  if (process.platform === "darwin") {
    await runProcess("osascript", ["-l", "JavaScript", "-e", createMacWindowScript(layout)]);
    return;
  }

  if (process.platform === "win32") {
    await runProcess("powershell", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      createWindowsWindowScript(layout),
    ]);
    return;
  }

  throw new Error("Window positioning is only supported on macOS and Windows.");
}

export function calculateRect(
  layout: WindowLayout,
  workArea: { height: number; width: number; x: number; y: number },
): { height: number; width: number; x: number; y: number } {
  const halfWidth = Math.floor(workArea.width / 2);

  if (layout === "left") {
    return { ...workArea, width: halfWidth };
  }

  if (layout === "right") {
    return {
      ...workArea,
      width: workArea.width - halfWidth,
      x: workArea.x + halfWidth,
    };
  }

  return workArea;
}

function createMacWindowScript(layout: WindowLayout): string {
  return `
ObjC.import("AppKit");

const screen = $.NSScreen.mainScreen;
const frame = screen.frame;
const visible = screen.visibleFrame;
const workArea = {
  x: Math.round(visible.origin.x),
  y: Math.round(frame.size.height - visible.origin.y - visible.size.height),
  width: Math.round(visible.size.width),
  height: Math.round(visible.size.height),
};

function calculateRect(layout, area) {
  const halfWidth = Math.floor(area.width / 2);
  if (layout === "left") {
    return { x: area.x, y: area.y, width: halfWidth, height: area.height };
  }
  if (layout === "right") {
    return { x: area.x + halfWidth, y: area.y, width: area.width - halfWidth, height: area.height };
  }
  return area;
}

const rect = calculateRect("${layout}", workArea);
const systemEvents = Application("System Events");
const frontProcesses = systemEvents.applicationProcesses.whose({ frontmost: true })();
if (frontProcesses.length === 0 || frontProcesses[0].windows.length === 0) {
  throw new Error("No active window.");
}

const window = frontProcesses[0].windows[0];
window.position = [rect.x, rect.y];
window.size = [rect.width, rect.height];
`;
}

function createWindowsWindowScript(layout: WindowLayout): string {
  const layoutLiteral = JSON.stringify(layout);

  return `
Add-Type @"
using System;
using System.Runtime.InteropServices;

public class WindowTools {
  [DllImport("user32.dll")]
  public static extern IntPtr GetForegroundWindow();

  [DllImport("user32.dll")]
  public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

  [DllImport("user32.dll")]
  public static extern bool SystemParametersInfo(uint uiAction, uint uiParam, ref RECT pvParam, uint fWinIni);
}

public struct RECT {
  public int Left;
  public int Top;
  public int Right;
  public int Bottom;
}
"@

$rect = New-Object RECT
[WindowTools]::SystemParametersInfo(0x0030, 0, [ref]$rect, 0) | Out-Null
$width = $rect.Right - $rect.Left
$height = $rect.Bottom - $rect.Top
$half = [Math]::Floor($width / 2)
$layout = ${layoutLiteral}

if ($layout -eq "left") {
  $x = $rect.Left
  $w = $half
} elseif ($layout -eq "right") {
  $x = $rect.Left + $half
  $w = $width - $half
} else {
  $x = $rect.Left
  $w = $width
}

$hwnd = [WindowTools]::GetForegroundWindow()
[WindowTools]::SetWindowPos($hwnd, [IntPtr]::Zero, $x, $rect.Top, $w, $height, 0x0040) | Out-Null
`;
}

