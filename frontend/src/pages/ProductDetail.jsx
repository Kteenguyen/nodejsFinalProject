// src/pages/ProductDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductController } from '../controllers/productController';

const money = (n) => `${(Number(n) || 0).toLocaleString("vi-VN")} đ`;
const isAbort = (e) =>
  e?.name === "AbortError" || /abort/i.test(String(e?.message || ""));

function Star({ filled = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-2xl ${
        filled ? "text-yellow-400" : "text-gray-300"
      } hover:text-yellow-400`}
      aria-label="star"
      title="Đánh giá"
    >
      ★
    </button>
  );
}

export default function ProductDetail() {
  const params = useParams();
  const urlId =
    params.id ??
    params.productId ??
    params.slug ??
    Object.values(params)[0] ??
    "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  // forms
  const [cName, setCName] = useState("");
  const [cText, setCText] = useState("");
  const [myRate, setMyRate] = useState(0);
  const [rateMsg, setRateMsg] = useState("");

  // gallery
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!urlId) {
      setError("Thiếu mã sản phẩm trên URL.");
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setError("");
      try {
        const j = await ProductController.getProductById(urlId);
        const data = j?.data || j?.product || j;
        if (!data || j?.success === false)
          throw new Error(j?.message || "Không tìm thấy sản phẩm.");
        setProduct(data);
        setActiveIdx(0);
      } catch (e) {
        if (!isAbort(e)) setError(e?.message || "Không tải được sản phẩm.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [urlId]);

  async function refetch() {
    try {
      const j = await ProductController.getProductById(urlId);
      setProduct(j?.data || j?.product || j);
    } catch (e) {
      if (!isAbort(e)) setError(e?.message || "Không tải được sản phẩm.");
    }
  }

  async function onSubmitComment(e) {
    e.preventDefault();
    if (!cText.trim()) return;
    try {
      await ProductController.addComment(product?._id || product?.productId || urlId, {
        name: cName || undefined,
        comment: cText.trim(), // BE yêu cầu "comment"
      });
      setCName("");
      setCText("");
      await refetch();
    } catch (e) {
      alert(e?.message || "Không gửi được bình luận");
    }
  }

  async function onRate() {
    // UI đang chọn 1..5 => chỉ cần clamp, KHÔNG cộng thêm 1
    const stars = Math.max(1, Math.min(5, Number(myRate) || 0));
    if (!stars) {
      setRateMsg("Hãy chọn số sao.");
      return;
    }
    try {
      setRateMsg("Đang gửi đánh giá…");
      await ProductController.rateProduct(product?._id || product?.productId || urlId, {
        rating: stars,
      });
      await refetch();
      setRateMsg("Cảm ơn bạn đã đánh giá!");
    } catch (e) {
      setRateMsg(
        /401|unauthor/i.test(String(e))
          ? "Bạn cần đăng nhập để đánh giá."
          : e?.message || "Không gửi được đánh giá."
      );
    }
  }

  // ======= TÍNH TOÁN HIỂN THỊ =======

  // Ảnh (đảm bảo ≥ 3)
  const images = useMemo(() => {
    const arr = (Array.isArray(product?.images) ? product.images : []).filter(
      Boolean
    );
    // Chuyển đổi mỗi hình ảnh sang URL hoàn chỉnh
    const converted = arr.map(img => ProductController.getImageUrl(img));
    while (converted.length < 3) converted.push("/img/placeholder.png");
    return converted.slice(0, 10);
  }, [product]);

  // Giá min
  const minPrice = useMemo(() => {
    if (typeof product?.lowestPrice === "number") return product.lowestPrice;
    if (typeof product?.minPrice === "number") return product.minPrice;
    const vs = Array.isArray(product?.variants) ? product.variants : [];
    const m = Math.min(...vs.map((v) => Number(v?.price) || Infinity));
    return Number.isFinite(m) ? m : Number(product?.price) || 0;
  }, [product]);

  // Tính trung bình & số lượng đánh giá: chịu nhiều tên field khác nhau
  const { avgRating, ratingCount } = useMemo(() => {
    // số gộp từ server (nếu có)
    const avgFromServer = Number(
      product?.avgRating ??
        product?.averageRating ??
        product?.ratingAvg ??
        product?.ratingAverage ??
        product?.rating?.avg
    );
    const countFromServer =
      Number(
        product?.ratingCount ??
          product?.ratingsCount ??
          product?.totalRatings ??
          product?.rating?.count
      ) || 0;

    // từ mảng ratings/stars (nếu có)
    const arr = Array.isArray(product?.ratings)
      ? product.ratings
      : Array.isArray(product?.stars)
      ? product.stars
      : [];
    const values = arr
      .map((r) => Number(r?.value ?? r?.rating ?? r?.star ?? r))
      .filter((x) => Number.isFinite(x));

    const count = countFromServer || values.length;
    const avg =
      Number.isFinite(avgFromServer) && avgFromServer > 0
        ? avgFromServer
        : values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;

    return { avgRating: avg, ratingCount: count };
  }, [product]);

  if (loading) return <div className="p-6">Đang tải…</div>;
  if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>;
  if (!product) return null;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* ====== THÔNG TIN CHÍNH ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gallery ≥ 3 ảnh */}
        <div>
          <div className="aspect-square w-full bg-white rounded-lg shadow overflow-hidden">
            <img
              src={images[activeIdx]}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-5 gap-2 mt-3">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`aspect-square rounded overflow-hidden border ${
                  i === activeIdx ? "border-indigo-500" : "border-transparent"
                }`}
                aria-label={`Ảnh ${i + 1}`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold">
            {product.name || product.productName || "(Không tên)"}
          </h1>

          <div className="text-gray-600">
            Thương hiệu: <b>{product.brand || "-"}</b>
          </div>

          <div className="text-2xl font-semibold text-indigo-600">
            {money(minPrice)}
          </div>

          {/* Tổng quan rating */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">
              {avgRating ? avgRating.toFixed(1) : "0.0"}/5
            </span>
            <div className="text-yellow-400">
              {"★★★★★".split("").map((_, i) => (
                <span
                  key={i}
                  className={i < Math.round(avgRating) ? "opacity-100" : "opacity-20"}
                >
                  ★
                </span>
              ))}
            </div>
            <span>({ratingCount || 0} đánh giá)</span>
          </div>

          {/* Biến thể */}
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div>
              <div className="font-semibold mb-2">Biến thể</div>
              <ul className="list-disc ml-5 space-y-1">
                {product.variants.map((v, idx) => (
                  <li key={idx}>
                    {(v.name || v.variantName || `Variant ${idx + 1}`) +
                      (v.price ? ` — ${money(v.price)}` : "")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mô tả ≥ 5 dòng (giữ chỗ nếu thiếu) */}
          <div className="prose max-w-none whitespace-pre-line leading-7">
            {String(product.description || product.productDescription || "")
              .trim()
              ? product.description || product.productDescription
              : `Mô tả đang được cập nhật…
Mô tả đang được cập nhật…
Mô tả đang được cập nhật…
Mô tả đang được cập nhật…
Mô tả đang được cập nhật…`}
          </div>
        </div>
      </div>

      {/* ====== ĐÁNH GIÁ & BÌNH LUẬN ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Đánh giá sao */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Đánh giá</h2>
          <div className="flex items-center gap-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} filled={n <= myRate} onClick={() => setMyRate(n)} />
              ))}
            </div>
            <button onClick={onRate} className="px-4 py-2 rounded bg-black text-white">
              Gửi đánh giá
            </button>
          </div>
          {rateMsg && <div className="text-sm mt-2 text-gray-600">{rateMsg}</div>}
        </div>

        {/* Bình luận */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Bình luận</h2>
          <form onSubmit={onSubmitComment} className="space-y-2 mb-4">
            <input
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              placeholder="Tên của bạn (không bắt buộc)"
              className="w-full border rounded px-3 py-2"
            />
            <textarea
              value={cText}
              onChange={(e) => setCText(e.target.value)}
              placeholder="Nội dung bình luận…"
              rows={4}
              className="w-full border rounded px-3 py-2"
              required
            />
            <button className="px-4 py-2 rounded bg-black text-white">Gửi bình luận</button>
          </form>

          <div className="space-y-3">
            {(product.comments || []).map((c, i) => (
              <div key={c._id || i} className="border-t pt-2">
                <div className="font-semibold">{c.name || "Ẩn danh"}</div>
                <div className="text-gray-700 whitespace-pre-line">
                  {c.comment ?? c.text}
                </div>
                <div className="text-xs text-gray-400">
                  {c.createdAt ? new Date(c.createdAt).toLocaleString("vi-VN") : ""}
                </div>
              </div>
            ))}
            {(!product.comments || product.comments.length === 0) && (
              <div className="text-gray-500">Chưa có bình luận.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
