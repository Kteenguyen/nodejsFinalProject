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
      className={`group bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100/80 ${isOutOfStock ? 'opacity-75' : ''}`}
    >
      <div className="relative overflow-hidden bg-gray-50/50">
        <img 
          src={img} 
          alt={name} 
          className={`w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'grayscale' : ''}`} 
          onError={(e) => {
            console.log('❌ Product image failed to load:', img);
            e.target.src = '/img/default.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg font-bold text-xs shadow-sm">
            -{discountPercent}%
          </div>
        )}
        
        {/* Savings Badge */}
        {savings > 0 && (
          <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
            Tiết kiệm: {currency(savings)}
          </div>
        )}
        
        {/* Stock Status Badge */}
        {stockStatus !== STOCK_STATUS.IN_STOCK && (
          <div className="absolute top-3 right-3 shadow-sm">
            <StockStatusBadge status={stockStatus} />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-2 min-h-[40px] group-hover:text-indigo-600 transition-colors duration-200">
          {name}
        </h3>
        
        {/* Specifications Labels */}
        {specs.length > 0 ? (
          <div className="flex flex-wrap gap-1 min-h-[24px]">
            {specs.map((spec, idx) => (
              <span key={idx} className="text-[10px] bg-indigo-50/60 text-indigo-600 border border-indigo-100/40 px-2 py-0.5 rounded-md font-semibold">
                {spec.value}
              </span>
            ))}
          </div>
        ) : (
          <div className="min-h-[24px]"></div>
        )}

        <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            {oldPrice > price && (
              <span className="text-[11px] text-gray-400 line-through">
                {currency(oldPrice)}
              </span>
            )}
            <span className={`text-base font-extrabold ${isOutOfStock ? 'text-gray-500' : 'text-indigo-600'}`}>
              {currency(price)}
            </span>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white px-2.5 py-1.5 rounded-lg transition-all duration-300">
            Xem chi tiết
          </span>
        </div>
      </div>
    </Link>
  );
}
