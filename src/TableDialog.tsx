import { useState } from "react";

type Props = { onClose: () => void; onInsert: (cells: string[][]) => void };

export default function TableDialog({ onClose, onInsert }: Props) {
  const [cells, setCells] = useState<string[][]>([
    ["Parametre", "Tip", "Açıklama"],
    ["", "", ""],
    ["", "", ""],
  ]);
  const cols = cells[0].length;

  const addRow = () => setCells((c) => [...c, Array(cols).fill("")]);
  const delRow = () => setCells((c) => (c.length > 2 ? c.slice(0, -1) : c));
  const addCol = () => setCells((c) => c.map((r) => [...r, ""]));
  const delCol = () => setCells((c) => (c[0].length > 1 ? c.map((r) => r.slice(0, -1)) : c));
  const setCell = (r: number, c: number, v: string) =>
    setCells((cs) => cs.map((row, i) => (i === r ? row.map((x, j) => (j === c ? v : x)) : row)));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Tablo ekle</h3>
        <p className="hint">İlk satır başlık satırıdır. Hücrelere doğrudan yazabilirsin.</p>

        <div className="table-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(110px, 1fr))` }}>
          {cells.map((row, r) =>
            row.map((value, c) => (
              <input
                key={`${r}-${c}`}
                className={r === 0 ? "head" : ""}
                value={value}
                placeholder={r === 0 ? "Başlık" : ""}
                onChange={(e) => setCell(r, c, e.target.value)}
              />
            )),
          )}
        </div>

        <div className="modal-actions">
          <button onClick={addRow}>+ Satır</button>
          <button onClick={delRow}>− Satır</button>
          <button onClick={addCol}>+ Sütun</button>
          <button onClick={delCol}>− Sütun</button>
          <span className="spacer" />
          <button onClick={onClose}>Vazgeç</button>
          <button className="primary" onClick={() => onInsert(cells)}>
            Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
