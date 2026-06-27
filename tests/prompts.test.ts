import { describe, it, expect } from "vitest";
import * as path from "path";
import { listFiles, readFile } from "./helpers";

describe("prompts", () => {
  const promptsDir = path.resolve("prompts");

  it("should have at least one prompt file", async () => {
    const files = await listFiles(promptsDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    expect(mdFiles.length).toBeGreaterThan(0);
  });

  it("should not include prompts.md (reserved for /prompts command)", async () => {
    const files = await listFiles(promptsDir);
    const names = files.map((f) => path.basename(f));
    expect(names).not.toContain("prompts.md");
  });

  it("should be non-empty markdown files", async () => {
    const files = await listFiles(promptsDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    for (const file of mdFiles) {
      const content = await readFile(file);
      expect(content.trim().length).toBeGreaterThan(0);
    }
  });

  it("should have filenames that become valid slash commands", async () => {
    const files = await listFiles(promptsDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    for (const file of mdFiles) {
      const name = path.basename(file, ".md");
      // Slash commands should be lowercase with hyphens
      expect(name).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
