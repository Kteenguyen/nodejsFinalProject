// src/pages/AdminProductEditPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "https://localhost:3001/api";

const emptyVariant = () => ({
  variantId: "",
  name: "",
  price: 0,
  stock: 0,
});

export default function AdminProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State danh mục
  const [categories, setCategories] = useState([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  
  const [product, setProduct] = useState({
    productName: "",
    productId: "",
    brand: "",
    category: { categoryId: "", name: "" },
    description: "",
    images: [], 
    variants: [emptyVariant()],
  });

  // Load danh mục
  useEffect(() => {
    axios.get(`${API_BASE}/products/categories`)
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      })
      .catch((err) => console.error("Lỗi load category", err));
  }, []);

  // Load sản phẩm
  useEffect(() => {
    let ignore = false;
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/products/${id}`, { withCredentials: true });
        const data = res.data?.product || res.data;
        if (!data) throw new Error("No data");
        if (ignore) return;

        setProduct({
          productName: data.productName || data.name || "",
          productId: data.productId || "",
          brand: data.brand || "",
          category: data.category || { categoryId: "", name: "" },
          description: data.productDescription || data.description || "",
          images: Array.isArray(data.images) ? data.images : [], 
          variants: Array.isArray(data.variants) && data.variants.length
            ? data.variants.map((v) => ({
                variantId: v.variantId || "",
                name: v.name || "",
                price: v.price ?? 0,
                stock: v.stock ?? 0,
              }))
            : [emptyVariant()],
        });
      } catch (err) {
        toast.error("Lỗi tải sản phẩm: " + err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchProduct();
    return () => { ignore = true; };
  }, [id]);

  const updateField = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  // Logic Dropdown Category
  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === "NEW") {
      setIsNewCategory(true);
      setProduct((prev) => ({ ...prev, category: { categoryId: "", name: "" } }));
    } else {
      setIsNewCategory(false);
      const selected = categories.find((c) => c.id === val);
      if (selected) {
        setProduct((prev) => ({
          ...prev,
          category: { categoryId: selected.id, name: selected.name },
        }));
      } else {
         setProduct((prev) => ({ ...prev, category: { categoryId: "", name: "" } }));
      }
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...product.images];
    newImages[index] = value;
    setProduct((prev) => ({ ...prev, images: newImages }));
  };
  const addImageField = () => {
    setProduct((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };
  const removeImageField = (index) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateVariantField = (index, field, value) => {
    setProduct((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });
  };
  const addVariant = () => {
    setProduct((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }));
  };
  const removeVariant = (index) => {
    setProduct((prev) => {
      const v = prev.variants.filter((_, i) => i !== index);
      return { ...prev, variants: v.length ? v : [emptyVariant()] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const catName = product.category?.name?.trim() || "Uncategorized";
      let catId = product.category?.categoryId?.trim();
      
      // Nếu là new category hoặc chưa có ID, tự tạo ID
      if (!catId || isNewCategory) {
        catId = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
      }

      const payload = {
        productName: product.productName,
        brand: product.brand,
        productDescription: product.description,
        category: { categoryId: catId, categoryName: catName },
        images: product.images.filter(img => img && img.trim() !== ""),
        variants: product.variants.map((v) => ({
          variantId: v.variantId,
          name: v.name,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
        })),
      };

      await axios.put(`${API_BASE}/products/${id}`, payload, { withCredentials: true });
      toast.success("Cập nhật thành công");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm mt-4 rounded">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa sản phẩm</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
            <input 
              className="w-full border rounded px-3 py-2"
              value={product.productName} 
              onChange={e => updateField("productName", e.target.value)} required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mã sản phẩm (Read-only)</label>
            <input 
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500"
              value={product.productId} disabled 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Thương hiệu</label>
            <input 
              className="w-full border rounded px-3 py-2"
              value={product.brand} 
              onChange={e => updateField("brand", e.target.value)} 
            />
          </div>

          {/* --- KHU VỰC DANH MỤC ĐÃ SỬA ĐỔI --- */}
          <div>
            <label className="block text-sm font-medium mb-1">Danh mục</label>
            {!isNewCategory ? (
              <select 
                className="w-full border rounded px-3 py-2 bg-white"
                onChange={handleCategorySelect}
                value={product.category?.categoryId || ""}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="NEW" className="font-bold text-blue-600 bg-blue-50">+ Tạo danh mục mới...</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input 
                  className="w-full border rounded px-3 py-2 flex-1"
                  placeholder="Nhập tên danh mục mới..."
                  value={product.category?.name || ""} 
                  onChange={e => updateField("category", { ...(product.category||{}), name: e.target.value })} 
                  autoFocus
                />
                <button type="button" onClick={()=>setIsNewCategory(false)} className="px-3 border rounded text-red-500 hover:bg-red-50">Hủy</button>
              </div>
            )}
          </div>
          {/* ----------------------------------- */}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea 
            className="w-full border rounded px-3 py-2 h-24"
            value={product.description} 
            onChange={e => updateField("description", e.target.value)} 
          />
        </div>

        {/* --- ẢNH SẢN PHẨM --- */}
        <div className="border p-4 rounded bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-bold text-gray-700">Hình ảnh (URL)</label>
            <button type="button" onClick={addImageField} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
              + Thêm ảnh
            </button>
          </div>
          {product.images.length === 0 && <p className="text-sm text-gray-400 italic">Chưa có ảnh nào</p>}
          <div className="space-y-2">
            {product.images.map((imgUrl, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                {imgUrl && <img src={imgUrl} alt="" className="w-8 h-8 object-cover rounded border bg-white"/>}
                <input
                  type="text"
                  placeholder="https://..."
                  className="flex-1 border rounded px-3 py-2 text-sm"
                  value={imgUrl}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                />
                <button type="button" onClick={() => removeImageField(idx)} className="text-red-500 font-bold px-2">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Biến thể */}
        <div className="border rounded p-4">
            <div className="flex justify-between mb-2">
                <h3 className="font-semibold">Biến thể</h3>
                <button type="button" onClick={addVariant} className="text-sm border px-2 py-1 rounded">+ Thêm</button>
            </div>
            {product.variants.map((v, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input className="border rounded px-2 py-1 flex-1" placeholder="Tên" value={v.name} onChange={e=>updateVariantField(idx,"name",e.target.value)}/>
                    <input className="border rounded px-2 py-1 w-24" placeholder="Mã" value={v.variantId} onChange={e=>updateVariantField(idx,"variantId",e.target.value)}/>
                    <input className="border rounded px-2 py-1 w-24" type="number" placeholder="Giá" value={v.price} onChange={e=>updateVariantField(idx,"price",e.target.value)}/>
                    <input className="border rounded px-2 py-1 w-20" type="number" placeholder="Kho" value={v.stock} onChange={e=>updateVariantField(idx,"stock",e.target.value)}/>
                    <button type="button" onClick={()=>removeVariant(idx)} className="text-red-500 px-2">Xóa</button>
                </div>
            ))}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {saving ? "Lưu..." : "Lưu thay đổi"}
          </button>
          <button type="button" onClick={() => navigate("/admin/products")} className="px-6 py-2 border rounded">Hủy</button>
        </div>
      </form>
    </div>
  );
}