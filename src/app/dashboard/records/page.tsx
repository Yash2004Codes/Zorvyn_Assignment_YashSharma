'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash, Edit2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Record {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes: string | null;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState<number | null>(null);
  const { user } = useAuth();

  // Filter State
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    date: '',
  });
  
  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.date) params.append('date', filters.date);

      const res = await api.get(`/records?${params.toString()}`);
      setRecords(res.data.records || []);
    } catch (err: any) {
      toast.error('Failed to parse financial records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };
      
      if (isEditing && activeRecordId) {
        await api.patch(`/records/${activeRecordId}`, payload);
        toast.success('Record updated successfully');
      } else {
        await api.post('/records', payload);
        toast.success('Record added successfully');
      }
      
      setIsModalOpen(false);
      setIsEditing(false);
      setActiveRecordId(null);
      setFormData({ ...formData, amount: '', category: '', notes: '' }); // reset
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete transaction.');
    }
  };

  const handleEdit = (record: Record) => {
    setIsEditing(true);
    setActiveRecordId(record.id);
    setFormData({
      amount: record.amount.toString(),
      type: record.type,
      category: record.category,
      date: record.date,
      notes: record.notes || '',
    });
    setIsModalOpen(true);
  };

  const confirmDelete = (id: number) => {
    setRecordToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
      await api.delete(`/records/${recordToDelete}`);
      toast.success('Record deleted.');
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete record.');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Transactions</h1>
          <p className="text-gray-500 mt-1">Review and filter your financial history</p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex flex-shrink-0 items-center justify-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Add Transaction</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label>
          <select 
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-700"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
          <input 
            type="text"
            placeholder="Search category..."
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Search Date</label>
          <input 
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-[9px] text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No transactions found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 font-medium text-gray-600">Date</th>
                  <th className="py-4 px-6 font-medium text-gray-600">Type</th>
                  <th className="py-4 px-6 font-medium text-gray-600">Category</th>
                  <th className="py-4 px-6 font-medium text-gray-600">Amount</th>
                  <th className="py-4 px-6 font-medium text-gray-600 truncate">Notes</th>
                  {isAdmin && <th className="py-4 px-6 font-medium text-gray-600 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-gray-700 whitespace-nowrap">{record.date}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        record.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-medium capitalize">{record.category}</td>
                    <td className={`py-4 px-6 font-medium whitespace-nowrap ${
                      record.type === 'income' ? 'text-emerald-600' : 'text-gray-900'
                    }`}>
                      {record.type === 'income' ? '+' : '-'}${Number(record.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-gray-500 max-w-xs truncate">{record.notes || '-'}</td>
                    {isAdmin && (
                      <td className="py-4 px-6 text-right space-x-2">
                        <button 
                          onClick={() => handleEdit(record)} 
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Transaction"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(record.id)} 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden scale-in-center">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button onClick={() => { setIsModalOpen(false); setIsEditing(false); }} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Groceries, Salary, Rent"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  rows={2}
                  placeholder="Additional details..."
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setIsEditing(false); }}
                  className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm shadow-indigo-100"
                >
                  {isEditing ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden p-8 text-center scale-in-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              This will permanently delete this transaction from your records. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                No, Keep it
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 px-4 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-semibold shadow-lg shadow-rose-100"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
