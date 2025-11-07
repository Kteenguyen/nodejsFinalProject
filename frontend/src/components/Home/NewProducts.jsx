// src/components/NewProducts.jsx
import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // 👈 BỎ DÒNG NÀY
import { ProductController } from '../../controllers/productController'
import ProductCard from './ProductCard';

const NewProducts = () => {
    const [newProducts, setNewProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchNewProducts = async () => {
            try {
                // 👇 SỬA LẠI LOGIC GỌI API
                const products = await ProductController.getNewProducts();
                setNewProducts(products);
            } catch (error) {
                // Lỗi đã được log trong controller
                console.error("Lỗi fetch sản phẩm mới (Component):", error.message);
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