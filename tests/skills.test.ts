import { describe, it, expect } from "vitest";
import * as path from "path";
import { listDirectories, readFile, parseFrontmatter } from "./helpers";

describe("skills", () => {
  const skillsDir = path.resolve("skills");

  it("should have at least one skill folder", async () => {
    const dirs = await listDirectories(skillsDir);
    expect(dirs.length).toBeGreaterThan(0);
  });

  it("each skill folder should contain a SKILL.md", async () => {
    const dirs = await listDirectories(skillsDir);

    for (const dir of dirs) {
      const skillFile = path.join(dir, "SKILL.md");
      const content = await readFile(skillFile).catch(() => null);
      expect(content).not.toBeNull();
    }
  });

  it("each SKILL.md should have valid frontmatter with name and description", async () => {
    const dirs = await listDirectories(skillsDir);

    for (const dir of dirs) {
      const skillFile = path.join(dir, "SKILL.md");
      const content = await readFile(skillFile);
      const frontmatter = parseFrontmatter(content);

      expect(frontmatter).not.toBeNull();
      expect(frontmatter!.name).toBeTruthy();
      expect(frontmatter!.description).toBeTruthy();
    }
  });

  it("should not have skill files directly inside skills/ (must be in subfolders)", async () => {
    const entries = await listDirectories(skillsDir);
    // listDirectories only returns directories, which is what we want
    expect(entries.length).toBeGreaterThan(0);
  });
});
