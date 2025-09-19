import { useState } from "react";
import { HiShoppingCart, HiMenu, HiX } from "react-icons/hi";

export default function Header() {
    const [mobileMenu, setMobileMenu] = useState(false);

    return (
        <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                <div className="text-2xl font-bold text-blue-600">MyShop</div>

                <nav className="hidden md:flex space-x-6 font-semibold text-gray-700">
                    <a href="#">Home</a>
                    <a href="#">Laptops</a>
                    <a href="#">Monitors</a>
                    <a href="#">Accessories</a>
                    <a href="#">Gadgets</a>
                </nav>

                <div className="flex items-center space-x-4">
                    <HiShoppingCart className="text-2xl cursor-pointer text-blue-600" />
                    <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
                        {mobileMenu ? <HiX className="text-3xl" /> : <HiMenu className="text-3xl" />}
                    </button>
                </div>
            </div>

            {mobileMenu && (
                <nav className="md:hidden bg-white shadow-md px-6 py-4 flex flex-col space-y-3">
                    <a href="#">Home</a>
                    <a href="#">Laptops</a>
                    <a href="#">Monitors</a>
                    <a href="#">Accessories</a>
                    <a href="#">Gadgets</a>
                </nav>
            )}
        </header>

    );
}
