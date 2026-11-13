import { useState } from "react";
import type { EditorView } from "@codemirror/view";
import * as A from "./editorActions";
import { SNIPPETS } from "./templates";
import TableDialog from "./TableDialog";

const LANGS = ["json", "http", "javascript", "typescript", "bash", "python", "csharp", "java", "php", "text"];

export default function Toolbar({ getView }: { getView: () => EditorView | null }) {
  const [tableOpen, setTableOpen] = useState(false);

  const run = (fn: (v: EditorView) => void) => () => {
    const v = getView();
    if (v) fn(v);
  };

  return (
    <>
      <div className="format-bar">
        <button title="Başlık" onClick={run((v) => A.setHeading(v, 2))}>Başlık</button>
        <button title="Alt başlık" onClick={run((v) => A.setHeading(v, 3))}>Alt başlık</button>
        <span className="sep" />
        <button title="Kalın (Ctrl+B)" onClick={run((v) => A.wrap(v, "**", "**", "kalın metin"))}><b>K</b></button>
        <button title="İtalik (Ctrl+I)" onClick={run((v) => A.wrap(v, "*", "*", "italik metin"))}><i>İ</i></button>
        <button title="Satır içi kod" onClick={run((v) => A.wrap(v, "`", "`", "kod"))}>{"</>"}</button>
        <button title="Bağlantı (Ctrl+K)" onClick={run(A.insertLink)}>Bağlantı</button>
        <span className="sep" />
        <button title="Madde listesi" onClick={run((v) => A.makeList(v, false))}>• Liste</button>
        <button title="Numaralı liste" onClick={run((v) => A.makeList(v, true))}>1. Liste</button>
        <button title="Not kutusu" onClick={run((v) => A.insertBlock(v, "> **Not:** "))}>Not</button>
        <button title="Ayırıcı çizgi" onClick={run((v) => A.insertBlock(v, "---"))}>Çizgi</button>
        <span className="sep" />
        <button title="Tablo ekle" onClick={() => setTableOpen(true)}>Tablo</button>
        <select
          value=""
          title="Kod bloğu ekle"
          onChange={(e) => run((v) => A.insertCodeBlock(v, e.target.value))()}
        >
          <option value="" disabled>Kod bloğu…</option>
          {LANGS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select
          value=""
          title="Hazır parça ekle"
          onChange={(e) => {
            const s = SNIPPETS.find((x) => x.name === e.target.value);
            if (s) run((v) => A.insertBlock(v, s.content))();
          }}
        >
          <option value="" disabled>Hazır parça…</option>
          {SNIPPETS.map((s) => (
            <option key={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      {tableOpen && (
        <TableDialog
          onClose={() => setTableOpen(false)}
          onInsert={(cells) => {
            setTableOpen(false);
            run((v) => A.insertBlock(v, A.tableFromCells(cells)))();
          }}
        />
      )}
    </>
  );
}
