import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export interface PackageInfo {
  name: string;
  packages: Set<string>;
}

export function readProjectPackages(cwd: string = process.cwd()): PackageInfo {
  const pkgPath = resolve(cwd, "package.json");

  if (!existsSync(pkgPath)) {
    throw new Error(`No package.json found in ${cwd}`);
  }

  const raw = JSON.parse(readFileSync(pkgPath, "utf-8"));
  const deps = Object.keys(raw.dependencies ?? {});
  const devDeps = Object.keys(raw.devDependencies ?? {});
  const packages = new Set([...deps, ...devDeps]);

  if (existsSync(resolve(cwd, "tsconfig.json"))) {
    packages.add("typescript");
  }

  return {
    name: raw.name ?? "unknown-project",
    packages,
  };
}
