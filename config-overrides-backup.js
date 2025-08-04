const path = require("path");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = function override(config) {
  if (!config.plugins) {
    config.plugins = [];
  }

  // Configure Monaco webpack plugin with specific language support
  config.plugins.push(
    new MonacoWebpackPlugin({
      languages: ["html", "css", "javascript", "typescript", "json"],
      features: [
        "accessibilityHelp",
        "bracketMatching",
        "caretOperations",
        "clipboard",
        "codeAction",
        "colorDetector",
        "comment",
        "contextmenu",
        "coreCommands",
        "cursorUndo",
        "dnd",
        "find",
        "folding",
        "fontZoom",
        "format",
        "gotoError",
        "gotoLine",
        "gotoSymbol",
        "hover",
        "iPadShowKeyboard",
        "inPlaceReplace",
        "inspectTokens",
        "linesOperations",
        "links",
        "multicursor",
        "parameterHints",
        "quickCommand",
        "quickOutline",
        "referenceSearch",
        "rename",
        "smartSelect",
        "snippets",
        "suggest",
        "toggleHighContrast",
        "toggleTabFocusMode",
        "transpose",
        "wordHighlighter",
        "wordOperations",
        "wordPartOperations",
      ],
    })
  );

  // Ensure module resolution works properly
  if (!config.resolve) {
    config.resolve = {};
  }
  if (!config.resolve.alias) {
    config.resolve.alias = {};
  }

  // Add Monaco editor alias
  config.resolve.alias["monaco-editor"] = path.resolve(
    __dirname,
    "node_modules/monaco-editor"
  );

  if (process.env.NODE_ENV === "production") {
    config.plugins = config.plugins.filter((plugin) => {
      return plugin.constructor.name !== "ForkTsCheckerWebpackPlugin";
    });
    return config;
  }

  let forkTsCheckerWebpackPlugin = config.plugins.find((plugin) => {
    return plugin.constructor.name === "ForkTsCheckerWebpackPlugin";
  });
  if (forkTsCheckerWebpackPlugin) {
    forkTsCheckerWebpackPlugin.memoryLimit = 4096;
  }
  return config;
};
// Ref https://github.com/microsoft/monaco-editor/issues/82
// Ref https://www.gitmemory.com/issue/facebook/create-react-app/7135/497102755
