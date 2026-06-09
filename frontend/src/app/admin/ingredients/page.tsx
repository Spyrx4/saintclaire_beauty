"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

function AdminIngredientsContent() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const data = await api.get('/ingredients');
      setIngredients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (ingredient: any = null) => {
    if (ingredient) {
      setEditingId(ingredient.id);
      setFormData({ name: ingredient.name, description: ingredient.description || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/ingredients/${editingId}`, formData);
      } else {
        await api.post('/ingredients', formData);
      }
      closeModal();
      fetchIngredients();
    } catch (err: any) {
      alert(err.message || 'Failed to save ingredient');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ingredient? This might affect products associated with it.')) return;
    try {
      await api.delete(`/ingredients/${id}`);
      fetchIngredients();
    } catch (err: any) {
      alert(err.message || 'Failed to delete ingredient');
    }
  };

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
          <a href="/admin/products" className="block px-4 py-3 rounded-xl text-text-muted hover:bg-white hover:text-primary transition-all text-sm font-medium">Products</a>
          <a href="/admin/categories" className="block px-4 py-3 rounded-xl text-text-muted hover:bg-white hover:text-primary transition-all text-sm font-medium">Categories</a>
          <a href="/admin/ingredients" className="block px-4 py-3 rounded-xl bg-primary text-white shadow text-sm font-medium">Ingredients</a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <span className="text-primary font-bold uppercase tracking-widest text-xs">Admin Panel</span>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mt-1">Manage Ingredients</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchIngredients} className="bg-white border border-gray-200 px-5 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all">
              Refresh
            </button>
            <button onClick={() => openModal()} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-secondary transition-all">
              + Add Ingredient
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
                    <th className="p-4 font-bold">ID</th>
                    <th className="p-4 font-bold">Name</th>
                    <th className="p-4 font-bold">Description</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-text-muted">
                        No ingredients found.
                      </td>
                    </tr>
                  ) : (
                    ingredients.map((ingredient) => (
                      <tr key={ingredient.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm text-text-muted">{ingredient.id}</td>
                        <td className="p-4 text-sm font-bold text-primary">{ingredient.name}</td>
                        <td className="p-4 text-sm text-text-muted max-w-xs truncate">{ingredient.description || '-'}</td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            onClick={() => openModal(ingredient)}
                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-bold transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(ingredient.id)}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-2xl font-bold text-primary mb-6">
              {editingId ? 'Edit Ingredient' : 'Add New Ingredient'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Ingredient Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  required
                  placeholder="e.g. Salicylic Acid"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow min-h-[100px]"
                  placeholder="Brief description of its function..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-bold text-text-muted hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminIngredientsPage() {
  return (
    <AuthGuard requireRole="admin">
      <AdminIngredientsContent />
    </AuthGuard>
  );
}
