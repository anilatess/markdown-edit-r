import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

export type Meta = Record<string, string>;
export type TocItem = { level: number; text: string; id: string };

// --- Front matter: dosyanın başındaki --- ... --- bloğu ---
export function parseFrontMatter(src: string): { meta: Meta; body: string } {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: src };
  const meta: Meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: src.slice(m[0].length) };
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch {
        /* düz metin olarak devam */
      }
    }
    return ""; // boş dönersek markdown-it kendisi escape eder
  },
});

const slug = (s: string) =>
  s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

export function render(src: string) {
  const { meta, body } = parseFrontMatter(src);
  const tokens = md.parse(body, {});
  const toc: TocItem[] = [];

  tokens.forEach((t, i) => {
    if (t.type === "heading_open" && (t.tag === "h2" || t.tag === "h3")) {
      const text = tokens[i + 1].content;
      const id = slug(text);
      t.attrSet("id", id);
      toc.push({ level: Number(t.tag[1]), text, id });
    }
  });

  const html = md.renderer.render(tokens, md.options, {});
  return { meta, toc, html };
}
