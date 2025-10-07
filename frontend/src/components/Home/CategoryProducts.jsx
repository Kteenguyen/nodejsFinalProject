// src/components/CategoryProducts.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const CategoryProducts = ({ categoryId, title }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/api/products/category/${categoryId}`);
                setProducts(res.data.products || []);
            } catch (err) {
                console.error(`Lỗi fetch sản phẩm danh mục ${categoryId}:`, err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryProducts();
    }, [categoryId]);

    if (loading) return <p>Loading {title}...</p>;
    if (!products.length) return null;

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default CategoryProducts;
