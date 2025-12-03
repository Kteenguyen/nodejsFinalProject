import { Link } from "react-router-dom";
import { currency } from "../../utils/format";
import { getStockStatus, StockStatusBadge, STOCK_STATUS } from '../../utils/stockStatus';
import { ProductController } from '../../controllers/productController';

export default function ProductCard({ p, product, viewMode = "grid" }) {
  // Support both 'p' and 'product' prop names
  const productData = p || product;

  // Safety check - render nothing if product is undefined/null
  if (!productData || typeof productData !== 'object') {
    return null;
  }

  const name = productData.name || productData.productName || "(Không tên)";
  const price = productData.lowestPrice ?? productData.minPrice ?? productData.price ?? 0;
  
  // Get original price (oldPrice) and discount from variants
  let oldPrice = 0;
  let discountPercent = 0;
  
  if (Array.isArray(productData.variants) && productData.variants.length > 0) {
    const firstVariant = productData.variants[0];
    oldPrice = firstVariant.oldPrice || 0;
    discountPercent = firstVariant.discount || 0;
    
    // If oldPrice not set, calculate from price and discount
    if (!oldPrice && discountPercent > 0) {
      oldPrice = Math.round(price / (1 - discountPercent / 100));
    }
    
    console.log('🏷️ Product price info:', { 
      name: productData.productName, 
      price, 
      oldPrice, 
      discountPercent,
      firstVariant
    });
  }
  
  // Get proper image URL using helper
  const rawImg = (Array.isArray(productData.images) && productData.images[0]) || null;
  const img = rawImg ? ProductController.getImageUrl(rawImg) : "/img/default.png";
  
  const detailId = productData.productId || productData._id || "";
  
  // Safety check - don't render if no valid id
  if (!detailId) {
    return null;
  }
  
  // Calculate stock status
  const totalStock = (() => {
    if (typeof productData.totalStock === "number") return productData.totalStock;
    if (Array.isArray(productData.variants) && productData.variants.length > 0) {
      return productData.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }
    if (productData.stock != null) return Number(productData.stock) || 0;
    return 0;
  })();
  
  const stockStatus = getStockStatus(totalStock);
  const isOutOfStock = stockStatus === STOCK_STATUS.OUT_OF_STOCK || stockStatus === STOCK_STATUS.DISCONTINUED;

  // Display first few specifications as labels
  const specs = Array.isArray(productData.specifications) ? productData.specifications.slice(0, 2) : [];
  
  // Calculate savings
  const savings = oldPrice > price ? oldPrice - price : 0;
  const savingsPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  
  return (
    <Link 
      to={`/products/${detailId}`} 
      className={`group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${isOutOfStock ? 'opacity-75' : ''}`}
    >
      <div className="relative overflow-hidden bg-gray-50">
        <img 
          src={img} 
          alt={name} 
          className={`w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300 ${isOutOfStock ? 'grayscale' : ''}`} 
          onError={(e) => {
            console.log('❌ Product image failed to load:', img);
            e.target.src = '/img/default.png';
          }}
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded font-bold text-sm">
            -{discountPercent}%
          </div>
        )}
        
        {/* Savings Badge */}
        {savings > 0 && (
          <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Tiết kiệm: {currency(savings)}
          </div>
        )}
        
        {/* Stock Status Badge */}
        {stockStatus !== STOCK_STATUS.IN_STOCK && (
          <div className="absolute top-2 right-2">
            <StockStatusBadge status={stockStatus} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        
        {/* Config Description - small text */}
        {specs.length > 0 && (
          <div className="mb-2 text-xs text-gray-600 line-clamp-1">
            {specs.map(spec => `${spec.label}: ${spec.value}`).join(' • ')}
          </div>
        )}
        
        {/* Specifications Labels */}
        {specs.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {specs.map((spec, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                <strong>{spec.label}:</strong> {spec.value}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${isOutOfStock ? 'text-gray-500' : 'text-blue-600'}`}>
                {currency(price)}
              </span>
              {oldPrice > price && (
                <span className="text-sm text-gray-400 line-through">
                  {currency(oldPrice)}
                </span>
              )}
            </div>
          </div>
          <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
            Xem chi tiết →
          </span>
        </div>
      </div>
    </Link>
  );
}
