import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [homeData, setHomeData] = useState({
        newProducts: [],
        bestSellers: [],
        categories: {},
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeProducts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/products/home');
                setHomeData(res.data.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchHomeProducts();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="container mx-auto p-4 space-y-8">
            {/* Sản phẩm mới */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Sản phẩm mới</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {homeData.newProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </section>

            {/* Bán chạy nhất */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Bán chạy nhất</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {homeData.bestSellers.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </section>

            {/* Danh mục khác */}
            {Object.entries(homeData.categories).map(([categoryId, products]) => (
                <section key={categoryId}>
                    <h2 className="text-2xl font-bold mb-4">
                        {categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default Home;
