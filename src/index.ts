import * as core from "@actions/core";
import { parse } from "@awesome-pages/parser";
import YAML from "yaml";

async function run(): Promise<void> {
  try {
    // Read and parse inputs
    const sourcesRaw = core.getInput("sources", { required: true });
    const githubToken = core.getInput("github-token") || undefined;
    const strictInput = core.getInput("strict") || undefined;
    const concurrencyInput = core.getInput("concurrency") || undefined;
    const rootDir = core.getInput("root-dir") || ".";

    // Parse boolean and numeric inputs
    const strict = strictInput?.toLowerCase() === "true";
    const concurrency = concurrencyInput ? Number(concurrencyInput) : undefined;

    // Parse sources - try YAML first, then JSON
    let sources: unknown;
    try {
      // Try parsing as YAML (which also handles JSON)
      sources = YAML.parse(sourcesRaw);
    } catch (yamlErr) {
      // If YAML fails, try JSON
      try {
        sources = JSON.parse(sourcesRaw);
      } catch {
        throw new Error(
          `Failed to parse 'sources' input as YAML or JSON. YAML error: ${yamlErr instanceof Error ? yamlErr.message : String(yamlErr)}`,
        );
      }
    }

    // Validate sources is an array
    if (!Array.isArray(sources)) {
      throw new Error(
        "'sources' input must be a JSON array of SourceSpec objects",
      );
    }

    // Log configuration
    core.info("Starting parser with configuration:");
    core.info(`  Root directory: ${rootDir}`);
    core.info(`  Strict mode: ${strict}`);
    if (concurrency) {
      core.info(`  Concurrency: ${concurrency}`);
    }
    if (githubToken) {
      core.info(`  GitHub token: provided`);
    }
    core.info(`  Sources: ${sources.length} source(s)`);

    // Run the parser
    const result = await parse({
      githubToken,
      strict,
      concurrency,
      rootDir,
      sources,
    });

    // Log results
    core.info("");
    core.info(`✅ Successfully generated ${result.length} file(s):`);

    // Show first 10 files with details
    const displayCount = Math.min(result.length, 10);
    for (let i = 0; i < displayCount; i++) {
      const file = result[i];
      core.info(
        `  ${i + 1}. ${file.file} (${file.artifact}, ${file.bytes} bytes)`,
      );
    }

    if (result.length > displayCount) {
      core.info(`  ... and ${result.length - displayCount} more file(s)`);
    }

    // Set output
    core.setOutput("files", JSON.stringify(result));

    core.info("");
    core.info("✨ Parser action completed successfully!");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(`❌ Parser action failed: ${message}`);

    // Log stack trace in debug mode
    if (err instanceof Error && err.stack) {
      core.debug(err.stack);
    }
  }
}

run();
