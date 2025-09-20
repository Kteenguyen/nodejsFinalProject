const ProductCard = ({ product }) => {
    return (
        <div className="border rounded p-2 shadow hover:shadow-lg transition">
            <img src={product.image} alt={product.productName} className="w-full h-40 object-cover mb-2" />
            <h3 className="font-semibold">{product.productName}</h3>
            <p className="text-red-500 font-bold">${product.price}</p>
        </div>
    );
};

export default ProductCard;
