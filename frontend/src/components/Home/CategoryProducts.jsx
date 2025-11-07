// src/components/CategoryProducts.jsx
import React, { useEffect, useState } from 'react';
import { ProductController } from '../../controllers/productController'; 
import ProductCard from './ProductCard';

const CategoryProducts = ({ categoryId, title }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                const products = await ProductController.getProductsByCategory(categoryId);
                setProducts(products);
            } catch (err) {
                console.error(`Lỗi fetch sản phẩm danh mục ${categoryId} (Component):`, err.message);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchCategoryProducts();
        }
    }, [categoryId]); // Giữ categoryId làm dependency

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