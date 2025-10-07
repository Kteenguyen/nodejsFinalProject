//src/components/ProductCard.jsx

const ProductCard = ({ product }) => {
    return (
        <div className="border rounded-lg p-4 shadow hover:shadow-lg">
            <img
                src={product.image ? product.image : 'public/images/placeholder.png'}
                alt={product.name}
                className="w-full h-40 object-cover rounded"
            />

            <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-red-500 font-bold">{product.price} ₫</p>
        </div>
    );
};

export default ProductCard;
