//src/components/ProductCard.jsx

const ProductCard = ({ product }) => {
    const imageUrl = product.images?.[0] || '/images/placeholder.png';
    const price = product.variants?.[0]?.price || 0;

    return (
        <div className="border rounded-lg p-4 shadow hover:shadow-lg">
            <img
                src={imageUrl}
                alt={product.productName}
                className="w-full h-40 object-cover rounded"
            />

            <h3 className="text-lg font-semibold mt-2">
                {product.productName}
            </h3>

            <p className="text-red-500 font-bold">
                {price.toLocaleString()} ₫
            </p>
        </div>
    );
};

export default ProductCard;
