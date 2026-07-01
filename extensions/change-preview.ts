// cSpell:words preapexis multiedit
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync } from "node:fs";
import { resolveFromCwd } from "./lib/paths.js";
import {
  inputRecord,
  type EventContext,
  type InputRecord,
  type ToolDecision
} from "./lib/pi-helpers.js";
import { commandMayModifyFiles } from "./lib/command-classifier.js";

type TextEdit = {
  oldText?: string;
  newText?: string;
};

const PREVIEW_STATUS_KEY = "change-preview";
const MAX_PREVIEW_CHARS = 12000;

export default function (pi: ExtensionAPI): void {
  function stringValue(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
  }

  function nonEmptyStringValue(value: unknown): string | undefined {
    return typeof value === "string" && value.trim().length > 0
      ? value
      : undefined;
  }

  function firstString(input: InputRecord, keys: string[]): string | undefined {
    for (const key of keys) {
      const value = nonEmptyStringValue(input[key]);

      if (value) {
        return value;
      }
    }

    return undefined;
  }

  function getTargetPath(ctx: EventContext, input: InputRecord): string {
    const rawPath = firstString(input, [
      "path",
      "filePath",
      "filepath",
      "file_path",
      "file",
      "target",
      "targetPath",
      "target_path"
    ]);

    if (!rawPath) {
      return "(unknown path)";
    }

    return resolveFromCwd(ctx, rawPath);
  }

  function getOldText(input: InputRecord): string | undefined {
    return stringValue(
      input.oldString ??
        input.old_string ??
        input.oldText ??
        input.old_text ??
        input.old ??
        input.search ??
        input.pattern
    );
  }

  function getNewText(input: InputRecord): string | undefined {
    return stringValue(
      input.newString ??
        input.new_string ??
        input.newText ??
        input.new_text ??
        input.new ??
        input.replace ??
        input.replacement ??
        input.content ??
        input.text ??
        input.data
    );
  }

  function isWriteTool(toolName: string): boolean {
    return toolName.toLowerCase() === "write";
  }

  function isEditTool(toolName: string): boolean {
    const lower = toolName.toLowerCase();

    return (
      lower === "edit" ||
      lower === "replace" ||
      lower === "multi_edit" ||
      lower === "multiedit"
    );
  }

  function readExistingFile(targetPath: string): string | undefined {
    try {
      if (!existsSync(targetPath)) {
        return undefined;
      }

      return readFileSync(targetPath, "utf-8");
    } catch {
      return undefined;
    }
  }

  function countLineNumber(source: string, index: number): number {
    return source.slice(0, index).split(/\r?\n/).length;
  }

  function findLocation(
    fullText: string | undefined,
    searchText: string | undefined
  ): string {
    if (!fullText || !searchText) {
      return "unknown";
    }

    const index = fullText.indexOf(searchText);

    if (index === -1) {
      return "not found in current file";
    }

    const startLine = countLineNumber(fullText, index);
    const endLine = startLine + searchText.split(/\r?\n/).length - 1;

    return startLine === endLine
      ? `line ${startLine}`
      : `lines ${startLine}-${endLine}`;
  }

  function truncate(value: string): string {
    if (value.length <= MAX_PREVIEW_CHARS) {
      return value;
    }

    return `${value.slice(0, MAX_PREVIEW_CHARS)}

... diff preview truncated ...
Total characters: ${value.length}`;
  }

  function splitLines(value: string): string[] {
    if (value.length === 0) {
      return [];
    }

    return value.split(/\r?\n/);
  }

  function createSimpleDiff(oldText?: string, newText?: string): string {
    const oldValue = oldText ?? "";
    const newValue = newText ?? "";

    if (oldValue === newValue) {
      return "No text change detected.";
    }

    const oldLines = splitLines(oldValue);
    const newLines = splitLines(newValue);

    if (oldLines.length === 0 && newLines.length === 0) {
      return "(no diff available)";
    }

    return [
      ...oldLines.map((line) => `- ${line}`),
      ...newLines.map((line) => `+ ${line}`)
    ].join("\n");
  }

  function createUnifiedDiff(oldText?: string, newText?: string): string {
    const oldValue = oldText ?? "";
    const newValue = newText ?? "";

    if (oldValue === newValue) {
      return "No text change detected.";
    }

    const oldLines = splitLines(oldValue);
    const newLines = splitLines(newValue);

    if (oldLines.length === 0) {
      return newLines.map((line) => `+ ${line}`).join("\n");
    }

    if (newLines.length === 0) {
      return oldLines.map((line) => `- ${line}`).join("\n");
    }

    const table = buildLcsTable(oldLines, newLines);
    const rows = buildDiffRows(oldLines, newLines, table);

    return rows.join("\n");
  }

  function buildLcsTable(oldLines: string[], newLines: string[]): number[][] {
    const table = Array.from({ length: oldLines.length + 1 }, () =>
      Array.from({ length: newLines.length + 1 }, () => 0)
    );

    for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex -= 1) {
      for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex -= 1) {
        if (oldLines[oldIndex] === newLines[newIndex]) {
          table[oldIndex][newIndex] = table[oldIndex + 1][newIndex + 1] + 1;
        } else {
          table[oldIndex][newIndex] = Math.max(
            table[oldIndex + 1][newIndex],
            table[oldIndex][newIndex + 1]
          );
        }
      }
    }

    return table;
  }

  function buildDiffRows(
    oldLines: string[],
    newLines: string[],
    table: number[][]
  ): string[] {
    const rows: string[] = [];
    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldLines.length && newIndex < newLines.length) {
      if (oldLines[oldIndex] === newLines[newIndex]) {
        rows.push(`  ${oldLines[oldIndex]}`);
        oldIndex += 1;
        newIndex += 1;
        continue;
      }

      if (table[oldIndex + 1][newIndex] >= table[oldIndex][newIndex + 1]) {
        rows.push(`- ${oldLines[oldIndex]}`);
        oldIndex += 1;
      } else {
        rows.push(`+ ${newLines[newIndex]}`);
        newIndex += 1;
      }
    }

    while (oldIndex < oldLines.length) {
      rows.push(`- ${oldLines[oldIndex]}`);
      oldIndex += 1;
    }

    while (newIndex < newLines.length) {
      rows.push(`+ ${newLines[newIndex]}`);
      newIndex += 1;
    }

    return compactDiffContext(rows);
  }

  function compactDiffContext(rows: string[]): string[] {
    const changedIndexes = rows
      .map((row, index) =>
        row.startsWith("+ ") || row.startsWith("- ") ? index : -1
      )
      .filter((index) => index >= 0);

    if (changedIndexes.length === 0) {
      return rows;
    }

    const keep = new Set<number>();
    const context = 3;

    for (const index of changedIndexes) {
      for (
        let current = Math.max(0, index - context);
        current <= Math.min(rows.length - 1, index + context);
        current += 1
      ) {
        keep.add(current);
      }
    }

    const output: string[] = [];
    let skipped = false;

    for (let index = 0; index < rows.length; index += 1) {
      if (keep.has(index)) {
        if (skipped) {
          output.push("  ...");
          skipped = false;
        }

        output.push(rows[index]);
      } else {
        skipped = true;
      }
    }

    return output;
  }

  function getMultiEdits(input: InputRecord): TextEdit[] {
    const rawEdits = input.edits ?? input.replacements ?? input.changes;

    if (!Array.isArray(rawEdits)) {
      return [];
    }

    return rawEdits
      .map((rawEdit) => inputRecord(rawEdit))
      .map((edit) => ({
        oldText: getOldText(edit),
        newText: getNewText(edit)
      }))
      .filter(
        (edit) => edit.oldText !== undefined || edit.newText !== undefined
      );
  }

  function buildEditPreview(
    toolName: string,
    targetPath: string,
    input: InputRecord
  ): string {
    const existingFile = readExistingFile(targetPath);
    const multiEdits = getMultiEdits(input);

    if (multiEdits.length > 0) {
      const sections = multiEdits.map((edit, index) => {
        const location = findLocation(existingFile, edit.oldText);
        const diff = createUnifiedDiff(edit.oldText, edit.newText);

        return [
          `Edit ${index + 1}`,
          `Location: ${location}`,
          "",
          "```diff",
          truncate(diff),
          "```"
        ].join("\n");
      });

      return sections.join("\n\n");
    }

    const oldText = getOldText(input);
    const newText = getNewText(input);
    const location = findLocation(existingFile, oldText);
    const diff = createUnifiedDiff(oldText, newText);

    return [
      `Location: ${location}`,
      "",
      "```diff",
      truncate(diff),
      "```",
      "",
      `Tool: ${toolName}`
    ].join("\n");
  }

  function buildWritePreview(targetPath: string, input: InputRecord): string {
    const existingFile = readExistingFile(targetPath);
    const newText = getNewText(input);

    const diff =
      existingFile === undefined
        ? createSimpleDiff(undefined, newText)
        : createUnifiedDiff(existingFile, newText);

    return [
      existingFile === undefined
        ? "File status: new file"
        : "File status: existing file",
      "",
      "```diff",
      truncate(diff),
      "```"
    ].join("\n");
  }

  async function confirmWriteOrEdit(
    toolName: string,
    input: InputRecord,
    ctx: EventContext
  ): Promise<ToolDecision> {
    const targetPath = getTargetPath(ctx, input);

    if (!ctx.hasUI) {
      return {
        block: true,
        reason:
          "Change preview requires UI approval before editing, but no UI is available."
      };
    }

    const preview = isWriteTool(toolName)
      ? buildWritePreview(targetPath, input)
      : buildEditPreview(toolName, targetPath, input);

    ctx.ui.setStatus(PREVIEW_STATUS_KEY, "change preview: waiting");

    try {
      const ok = await ctx.ui.confirm(
        `Approve ${toolName} change`,
        [
          "The agent wants to change this file.",
          "",
          `File: ${targetPath}`,
          "",
          "Proposed change:",
          "",
          preview,
          "",
          "Approve this change?"
        ].join("\n")
      );

      if (!ok) {
        return {
          block: true,
          reason: `User rejected proposed ${toolName} change for ${targetPath}.`
        };
      }

      return undefined;
    } finally {
      ctx.ui.setStatus(PREVIEW_STATUS_KEY, undefined);
    }
  }

  async function confirmShellEdit(
    command: string,
    ctx: EventContext
  ): Promise<ToolDecision> {
    if (!ctx.hasUI) {
      return {
        block: true,
        reason:
          "Shell command may modify files, but no UI is available for approval."
      };
    }

    ctx.ui.setStatus(PREVIEW_STATUS_KEY, "command preview: waiting");

    try {
      const ok = await ctx.ui.confirm(
        "Approve file-changing command",
        [
          "This shell command may modify files.",
          "",
          "Pi cannot show an exact file diff before this command runs.",
          "Approve only if you trust this command.",
          "",
          "Command:",
          "```",
          command,
          "```",
          "",
          "Approve this command?"
        ].join("\n")
      );

      if (!ok) {
        return {
          block: true,
          reason: "User rejected shell command that may modify files."
        };
      }

      return undefined;
    } finally {
      ctx.ui.setStatus(PREVIEW_STATUS_KEY, undefined);
    }
  }

  pi.on("tool_call", async (event, ctx) => {
    const input = inputRecord(event.input);

    if (isWriteTool(event.toolName) || isEditTool(event.toolName)) {
      return await confirmWriteOrEdit(event.toolName, input, ctx);
    }

    if (event.toolName === "bash") {
      const command = nonEmptyStringValue(input.command) ?? "";

      if (commandMayModifyFiles(command)) {
        return await confirmShellEdit(command, ctx);
      }
    }

    return undefined;
  });

  pi.registerCommand("change-preview-status", {
    description: "Show change preview guard status",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) {
        console.log("Change preview guard is enabled.");
        return;
      }

      ctx.ui.notify(
        [
          "Change preview guard is enabled.",
          "",
          "Before write/edit tools run, Pi will ask for approval.",
          "The approval message shows a diff-style preview.",
          "Before risky shell commands run, Pi will ask for approval."
        ].join("\n"),
        "info"
      );
    }
  });
}
