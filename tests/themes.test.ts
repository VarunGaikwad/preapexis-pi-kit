import { describe, it, expect } from "vitest";
import * as path from "path";
import { listFiles, readFile } from "./helpers";

describe("themes", () => {
  const themesDir = path.resolve("themes");

  it("should have at least one theme file", async () => {
    const files = await listFiles(themesDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    expect(jsonFiles.length).toBeGreaterThan(0);
  });

  it("should be valid JSON", async () => {
    const files = await listFiles(themesDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    for (const file of jsonFiles) {
      const content = await readFile(file);
      expect(() => JSON.parse(content)).not.toThrow();
    }
  });

  it("should have required theme fields", async () => {
    const files = await listFiles(themesDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    for (const file of jsonFiles) {
      const content = await readFile(file);
      const theme = JSON.parse(content);

      expect(theme.name).toBeTruthy();
      expect(theme.vars).toBeDefined();
      expect(theme.colors).toBeDefined();
    }
  });

  it("should reference the Pi theme schema", async () => {
    const files = await listFiles(themesDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    for (const file of jsonFiles) {
      const content = await readFile(file);
      const theme = JSON.parse(content);

      expect(theme.$schema).toMatch(/theme-schema\.json$/);
    }
  });
});
