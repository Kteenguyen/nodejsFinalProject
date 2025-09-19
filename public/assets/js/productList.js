// public/assets/js/ProductList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import styles from './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const fetchProducts = async (params) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/products', { params });
            setProducts(response.data.products);
            setPagination({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages,
                totalProducts: response.data.totalProducts,
            });
        } catch (err) {
            setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const queryParams = Object.fromEntries([...searchParams]);
        fetchProducts(queryParams);
    }, [searchParams]);

    const handleFilterChange = (key, value) => {
        setSearchParams(prev => {
            if (value) {
                prev.set(key, value);
            } else {
                prev.delete(key);
            }
            prev.set('page', 1); // Reset to page 1 on filter change
            return prev;
        }, { replace: true });
    };

    const handleSortChange = (e) => {
        const [sortBy, sortOrder] = e.target.value.split('-');
        setSearchParams(prev => {
            prev.set('sortBy', sortBy);
            prev.set('sortOrder', sortOrder);
            return prev;
        });
    };

    const handlePagination = (page) => {
        setSearchParams(prev => {
            prev.set('page', page);
            return prev;
        });
    };

    const renderPagination = () => {
        const { currentPage, totalPages } = pagination;
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePagination(i)}
                    className={currentPage === i ? styles.activePage : ''}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className={styles.pagination}>
                {pages}
            </div>
        );
    };

    if (loading) return <div className={styles.loading}>Đang tải sản phẩm...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <h2>Lọc sản phẩm</h2>
                <div className={styles.filterGroup}>
                    <h3>Thương hiệu</h3>
                    <select onChange={(e) => handleFilterChange('brand', e.target.value)}>
                        <option value="">Tất cả</option>
                        <option value="Apple">Apple</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Xiaomi">Xiaomi</option>
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <h3>Giá</h3>
                    <input
                        type="number"
                        placeholder="Giá thấp nhất"
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Giá cao nhất"
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                </div>
            </aside>
            <main className={styles.mainContent}>
                <div className={styles.controls}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleFilterChange('keyword', e.target.value);
                            }
                        }}
                    />
                    <select onChange={handleSortChange}>
                        <option value="">Sắp xếp</option>
                        <option value="price-asc">Giá: Thấp đến cao</option>
                        <option value="price-desc">Giá: Cao đến thấp</option>
                        <option value="name-asc">Tên: A-Z</option>
                        <option value="name-desc">Tên: Z-A</option>
                    </select>
                </div>
                <div className={styles.productList}>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard key={product.productId} product={product} />
                        ))
                    ) : (
                        <p>Không tìm thấy sản phẩm nào.</p>
                    )}
                </div>
                {pagination.totalPages > 1 && renderPagination()}
            </main>
        </div>
    );
};

export default ProductList;
