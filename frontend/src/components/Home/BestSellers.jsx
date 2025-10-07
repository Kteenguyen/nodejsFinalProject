// src/components/BestSellers.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const BestSellers = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/products/collections/bestsellers');
                setBestSellers(res.data.products || []);
            } catch (error) {
                console.error("Lỗi fetch Best Sellers:", error);
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
