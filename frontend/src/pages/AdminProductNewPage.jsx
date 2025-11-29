// src/pages/AdminProductNewPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "https://localhost:3001/api";

const generateProductId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PRD-${timestamp}-${random}`;
};

// Mẫu biến thể với đầy đủ trường
const emptyVariant = () => ({
  variantId: "",
  name: "",
  oldPrice: 0, // Giá gốc
  discount: 0, // % Giảm giá
  price: 0,    // Giá bán (Tự tính)
  stock: 0,
});

export default function AdminProductNewPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isNewCategory, setIsNewCategory] = useState(false);

  const [product, setProduct] = useState({
    productName: "",
    productId: generateProductId(),
    brand: "",
    category: { categoryId: "", name: "" },
    description: "",
    images: ["", "", ""],
    variants: [emptyVariant()],
  });

  // Load danh mục
  useEffect(() => {
    import('../controllers/categoryController').then(({ CategoryController }) => {
      CategoryController.getAll().then((cats) => setCategories(cats)).catch((err) => console.error(err));
    });
  }, []);

  const updateField = (field, value) => setProduct((prev) => ({ ...prev, [field]: value }));

  const updateCategoryName = (value) => {
    setProduct((prev) => ({
      ...prev,
      category: { ...(prev.category || {}), name: value },
    }));
  };

  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === "NEW") {
      setIsNewCategory(true);
      setProduct((prev) => ({ ...prev, category: { categoryId: "", name: "" } }));
    } else {
      setIsNewCategory(false);
      const selected = categories.find((c) => c.id === val);
      if (selected) setProduct((prev) => ({ ...prev, category: { categoryId: selected.id, name: selected.name } }));
      else setProduct((prev) => ({ ...prev, category: { categoryId: "", name: "" } }));
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...product.images];
    newImages[index] = value;
    setProduct((prev) => ({ ...prev, images: newImages }));
  };
  const addImageField = () => setProduct((prev) => ({ ...prev, images: [...prev.images, ""] }));
  const removeImageField = (index) => setProduct((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  // === LOGIC TÍNH GIÁ TỰ ĐỘNG ===
  const updateVariantField = (index, field, value) => {
    setProduct((prev) => {
      const variants = [...prev.variants];
      const variant = { ...variants[index], [field]: value };

      // Nếu sửa Giá gốc hoặc % Giảm -> Tính lại Giá bán
      if (field === 'oldPrice' || field === 'discount') {
          const old = Number(field === 'oldPrice' ? value : variant.oldPrice) || 0;
          const disc = Number(field === 'discount' ? value : variant.discount) || 0;
          
          // Công thức: Giá bán = Giá gốc * (100 - %)/100
          const newPrice = old * (100 - disc) / 100;
          variant.price = Math.max(0, Math.round(newPrice));
      }

      variants[index] = variant;
      return { ...prev, variants };
    });
  };

  const addVariant = () => setProduct((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }));
  const removeVariant = (index) => setProduct((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.productName.trim()) return toast.error("Thiếu tên sản phẩm.");
    if (!product.productId.trim()) return toast.error("Thiếu mã sản phẩm.");
    if (!product.variants.length) return toast.error("Cần ít nhất 1 biến thể.");

    const validImages = product.images.filter(img => img && img.trim() !== "");

    try {
      setSaving(true);
      const catName = product.category?.name?.trim() || "Uncategorized";
      let catId = product.category?.categoryId?.trim();
      if (!catId || isNewCategory) {
        catId = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
      }

      const payload = {
        productId: product.productId.trim(),
        productName: product.productName.trim(),
        brand: product.brand?.trim() || "",
        productDescription: product.description || "",
        category: { categoryId: catId, categoryName: catName },
        images: validImages,
        variants: product.variants.map((v) => ({
          variantId: v.variantId.trim() || `v-${Date.now()}`,
          name: v.name.trim(),
          oldPrice: Number(v.oldPrice) || 0,
          discount: Number(v.discount) || 0,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
        })),
        status: 'available',
        isNewProduct: true
      };

      await axios.post(`${API_BASE}/products`, payload, { withCredentials: true });
      toast.success("Tạo sản phẩm thành công");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tạo sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-sm mt-4 rounded">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Thêm sản phẩm mới</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium mb-1">Tên sản phẩm *</label><input className="w-full border rounded px-3 py-2" value={product.productName} onChange={(e) => updateField("productName", e.target.value)} required /></div>
          <div><label className="block text-sm font-medium mb-1">Mã ID *</label><div className="flex gap-2"><input className="flex-1 border rounded px-3 py-2 bg-gray-100" value={product.productId} readOnly disabled /><button type="button" onClick={() => updateField("productId", generateProductId())} className="px-3 py-2 text-sm bg-blue-500 text-white rounded">Tạo lại</button></div></div>
          <div><label className="block text-sm font-medium mb-1">Thương hiệu</label><input className="w-full border rounded px-3 py-2" value={product.brand} onChange={(e) => updateField("brand", e.target.value)} /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Danh mục</label>
            {!isNewCategory ? (
              <select className="w-full border rounded px-3 py-2 bg-white" onChange={handleCategorySelect} value={product.category?.categoryId || ""}><option value="">-- Chọn --</option>{categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}<option value="NEW" className="font-bold text-blue-600 bg-blue-50">+ Tạo mới...</option></select>
            ) : (
              <div className="flex gap-2"><input className="flex-1 border rounded px-3 py-2" placeholder="Tên danh mục..." value={product.category?.name || ""} onChange={(e) => updateCategoryName(e.target.value)} autoFocus /><button type="button" onClick={() => setIsNewCategory(false)} className="px-3 border rounded text-red-500">Hủy</button></div>
            )}
          </div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea className="w-full border rounded px-3 py-2 h-24" value={product.description} onChange={(e) => updateField("description", e.target.value)} /></div>
        
        <div className="border p-4 rounded bg-gray-50">
          <div className="flex justify-between mb-2"><label className="font-bold text-sm">Hình ảnh</label><button type="button" onClick={addImageField} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">+ Thêm ảnh</button></div>
          <div className="space-y-2">{product.images.map((url, i) => (<div key={i} className="flex gap-2"><input className="flex-1 border rounded px-2 py-1 text-sm" value={url} onChange={e=>handleImageChange(i,e.target.value)} placeholder="URL..."/><button type="button" onClick={()=>removeImageField(i)} className="text-red-500 font-bold px-2">✕</button></div>))}</div>
        </div>

        {/* BIẾN THỂ & TÍNH GIÁ */}
        <div className="border rounded overflow-hidden">
            <div className="bg-gray-100 p-2 flex justify-between items-center"><h3 className="font-bold text-gray-700">Biến thể & Giá</h3><button type="button" onClick={addVariant} className="text-sm bg-white border px-2 py-1 rounded shadow-sm">+ Thêm</button></div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600"><tr><th className="px-3 py-2 w-48">Tên</th><th className="px-3 py-2 w-32">Mã</th><th className="px-3 py-2 w-32">Giá gốc (VNĐ)</th><th className="px-3 py-2 w-24 text-center">% Giảm</th><th className="px-3 py-2 w-32">Giá bán (Auto)</th><th className="px-3 py-2 w-24">Kho</th><th className="px-3 py-2 w-10"></th></tr></thead>
              <tbody>
                {product.variants.map((v, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="p-2"><input className="w-full border rounded px-2 py-1" value={v.name} onChange={e=>updateVariantField(idx,"name",e.target.value)} placeholder="Tên"/></td>
                    <td className="p-2"><input className="w-full border rounded px-2 py-1" value={v.variantId} onChange={e=>updateVariantField(idx,"variantId",e.target.value)}/></td>
                    
                    {/* GIÁ GỐC */}
                    <td className="p-2"><input type="number" className="w-full border rounded px-2 py-1" value={v.oldPrice} onChange={e=>updateVariantField(idx,"oldPrice",e.target.value)} placeholder="0"/></td>
                    
                    {/* % GIẢM */}
                    <td className="p-2 relative">
                        <input type="number" className="w-full border rounded px-2 py-1 text-center font-bold text-green-600" value={v.discount} onChange={e=>updateVariantField(idx,"discount",e.target.value)} placeholder="0"/>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>
                    </td>

                    {/* GIÁ BÁN (READ ONLY) */}
                    <td className="p-2"><input type="number" className="w-full border rounded px-2 py-1 bg-gray-100 font-bold text-red-600 cursor-not-allowed" value={v.price} readOnly /></td>

                    <td className="p-2"><input type="number" className="w-full border rounded px-2 py-1" value={v.stock} onChange={e=>updateVariantField(idx,"stock",e.target.value)}/></td>
                    <td className="p-2 text-center"><button type="button" onClick={()=>removeVariant(idx)} className="text-red-500 hover:text-red-700">Xóa</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>

        <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white py-4">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? "Lưu..." : "Tạo sản phẩm"}</button>
          <button type="button" onClick={() => navigate("/admin/products")} className="px-6 py-2 border rounded hover:bg-gray-50 text-gray-700">Trở về</button>
        </div>
      </form>
    </div>
  );
}