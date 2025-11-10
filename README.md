# Awesome Pages Parser Action

A GitHub Action that parses awesome-style README.md files into structured artifacts using [`@awesome-pages/parser`](https://www.npmjs.com/package/@awesome-pages/parser).

## Features

- 📦 Parse awesome lists from **local files**, **GitHub repositories**, or **HTTP URLs**
- 🎯 Generate multiple artifact types: `domain`, `index`, `bookmarks`, `sitemap`, `rss-json`, `rss-xml`
- 🔧 Flexible placeholder-based output paths
- ⚡ Configurable concurrency for parallel parsing
- 🔒 Support for private repositories via GitHub tokens
- ✅ Strict mode for validation

## Usage

### Basic Example (YAML)

```yaml
name: Build Awesome Artifacts

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Parse awesome lists
        uses: awesome-pages/parser-action@v1
        with:
          sources: |
            - from:
                - README.md
              outputs:
                - artifact: [domain, index]
                  to: dist/{name}.{artifact}.json
```

### Basic Example (JSON)

```yaml
- name: Parse awesome lists
  uses: awesome-pages/parser-action@v1
  with:
    sources: |
      [
        {
          "from": ["README.md"],
          "outputs": [
            {
              "artifact": ["domain", "index"],
              "to": "dist/{name}.{artifact}.json"
            }
          ]
        }
      ]
```

### GitHub Repository Sources (YAML)

Parse awesome lists from GitHub repositories:

```yaml
- name: Parse from GitHub
  uses: awesome-pages/parser-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    sources: |
      - from:
          - github://teles/awesome-click-and-use@main:README.md
          - github://teles/awesome-seo@main:README.md
        outputs:
          - artifact: [domain, index]
            to: dist/{repo}-{name}.{artifact}.json
          - artifact: bookmarks
            to: dist/{repo}-{name}.bookmarks.html
```

### GitHub Repository Sources (JSON)

```yaml
- name: Parse from GitHub
  uses: awesome-pages/parser-action@v1
  with:
    sources: |
      [
        {
          "from": [
            "github://teles/awesome-click-and-use@main:README.md",
            "github://teles/awesome-seo@main:README.md"
          ],
          "outputs": [
            {
              "artifact": ["domain", "index"],
              "to": "dist/{repo}-{name}.{artifact}.json"
            },
            {
              "artifact": "bookmarks",
              "to": "dist/{repo}-{name}.bookmarks.html"
            }
          ]
        }
      ]
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Local Files with Globs (YAML)

Parse multiple local markdown files:

```yaml
- name: Parse local files
  uses: awesome-pages/parser-action@v1
  with:
    root-dir: "."
    sources: |
      - from:
          - docs/**/*.md
        outputs:
          - artifact: [domain, index]
            to: dist/{dir}/{name}.{artifact}.json
```

### Local Files with Globs (JSON)

```yaml
- name: Parse local files
  uses: awesome-pages/parser-action@v1
  with:
    sources: |
      [
        {
          "from": ["docs/**/*.md"],
          "outputs": [
            {
              "artifact": ["domain", "index"],
              "to": "dist/{dir}/{name}.{artifact}.json"
            }
          ]
        }
      ]
    root-dir: "."
```

### All Artifact Types (YAML)

Generate all available artifact types:

```yaml
- name: Generate all artifacts
  uses: awesome-pages/parser-action@v1
  with:
    sources: |
      - from:
          - README.md
        outputs:
          - artifact: domain
            to: dist/domain.json
          - artifact: index
            to: dist/index.json
          - artifact: bookmarks
            to: dist/bookmarks.html
          - artifact: sitemap
            to: dist/sitemap.xml
          - artifact: rss-json
            to: dist/feed.json
          - artifact: rss-xml
            to: dist/feed.xml
```

### All Artifact Types (JSON)

```yaml
- name: Generate all artifacts
  uses: awesome-pages/parser-action@v1
  with:
    sources: |
      [
        {
          "from": ["README.md"],
          "outputs": [
            {
              "artifact": "domain",
              "to": "dist/domain.json"
            },
            {
              "artifact": "index",
              "to": "dist/index.json"
            },
            {
              "artifact": "bookmarks",
              "to": "dist/bookmarks.html"
            },
            {
              "artifact": "sitemap",
              "to": "dist/sitemap.xml"
            },
            {
              "artifact": "rss-json",
              "to": "dist/feed.json"
            },
            {
              "artifact": "rss-xml",
              "to": "dist/feed.xml"
            }
          ]
        }
      ]
```

### With Strict Mode and Concurrency (YAML)

```yaml
- name: Parse with strict validation
  uses: awesome-pages/parser-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    strict: true
    concurrency: 8
    sources: |
      - from:
          - github://awesome-*/awesome-*@main:README.md
        outputs:
          - artifact: [domain, index]
            to: dist/{owner}-{repo}.{artifact}.json
```

### With Strict Mode and Concurrency (JSON)

```yaml
- name: Parse with strict validation
  uses: awesome-pages/parser-action@v1
  with:
    sources: |
      [
        {
          "from": ["github://awesome-*/awesome-*@main:README.md"],
          "outputs": [
            {
              "artifact": ["domain", "index"],
              "to": "dist/{owner}-{repo}.{artifact}.json"
            }
          ]
        }
      ]
    github-token: ${{ secrets.GITHUB_TOKEN }}
    strict: true
    concurrency: 8
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `sources` | ✅ Yes | - | YAML or JSON array of source specifications (see [Source Specification](#source-specification)) |
| `github-token` | ❌ No | - | GitHub token for accessing repositories (use `${{ secrets.GITHUB_TOKEN }}`) |
| `strict` | ❌ No | `false` | Enable strict mode to fail-fast on parsing inconsistencies |
| `concurrency` | ❌ No | - | Maximum number of parallel parsing operations |
| `root-dir` | ❌ No | `.` | Base directory for resolving local globs and `{dir}` placeholder |

## Outputs

| Output | Description |
|--------|-------------|
| `files` | JSON stringified array of generated files with metadata (`ParseResultFile[]`) |

### Using Outputs

```yaml
- name: Parse awesome lists
  id: parse
  uses: awesome-pages/parser-action@v1
  with:
    sources: |
      [{ "from": ["README.md"], "outputs": [{ "artifact": "domain", "to": "dist/domain.json" }] }]

- name: Show generated files
  run: |
    echo "Generated files:"
    echo '${{ steps.parse.outputs.files }}' | jq -r '.[] | "- \(.file) (\(.bytes) bytes)"'
```

## Source Specification

Each source specification in the `sources` array should have:

**YAML format:**
```yaml
- from:
    - string      # List of input sources (globs, URLs, or github://)
  outputs:
    - artifact: string | [string, ...]  # Artifact type(s) to generate
      to: string                         # Output path with placeholders
```

**JSON format:**
```typescript
{
  "from": string[],      // List of input sources (globs, URLs, or github://)
  "outputs": [
    {
      "artifact": string | string[],  // Artifact type(s) to generate
      "to": string                     // Output path with placeholders
    }
  ]
}
```

### Artifact Types

- `domain` - Structured domain JSON with parsed content
- `index` - Inverted index JSON for search
- `bookmarks` - HTML bookmarks file
- `sitemap` - XML sitemap
- `rss-json` - JSON Feed format
- `rss-xml` - RSS 2.0 XML format

### Source Formats

| Format | Example | Description |
|--------|---------|-------------|
| **Local files** | `README.md` | Single file |
| **Glob patterns** | `docs/**/*.md` | Multiple files matching pattern |
| **GitHub** | `github://owner/repo@ref:path` | GitHub repository file |
| **HTTP/HTTPS** | `https://example.com/README.md` | Remote file via HTTP |

### Placeholders

Use these placeholders in the `to` output path:

- `{name}` - Base name of the source file (without extension)
- `{dir}` - Directory of the source file relative to `root-dir`
- `{artifact}` - Current artifact name (`domain`, `index`, etc.)
- `{repo}` - Repository name (for GitHub sources)
- `{owner}` - Repository owner (for GitHub sources)

## Complete Example Workflow

```yaml
name: Generate Awesome Artifacts

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  generate:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Parse awesome lists
        id: parse
        uses: awesome-pages/parser-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          strict: true
          concurrency: 4
          sources: |
            - from:
                - github://teles/awesome-click-and-use@main:README.md
                - github://teles/awesome-seo@main:README.md
              outputs:
                - artifact: [domain, index]
                  to: public/{repo}.{artifact}.json
                - artifact: bookmarks
                  to: public/{repo}.html
                - artifact: [rss-json, rss-xml]
                  to: public/{repo}.{artifact}

      - name: Commit generated files
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add public/
          git diff --staged --quiet || git commit -m "Update generated artifacts"
          git push
```

## Development

### Building the Action

```bash
# Install dependencies
pnpm install

# Build the action
pnpm build

# Type-check
pnpm typecheck
```

The compiled output will be in `dist/index.cjs`.

### Testing Locally

You can test the parser functionality locally using the `@awesome-pages/parser` package directly:

```bash
cd /path/to/awesome-pages/parser
pnpm test
```

## License

MIT

## Related

- [@awesome-pages/parser](https://www.npmjs.com/package/@awesome-pages/parser) - The underlying parser library
- [Awesome Lists](https://github.com/topics/awesome) - Curated lists on GitHub
