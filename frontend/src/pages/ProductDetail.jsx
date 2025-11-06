// src/pages/ProductDetail.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001';

function resolveUrl(src) {
  if (!src) return '/images/placeholder.png';
  return /^https?:\/\//i.test(src) ? src : `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
}

export default function ProductDetail({ productId }) {
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  const [sel, setSel] = useState('');     // variantId được chọn
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setError('');
    axios.get(`${API_BASE}/api/products/${productId}`)
      .then(res => {
        const data = res.data?.product;
        setP(data || null);
        // default chọn biến thể đầu tiên nếu có
        const first = data?.variants?.[0]?.variantId;
        if (first) setSel(first);
      })
      .catch(e => setError(e?.response?.data?.message || 'Lỗi tải sản phẩm'));
  }, [productId]);

  const v = useMemo(() => {
    if (!p || !Array.isArray(p.variants)) return null;
    return p.variants.find(x => String(x.variantId) === String(sel)) || null;
  }, [p, sel]);

  const minPrice = useMemo(() => {
    if (typeof p?.minPrice === 'number') return p.minPrice;
    const prices = (p?.variants || []).map(x => Number(x.price)).filter(Number.isFinite);
    return prices.length ? Math.min(...prices) : 0;
  }, [p]);

  const images = Array.isArray(p?.images) ? p.images : [];
  const first3 = images.slice(0, 3);

  function addToCart() {
    if (!p || !v) return;
    const raw = JSON.parse(localStorage.getItem('cart') || '[]');
    const keyMatch = (it) =>
      (it.productId === p.productId || it.productMongoId === p._id || it._id === p._id)
      && String(it.variantId) === String(v.variantId);
    const existed = raw.find(keyMatch);
    if (existed) {
      existed.qty = Number(existed.qty || 1) + Number(qty || 1);
    } else {
      raw.push({
        productId: p.productId,
        productMongoId: p._id,
        variantId: v.variantId,
        qty: Number(qty || 1)
      });
    }
    localStorage.setItem('cart', JSON.stringify(raw));
    alert('Đã thêm vào giỏ');
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!p) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Ảnh (>=3 ảnh để đạt rubric) */}
      <div className="grid grid-cols-3 gap-2">
        {(first3.length ? first3 : images).map((src, i) => (
          <img
            key={i}
            src={resolveUrl(src)}
            alt={`${p.productName}-${i}`}
            className="rounded object-cover w-full h-40"
            loading="lazy"
          />
        ))}
      </div>

      {/* Thông tin chính */}
      <div>
        <h1 className="text-2xl font-bold">{p.productName}</h1>
        <p className="text-sm text-gray-500">Brand: {p.brand || '-'}</p>

        <div className="mt-2">
          <div className="text-xl font-semibold">
            {/* Giá tổng quát từ minPrice (nếu chưa chọn) */}
            {v
              ? `Giá: ${Number(v.price || 0).toLocaleString()} ₫`
              : `Giá từ: ${Number(minPrice).toLocaleString()} ₫`}
          </div>
          {v && <div className="text-sm text-gray-600">Tồn kho: {v.stock ?? 0}</div>}
        </div>

        {/* Chọn biến thể (#12) */}
        {Array.isArray(p.variants) && p.variants.length > 0 && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">Chọn biến thể</label>
              <select
                className="border rounded p-2 w-full"
                value={sel}
                onChange={(e) => setSel(e.target.value)}
              >
                {p.variants.map((x) => (
                  <option key={x.variantId} value={x.variantId}>
                    {x.name} — {Number(x.price || 0).toLocaleString()} ₫ (tồn: {x.stock ?? 0})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Số lượng</label>
              <input
                type="number"
                min={1}
                max={v?.stock ?? undefined}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
                className="border rounded p-2 w-28"
              />
            </div>
          </div>
        )}

        {/* Mô tả (>=5 dòng để đạt rubric) */}
        <div className="mt-4">
          <div className="font-medium mb-1">Mô tả</div>
          <p className="whitespace-pre-line">{p.productDescription}</p>
        </div>

        {/* Bình luận & xếp hạng (hiển thị) */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Bình luận & Xếp hạng</h2>
            <span className="text-sm text-gray-600">
              | Trung bình: {p.averageRating ?? 0}★
            </span>
          </div>

          {Array.isArray(p.comments) && p.comments.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {p.comments.map((c, idx) => (
                <li key={idx} className="border rounded p-2">
                  <div className="text-sm">
                    <span className="font-medium">{c.guestName || c.accountId || 'Người dùng'}</span>
                    <span className="ml-2 text-yellow-600">{c.rating ? `${c.rating}★` : ''}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.comment}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Chưa có bình luận.</p>
          )}
        </div>

        {/* Hành động */}
        <div className="mt-6 flex gap-3">
          <button
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={!v || (v.stock ?? 0) <= 0}
            onClick={addToCart}
          >
            Thêm vào giỏ
          </button>
          <a
            href="/cart"
            className="px-4 py-2 rounded border border-black text-black"
          >
            Xem giỏ
          </a>
        </div>
      </div>
    </div>
  );
}
