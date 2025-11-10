'use strict';

var core = require('@actions/core');
var parser = require('@awesome-pages/parser');
var YAML = require('yaml');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var core__namespace = /*#__PURE__*/_interopNamespace(core);
var YAML__default = /*#__PURE__*/_interopDefault(YAML);

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_index = __commonJS({
  "src/index.ts"() {
    async function run() {
      try {
        const sourcesRaw = core__namespace.getInput("sources", { required: true });
        const githubToken = core__namespace.getInput("github-token") || void 0;
        const strictInput = core__namespace.getInput("strict") || void 0;
        const concurrencyInput = core__namespace.getInput("concurrency") || void 0;
        const rootDir = core__namespace.getInput("root-dir") || ".";
        const strict = strictInput?.toLowerCase() === "true";
        const concurrency = concurrencyInput ? Number(concurrencyInput) : void 0;
        let sources;
        try {
          sources = YAML__default.default.parse(sourcesRaw);
        } catch (yamlErr) {
          try {
            sources = JSON.parse(sourcesRaw);
          } catch {
            throw new Error(
              `Failed to parse 'sources' input as YAML or JSON. YAML error: ${yamlErr instanceof Error ? yamlErr.message : String(yamlErr)}`
            );
          }
        }
        if (!Array.isArray(sources)) {
          throw new Error(
            "'sources' input must be a JSON array of SourceSpec objects"
          );
        }
        core__namespace.info("Starting parser with configuration:");
        core__namespace.info(`  Root directory: ${rootDir}`);
        core__namespace.info(`  Strict mode: ${strict}`);
        if (concurrency) {
          core__namespace.info(`  Concurrency: ${concurrency}`);
        }
        if (githubToken) {
          core__namespace.info(`  GitHub token: provided`);
        }
        core__namespace.info(`  Sources: ${sources.length} source(s)`);
        const result = await parser.parse({
          githubToken,
          strict,
          concurrency,
          rootDir,
          sources
        });
        core__namespace.info("");
        core__namespace.info(`\u2705 Successfully generated ${result.length} file(s):`);
        const displayCount = Math.min(result.length, 10);
        for (let i = 0; i < displayCount; i++) {
          const file = result[i];
          core__namespace.info(
            `  ${i + 1}. ${file.file} (${file.artifact}, ${file.bytes} bytes)`
          );
        }
        if (result.length > displayCount) {
          core__namespace.info(`  ... and ${result.length - displayCount} more file(s)`);
        }
        core__namespace.setOutput("files", JSON.stringify(result));
        core__namespace.info("");
        core__namespace.info("\u2728 Parser action completed successfully!");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        core__namespace.setFailed(`\u274C Parser action failed: ${message}`);
        if (err instanceof Error && err.stack) {
          core__namespace.debug(err.stack);
        }
      }
    }
    run();
  }
});
var index = require_index();

module.exports = index;
