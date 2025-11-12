export default function TimeGranularityPicker({ value, onChange, from, to, onRangeChange }) {
  const opts = ["year", "quarter", "month", "week", "custom"];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {opts.map(k => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`px-3 py-1.5 rounded border ${value===k ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
        >
          {k.toUpperCase()}
        </button>
      ))}

      {value === "custom" && (
        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={from || ""}
            onChange={e => onRangeChange({ from: e.target.value, to })}
          />
          <span>→</span>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={to || ""}
            onChange={e => onRangeChange({ from, to: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
