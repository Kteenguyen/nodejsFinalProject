// src/pages/AdminProductEditPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { getImageUrl } from '../services/api';

const API_BASE = "https://localhost:3001/api";

const emptyVariant = () => ({
  variantId: "",
  name: "",
  oldPrice: 0,
  discount: 0, 
  price: 0, 
  stock: 0,
});

export default function AdminProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    axios.get(`${API_BASE}/products/categories`)
      .then((res) => { if (res.data.success) setCategories(res.data.categories); })
      .catch((err) => console.error(err));
  }, []);

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
                oldPrice: v.oldPrice ?? 0,
                discount: v.discount ?? 0, 
                price: v.price ?? 0,
                stock: v.stock ?? 0,
              }))
            : [emptyVariant()],
        });
      } catch (err) { toast.error(err.message); } finally { if (!ignore) setLoading(false); }
    }
    fetchProduct();
    return () => { ignore = true; };
  }, [id]);

  const updateField = (field, value) => setProduct((prev) => ({ ...prev, [field]: value }));
  
  // Logic tính toán khi nhập liệu (Giống trang New)
  const updateVariantField = (index, field, value) => {
    setProduct((prev) => {
      const variants = [...prev.variants];
      const variant = { ...variants[index], [field]: value };

      if (field === 'oldPrice' || field === 'discount') {
          const old = Number(field === 'oldPrice' ? value : variant.oldPrice) || 0;
          const disc = Number(field === 'discount' ? value : variant.discount) || 0;
          const newPrice = old * (100 - disc) / 100;
          variant.price = Math.max(0, Math.round(newPrice));
      }

      variants[index] = variant;
      return { ...prev, variants };
    });
  };

  const handleCategorySelect = (e) => { 
      const val = e.target.value; 
      if(val==="NEW"){setIsNewCategory(true);setProduct(p=>({...p,category:{categoryId:"",name:""}}))}
      else{setIsNewCategory(false);const s=categories.find(c=>c.id===val);setProduct(p=>({...p,category:s?{categoryId:s.id,name:s.name}:{categoryId:"",name:""}}))}
  };
  const handleImageChange = (index, value) => { const img=[...product.images]; img[index]=value; setProduct(p=>({...p,images:img})) };
  const addImageField = () => setProduct(p=>({...p,images:[...p.images,""]}));
  const removeImageField = (i) => setProduct(p=>({...p,images:p.images.filter((_,idx)=>idx!==i)}));
  const addVariant = () => setProduct(p=>({...p,variants:[...p.variants,emptyVariant()]}));
  const removeVariant = (i) => setProduct(p=>({...p,variants:p.variants.filter((_,idx)=>idx!==i)}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const catName = product.category?.name?.trim() || "Uncategorized";
      let catId = product.category?.categoryId?.trim();
      if (!catId || isNewCategory) catId = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");

      const payload = {
        productName: product.productName,
        brand: product.brand,
        productDescription: product.description,
        category: { categoryId: catId, categoryName: catName },
        images: product.images.filter(img => img && img.trim() !== ""),
        variants: product.variants.map((v) => ({
          variantId: v.variantId,
          name: v.name,
          oldPrice: Number(v.oldPrice) || 0,
          discount: Number(v.discount) || 0,
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

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-sm mt-4 rounded">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa sản phẩm</h1>
          <button type="button" onClick={() => navigate("/admin/products")} className="text-gray-500 hover:text-blue-600 text-sm">&larr; Quay lại danh sách</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium mb-1">Tên sản phẩm</label><input className="w-full border rounded px-3 py-2" value={product.productName} onChange={e => updateField("productName", e.target.value)} required /></div>
          <div><label className="block text-sm font-medium mb-1">Mã (Read-only)</label><input className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500" value={product.productId} disabled /></div>
          <div><label className="block text-sm font-medium mb-1">Thương hiệu</label><input className="w-full border rounded px-3 py-2" value={product.brand} onChange={e => updateField("brand", e.target.value)} /></div>
          <div><label className="block text-sm font-medium mb-1">Danh mục</label>{!isNewCategory ? (<select className="w-full border rounded px-3 py-2 bg-white" onChange={handleCategorySelect} value={product.category?.categoryId || ""}><option value="">-- Chọn --</option>{categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}<option value="NEW" className="font-bold text-blue-600 bg-blue-50">+ Tạo mới...</option></select>) : (<div className="flex gap-2"><input className="w-full border rounded px-3 py-2 flex-1" placeholder="Nhập tên..." value={product.category?.name || ""} onChange={e => updateField("category", { ...(product.category||{}), name: e.target.value })} autoFocus /><button type="button" onClick={()=>setIsNewCategory(false)} className="px-3 border rounded text-red-500">Hủy</button></div>)}</div>
        </div>

        <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea className="w-full border rounded px-3 py-2 h-24" value={product.description} onChange={e => updateField("description", e.target.value)} /></div>

        <div className="border p-4 rounded bg-gray-50">
          <div className="flex justify-between items-center mb-3"><label className="block text-sm font-bold text-gray-700">Hình ảnh</label><button type="button" onClick={addImageField} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">+ Thêm ảnh</button></div>
          <div className="space-y-2">{product.images.map((imgUrl, idx) => (<div key={idx} className="flex gap-2 items-center">{imgUrl && <img src={getImageUrl(imgUrl)} alt="" className="w-8 h-8 object-cover rounded border bg-white"/>}<input type="text" className="flex-1 border rounded px-3 py-2 text-sm" value={imgUrl} onChange={(e) => handleImageChange(idx, e.target.value)} /><button type="button" onClick={() => removeImageField(idx)} className="text-red-500 font-bold px-2">✕</button></div>))}</div>
        </div>

        {/* BIẾN THỂ & GIÁ */}
        <div className="border rounded overflow-hidden">
            <div className="bg-gray-100 p-2 flex justify-between items-center"><h3 className="font-bold text-gray-700">Biến thể & Giá bán</h3><button type="button" onClick={addVariant} className="text-sm bg-white border px-2 py-1 rounded shadow-sm">+ Thêm</button></div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600"><tr><th className="px-3 py-2 w-48">Tên</th><th className="px-3 py-2 w-24">Mã</th><th className="px-3 py-2 w-32">Giá gốc</th><th className="px-3 py-2 w-24 text-center">% Giảm</th><th className="px-3 py-2 w-32">Giá bán (Auto)</th><th className="px-3 py-2 w-24">Kho</th><th className="px-3 py-2 w-10"></th></tr></thead>
              <tbody>
                {product.variants.map((v, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="p-2"><input className="w-full border rounded px-2 py-1" value={v.name} onChange={e=>updateVariantField(idx,"name",e.target.value)}/></td>
                    <td className="p-2"><input className="w-full border rounded px-2 py-1" value={v.variantId} onChange={e=>updateVariantField(idx,"variantId",e.target.value)}/></td>
                    
                    {/* GIÁ GỐC */}
                    <td className="p-2"><input type="number" className="w-full border rounded px-2 py-1" value={v.oldPrice} onChange={e=>updateVariantField(idx,"oldPrice",e.target.value)} placeholder="0"/></td>
                    
                    {/* % GIẢM */}
                    <td className="p-2 relative">
                        <input type="number" className="w-full border rounded px-2 py-1 text-center font-bold text-green-600" value={v.discount} onChange={e=>updateVariantField(idx,"discount",e.target.value)} placeholder="0"/>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>
                    </td>

                    {/* GIÁ BÁN (READONLY) */}
                    <td className="p-2"><input type="number" className="w-full border rounded px-2 py-1 bg-gray-100 font-bold text-red-600 cursor-not-allowed" value={v.price} readOnly /></td>

                    <td className="p-2"><input type="number" className="w-full border rounded px-2 py-1" value={v.stock} onChange={e=>updateVariantField(idx,"stock",e.target.value)}/></td>
                    <td className="p-2 text-center"><button type="button" onClick={()=>removeVariant(idx)} className="text-red-500 hover:text-red-700">Xóa</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>

        <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white py-4">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm disabled:opacity-50">
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button type="button" onClick={() => navigate("/admin/products")} className="px-6 py-2 border rounded hover:bg-gray-50 text-gray-700">
            Trở về danh sách
          </button>
        </div>
      </form>
    </div>
  );
}