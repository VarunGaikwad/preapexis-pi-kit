import { describe, it, expect } from "vitest";
import * as fs from "fs/promises";

describe("package.json", () => {
  it("should exist and be valid JSON", async () => {
    const raw = await fs.readFile("package.json", "utf-8");
    const pkg = JSON.parse(raw);
    expect(pkg).toBeDefined();
  });

  it("should have required pi package fields", async () => {
    const raw = await fs.readFile("package.json", "utf-8");
    const pkg = JSON.parse(raw);

    expect(pkg.name).toBe("@preapexis/pi-kit");
    expect(pkg.pi).toBeDefined();
    expect(Array.isArray(pkg.pi.extensions)).toBe(true);
    expect(Array.isArray(pkg.pi.prompts)).toBe(true);
    expect(Array.isArray(pkg.pi.skills)).toBe(true);
    expect(Array.isArray(pkg.pi.themes)).toBe(true);
  });

  it("should declare peer dependency on pi-coding-agent", async () => {
    const raw = await fs.readFile("package.json", "utf-8");
    const pkg = JSON.parse(raw);

    expect(pkg.peerDependencies).toBeDefined();
    expect(pkg.peerDependencies["@earendil-works/pi-coding-agent"]).toBe("*");
  });

  it("should have test script configured", async () => {
    const raw = await fs.readFile("package.json", "utf-8");
    const pkg = JSON.parse(raw);

    expect(pkg.scripts?.test).toBeDefined();
    expect(pkg.scripts.test).toContain("vitest");
  });
});
