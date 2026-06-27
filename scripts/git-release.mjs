import { spawnSync } from "node:child_process";

const message =
  process.env.npm_config_msg ||
  process.argv.slice(2).join(" ") ||
  "chore: release";

function run(command) {
  console.log(`\n> ${command}\n`);

  const result = spawnSync(command, {
    stdio: "inherit",
    shell: true
  });

  if (result.status !== 0) {
    console.error(`\nCommand failed: ${command}`);
    process.exit(result.status ?? 1);
  }
}

run("git add .");
run(`git commit -m "${message}"`);
run("npm version patch");
run("git push --follow-tags");
