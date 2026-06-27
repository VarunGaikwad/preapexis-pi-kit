import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const message =
  process.env.npm_config_msg ||
  process.argv.slice(2).join(" ") ||
  "chore: release";

function run(command, args) {
  console.log(`\n> ${command} ${args.join(" ")}\n`);

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true
  });

  if (result.status !== 0) {
    console.error(`\nCommand failed: ${command} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function bumpPatch(version) {
  const parts = version.split(".").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`Invalid version: ${version}`);
  }

  parts[2] += 1;
  return parts.join(".");
}

const pkg = readJson("package.json");
const nextVersion = bumpPatch(pkg.version);

pkg.version = nextVersion;
writeJson("package.json", pkg);

if (existsSync("package-lock.json")) {
  const lock = readJson("package-lock.json");

  if (lock.version) {
    lock.version = nextVersion;
  }

  if (lock.packages?.[""]) {
    lock.packages[""].version = nextVersion;
  }

  writeJson("package-lock.json", lock);
}

const tag = `v${nextVersion}`;

console.log(`\nBumped version to ${nextVersion}\n`);

run("git", ["add", "."]);
run("git", ["commit", "-m", `"${message}"`]);
run("git", ["tag", [tag]]);
run("git", ["push", "--follow-tags"]);
