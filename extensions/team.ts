import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * Team context extension.
 *
 * Injects shared working rules into every agent session so all team members
 * follow the same conventions.
 */

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event) => {
    return {
      systemPrompt:
        event.systemPrompt +
        `

Team working rules:
- Use small diffs.
- Read files before editing.
- Do not touch secrets.
- Do not edit lockfiles unless asked.
- Prefer existing patterns.
- Always explain verification.
- Run tests when possible.
`,
    };
  });
}
