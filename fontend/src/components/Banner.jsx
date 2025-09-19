export default function Banner() {
    return (
        <section className="bg-blue-600 text-white h-96 flex flex-col justify-center items-center text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to MyShop</h1>
            <p className="text-lg md:text-2xl mb-6">Discover the best products for your needs</p>
            <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition">
                Shop Now
            </button>
        </section>
    );
}
