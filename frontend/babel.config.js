module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [transformImportMetaEnv],
  };
};

function transformImportMetaEnv() {
  return {
    visitor: {
      MetaProperty(path) {
        const parent = path.parentPath;
        if (
          !parent.isMemberExpression() ||
          !parent.get("property").isIdentifier({ name: "env" })
        ) {
          return;
        }

        const grandParent = parent.parentPath;
        if (
          grandParent.isMemberExpression() &&
          grandParent.get("property").isIdentifier({ name: "MODE" })
        ) {
          grandParent.replaceWith(
            memberExpression(path, "process", "env", "NODE_ENV")
          );
        } else {
          parent.replaceWith(memberExpression(path, "process", "env"));
        }
      },
    },
  };
}

function memberExpression(path, ...parts) {
  const t = require("@babel/types");
  return parts.reduce((obj, prop) =>
    obj ? t.memberExpression(obj, t.identifier(prop)) : t.identifier(prop),
    null
  );
}
