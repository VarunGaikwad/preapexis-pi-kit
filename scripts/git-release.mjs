import { spawnSync } from "node:child_process";

const message =
  process.env.npm_config_msg ||
  process.argv.slice(2).join(" ") ||
  "chore: release";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("git", ["add", "."]);
run("git", ["commit", "-m", `"${message}"`]);
run("npm", ["version", "patch"]);
run("git", ["push", "--follow-tags"]);
