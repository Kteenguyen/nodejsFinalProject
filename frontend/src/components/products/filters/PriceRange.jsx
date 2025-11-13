import { useEffect, useMemo, useState } from "react";

// helpers
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function snapToStep(n, step) {
  if (!step) return n;
  return Math.round(n / step) * step;
}
const nfVN = new Intl.NumberFormat("vi-VN");
const fmtVN = (n) => nfVN.format(Math.max(0, Number(n) || 0));
const unfmtVN = (s) => Number(String(s).replace(/[^\d]/g, "")) || 0;

export default function PriceRange({
  min = 0,
  max = 99_999_999,   // mặc định 99.999.999 VND
  step = 1_000_000,
  valueMin,
  valueMax,
  onChange,
}) {
  // state số (điều khiển slider)
  const [minVal, setMinVal] = useState(valueMin ?? min);
  const [maxVal, setMaxVal] = useState(valueMax ?? max);

  // state text hiển thị trong input (định dạng 1.000.000)
  const [minInput, setMinInput] = useState(fmtVN(valueMin ?? min));
  const [maxInput, setMaxInput] = useState(fmtVN(valueMax ?? max));

  // đồng bộ khi props đổi
  useEffect(() => {
    const v = valueMin ?? min;
    setMinVal(v);
    setMinInput(fmtVN(v));
  }, [valueMin, min]);

  useEffect(() => {
    const v = valueMax ?? max;
    setMaxVal(v);
    setMaxInput(fmtVN(v));
  }, [valueMax, max]);

  // phần trăm fill track
  const leftPct = useMemo(
    () => ((minVal - min) / (max - min)) * 100,
    [minVal, min, max]
  );
  const rightPct = useMemo(
    () => 100 - ((maxVal - min) / (max - min)) * 100,
    [maxVal, min, max]
  );

  const emit = (mi, ma) => onChange?.({ min: mi, max: ma });

  // cập nhật từ slider (range)
  const changeMin = (num) => {
    let n = clamp(Number(num || 0), min, maxVal - step);
    n = snapToStep(n, step);
    setMinVal(n);
    setMinInput(fmtVN(n));
    emit(n, maxVal);
  };
  const changeMax = (num) => {
    let n = clamp(Number(num || 0), minVal + step, max);
    n = snapToStep(n, step);
    setMaxVal(n);
    setMaxInput(fmtVN(n));
    emit(minVal, n);
  };

  // cập nhật từ ô text đã định dạng
  const handleMinText = (s) => {
    const raw = unfmtVN(s);
    changeMin(raw);
  };
  const handleMaxText = (s) => {
    const raw = unfmtVN(s);
    changeMax(raw);
  };

  return (
    <div>
      {/* Inputs định dạng vi-VN */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={minInput}
            onChange={(e) => handleMinText(e.target.value)}
            onBlur={(e) => setMinInput(fmtVN(unfmtVN(e.target.value)))}
            className="w-full rounded border px-3 py-1"
            aria-label="Giá tối thiểu"
          />
          <span className="ml-1 text-gray-500">đ</span>
        </div>
        <span>–</span>
        <div className="flex-1 flex items-center">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={maxInput}
            onChange={(e) => handleMaxText(e.target.value)}
            onBlur={(e) => setMaxInput(fmtVN(unfmtVN(e.target.value)))}
            className="w-full rounded border px-3 py-1"
            aria-label="Giá tối đa"
          />
          <span className="ml-1 text-gray-500">đ</span>
        </div>
      </div>

      {/* Slider đôi */}
      <div className="mt-3 range-double">
        <div className="range-track" />
        <div
          className="range-fill"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) => changeMin(e.target.value)}
          className="price"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) => changeMax(e.target.value)}
          className="price"
        />
      </div>

      <div className="text-xs text-gray-500 mt-1">
        Tối thiểu: {fmtVN(min)} đ • Tối đa: {fmtVN(max)} đ
      </div>
    </div>
  );
}
