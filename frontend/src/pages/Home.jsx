// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductController } from '../controllers/productController';
import ProductCard from '../components/Home/ProductCard';
import {
    ArrowRight, Zap, TrendingUp, Monitor, HardDrive, Laptop,
    Smartphone, Speaker, Gamepad2, Keyboard, ChevronRight,
    Truck, ShieldCheck, Headphones, Mail, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

// Loading Skeleton
const ProductSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm animate-pulse h-[300px] w-full"></div>
);

// Danh mục nhanh
const QUICK_CATEGORIES = [
    { name: 'Laptop', icon: <Laptop size={24} />, id: 'laptop' },
    { name: 'Điện thoại', icon: <Smartphone size={24} />, id: 'phone' },
    { name: 'Màn hình', icon: <Monitor size={24} />, id: 'monitor' },
    { name: 'Ổ cứng', icon: <HardDrive size={24} />, id: 'ssd' },
    { name: 'Âm thanh', icon: <Speaker size={24} />, id: 'audio' },
    { name: 'Gaming', icon: <Gamepad2 size={24} />, id: 'gaming' },
    { name: 'Phụ kiện', icon: <Keyboard size={24} />, id: 'accessory' },
];

export default function Home() {
    const [newProducts, setNewProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [dynamicCategories, setDynamicCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // State cho Form đăng ký khuyến mãi
    const [email, setEmail] = useState("");
    const [isSubscribing, setIsSubscribing] = useState(false);

    // CONFIG ID Danh mục (Thay bằng ID thật của bạn)
    const CATEGORY_IDS = {
        LAPTOP: "laptop",
        MONITOR: "monitor",
        DRIVE: "ssd"
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { CategoryController } = await import('../controllers/categoryController');
                const [resNew, resBest, categoriesList] = await Promise.all([
                    ProductController.getNewProducts(),
                    ProductController.getBestSellers(),
                    CategoryController.getAll()
                ]);

                setNewProducts(resNew || []);
                setBestSellers(resBest || []);

                if (categoriesList?.length > 0) {
                    const prioritizedCats = categoriesList.filter(c =>
                        [CATEGORY_IDS.LAPTOP, CATEGORY_IDS.MONITOR, CATEGORY_IDS.DRIVE].includes(c.categoryId)
                    );

                    const categoryRequests = prioritizedCats.map(async (cat) => {
                        const res = await ProductController.getProductsByCategory(cat.categoryId, { limit: 8 });
                        return { id: cat.categoryId, name: cat.categoryName, products: res.products || [] };
                    });

                    const results = await Promise.all(categoryRequests);
                    setDynamicCategories(results.filter(cat => cat.products.length > 0));
                }
            } catch (error) {
                console.error("Lỗi tải trang chủ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- XỬ LÝ ĐĂNG KÝ EMAIL ---
    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email) {
            toast.warning("Vui lòng nhập địa chỉ email!");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Email không hợp lệ!");
            return;
        }

        setIsSubscribing(true);
        // Giả lập gọi API
        setTimeout(() => {
            toast.success("Đăng ký nhận tin thành công! Mã giảm giá đã được gửi.");
            setEmail("");
            setIsSubscribing(false);
        }, 1500);
    };

    // --- COMPONENT KHỐI SẢN PHẨM ---
    const SectionBlock = ({ title, icon, products, linkTo, bannerImg }) => (
        <section className="mb-8">
            <div className="container mx-auto px-4">

                {/* Banner Quảng Cáo (Đã fix lỗi ảnh) */}
                {bannerImg && (
                    <div className="mb-8 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        <img
                            src={bannerImg}
                            alt="Quảng cáo khuyến mãi"
                            className="w-full h-32 md:h-48 object-cover transform group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/1200x300?text=Banner+Quang+Cao'; // Fallback nếu ảnh lỗi
                            }}
                        />
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-3">
                            <span className="text-blue-600 p-2 bg-blue-50 rounded-lg">{icon}</span>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 uppercase tracking-tight">{title}</h2>
                        </div>
                        <Link to={linkTo} className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-all">
                            Xem tất cả <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="p-4 md:p-6 bg-white">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {loading
                                ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
                                : products.slice(0, 8).map((product) => (
                                    <div key={product._id || product.productId} className="h-full">
                                        <ProductCard product={product} viewMode="grid" />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );

    return (
        <div className="bg-[#f4f6f8] min-h-screen font-sans pb-0">

            {/* 1. HERO SECTION */}
            <div className="bg-white pb-8 pt-4 mb-6 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:h-[400px]">
                        <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-md relative group cursor-pointer">
                            <img
                                src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=2068&auto=format&fit=crop"
                                alt="Main Banner"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-8">
                                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded w-fit mb-3">HOT DEAL THÁNG 11</span>
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">MacBook Pro M3</h2>
                                <p className="text-gray-200 mb-6 text-lg">Sức mạnh quái vật - Hiệu năng đỉnh cao.</p>
                                <Link to="/products" className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold w-fit hover:bg-blue-600 hover:text-white transition-all shadow-lg">Mua ngay</Link>
                            </div>
                        </div>

                        <div className="hidden lg:flex flex-col gap-4 h-full">

                            {/* Banner Phụ 1: Link tới Gaming */}
                            <Link to="/products?categoryId=gaming" className="flex-1 rounded-2xl overflow-hidden shadow-md relative group cursor-pointer block">
                                <img src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1932&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Sub 1" />
                                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white font-bold text-lg">Phụ kiện Gaming</p>
                                    <p className="text-gray-300 text-sm">Giảm đến 50%</p>
                                </div>
                            </Link>

                            {/* Banner Phụ 2: Link tới Màn hình */}
                            <Link to="/products?categoryId=monitor" className="flex-1 rounded-2xl overflow-hidden shadow-md relative group cursor-pointer block">
                                <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Sub 2" />
                                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white font-bold text-lg">Màn hình 4K</p>
                                    <p className="text-gray-300 text-sm">Sắc nét từng chi tiết</p>
                                </div>
                            </Link>

                        </div>
                    </div>

                    {/* QUICK CATEGORIES */}
                    <div className="mt-10 flex flex-wrap justify-center md:justify-between gap-6 px-2">
                        {QUICK_CATEGORIES.map((cat, idx) => (
                            <Link to={`/products?categoryId=${cat.id}`} key={idx} className="flex flex-col items-center gap-3 group cursor-pointer min-w-[80px]">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 border border-gray-200">
                                    {cat.icon}
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. CHÍNH SÁCH (ICONS) */}
            <div className="container mx-auto px-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: <Truck size={28} />, title: "Miễn phí vận chuyển", desc: "Đơn hàng > 5 triệu" },
                        { icon: <ShieldCheck size={28} />, title: "Bảo hành chính hãng", desc: "Cam kết 100% chất lượng" },
                        { icon: <Headphones size={28} />, title: "Hỗ trợ 24/7", desc: "Tư vấn kỹ thuật online" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-default">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">{item.icon}</div>
                            <div><h3 className="font-bold text-gray-800">{item.title}</h3><p className="text-sm text-gray-500">{item.desc}</p></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. KHỐI SẢN PHẨM MỚI (Kèm Banner Quảng Cáo đã sửa link) */}
            <SectionBlock
                title="Sản phẩm mới về"
                icon={<Zap size={24} />}
                products={newProducts}
                linkTo="/products?sort=newest"
                // Link ảnh Unsplash ổn định
                bannerImg="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"
            />

            {/* 4. KHỐI BÁN CHẠY */}
            <SectionBlock
                title="Top Bán Chạy"
                icon={<TrendingUp size={24} />}
                products={bestSellers}
                linkTo="/products?bestSeller=true"
            />

            {/* 5. CÁC DANH MỤC KHÁC */}
            {dynamicCategories.map((cat, index) => (
                <SectionBlock
                    key={cat.id}
                    title={cat.name}
                    icon={<Monitor size={24} />}
                    products={cat.products}
                    linkTo={`/products?categoryId=${cat.id}`}
                    // Banner xen kẽ: Chỉ hiện ở danh mục đầu tiên
                    bannerImg={index === 0 ? "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop" : null}
                />
            ))}

            {/* 6. NEWSLETTER & FOOTER PROMOTION (Đã phục hồi chức năng) */}
            <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16 mt-12 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-full mb-6 backdrop-blur-md border border-white/20 shadow-lg">
                        <Mail size={32} className="text-blue-300" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Đăng ký nhận tin khuyến mãi</h2>
                    <p className="text-gray-300 mb-8 max-w-xl mx-auto text-lg">
                        Nhận ngay voucher giảm giá <span className="text-yellow-400 font-bold">10%</span> cho đơn hàng đầu tiên khi đăng ký bản tin.
                    </p>

                    {/* Form Đăng ký */}
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row justify-center max-w-lg mx-auto gap-3">
                        <input
                            type="email"
                            placeholder="Nhập địa chỉ email của bạn..."
                            className="w-full px-6 py-4 rounded-xl text-gray-900 outline-none focus:ring-4 focus:ring-blue-500/50 transition-all shadow-lg"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubscribing}
                        />
                        <button
                            type="submit"
                            disabled={isSubscribing}
                            className={`
                        bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 whitespace-nowrap
                        ${isSubscribing ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-1'}
                    `}
                        >
                            {isSubscribing ? 'Đang gửi...' : (
                                <>
                                    Đăng ký ngay <CheckCircle size={20} />
                                </>
                            )}
                        </button>
                    </form>
                    <p className="text-gray-400 text-xs mt-6 opacity-70">
                        Chúng tôi cam kết bảo mật thông tin cá nhân của bạn. Không spam.
                    </p>
                </div>
            </div>

        </div>
    );
}