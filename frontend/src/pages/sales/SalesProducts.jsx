import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function SalesProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    api.get(`/products?${params}`).then(r => setProducts(r.data.products)).catch(console.error).finally(() => setLoading(false));
  }, [search, category]);

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Products Catalog</h1>
      </div>
      <div className="filters">
        <input className="form-input filter-input" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-input filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="product-grid">
        {loading ? <div className="spinner-center"><div className="spinner"></div></div> : products.length === 0 ? (
          <div className="empty">No products found</div>
        ) : products.map(p => (
          <div key={p._id} className="product-card">
            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="product-img" /> : <div className="product-img-placeholder">📦</div>}
            <div className="product-info">
              <div className="product-name">{p.name}</div>
              <div className="product-sku">SKU: {p.sku}</div>
              <div className="product-category">{p.category}</div>
              <div className="product-price">Rs. {p.price?.toLocaleString()}</div>
              {p.supplier && <div className="product-supplier">Supplier: {p.supplier.name}</div>}
              {p.description && <div className="product-desc">{p.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
