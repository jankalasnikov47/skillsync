import { existsSync } from "node:fs";
import { resolve } from "node:path";

export function isSkillInstalled(
  skillName: string,
  cwd: string = process.cwd()
): boolean {
  return existsSync(resolve(cwd, "skills", skillName, "SKILL.md"));
}

export function isRuleInstalled(
  ruleName: string,
  cwd: string = process.cwd()
): boolean {
  return existsSync(resolve(cwd, ".cursor", "rules", `${ruleName}.mdc`));
}
