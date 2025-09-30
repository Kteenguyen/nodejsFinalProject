import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/index.css';
import NewProducts from '../components/NewProducts';
import BestSellers from '../components/BestSellers';
import CategoryProducts from '../components/CategoryProducts';



const Home = () => {
    return (
        <div className="container mx-auto p-4 space-y-8">
            <NewProducts />
            <BestSellers />
            <CategoryProducts categoryId="laptop" title="Laptop" />
            <CategoryProducts categoryId="monitor" title="Màn hình" />
            <CategoryProducts categoryId="ssd" title="Ổ cứng SSD" />
        </div>
    );
};

export default Home;
