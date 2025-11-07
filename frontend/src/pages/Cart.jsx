// src/pages/Cart.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CartPage(){
  const [details, setDetails] = useState([]);

  useEffect(()=>{
    const raw = JSON.parse(localStorage.getItem('cart') || '[]');
    axios.post('http://localhost:3001/api/products/batch', { lines: raw })
      .then(res => setDetails(res.data || []))
      .catch(() => setDetails([]));
  }, []);

  if (!details.length) return <p>Giỏ hàng trống.</p>;
  const subtotal = details.reduce((s, d) => s + d.price * d.qty, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Giỏ hàng</h1>
      <ul className="space-y-3">
        {details.map(it => (
          <li key={`${it.productId}-${it.variantId}`} className="flex gap-3 items-center border p-3 rounded">
            <img src={/^https?:\/\//.test(it.image)?it.image:`http://localhost:3001${it.image}`} alt={it.name} className="w-16 h-16 object-cover rounded"/>
            <div className="flex-1">
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-gray-500">{it.attrs?.name}</div>
              <div>SL: {it.qty}</div>
            </div>
            <div className="font-semibold">{it.price.toLocaleString()} ₫</div>
          </li>
        ))}
      </ul>
      <hr className="my-4"/>
      <div className="text-right text-xl font-bold">Tạm tính: {subtotal.toLocaleString()} ₫</div>
    </div>
  );
}
