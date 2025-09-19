import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroCarousel from "./components/HeroCarousel";
import ProductSection from "./components/ProductSection";

// Dữ liệu mẫu
const laptops = [
    { name: "Laptop Pro", price: 1200, image: "https://via.placeholder.com/300x200", rating: 5 },
    { name: "Laptop Air", price: 900, image: "https://via.placeholder.com/300x200", rating: 4 },
    { name: "Laptop Gamer", price: 1500, image: "https://via.placeholder.com/300x200", rating: 5 },
    { name: "Laptop Mini", price: 800, image: "https://via.placeholder.com/300x200", rating: 4 },
];

const monitors = [
    { name: "Monitor HD", price: 300, image: "https://via.placeholder.com/300x200", rating: 4 },
    { name: "Monitor 4K", price: 500, image: "https://via.placeholder.com/300x200", rating: 5 },
    { name: "Curved Monitor", price: 400, image: "https://via.placeholder.com/300x200", rating: 4 },
    { name: "Gaming Monitor", price: 350, image: "https://via.placeholder.com/300x200", rating: 5 },
];

const accessories = [
    { name: "Gaming Mouse", price: 50, image: "https://via.placeholder.com/300x200", rating: 4 },
    { name: "Keyboard RGB", price: 80, image: "https://via.placeholder.com/300x200", rating: 5 },
    { name: "Headphones", price: 150, image: "https://via.placeholder.com/300x200", rating: 4 },
    { name: "Webcam HD", price: 90, image: "https://via.placeholder.com/300x200", rating: 3 },
];

const gadgets = [
    { name: "Smartphone", price: 700, image: "https://via.placeholder.com/300x200", rating: 5 },
    { name: "Tablet", price: 500, image: "https://via.placeholder.com/300x200", rating: 4 },
    { name: "Smartwatch", price: 250, image: "https://via.placeholder.com/300x200", rating: 4 },
    { name: "Drone", price: 1200, image: "https://via.placeholder.com/300x200", rating: 5 },
];

export default function App() {
    return (
        <div className="mt-[96px]">
            <Header />
            <main className="mt-20">
                <HeroCarousel />
                <ProductSection title="Best Sellers" products={[...laptops.slice(0,2), ...monitors.slice(0,2)]} />
                <ProductSection title="Laptops" products={laptops} />
                <ProductSection title="Monitors" products={monitors} />
                <ProductSection title="Accessories" products={accessories} />
                <ProductSection title="Gadgets" products={gadgets} />
            </main>
            <Footer />
        </div>
    );
}
