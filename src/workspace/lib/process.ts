import { execFile } from "node:child_process";

export type ProcessResult = {
  stderr: string;
  stdout: string;
};

type RunOptions = {
  cwd?: string;
  timeoutMs?: number;
};

export function runProcess(
  file: string,
  args: readonly string[] = [],
  options: RunOptions = {},
): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    execFile(
      file,
      [...args],
      {
        cwd: options.cwd,
        timeout: options.timeoutMs ?? 20_000,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({ stderr, stdout });
      },
    );
  });
}

export async function openApplication(appName: string, workspacePath?: string): Promise<void> {
  if (process.platform === "darwin") {
    const args = ["-a", appName];
    if (workspacePath) {
      args.push(workspacePath);
    }

    await runProcess("open", args);
    return;
  }

  if (process.platform === "win32") {
    await runProcess("cmd", ["/c", "start", "", appName]);
    return;
  }

  await runProcess("xdg-open", [appName]);
}

export async function openUrl(url: string): Promise<void> {
  if (process.platform === "darwin") {
    await runProcess("open", [url]);
    return;
  }

  if (process.platform === "win32") {
    await runProcess("cmd", ["/c", "start", "", url]);
    return;
  }

  await runProcess("xdg-open", [url]);
}

export async function copyToClipboard(text: string): Promise<void> {
  if (process.platform === "darwin") {
    await writeStdinProcess("pbcopy", [], text);
    return;
  }

  if (process.platform === "win32") {
    await writeStdinProcess("clip", [], text);
    return;
  }

  await writeStdinProcess("xclip", ["-selection", "clipboard"], text);
}

function writeStdinProcess(file: string, args: readonly string[], input: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = execFile(file, [...args], { windowsHide: true }, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });

    child.stdin?.end(input);
  });
}

