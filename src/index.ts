import { Command } from "commander";
import { syncCommand } from "./commands/sync.js";
import { createCommand } from "./commands/create.js";
import { statusCommand } from "./commands/status.js";

const program = new Command();

program
  .name("skillsync")
  .description(
    "Automatically sync Cursor rules, agent skills, and AGENTS.md based on your package.json"
  )
  .version("0.1.0");

program
  .command("sync")
  .description("Sync skills and rules based on your package.json dependencies")
  .action(async () => {
    await syncCommand();
  });

program
  .command("create [package]")
  .description("Generate a custom SKILL.md using Claude API (requires ANTHROPIC_API_KEY)")
  .action(async (pkg?: string) => {
    await createCommand(pkg);
  });

program
  .command("status")
  .description("Show installed rules, skills, and AGENTS.md status")
  .action(async () => {
    await statusCommand();
  });

program.parse();
