import { existsSync, readdirSync } from "node:fs";
import { resolve, basename } from "node:path";
import { log } from "../lib/logger.js";

export async function statusCommand(): Promise<void> {
  const cwd = process.cwd();

  log.blank();
  log.info("skillsync status");
  log.blank();

  const rulesDir = resolve(cwd, ".cursor", "rules");
  if (existsSync(rulesDir)) {
    const rules = readdirSync(rulesDir).filter((f) => f.endsWith(".mdc"));
    if (rules.length > 0) {
      log.success(`Rules (${rules.length}):`);
      for (const r of rules) log.dim(`→ .cursor/rules/${r}`);
    } else {
      log.warn("No rules installed.");
    }
  } else {
    log.warn("No .cursor/rules/ directory found.");
  }

  log.blank();

  const skillsDir = resolve(cwd, "skills");
  if (existsSync(skillsDir)) {
    const skills = readdirSync(skillsDir, { withFileTypes: true })
      .filter(
        (d) =>
          d.isDirectory() &&
          existsSync(resolve(skillsDir, d.name, "SKILL.md"))
      )
      .map((d) => d.name);

    if (skills.length > 0) {
      log.success(`Skills (${skills.length}):`);
      for (const s of skills) log.dim(`→ skills/${s}/SKILL.md`);
    } else {
      log.warn("No skills installed.");
    }
  } else {
    log.warn("No skills/ directory found.");
  }

  log.blank();

  const agentsMd = resolve(cwd, "AGENTS.md");
  if (existsSync(agentsMd)) {
    log.success("AGENTS.md exists.");
  } else {
    log.warn("AGENTS.md not found. Run: npx skillsync sync");
  }

  log.blank();
}
