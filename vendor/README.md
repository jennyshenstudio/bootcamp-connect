# Third-party libraries

Self-hosted so the app works offline and under its Content Security Policy (D028). Don't edit these files; replace them with a new release instead.

| Library | Version | Files | Licence | Source |
| --- | --- | --- | --- | --- |
| pdf.js (Mozilla) | 3.11.174 | `pdfjs/3.11.174/pdf.min.js`, `pdf.worker.min.js` | Apache 2.0 (`pdfjs/3.11.174/LICENSE`) | `build/pdf.js` and `build/pdf.worker.js` from the official release [pdfjs-3.11.174-dist.zip](https://github.com/mozilla/pdf.js/releases/tag/v3.11.174) (SHA-256 `ba1b54ba0d26618776c036e68d61ea20f76120a616251817b09fa133150da635`), minified with esbuild 0.28 (`esbuild --minify`). |

Used by `js/import.js` (reading CVs) and `js/attachments.js` (showing PDF attachments), always with `isEvalSupported: false`, which closes CVE-2024-4367 in this version of pdf.js.

## Not self-hosted yet

- **Mammoth 1.6.0** (reading Word .docx CVs) still loads from `cdnjs.cloudflare.com` when someone imports a Word file, so that import needs an internet connection. To self-host it: download `mammoth.browser.min.js` for 1.6.0 (from cdnjs or the npm package), save it as `vendor/mammoth/1.6.0/mammoth.browser.min.js` with its licence (BSD-2-Clause), set `MAMMOTH_SRC` in `js/import.js` to that path, and remove `https://cdnjs.cloudflare.com` from the CSP in `scripts/build.mjs`.
