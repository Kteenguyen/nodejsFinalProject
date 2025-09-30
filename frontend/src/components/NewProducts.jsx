// src/components/NewProducts.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const NewProducts = () => {
    const [newProducts, setNewProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewProducts = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/products/collections/new');
                setNewProducts(res.data.products || []); // Backend trả { success: true, products: [...] }
            } catch (error) {
                console.error("Lỗi fetch sản phẩm mới:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNewProducts();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">Sản phẩm mới</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {newProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default NewProducts;
