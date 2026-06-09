"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

function AdminProductsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category_id: '',
    description: '',
    ph_level: '',
    texture: '',
    cost_price: '',
    selling_price: '',
    stock: '',
    threshold: '10',
    supplier: '',
    ingredients: [] as number[],
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, ingRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/ingredients')
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes);
      setIngredients(ingRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        code: product.code,
        name: product.name,
        category_id: product.category_id,
        description: product.description || '',
        ph_level: product.ph_level || '',
        texture: product.texture || '',
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        stock: product.stock,
        threshold: product.threshold || 10,
        supplier: product.supplier || '',
        ingredients: product.ingredients ? product.ingredients.map((i: any) => i.id) : [],
        is_active: product.is_active
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '',
        name: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        description: '',
        ph_level: '',
        texture: '',
        cost_price: '',
        selling_price: '',
        stock: '0',
        threshold: '10',
        supplier: '',
        ingredients: [],
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
      } else {
        await api.post('/products', formData);
      }
      closeModal();
      fetchData(); // Refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleIngredientChange = (ingredientId: number) => {
    setFormData(prev => {
      const current = [...prev.ingredients];
      if (current.includes(ingredientId)) {
        return { ...prev, ingredients: current.filter(id => id !== ingredientId) };
      } else {
        return { ...prev, ingredients: [...current, ingredientId] };
      }
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 pt-24">
      {/* Sidebar */}
      <aside className="w-72 glass border-r border-gray-200 p-8 flex flex-col gap-6 min-h-screen hidden md:flex">
        <div>
          <a href="/admin/dashboard" className="text-xs uppercase tracking-widest font-bold text-secondary flex items-center gap-2 hover:translate-x-1 transition-transform mb-8">
            ← Back to Dashboard
          </a>
          <h2 className="text-2xl font-black text-primary">Master Data</h2>
          <p className="text-xs text-text-muted mt-2">Manage your core entities</p>
        </div>
        <div className="space-y-2 mt-4">
          <a href="/admin/products" className="block px-4 py-3 rounded-xl bg-primary text-white shadow text-sm font-medium">Products</a>
          <a href="/admin/categories" className="block px-4 py-3 rounded-xl text-text-muted hover:bg-white hover:text-primary transition-all text-sm font-medium">Categories</a>
          <a href="/admin/ingredients" className="block px-4 py-3 rounded-xl text-text-muted hover:bg-white hover:text-primary transition-all text-sm font-medium">Ingredients</a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-hidden">
        <div className="mb-8 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <span className="text-primary font-bold uppercase tracking-widest text-xs">Admin Panel</span>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mt-1">Manage Products</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-200 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[250px]"
            />
            <button onClick={fetchData} className="bg-white border border-gray-200 px-5 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all whitespace-nowrap">
              Refresh
            </button>
            <button onClick={() => openModal()} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-secondary transition-all whitespace-nowrap">
              + Add Product
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-secondary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-xs uppercase tracking-widest text-text-muted">
                    <th className="p-4 font-bold">Code</th>
                    <th className="p-4 font-bold">Name</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold text-right">Cost Price</th>
                    <th className="p-4 font-bold text-right">Selling Price</th>
                    <th className="p-4 font-bold text-center">Stock</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-text-muted">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-xs font-mono text-text-muted">{product.code}</td>
                        <td className="p-4 text-sm font-bold text-primary">
                          {product.name}
                          {!product.is_active && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Inactive</span>}
                        </td>
                        <td className="p-4 text-sm text-text-muted">{product.category?.name || '-'}</td>
                        <td className="p-4 text-sm text-right font-mono text-text-muted">Rp {Number(product.cost_price).toLocaleString('id-ID')}</td>
                        <td className="p-4 text-sm text-right font-mono font-bold text-primary">Rp {Number(product.selling_price).toLocaleString('id-ID')}</td>
                        <td className="p-4 text-sm text-center">
                          <span className={`px-2 py-1 rounded-lg font-bold ${product.stock <= product.threshold ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button 
                            onClick={() => openModal(product)}
                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-bold transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 font-bold transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 w-full max-w-4xl shadow-2xl animate-fade-in my-8">
            <h3 className="text-2xl font-bold text-primary mb-6">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-secondary border-b pb-2">Basic Info</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Code</label>
                      <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" placeholder="PROD-001" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Category</label>
                      <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm">
                        <option value="">Select Category...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Product Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm h-24" />
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-secondary border-b pb-2">Pricing & Stock</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Cost Price (Rp)</label>
                      <input type="number" required min="0" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Selling Price (Rp)</label>
                      <input type="number" required min="0" value={formData.selling_price} onChange={e => setFormData({...formData, selling_price: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Current Stock</label>
                      <input type="number" required min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Low Stock Threshold</label>
                      <input type="number" required min="0" value={formData.threshold} onChange={e => setFormData({...formData, threshold: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Attributes & Ingredients */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-secondary border-b pb-2">Attributes</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">pH Level</label>
                      <input type="number" step="0.1" value={formData.ph_level} onChange={e => setFormData({...formData, ph_level: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" placeholder="e.g. 5.5" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Texture</label>
                      <input type="text" value={formData.texture} onChange={e => setFormData({...formData, texture: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" placeholder="e.g. Gel" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Supplier</label>
                    <input type="text" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-secondary border-b pb-2">Ingredients</h4>
                  <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 h-48 overflow-y-auto">
                    {ingredients.length === 0 ? (
                      <p className="text-sm text-text-muted">No ingredients available. Please add some first.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ingredients.map(ing => (
                          <label key={ing.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                            <input 
                              type="checkbox" 
                              checked={formData.ingredients.includes(ing.id)}
                              onChange={() => handleIngredientChange(ing.id)}
                              className="rounded text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-primary">{ing.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center pt-6 border-t mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-primary">Product is Active</span>
                </label>
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-text-muted hover:bg-gray-100 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-secondary transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <AuthGuard requireRole="admin">
      <AdminProductsContent />
    </AuthGuard>
  );
}
