import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { checkTypeScriptSyntax, listFiles, readFile } from "./helpers.js";

function hasPiDefaultExport(source: string): boolean {
  return (
    /export\s+default\s+async\s+function\b/.test(source) ||
    /export\s+default\s+function\b/.test(source) ||
    /export\s+default\s+\(/.test(source) ||
    /export\s*\{[^}]*\bas\s+default\b[^}]*\}/.test(source)
  );
}

describe("extensions", () => {
  const extDir = path.resolve("extensions");

  it("should have at least one extension file", async () => {
    const files = await listFiles(extDir);
    const tsFiles = files.filter((file: string) => file.endsWith(".ts"));

    expect(tsFiles.length).toBeGreaterThan(0);
  });

  it("should export a default extension function", async () => {
    const files = await listFiles(extDir);
    const tsFiles = files.filter((file: string) => file.endsWith(".ts"));

    for (const file of tsFiles) {
      const source = await readFile(file);

      expect(
        hasPiDefaultExport(source),
        `${path.basename(file)} should export a default function`
      ).toBe(true);
    }
  });

  it("should have valid TypeScript syntax", async () => {
    const files = await listFiles(extDir);
    const tsFiles = files.filter((file: string) => file.endsWith(".ts"));

    for (const file of tsFiles) {
      const source = await readFile(file);
      const result = checkTypeScriptSyntax(source, path.basename(file));

      expect(result.errors, `${path.basename(file)} has syntax errors`).toEqual(
        []
      );
    }
  });

  it("should not contain duplicate extension file names", async () => {
    const files = await listFiles(extDir);
    const tsFiles = files.filter((file: string) => file.endsWith(".ts"));

    const names = tsFiles.map((file: string) => path.basename(file, ".ts"));
    const uniqueNames = new Set(names);

    expect(uniqueNames.size).toBe(names.length);
  });
});
