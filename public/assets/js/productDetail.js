// public/assets/js/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [review, setReview] = useState({ content: '', rating: 5 });
    const [reviews, setReviews] = useState([]); // State to store existing reviews

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/products/${productId}`);
                setProduct(response.data);
                // Giả định API trả về thêm trường comments hoặc có endpoint riêng để lấy reviews
                // Ví dụ: const commentsResponse = await axios.get(`/api/products/${response.data._id}/reviews`);
                // setReviews(commentsResponse.data.comments);
            } catch (err) {
                setError('Không thể tải chi tiết sản phẩm. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        // Giả định bạn đã có accountId từ context hoặc state quản lý người dùng
        const accountId = 'user_123'; 
        
        try {
            await axios.post(`/api/products/${productId}/reviews`, {
                accountId,
                content: review.content,
                rating: review.rating,
            });
            alert('Đánh giá của bạn đã được gửi thành công!');
            // Reset form và có thể cập nhật danh sách đánh giá
            setReview({ content: '', rating: 5 });
        } catch (err) {
            alert('Gửi đánh giá thất bại. Vui lòng thử lại.');
        }
    };

    if (loading) return <div className={styles.loading}>Đang tải chi tiết sản phẩm...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!product) return <div>Không tìm thấy sản phẩm.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.productDetails}>
                <div className={styles.imageGallery}>
                    <img src={product.images[0]} alt={product.productName} className={styles.mainImage} />
                    {/* Thêm các ảnh phụ nếu có */}
                </div>
                <div className={styles.info}>
                    <h1 className={styles.name}>{product.productName}</h1>
                    <p className={styles.price}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</p>
                    <div className={styles.description}>
                        <h2>Mô tả sản phẩm</h2>
                        <p>{product.productDescription}</p>
                    </div>
                    <button className={styles.addToCartButton}>Thêm vào giỏ hàng</button>
                </div>
            </div>
            
            <div className={styles.reviewsSection}>
                <h2>Đánh giá và bình luận</h2>
                {/* Form gửi đánh giá */}
                <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                    <h3>Viết đánh giá của bạn</h3>
                    <textarea
                        value={review.content}
                        onChange={(e) => setReview({ ...review, content: e.target.value })}
                        placeholder="Nội dung đánh giá của bạn..."
                        required
                    />
                    <div className={styles.rating}>
                        <label>Đánh giá:</label>
                        <select
                            value={review.rating}
                            onChange={(e) => setReview({ ...review, rating: parseInt(e.target.value) })}
                        >
                            <option value="5">⭐⭐⭐⭐⭐</option>
                            <option value="4">⭐⭐⭐⭐</option>
                            <option value="3">⭐⭐⭐</option>
                            <option value="2">⭐⭐</option>
                            <option value="1">⭐</option>
                        </select>
                    </div>
                    <button type="submit">Gửi đánh giá</button>
                </form>

                {/* Danh sách đánh giá đã có */}
                {reviews.length > 0 ? (
                    <div className={styles.reviewsList}>
                        {reviews.map((rev, index) => (
                            <div key={index} className={styles.reviewItem}>
                                <div className={styles.reviewHeader}>
                                    <strong>Người dùng: {rev.accountId}</strong>
                                    <span>Đánh giá: {rev.rating} sao</span>
                                </div>
                                <p>{rev.content}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.noReviews}>Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
