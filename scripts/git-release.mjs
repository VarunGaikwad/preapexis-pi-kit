import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

const rl = readline.createInterface({ input, output });

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

async function askYesNo(question, defaultValue = false) {
  const suffix = defaultValue ? "Y/n" : "y/N";
  const answer = (await rl.question(`${question} (${suffix}): `))
    .trim()
    .toLowerCase();

  if (!answer) return defaultValue;

  return answer === "y" || answer === "yes";
}

async function askVersionType() {
  while (true) {
    const answer = (await rl.question("Version bump type? patch/minor/major: "))
      .trim()
      .toLowerCase();

    if (["patch", "minor", "major"].includes(answer)) {
      return answer;
    }

    console.log("Please type patch, minor, or major.");
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function bumpVersion(version, type) {
  const parts = version.split(".").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`Invalid version: ${version}`);
  }

  if (type === "major") {
    parts[0] += 1;
    parts[1] = 0;
    parts[2] = 0;
  }

  if (type === "minor") {
    parts[1] += 1;
    parts[2] = 0;
  }

  if (type === "patch") {
    parts[2] += 1;
  }

  return parts.join(".");
}

function updatePackageVersion(nextVersion) {
  const pkg = readJson("package.json");

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
}

try {
  const shouldBump = await askYesNo(
    "Do you want to bump package version?",
    true
  );
  let nextVersion = null;
  let tag = null;

  if (shouldBump) {
    const bumpType = await askVersionType();
    const pkg = readJson("package.json");

    nextVersion = bumpVersion(pkg.version, bumpType);
    tag = `v${nextVersion}`;

    updatePackageVersion(nextVersion);

    console.log(`\nBumped version to ${nextVersion}\n`);
  }

  const shouldPublish = await askYesNo("Do you want to publish to npm?", false);

  run("git", ["add", "."]);
  run("git", ["commit", "-m", `"${message}"`]);

  if (tag) {
    run("git", ["tag", tag]);
  }

  run("git", ["push", "--follow-tags"]);

  if (shouldPublish) {
    run("npm", ["publish", "--access", "public"]);
  }

  console.log("\nDone.\n");
} finally {
  rl.close();
}
