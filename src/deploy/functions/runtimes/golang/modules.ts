import { logger } from "../../../../logger";

export interface Module {
  module: string;
  version: string;
  dependencies: Record<string, string>;
}

export function parseModule(mod: string): Module {
  const module: Module = {
    module: "",
    version: "",
    dependencies: {},
  };
  const lines = mod.split("\n");
  let inRequire = false;
  for (const line of lines) {
    if (inRequire) {
      const endRequireMatch = /\)/.exec(line);
      if (endRequireMatch) {
        inRequire = false;
        continue;
      }

      const requireMatch = /([^ ]+) (.*)/.exec(line);
      if (requireMatch) {
        module.dependencies[requireMatch[1]] = requireMatch[2];
        continue;
      }

      if (line.trim()) {
        logger.debug("Don't know how to handle line", line, "inside a mod.go require block");
      }
      continue;
    }
    const modMatch = /^module (.*)$/.exec(line);
    if (modMatch) {
      module.module = modMatch[1];
      continue;
    }
    const versionMatch = /^go (\d+\.\d+)$/.exec(line);
    if (versionMatch) {
      module.version = versionMatch[1];
      continue;
    }

    const requireMatch = /^require ([^ ]+) (.*)$/.exec(line);
    if (requireMatch) {
      module.dependencies[requireMatch[1]] = requireMatch[2];
      continue;
    }

    const requireBlockMatch = /^require +\(/.exec(line);
    if (requireBlockMatch) {
      inRequire = true;
      continue;
    }

    if (line.trim()) {
      logger.debug("Don't know how to handle line", line, "in mod.go");
    }
  }

  return module;
}
