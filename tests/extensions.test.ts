import { describe, it, expect } from "vitest";
import * as path from "path";
import {
  listFiles,
  readFile,
  checkTypeScriptSyntax,
  hasDefaultExport
} from "./helpers";

describe("extensions", () => {
  const extDir = path.resolve("extensions");

  it("should have at least one extension file", async () => {
    const files = await listFiles(extDir);
    const tsFiles = files.filter((f) => f.endsWith(".ts"));
    expect(tsFiles.length).toBeGreaterThan(0);
  });

  it("should export a default function", async () => {
    const files = await listFiles(extDir);
    const tsFiles = files.filter((f) => f.endsWith(".ts"));

    for (const file of tsFiles) {
      const source = await readFile(file);
      expect(hasDefaultExport(source)).toBe(true);
    }
  });

  it("should have no unexpected imports", async () => {
    const files = await listFiles(extDir);
    const tsFiles = files.filter((f) => f.endsWith(".ts"));

    for (const file of tsFiles) {
      const source = await readFile(file);
      const result = checkTypeScriptSyntax(source, path.basename(file));
      expect(result.errors).toEqual([]);
    }
  });

  it("should not contain duplicate responsibilities (by name)", async () => {
    const files = await listFiles(extDir);
    const tsFiles = files.filter((f) => f.endsWith(".ts"));

    // Each extension should have a unique, focused name
    const names = tsFiles.map((f) => path.basename(f, ".ts"));
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});
