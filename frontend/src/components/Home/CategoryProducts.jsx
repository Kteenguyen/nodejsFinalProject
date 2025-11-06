// src/components/CategoryProducts.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const API_BASE = 'http://localhost:3001';

const CategoryProducts = ({ categoryId, title }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // --- NEW: state cho #16 (Ordering) + phân trang nhẹ ---
  const [sortBy, setSortBy]       = useState('newest'); // name | price | newest | oldest
  const [sortOrder, setSortOrder] = useState('desc');   // asc | desc
  const [page, setPage]           = useState(1);
  const [limit]                   = useState(8);        // hiển thị 8 sp/khối
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const fetchCategoryProducts = async () => {
      setLoading(true); setError('');
      try {
        // Dùng endpoint chung /api/products để có sort/filter/pagination chuẩn
        const res = await axios.get(`${API_BASE}/api/products`, {
          params: { categoryId, sortBy, sortOrder, page, limit }
        });

        if (cancelled) return;
        setProducts(res.data?.products || []);
        setTotalPages(Math.max(res.data?.totalPages || 1, 1)); // luôn ≥ 1
      } catch (err) {
        if (cancelled) return;
        console.error(`Lỗi fetch sản phẩm danh mục ${categoryId}:`, err);
        setError('Không tải được sản phẩm. Vui lòng thử lại sau.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCategoryProducts();
    return () => { cancelled = true; };
  }, [categoryId, sortBy, sortOrder, page, limit]);

  if (loading) return <p>Loading {title}...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!products.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold">{title}</h2>

        {/* --- NEW: thanh sắp xếp (#16) --- */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sắp xếp:</label>
          <select
            className="border rounded p-1"
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [by, ord] = e.target.value.split(':');
              setSortBy(by); setSortOrder(ord); setPage(1);
            }}
          >
            <option value="newest:desc">Mới nhất</option>
            <option value="oldest:asc">Cũ nhất</option>
            <option value="name:asc">Tên A–Z</option>
            <option value="name:desc">Tên Z–A</option>
            <option value="price:asc">Giá tăng dần</option>
            <option value="price:desc">Giá giảm dần</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id || product.productId} product={product} />
        ))}
      </div>

      {/* --- NEW: phân trang gọn (#10-compatible, luôn hiển thị số trang) --- */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 border rounded ${p === page ? 'bg-black text-white' : ''}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default CategoryProducts;
