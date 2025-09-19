export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-200 py-10 mt-12">
            <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
                <div>
                    <h4 className="font-bold text-xl mb-2">MyShop</h4>
                    <p>Quality products delivered to your door.</p>
                </div>
                <div>
                    <h4 className="font-bold mb-2">Links</h4>
                    <ul className="space-y-1">
                        <li><a href="#" className="hover:text-blue-400">Home</a></li>
                        <li><a href="#" className="hover:text-blue-400">Products</a></li>
                        <li><a href="#" className="hover:text-blue-400">About</a></li>
                        <li><a href="#" className="hover:text-blue-400">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-2">Contact</h4>
                    <p>Email: support@myshop.com</p>
                    <p>Phone: +123 456 789</p>
                </div>
            </div>
            <div className="text-center text-gray-500 mt-6">
                © 2025 MyShop. All rights reserved.
            </div>
        </footer>
    );
}
