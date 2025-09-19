// public/assets/js/ProductCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    return (
        <Link to={`/products/${product.productId}`} className={styles.card}>
            <img src={product.images[0]} alt={product.productName} className={styles.image} />
            <h3 className={styles.name}>{product.productName}</h3>
            <p className={styles.price}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</p>
        </Link>
    );
};

export default ProductCard;
