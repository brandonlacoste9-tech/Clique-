const { getDefaultConfig } = require("expo/metro-config");
const fs = require("fs");

const config = getDefaultConfig(__dirname);

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = defaultResolveRequest || context.resolveRequest;
  const resolved = resolve(context, moduleName, platform);

  if (
    platform === "web" &&
    resolved &&
    resolved.type === "sourceFile" &&
    typeof resolved.filePath === "string" &&
    resolved.filePath.endsWith(".mjs")
  ) {
    const cjsPath = resolved.filePath
      .replace(/\/esm\//, "/")
      .replace(/\.mjs$/, ".js");

    if (cjsPath !== resolved.filePath && fs.existsSync(cjsPath)) {
      return { ...resolved, filePath: cjsPath };
    }
  }

  return resolved;
};

module.exports = config;
