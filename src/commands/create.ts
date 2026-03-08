import { log } from "../lib/logger.js";

export async function createCommand(pkg?: string): Promise<void> {
  log.blank();
  log.info("skillsync create");
  log.blank();
  log.warn(
    "The create command is not yet implemented. Coming in the next release."
  );

  if (pkg) {
    log.dim(`Package: ${pkg}`);
  }

  log.dim(
    "This will generate a custom SKILL.md using Claude API based on your codebase."
  );
  log.dim("Requires ANTHROPIC_API_KEY in your environment.");
  log.blank();
}
