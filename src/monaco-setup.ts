// Monaco language setup
import * as monaco from "monaco-editor";

// Simple MonacoEnvironment setup - disable workers to avoid "Unexpected usage" errors
// Syntax highlighting will still work through the main thread
(window as any).MonacoEnvironment = {
  getWorker: function () {
    // Return null to disable web workers and fall back to main thread
    return null;
  },
};

export default monaco;
