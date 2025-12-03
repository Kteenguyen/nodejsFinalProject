import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
// Đã xóa: import VariantLinkInput from "../components/VariantLinkInput";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from '../services/api';
import Calendar from '../components/common/Calendar';
import { Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';

// Hàm helper: Chuyển chuỗi định dạng tiền tệ (ví dụ: "1.000.000") về số nguyên (1000000)
const parsePrice = (formattedValue) => {
  if (formattedValue === undefined || formattedValue === null || formattedValue === "") return 0;
  // Loại bỏ tất cả dấu chấm (.), dấu phẩy (,) và chuyển về số
  return Number(String(formattedValue).replace(/\./g, "").replace(/,/g, "")) || 0;
};

// Hàm helper: Định dạng số nguyên thành chuỗi tiền tệ VNĐ (ví dụ: 1000000 -> "1.000.000")
const formatPrice = (value) => {
  if (!value && value !== 0) return "";
  const num = String(value).replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("vi-VN");
};

// Hàm helper: Khởi tạo biến thể rỗng
const emptyVariant = () => ({
  variantId: "",
  name: "",
  oldPrice: 0,
  discount: 0,
  price: 0,
  stock: 0,
  images: [], // Khởi tạo mảng ảnh rỗng
  imagePreviews: [],
});

// Hàm helper: Fuzzy Search đơn giản cho danh mục
const fuzzySearch = (query, list) => {
  if (!query) return list;
  const lowerQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return list.filter(item => {
    const name = (item.name || item.categoryName || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return name.includes(lowerQuery);
  });
};

// Component lồng: Xử lý input URL ảnh cho biến thể (thay thế VariantLinkInput.jsx)
const VariantLinkInputHook = ({ variantIndex, product, setProduct }) => {
  const [showInput, setShowInput] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleAddLink = () => {
    if (newImageUrl.trim()) {
      setProduct(prev => {
        const variants = [...prev.variants];
        const variant = variants[variantIndex];
        // Thêm URL mới vào mảng images của biến thể
        variant.images = [...(variant.images || []), newImageUrl.trim()]; 
        variants[variantIndex] = variant;
        return { ...prev, variants };
      });
      setNewImageUrl('');
      setShowInput(false);
    }
  };

  return (
    <div className="mt-1">
      <AnimatePresence mode="wait">
        {showInput ? (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-1 items-center"
          >
            <input
              type="url"
              className="flex-grow border rounded px-1 py-0.5 text-xs focus:ring-blue-500 focus:border-blue-500"
              placeholder="Dán URL ảnh..."
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
            />
            <button 
              type="button" 
              onClick={handleAddLink} 
              disabled={!newImageUrl.trim()}
              className="bg-blue-500 text-white p-0.5 rounded text-xs disabled:opacity-50"
              title="Thêm"
            >
              +
            </button>
            <button 
              type="button" 
              onClick={() => setShowInput(false)} 
              className="text-gray-500 hover:text-gray-700"
              title="Hủy"
            >
              <X size={14} />
            </button>
          </motion.div>
        ) : (
          <motion.button 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            type="button" 
            onClick={() => setShowInput(true)} 
            className="text-blue-500 hover:text-blue-700 text-xs flex items-center gap-1"
          >
            <LinkIcon size={12} /> Dán URL
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};


export default function AdminProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [primaryCategorySearch, setPrimaryCategorySearch] = useState("");
  const [showPrimaryCategoryDropdown, setShowPrimaryCategoryDropdown] = useState(false);
  const variantImageRefs = useRef({});

  const [product, setProduct] = useState({
    productName: "",
    productId: "",
    brand: "",
    category: { categoryId: "", name: "" },
    categories: [],
    description: "",
    specifications: [{ label: "", value: "" }],
    images: [],
    imagePreviews: [],
    variants: [emptyVariant()],
    createdAt: "",
  });

  // Load categories
  useEffect(() => {
    // Giả định bạn có CategoryController hoặc API để lấy danh mục
    // Thay thế bằng logic fetch thực tế của bạn
    const mockCategories = [
      { categoryId: "dien-thoai", name: "Điện Thoại" },
      { categoryId: "laptop", name: "Laptop" },
      { categoryId: "phu-kien", name: "Phụ kiện" },
    ];
    setCategories(mockCategories);

    // Bỏ import controller nếu bạn dùng API
    /*
    import('../controllers/categoryController').then(({ CategoryController }) => {
      CategoryController.getAll().then((cats) => setCategories(cats)).catch((err) => console.error(err));
    });
    */
  }, []);

  // Load product
  useEffect(() => {
    (async () => {
      if (id === 'new') {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data.product;
        setProduct({
          productName: p.productName || "",
          productId: p.productId || "",
          brand: p.brand || "",
          category: p.category || { categoryId: "", name: "" },
          categories: Array.isArray(p.categories) ? p.categories : [],
          description: p.productDescription || "",
          specifications: Array.isArray(p.specifications) ? p.specifications : [{ label: "", value: "" }],
          images: p.images || [],
          imagePreviews: p.images || [],
          variants: (p.variants || []).map(v => ({
            variantId: v.variantId || "",
            name: v.name || "",
            oldPrice: v.oldPrice || 0,
            discount: v.discount || 0,
            price: v.price || 0,
            stock: v.stock || 0,
            images: v.images || [],
            imagePreviews: v.images || [],
          })),
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : "",
        });
      } catch (err) {
        toast.error("Không tải được sản phẩm");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  // Hàm đã sửa lỗi: Cập nhật trường chung của sản phẩm
  const updateField = (field, value) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  // Hàm đã sửa lỗi: Xử lý chọn danh mục chính
  const handlePrimaryCategorySelect = (c) => {
    setProduct(p => ({ 
      ...p, 
      category: { categoryId: c.categoryId, name: c.name || c.categoryName }, 
      // Xóa categoryId khỏi danh mục phụ nếu có
      categories: (p.categories || []).filter(cat => cat.categoryId !== c.categoryId)
    }));
    setPrimaryCategorySearch(c.name || c.categoryName);
    setShowPrimaryCategoryDropdown(false);
  };
  
  // Hàm đã sửa lỗi: Thêm danh mục khác
  const addCategory = (categoryId) => {
    const categoryToAdd = categories.find(c => c.categoryId === categoryId);
    if (!categoryToAdd) return;
    setProduct(prev => {
      // Đảm bảo không thêm nếu đã tồn tại
      if ((prev.categories || []).some(c => c.categoryId === categoryId)) return prev;
      return {
        ...prev,
        categories: [...(prev.categories || []), { categoryId: categoryToAdd.categoryId, categoryName: categoryToAdd.name || categoryToAdd.categoryName }]
      };
    });
  };

  const removeCategory = (categoryId) => {
    setProduct((prev) => ({
      ...prev,
      // Lọc danh mục khác, và đảm bảo không xóa danh mục chính nếu có trùng ID
      categories: (prev.categories || []).filter((cat) => cat.categoryId !== categoryId)
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...product.images];
    newImages[index] = value;
    const newPreviews = [...product.imagePreviews];
    newPreviews[index] = value;
    setProduct((prev) => ({ ...prev, images: newImages, imagePreviews: newPreviews }));
  };

  const handleImageFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPreviews = [...product.imagePreviews];
        newPreviews[index] = event.target.result;
        setProduct((prev) => ({ ...prev, imagePreviews: newPreviews }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageField = () => setProduct((prev) => ({ ...prev, images: [...prev.images, ""], imagePreviews: [...prev.imagePreviews, ""] }));
  const removeImageField = (index) => setProduct((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index), imagePreviews: prev.imagePreviews.filter((_, i) => i !== index) }));

  const updateVariantField = (index, field, value) => {
    setProduct((prev) => {
      const variants = [...prev.variants];
      const variant = { ...variants[index] };

      if (field === 'oldPrice') {
        // Parse giá trị nhập vào, loại bỏ dấu chấm/phẩy
        const numericValue = parsePrice(value);
        variant.oldPrice = numericValue;
        const disc = Number(variant.discount) || 0;
        variant.price = Math.max(0, Math.round(numericValue * (100 - disc) / 100));
      } else if (field === 'discount') {
        // Đảm bảo discount là số và nằm trong khoảng 0-100
        const numericValue = Number(value) || 0;
        variant.discount = Math.min(100, Math.max(0, numericValue));
        const old = parsePrice(variant.oldPrice);
        variant.price = Math.max(0, Math.round(old * (100 - variant.discount) / 100));
      } else if (field === 'name' || field === 'variantId') {
        variant[field] = value;
      } else if (field === 'stock') {
        variant[field] = Number(value) || 0;
      }

      variants[index] = variant;
      return { ...prev, variants };
    });
  };

  const addVariant = () => {
    setProduct((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }));
  };

  const removeVariant = (index) => {
    setProduct((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateSpecification = (index, field, value) => {
    setProduct((prev) => {
      const specs = [...prev.specifications];
      specs[index] = { ...specs[index], [field]: value };
      return { ...prev, specifications: specs };
    });
  };

  const addSpecification = () => {
    setProduct((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { label: "", value: "" }]
    }));
  };

  const removeSpecification = (index) => {
    setProduct((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.productName.trim()) return toast.error("Thiếu tên sản phẩm.");
    if (!product.category.categoryId) return toast.error("Thiếu danh mục chính.");
    if (!product.variants.length) return toast.error("Cần ít nhất 1 biến thể.");

    const validImages = product.images.filter(img => img && img.trim() !== "");
    const validSpecs = product.specifications.filter(s => s.label && s.value);

    try {
      setSaving(true);
      const catName = product.category?.name?.trim() || "Uncategorized";
      let catId = product.category?.categoryId?.trim();
      
      const payload = {
        productName: product.productName.trim(),
        brand: product.brand?.trim() || "",
        productDescription: product.description || "",
        category: { categoryId: catId, categoryName: catName },
        categories: product.categories,
        images: validImages,
        specifications: validSpecs,
        variants: product.variants.map((v) => ({
          variantId: v.variantId || `v-${Date.now()}`,
          name: v.name.trim(),
          oldPrice: parsePrice(v.oldPrice),
          discount: Number(v.discount) || 0,
          price: parsePrice(v.price),
          stock: Number(v.stock) || 0,
          images: v.images.filter(img => img && img.trim() !== "")
        })),
        createdAt: product.createdAt ? new Date(product.createdAt) : undefined
      };

      if (id === 'new') {
        // Giả định tạo mới nếu id là 'new'
        await api.post(`/products`, payload);
        toast.success("Tạo sản phẩm thành công");
      } else {
        await api.put(`/products/${id}`, payload);
        toast.success("Cập nhật sản phẩm thành công");
      }
      
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{id === 'new' ? "Thêm Sản phẩm mới" : `Chỉnh sửa Sản phẩm: ${product.productName || id}`}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* THÔNG TIN CHUNG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Tên sản phẩm *</label><input type="text" className="w-full border rounded px-3 py-2" value={product.productName} onChange={(e) => updateField("productName", e.target.value)} /></div>
          <div><label className="block text-sm font-medium mb-1">Thương hiệu</label><input type="text" className="w-full border rounded px-3 py-2" value={product.brand} onChange={(e) => updateField("brand", e.target.value)} /></div>
        </div>
        
        {/* DANH MỤC */}
        <div className="border rounded p-4 bg-gray-50">
          <h3 className="font-bold text-sm mb-4">Danh mục</h3>
          
          {/* Hiển thị danh mục chính đã chọn */}
          {product.category?.categoryId && (
            <div className="mb-4 pb-4 border-b">
              <p className="text-xs font-semibold text-gray-600 mb-2">Danh mục chính:</p>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {product.category.name || product.category.categoryId}
                <button 
                  type="button" 
                  onClick={() => setProduct(p => ({ ...p, category: { categoryId: "", name: "" }, categories: (p.categories || []).filter(cat => cat.categoryId !== p.category.categoryId) }))}
                  className="ml-1 text-blue-700 hover:text-blue-900 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Hiển thị danh mục khác đã chọn */}
          {Array.isArray(product.categories) && product.categories.length > 0 && (
            <div className="mb-4 pb-4 border-b">
              <p className="text-xs font-semibold text-gray-600 mb-2">Danh mục khác:</p>
              <div className="flex flex-wrap gap-2">
                {product.categories.map((cat) => (
                  <div key={cat.categoryId} className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {cat.categoryName}
                    <button 
                      type="button" 
                      onClick={() => removeCategory(cat.categoryId)}
                      className="ml-1 text-green-700 hover:text-green-900 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 relative">
            <label className="block text-sm font-medium mb-2">Chọn danh mục chính *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập để tìm danh mục..."
                value={primaryCategorySearch}
                onChange={(e) => {
                  setPrimaryCategorySearch(e.target.value);
                  setShowPrimaryCategoryDropdown(true);
                }}
                onFocus={() => setShowPrimaryCategoryDropdown(true)}
                onBlur={() => setTimeout(() => setShowPrimaryCategoryDropdown(false), 200)}
                className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <AnimatePresence>
                {showPrimaryCategoryDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10 max-h-56 overflow-y-auto"
                  >
                    {fuzzySearch(primaryCategorySearch, categories).length > 0 ? (
                      fuzzySearch(primaryCategorySearch, categories).map((c) => (
                        <button
                          key={c.categoryId}
                          type="button"
                          onClick={() => handlePrimaryCategorySelect(c)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 transition border-b last:border-b-0"
                        >
                          {c.name || c.categoryName}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">Không tìm thấy danh mục</div>
                    )}
                  </motion.div>
                )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Thêm danh mục khác (tùy chọn)</label>
            <div className="border rounded p-3 bg-white max-h-56 overflow-y-auto space-y-2">
              {Array.isArray(categories) && categories.map((c) => {
                const isSelected = Array.isArray(product.categories) && product.categories.some(cat => cat.categoryId === c.categoryId);
                const isPrimary = product.category?.categoryId === c.categoryId;
                return (
                  <label key={c.categoryId} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                    <input 
                      type="checkbox" 
                      checked={isSelected || isPrimary}
                      disabled={isPrimary}
                      onChange={(e) => {
                        if (e.target.checked) addCategory(c.categoryId);
                        else removeCategory(c.categoryId);
                      }}
                      className="rounded"
                    />
                    <span className={`text-sm ${isPrimary ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {c.name || c.categoryName}
                      {isPrimary && <span className="text-xs text-gray-500 ml-1">(chính)</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea className="w-full border rounded px-3 py-2 h-24" value={product.description} onChange={(e) => updateField("description", e.target.value)} /></div>

        {/* THÔNG SỐ KỸ THUẬT */}
        <div className="border rounded p-4 bg-gray-50">
          <div className="flex justify-between mb-4">
            <label className="font-bold text-sm">Thông số kỹ thuật</label>
            <button type="button" onClick={addSpecification} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">+ Thêm</button>
          </div>
          <div className="space-y-3">
            {product.specifications.map((spec, i) => (
              <div key={i} className="flex gap-2">
                <input 
                  type="text"
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  placeholder="Label (ví dụ: RAM, CPU)"
                  value={spec.label}
                  onChange={(e) => updateSpecification(i, "label", e.target.value)}
                />
                <input 
                  type="text"
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  placeholder="Giá trị (ví dụ: 8GB, Snapdragon)"
                  value={spec.value}
                  onChange={(e) => updateSpecification(i, "value", e.target.value)}
                />
                <button type="button" onClick={() => removeSpecification(i)} className="text-red-500 hover:text-red-700">Xóa</button>
              </div>
            ))}
          </div>
        </div>

        <div className="border p-4 rounded bg-gray-50">
          <div className="flex justify-between mb-4"><label className="font-bold text-sm">Hình ảnh sản phẩm</label><button type="button" onClick={addImageField} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">+ Thêm ảnh</button></div>
          <div className="space-y-4">
            {product.images.map((url, i) => (
              <div key={i} className="border rounded p-3 bg-white">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
                      <input 
                        ref={el => variantImageRefs.current[`product_${i}`] = el}
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageFileChange(i, e)}
                        className="hidden" 
                      />
                      <div className="text-center" onClick={() => variantImageRefs.current[`product_${i}`]?.click()}>
                        <ImageIcon size={20} className="text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Click để chọn ảnh</p>
                      </div>
                    </div>
                    <input 
                      className="w-full border rounded px-2 py-1 text-sm" 
                      value={url} 
                      onChange={e=>handleImageChange(i,e.target.value)} 
                      placeholder="Hoặc dán URL ảnh..."
                    />
                  </div>
                  <div className="w-20 h-20 rounded border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.imagePreviews[i] ? (
                      <img src={product.imagePreviews[i]} alt="" className="w-full h-full object-cover" onError={() => {}} />
                    ) : (
                      <ImageIcon size={24} className="text-gray-400" />
                    )}
                  </div>
                  <button type="button" onClick={()=>removeImageField(i)} className="text-red-500 font-bold hover:text-red-700">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded overflow-hidden">
          <div className="bg-gray-100 p-2 flex justify-between items-center"><h3 className="font-bold text-gray-700">Biến thể & Giá</h3><button type="button" onClick={addVariant} className="text-sm bg-white border px-2 py-1 rounded shadow-sm">+ Thêm</button></div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left table-fixed">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 w-36">Ảnh</th>
                  <th className="px-3 py-2 w-48">Tên</th>
                  <th className="px-3 py-2 w-32">Mã</th>
                  <th className="px-3 py-2 w-32">Giá gốc (VNĐ)</th>
                  <th className="px-3 py-2 w-24 text-center">% Giảm</th>
                  <th className="px-3 py-2 w-32">Giá bán (Auto)</th>
                  <th className="px-3 py-2 w-24">Kho</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    {/* Ảnh biến thể */}
                    <td className="p-2 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1 items-center flex-wrap mb-1">
                          {(v.images || []).map((img, imgIdx) => (
                            <div key={imgIdx} className="relative group">
                              {img && (
                                <img src={img} alt="variant-img" className="w-10 h-10 object-cover rounded border" />
                              )}
                              <button type="button" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100" onClick={() => {
                                // Xóa ảnh khỏi variant
                                const newVariants = [...product.variants];
                                newVariants[idx].images = (newVariants[idx].images || []).filter((_, i) => i !== imgIdx);
                                setProduct(p => ({ ...p, variants: newVariants }));
                              }} title="Xóa ảnh">×</button>
                            </div>
                          ))}
                          <button type="button" className="w-10 h-10 flex items-center justify-center border-2 border-dashed rounded text-gray-400 hover:border-blue-400 hover:text-blue-600" onClick={() => document.getElementById(`variant-img-input-${idx}`).click()} title="Thêm ảnh">+</button>
                          <input id={`variant-img-input-${idx}`} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => {
                            const files = Array.from(e.target.files || []);
                            if (!files.length) return;
                            const newImgs = files.map(file => URL.createObjectURL(file));
                            const newVariants = [...product.variants];
                            newVariants[idx].images = [...(newVariants[idx].images || []), ...newImgs];
                            setProduct(p => ({ ...p, variants: newVariants }));
                            e.target.value = "";
                          }} />
                        </div>
                        {/* Component lồng đã được thêm vào */}
                        <VariantLinkInputHook
                          variantIndex={idx}
                          product={product}
                          setProduct={setProduct}
                        />
                      </div>
                    </td>

                    <td className="p-2 align-top"><input className="w-full border rounded px-2 py-1" value={v.name} onChange={e=>updateVariantField(idx,"name",e.target.value)} placeholder="Tên"/></td>
                    <td className="p-2 align-top"><input className="w-full border rounded px-2 py-1" value={v.variantId} onChange={e=>updateVariantField(idx,"variantId",e.target.value)}/></td>
                    <td className="p-2 align-top">
                      <input 
                        type="text" 
                        className="w-full border rounded px-2 py-1 text-right" 
                        value={formatPrice(v.oldPrice)} 
                        onChange={e => updateVariantField(idx, "oldPrice", e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2 relative align-top">
                      <input type="number" min="0" max="100" className="w-full border rounded px-2 py-1 text-center font-bold text-green-600" value={v.discount || ''} onChange={e=>updateVariantField(idx,"discount",e.target.value)} placeholder="0"/>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>
                    </td>
                    <td className="p-2 align-top">
                      <input 
                        type="text" 
                        className="w-full border rounded px-2 py-1 bg-green-50 font-bold text-green-700 text-right cursor-not-allowed" 
                        value={formatPrice(v.price)} 
                        readOnly 
                      />
                    </td>
                    <td className="p-2 align-top"><input type="number" min="0" className="w-full border rounded px-2 py-1" value={v.stock || ''} onChange={e=>updateVariantField(idx,"stock",e.target.value)} placeholder="0"/></td>
                    <td className="p-2 text-center align-top"><button type="button" onClick={()=>removeVariant(idx)} className="text-red-500 hover:text-red-700">Xóa</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white py-4">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? "Lưu..." : "Cập nhật sản phẩm"}</button>
          <button type="button" onClick={() => navigate("/admin/products")} className="px-6 py-2 border rounded hover:bg-gray-50 text-gray-700">Trở về</button>
        </div>
      </form>
    </div>
  );
}