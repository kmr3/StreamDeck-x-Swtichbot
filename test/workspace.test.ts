import { describe, expect, it } from "vitest";

import { summarizeGitStatus } from "../src/workspace/lib/git.js";
import { calculateRect } from "../src/workspace/lib/window.js";

describe("workspace window layouts", () => {
  const workArea = { height: 900, width: 1440, x: 0, y: 25 };

  it("calculates left half", () => {
    expect(calculateRect("left", workArea)).toEqual({ height: 900, width: 720, x: 0, y: 25 });
  });

  it("calculates right half", () => {
    expect(calculateRect("right", workArea)).toEqual({ height: 900, width: 720, x: 720, y: 25 });
  });

  it("uses the full visible work area for maximize", () => {
    expect(calculateRect("maximize", workArea)).toEqual(workArea);
  });
});

describe("workspace git summary", () => {
  it("summarizes a clean branch", () => {
    expect(summarizeGitStatus("## main\n")).toMatchObject({
      branch: "main",
      changedFiles: 0,
      title: "main\nclean",
    });
  });

  it("counts changed files", () => {
    expect(summarizeGitStatus("## feature...origin/feature\n M src/a.ts\n?? test/a.test.ts\n"))
      .toMatchObject({
        branch: "feature",
        changedFiles: 2,
        title: "feature\n2 files",
      });
  });
});

