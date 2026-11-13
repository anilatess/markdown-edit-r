import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// highlight.js temasını sunucu tarafında da kullanıyoruz (kod blokları renkli çıksın)
function highlightCss(): string {
  try {
    const require = createRequire(import.meta.url);
    return readFileSync(require.resolve("highlight.js/styles/github.css"), "utf8");
  } catch {
    return "";
  }
}

const DOC_CSS = `
body { font-family: system-ui, "Segoe UI", Arial, sans-serif; color: #1a1a1a; margin: 0; }
.doc { line-height: 1.6; font-size: 11pt; }
.doc h1, .doc h2, .doc h3 { line-height: 1.25; page-break-after: avoid; }
.doc h2 { border-bottom: 1px solid #e5e5e5; padding-bottom: 4px; margin-top: 1.8em; }
.doc table { border-collapse: collapse; width: 100%; margin: 1em 0; page-break-inside: avoid; }
.doc th, .doc td { border: 1px solid #d0d0d0; padding: 6px 10px; text-align: left; }
.doc th { background: #f3f4f6; }
.doc pre { background: #f6f8fa; padding: 12px; border-radius: 6px; white-space: pre-wrap; word-break: break-word; page-break-inside: avoid; }
.doc code { font-family: ui-monospace, Consolas, monospace; font-size: 0.9em; }
.doc :not(pre) > code { background: #f0f0f0; padding: 1px 5px; border-radius: 4px; }
.cover { text-align: center; height: 245mm; display: flex; flex-direction: column; justify-content: center; page-break-after: always; }
.cover h1 { font-size: 2.6rem; margin-bottom: 0.2em; }
.cover h2 { border: 0; font-weight: 400; color: #555; margin-top: 0; }
.toc { page-break-after: always; }
.toc ul { list-style: none; padding-left: 0; }
.toc .lvl3 { padding-left: 1.5em; }
.toc a { color: inherit; text-decoration: none; }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
`;

export function buildHtml(body: string, title: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${highlightCss()}${DOC_CSS}</style></head><body>${body}</body></html>`;
}
