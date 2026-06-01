import { copyToClipboard, runProcess } from "./process.js";

export type GitSummary = {
  branch: string;
  changedFiles: number;
  raw: string;
  title: string;
};

export async function getGitStatus(workspacePath: string): Promise<GitSummary> {
  const { stdout } = await runProcess("git", ["status", "--short", "--branch"], {
    cwd: workspacePath,
  });

  return summarizeGitStatus(stdout);
}

export async function copyGitDiffStat(workspacePath: string): Promise<string> {
  const { stdout } = await runProcess("git", ["diff", "--stat"], {
    cwd: workspacePath,
  });
  const text = stdout.trim() || "No unstaged diff.";
  await copyToClipboard(text);
  return text;
}

export function summarizeGitStatus(rawStatus: string): GitSummary {
  const lines = rawStatus
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const branchLine = lines.find((line) => line.startsWith("##"));
  const branch = branchLine?.replace(/^##\s*/, "").split("...")[0]?.trim() || "unknown";
  const changedFiles = lines.filter((line) => !line.startsWith("##")).length;
  const title = changedFiles === 0 ? `${branch}\nclean` : `${branch}\n${changedFiles} files`;

  return {
    branch,
    changedFiles,
    raw: rawStatus,
    title,
  };
}

