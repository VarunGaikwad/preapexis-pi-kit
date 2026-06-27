import * as fs from "fs/promises";
import * as path from "path";
import * as ts from "typescript";

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf-8");
}

export async function listFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isFile()) {
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
}

export async function listDirectories(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(dir, e.name));
}

export function checkTypeScriptSyntax(source: string, fileName: string): {
  valid: boolean;
  errors: string[];
} {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true
  );

  const errors: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isExpressionStatement(node)) {
      const text = node.getText(sourceFile).trim();
      if (text.startsWith("import ") || text.startsWith("export ")) {
        // valid module statement
      } else if (
        text.includes("Unknown") ||
        text.includes("undefined") // crude fallback
      ) {
        // ignore
      }
    }

    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier
        .getText(sourceFile)
        .replace(/['"]/g, "");

      // Allow @earendil-works/pi-coding-agent and node built-ins
      if (
        moduleSpecifier.startsWith(".") ||
        moduleSpecifier.startsWith("@earendil-works/pi-coding-agent") ||
        moduleSpecifier.startsWith("node:") ||
        ["fs", "fs/promises", "path", "url", "util"].includes(moduleSpecifier)
      ) {
        // ok
      } else {
        errors.push(`Unexpected import: ${moduleSpecifier}`);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    valid: errors.length === 0,
    errors
  };
}

export function hasDefaultExport(source: string): boolean {
  return /export\s+default\s+function\s*\(/.test(source);
}

export function parseFrontmatter(
  content: string
): { name: string; description: string } | null {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return null;

  const frontmatter = match[1];
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m);

  if (!nameMatch || !descMatch) return null;

  return {
    name: nameMatch[1].trim(),
    description: descMatch[1].trim()
  };
}
