import { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import { editorExtensions } from "./editorActions";
import Toolbar from "./Toolbar";
import "highlight.js/styles/github.css";
import { render } from "./markdown";
import { TEMPLATES } from "./templates";
import "./styles.css";

const KEY = "doc-editor:content";

function load(): string {
  try {
    return localStorage.getItem(KEY) ?? TEMPLATES[0].content;
  } catch {
    return TEMPLATES[0].content;
  }
}

export default function App() {
  const [text, setText] = useState(load);
  const [busy, setBusy] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, text);
    } catch {
      /* depolama kapalıysa sessiz geç */
    }
  }, [text]);

  const { meta, toc, html } = useMemo(() => render(text), [text]);

  const applyTemplate = (name: string) => {
    const t = TEMPLATES.find((x) => x.name === name);
    if (t && confirm("Mevcut içerik silinecek. Devam edilsin mi?")) setText(t.content);
  };

  const downloadMd = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meta.game || meta.title || "document"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    if (!articleRef.current) return;
    setBusy(true);
    try {
      const footer = [meta.game, meta.version && `v${meta.version}`].filter(Boolean).join(" · ");
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: articleRef.current.outerHTML, title: meta.title, footer }),
      });
      if (!res.ok) throw new Error("PDF hatası");
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${meta.game || meta.title || "document"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF sunucusuna ulaşılamadı. server klasöründe `npm run dev` çalışıyor mu?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app">
      <header className="toolbar">
        <strong>Doc Editor</strong>
        <select value="" onChange={(e) => applyTemplate(e.target.value)}>
          <option value="" disabled>
            Şablon seç…
          </option>
          {TEMPLATES.map((t) => (
            <option key={t.name}>{t.name}</option>
          ))}
        </select>
        <span className="spacer" />
        <button onClick={downloadMd}>.md indir</button>
        <button onClick={() => window.print()}>Yazdır</button>
        <button className="primary" onClick={exportPdf} disabled={busy}>
          {busy ? "Hazırlanıyor…" : "PDF indir"}
        </button>
      </header>

      <main className="split">
        <section className="editor">
          <Toolbar getView={() => viewRef.current} />
          <div className="editor-body">
            <CodeMirror
              value={text}
              height="100%"
              extensions={[markdown(), EditorView.lineWrapping, ...editorExtensions]}
              onChange={setText}
              onCreateEditor={(view) => {
                viewRef.current = view;
              }}
            />
          </div>
        </section>

        <section className="preview">
          <article className="doc" ref={articleRef}>
            {meta.title && (
              <div className="cover">
                <h1>{meta.title}</h1>
                {meta.game && <h2>{meta.game}</h2>}
                <p>
                  {[meta.provider, meta.version && `v${meta.version}`, meta.date]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            )}

            {toc.length > 0 && (
              <nav className="toc">
                <h2>İçindekiler</h2>
                <ul>
                  {toc.map((t) => (
                    <li key={t.id} className={`lvl${t.level}`}>
                      <a href={`#${t.id}`}>{t.text}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <div dangerouslySetInnerHTML={{ __html: html }} />
          </article>
          <div className="print-footer">
            {[meta.game, meta.version && `v${meta.version}`].filter(Boolean).join(" · ")}
          </div>
        </section>
      </main>
    </div>
  );
}
