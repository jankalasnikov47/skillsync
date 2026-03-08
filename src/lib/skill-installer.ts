import { execSync } from "node:child_process";
import { log } from "./logger.js";

export interface SkillMapping {
  repo: string;
  name: string;
}

export function installSkill(skill: SkillMapping): boolean {
  const cmd = `npx skills add ${skill.repo} --skill ${skill.name} -a cursor -y`;
  try {
    execSync(cmd, { stdio: "pipe", timeout: 60_000 });
    return true;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    log.error(`Failed to install skill ${skill.name}: ${message}`);
    return false;
  }
}
