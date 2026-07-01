import * as path from "node:path";
import type { EventContext } from "./pi-helpers.js";

export function resolveFromCwd(ctx: EventContext, value: string): string {
  if (path.isAbsolute(value)) {
    return path.normalize(value);
  }

  return path.normalize(path.join(ctx.cwd, value));
}

export function normalize(filePath: string): string {
  return path.resolve(filePath);
}

export function getFileName(filePath: string): string {
  return path.basename(path.normalize(filePath));
}

export function getPathSegments(filePath: string): string[] {
  return path
    .normalize(filePath)
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean);
}
