/**
 * User Management Page - Exclusively for Admin roles.
 * 
 * Features:
 * - List all system users with their current status and role.
 * - Dynamic Role Updating: Admins can promote/demote users (except master admin).
 * - Live Status Toggling: Activate or Deactivate user accounts in real-time.
 * - Protection: Prevents deactivating yourself or the master system admin.
 */
'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Shield, ShieldAlert, ShieldCheck, Trash, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'viewer' | 'analyst' | 'admin';
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  /**
   * Fetches the full list of users.
   * Only accessible if the logged-in user is an Admin (enforced on server).
   */
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (err: any) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Updates a user's active/inactive status.
   * Leverages the PATCH /api/users/:id endpoint.
   */
  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      await api.patch(`/users/${userId}`, { is_active: newStatus === 'active' });
      toast.success('User status updated');
      fetchUsers(); // Refresh the list to show updated status
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  /**
   * Updates a user's role (Admin, Analyst, Viewer).
   */
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      toast.success('User role updated');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user role');
    }
  };

  /**
   * Deactivates a user account (soft delete).
   */
  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deactivated');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate user');
    }
  };

  /**
   * Returns a specific icon based on the user's role.
   */
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'analyst': return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  // Frontend guard: Redirect or show access denied if somehow non-admin accesses this route.
  if (currentUser?.role !== 'admin') {
    return <div className="p-10 text-center text-red-500">Access Denied. Admins only.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Title Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
        <p className="text-gray-500 mt-1">Manage system users and their access levels.</p>
      </div>

      {/* Main Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 font-medium text-gray-600">Name</th>
                  <th className="py-4 px-6 font-medium text-gray-600">Email</th>
                  <th className="py-4 px-6 font-medium text-gray-600">Status</th>
                  <th className="py-4 px-6 font-medium text-gray-600">Role</th>
                  <th className="py-4 px-6 font-medium text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{user.name}</td>
                    <td className="py-4 px-6 text-gray-500">{user.email}</td>
                    
                    {/* Status Toggle Column */}
                    <td className="py-4 px-6">
                      <select
                        value={user.is_active ? 'active' : 'deactivated'}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        // Protection: Cannot deactivate master accounts or yourself
                        disabled={
                          user.email === 'admin@finance.com' ||
                          user.email === 'test1@finance.com' ||
                          user.id === currentUser?.id
                        }
                        className={`text-sm rounded outline-none focus:ring-0 cursor-pointer disabled:opacity-50 font-medium px-2 py-1 ${
                          user.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <option value="active" className="bg-white text-gray-900">Active</option>
                        <option value="deactivated" className="bg-white text-gray-900">Deactivated</option>
                      </select>
                    </td>

                    {/* Role Selection Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          // Protection: Cannot change own role or master admin's role
                          disabled={
                            user.email === 'admin@finance.com' ||
                            user.id === currentUser?.id
                          }
                          className="text-sm bg-transparent border-gray-200 rounded outline-none focus:ring-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed capitalize font-medium text-gray-700"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="analyst">Analyst</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>

                    {/* Action Column (Soft Delete/Deactivate) */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <button 
                        onClick={() => handleDelete(user.id)}
                        disabled={
                          user.email === 'admin@finance.com' || 
                          user.email === 'test1@finance.com' ||
                          user.id === currentUser?.id
                        }
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                        title="Deactivate User"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
