import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CompanyLogo {
  id: string;
  name: string;
  logo_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

const CompanyLogosManager = () => {
  const [logos, setLogos] = useState<CompanyLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLogo, setEditingLogo] = useState<CompanyLogo | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    order_index: 0,
    is_active: true
  });

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const { data, error } = await supabase
        .from('company_logos')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setLogos(data || []);
    } catch (error) {
      console.error('Error fetching company logos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLogo) {
        const { error } = await supabase
          .from('company_logos')
          .update(formData)
          .eq('id', editingLogo.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_logos')
          .insert([formData]);
        
        if (error) throw error;
      }

      await fetchLogos();
      resetForm();
    } catch (error) {
      console.error('Error saving company logo:', error);
      alert('Error saving company logo. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this logo?')) return;

    try {
      const { error } = await supabase
        .from('company_logos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchLogos();
    } catch (error) {
      console.error('Error deleting company logo:', error);
      alert('Error deleting company logo. Please try again.');
    }
  };

  const toggleActive = async (logo: CompanyLogo) => {
    try {
      const { error } = await supabase
        .from('company_logos')
        .update({ is_active: !logo.is_active })
        .eq('id', logo.id);

      if (error) throw error;
      await fetchLogos();
    } catch (error) {
      console.error('Error updating logo status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      order_index: 0,
      is_active: true
    });
    setEditingLogo(null);
    setShowForm(false);
  };

  const startEdit = (logo: CompanyLogo) => {
    setFormData({
      name: logo.name,
      logo_url: logo.logo_url,
      order_index: logo.order_index,
      is_active: logo.is_active
    });
    setEditingLogo(logo);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Company Logos Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-400 text-black px-4 py-2 rounded-md font-medium hover:bg-yellow-500 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Logo</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-serif font-bold mb-6">
              {editingLogo ? 'Edit Company Logo' : 'Add New Company Logo'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Index</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 text-black px-4 py-2 rounded-md font-medium hover:bg-yellow-500"
                >
                  {editingLogo ? 'Update' : 'Create'} Logo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logos.map((logo) => (
          <div key={logo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-32 bg-gray-50 flex items-center justify-center p-4">
              <img
                src={logo.logo_url}
                alt={logo.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{logo.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  logo.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {logo.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Order: {logo.order_index}</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => toggleActive(logo)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  {logo.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => startEdit(logo)}
                  className="text-yellow-600 hover:text-yellow-900"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(logo.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyLogosManager;