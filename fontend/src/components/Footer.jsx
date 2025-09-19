export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-8 mt-12">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <p>&copy; 2025 MyShop. All rights reserved.</p>
                <div className="flex space-x-4 mt-4 md:mt-0">
                    <a href="#" className="hover:text-blue-400">Facebook</a>
                    <a href="#" className="hover:text-blue-400">Instagram</a>
                    <a href="#" className="hover:text-blue-400">Twitter</a>
                </div>
            </div>
        </footer>
    );
}
