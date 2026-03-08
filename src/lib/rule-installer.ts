import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { log } from "./logger.js";

export interface RuleMapping {
  source: string;
  slug: string;
  name: string;
}

const BASE_URL =
  "https://raw.githubusercontent.com/pontusab/cursor.directory/main/packages/data/src/rules";

export async function installRule(
  rule: RuleMapping,
  cwd: string = process.cwd()
): Promise<boolean> {
  try {
    const url = `${BASE_URL}/${rule.source}`;
    const response = await fetch(url);

    if (!response.ok) {
      log.error(`Failed to fetch rule ${rule.name}: HTTP ${response.status}`);
      return false;
    }

    const tsSource = await response.text();
    const content = extractRuleContent(tsSource, rule.slug);

    if (!content) {
      log.error(`Could not parse rule content for slug "${rule.slug}" in ${rule.source}`);
      return false;
    }

    const outPath = resolve(cwd, ".cursor", "rules", `${rule.name}.mdc`);
    mkdirSync(dirname(outPath), { recursive: true });

    const title = extractRuleTitle(tsSource, rule.slug) ?? rule.name;
    const mdc = buildMdc(title, content);
    writeFileSync(outPath, mdc, "utf-8");

    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error(`Failed to install rule ${rule.name}: ${message}`);
    return false;
  }
}

function extractRuleContent(tsSource: string, slug: string): string | null {
  const slugIndex = tsSource.indexOf(`slug: "${slug}"`);
  if (slugIndex === -1) return null;

  const contentStart = tsSource.indexOf("content: `", slugIndex);
  if (contentStart === -1) return null;

  const backtickStart = contentStart + "content: `".length;
  let depth = 1;
  let i = backtickStart;

  while (i < tsSource.length && depth > 0) {
    if (tsSource[i] === "`" && tsSource[i - 1] !== "\\") {
      depth--;
    }
    i++;
  }

  if (depth !== 0) return null;

  return tsSource.slice(backtickStart, i - 1).trim();
}

function extractRuleTitle(tsSource: string, slug: string): string | null {
  const slugIndex = tsSource.indexOf(`slug: "${slug}"`);
  if (slugIndex === -1) return null;

  const searchRegion = tsSource.slice(Math.max(0, slugIndex - 500), slugIndex);
  const titleMatch = searchRegion.match(/title:\s*"([^"]+)"/);
  return titleMatch?.[1] ?? null;
}

function buildMdc(title: string, content: string): string {
  return `---
description: ${title}
globs: 
alwaysApply: true
---

${content}
`;
}
