// src/components/BestSellers.jsx
import React, { useEffect, useState } from 'react';
// import axios from 'axios'; // 👈 BỎ DÒNG NÀY
import { ProductController } from '../../controllers/productController'; 
import ProductCard from './ProductCard';

const BestSellers = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                // 👇 SỬA LẠI LOGIC GỌI API
                const products = await ProductController.getBestSellers();
                setBestSellers(products);
            } catch (error) {
                console.error("Lỗi fetch Best Sellers (Component):", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBestSellers();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">Bán chạy nhất</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {bestSellers.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default BestSellers;