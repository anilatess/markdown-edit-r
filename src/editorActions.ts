import { EditorView, keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";

// Seçili metni işaretlerle sarar: **kalın**, *italik*, `kod`
export function wrap(view: EditorView, before: string, after = before, placeholder = "metin") {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to) || placeholder;
  view.dispatch({
    changes: { from, to, insert: before + selected + after },
    selection: { anchor: from + before.length, head: from + before.length + selected.length },
  });
  view.focus();
}

export function insertLink(view: EditorView) {
  const { from, to } = view.state.selection.main;
  const text = view.state.sliceDoc(from, to) || "bağlantı metni";
  const urlStart = from + text.length + 3; // "[" + text + "]("
  view.dispatch({
    changes: { from, to, insert: `[${text}](https://)` },
    selection: { anchor: urlStart, head: urlStart + "https://".length },
  });
  view.focus();
}

// Bulunduğun satırı başlık yapar (## veya ###). Aynı seviyedeyse başlığı kaldırır.
export function setHeading(view: EditorView, level: number) {
  const line = view.state.doc.lineAt(view.state.selection.main.from);
  const current = /^(#{1,6})\s/.exec(line.text)?.[1].length ?? 0;
  const text = line.text.replace(/^#{1,6}\s*/, "");
  const prefix = current === level ? "" : "#".repeat(level) + " ";
  view.dispatch({ changes: { from: line.from, to: line.to, insert: prefix + text } });
  view.focus();
}

// Seçili satırları listeye çevirir
export function makeList(view: EditorView, ordered: boolean) {
  const { doc, selection } = view.state;
  const first = doc.lineAt(selection.main.from).number;
  const last = doc.lineAt(selection.main.to).number;
  const changes = [];
  for (let n = first; n <= last; n++) {
    changes.push({ from: doc.line(n).from, insert: ordered ? `${n - first + 1}. ` : "- " });
  }
  view.dispatch({ changes });
  view.focus();
}

// Bloğu (tablo, kod vb.) uygun boşluklarla imlecin olduğu yere ekler
export function insertBlock(view: EditorView, text: string, cursorOffset = text.length) {
  const line = view.state.doc.lineAt(view.state.selection.main.from);
  const empty = line.text.trim() === "";
  const pos = empty ? line.from : line.to;
  const lead = empty ? "" : "\n\n";
  view.dispatch({
    changes: { from: pos, to: empty ? line.to : pos, insert: lead + text + "\n" },
    selection: { anchor: pos + lead.length + cursorOffset },
    scrollIntoView: true,
  });
  view.focus();
}

export function insertCodeBlock(view: EditorView, lang: string) {
  const l = lang === "text" ? "" : lang;
  const { from, to } = view.state.selection.main;
  if (from !== to) {
    const selected = view.state.sliceDoc(from, to);
    view.dispatch({ changes: { from, to, insert: "```" + l + "\n" + selected + "\n```" } });
    view.focus();
    return;
  }
  insertBlock(view, "```" + l + "\n\n```", 4 + l.length);
}

export function tableFromCells(cells: string[][]): string {
  const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
  const rows = cells.map((r) => r.map(esc));
  const widths = rows[0].map((_, c) => Math.max(3, ...rows.map((r) => r[c].length)));
  const line = (r: string[]) => "| " + r.map((x, c) => x.padEnd(widths[c])).join(" | ") + " |";
  const sep = "| " + widths.map((w) => "-".repeat(w)).join(" | ") + " |";
  return [line(rows[0]), sep, ...rows.slice(1).map(line)].join("\n");
}

// Klavye kısayolları: Ctrl/Cmd + B, I, K
const shortcuts = Prec.highest(
  keymap.of([
    { key: "Mod-b", run: (v) => (wrap(v, "**", "**", "kalın metin"), true) },
    { key: "Mod-i", run: (v) => (wrap(v, "*", "*", "italik metin"), true) },
    { key: "Mod-k", run: (v) => (insertLink(v), true) },
  ]),
);

// Excel / Google Sheets / Word'den tablo kopyalayıp yapıştırınca otomatik markdown tabloya çevirir
const pasteTable = EditorView.domEventHandlers({
  paste(event, view) {
    const data = event.clipboardData;
    if (!data || !/<table/i.test(data.getData("text/html"))) return false;
    const rows = data
      .getData("text/plain")
      .replace(/\r/g, "")
      .split("\n")
      .filter((l) => l.trim() !== "")
      .map((l) => l.split("\t"));
    if (rows.length === 0 || rows[0].length < 2) return false;
    const width = Math.max(...rows.map((r) => r.length));
    const cells = rows.map((r) => Array.from({ length: width }, (_, i) => r[i] ?? ""));
    event.preventDefault();
    insertBlock(view, tableFromCells(cells));
    return true;
  },
});

export const editorExtensions = [shortcuts, pasteTable];
