export default function ProductSection({ title, products }) {
    return (
        <section className="container mx-auto py-12">
            <h2 className="text-3xl font-bold mb-8">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((p, idx) => (
                    <div
                        key={idx}
                        className="bg-white shadow-md p-4 rounded-lg hover:shadow-2xl transition"
                    >
                        <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-40 object-cover rounded-md mb-3"
                        />
                        <h3 className="font-semibold">{p.name}</h3>
                        <div className="flex items-center mt-1 mb-2">
                            {Array(5)
                                .fill(0)
                                .map((_, i) => (
                                    <span
                                        key={i}
                                        className={i < p.rating ? "text-yellow-400" : "text-gray-300"}
                                    >
                                        ★
                                    </span>
                                ))}
                        </div>
                        <p className="text-blue-600 font-bold">${p.price}</p>
                        <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
