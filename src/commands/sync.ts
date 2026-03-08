import ora from "ora";
import { readProjectPackages } from "../lib/package-reader.js";
import { isSkillInstalled, isRuleInstalled } from "../lib/diff.js";
import { installSkill, type SkillMapping } from "../lib/skill-installer.js";
import { installRule, type RuleMapping } from "../lib/rule-installer.js";
import { generateAgentsMd } from "../lib/agents-md.js";
import { log } from "../lib/logger.js";
import mapping from "../mapping.json" with { type: "json" };

interface MappingEntry {
  skill: SkillMapping | null;
  rule: RuleMapping | null;
  recommend: { tool: string; repo: string; description: string } | null;
}

const packageMapping = mapping as Record<string, MappingEntry>;

export async function syncCommand(): Promise<void> {
  if (process.env.CI === "true") {
    log.dim("CI detected — skipping skillsync sync.");
    return;
  }

  log.blank();
  log.info("skillsync sync");
  log.blank();

  const { name: projectName, packages } = readProjectPackages();

  const skillsInstalled: string[] = [];
  const skillsSkipped: string[] = [];
  const rulesInstalled: string[] = [];
  const rulesSkipped: string[] = [];
  const gaps: string[] = [];
  const recommendations: MappingEntry["recommend"][] = [];
  const skillsToInstall: { pkg: string; skill: SkillMapping }[] = [];
  const rulesToInstall: { pkg: string; rule: RuleMapping }[] = [];

  for (const pkg of packages) {
    const entry = packageMapping[pkg];

    if (!entry) {
      continue;
    }

    if (entry.skill) {
      if (isSkillInstalled(entry.skill.name)) {
        skillsSkipped.push(entry.skill.name);
      } else {
        skillsToInstall.push({ pkg, skill: entry.skill });
      }
    }

    if (entry.rule) {
      if (isRuleInstalled(entry.rule.name)) {
        rulesSkipped.push(entry.rule.name);
      } else {
        rulesToInstall.push({ pkg, rule: entry.rule });
      }
    }

    if (!entry.skill && !entry.rule) {
      gaps.push(pkg);
    }

    if (entry.recommend) {
      recommendations.push(entry.recommend);
    }
  }

  // --- Install skills ---
  if (skillsToInstall.length > 0) {
    const spinner = ora("Installing skills...").start();
    for (const { skill } of skillsToInstall) {
      spinner.text = `Installing skill: ${skill.name}`;
      const ok = installSkill(skill);
      if (ok) {
        skillsInstalled.push(skill.name);
      }
    }
    spinner.stop();
  }

  // --- Install rules ---
  if (rulesToInstall.length > 0) {
    const spinner = ora("Fetching rules from cursor.directory...").start();
    for (const { rule } of rulesToInstall) {
      spinner.text = `Fetching rule: ${rule.name}`;
      const ok = await installRule(rule);
      if (ok) {
        rulesInstalled.push(rule.name);
      }
    }
    spinner.stop();
  }

  // --- Generate AGENTS.md ---
  const detectedPackages = [...packages].filter((p) => p in packageMapping);
  generateAgentsMd(projectName, detectedPackages);

  // --- Summary ---
  log.blank();

  if (skillsInstalled.length > 0) {
    log.success(`Skills installed:`);
    for (const s of skillsInstalled) log.dim(`→ ${s}`);
  }

  if (skillsSkipped.length > 0) {
    log.dim(`Skills already installed: ${skillsSkipped.join(", ")}`);
  }

  if (rulesInstalled.length > 0) {
    log.success(`Rules installed:`);
    for (const r of rulesInstalled) log.dim(`→ .cursor/rules/${r}.mdc`);
  }

  if (rulesSkipped.length > 0) {
    log.dim(`Rules already installed: ${rulesSkipped.join(", ")}`);
  }

  log.success("AGENTS.md updated");

  if (gaps.length > 0) {
    log.blank();
    for (const g of gaps) {
      log.warn(`${g} — no community skill found`);
    }
    log.dim("Run: npx skillsync create <package>");
  }

  if (recommendations.length > 0) {
    log.blank();
    for (const rec of recommendations) {
      if (!rec) continue;
      log.recommend(`Recommended: ${rec.tool} (${rec.repo})`);
      log.dim(rec.description);
    }
  }

  log.blank();
}
