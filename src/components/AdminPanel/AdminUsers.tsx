import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Ban, 
  CheckCircle, 
  Search, 
  UserX, 
  UserPlus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Sparkles,
  Shield,
  Crown,
  Key,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

import { UserRecord } from '../../types';

export const AdminUsers: React.FC = () => {
  const { 
    allUsers, 
    addUser, 
    updateUser, 
    deleteUser, 
    toggleBanUser, 
    resetUsersData 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'admin' | 'user'>('All');

  const [resetSuccess, setResetSuccess] = useState(false);

  // Modal States
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Omit<UserRecord, 'uid' | 'regDate'>>({
    username: '',
    email: '',
    role: 'user',
    plan: 'Free Tier',
    status: 'Active'
  });

  const handleResetUsersData = () => {
    resetUsersData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleDeleteAllNonAdmins = () => {
    const nonAdmins = allUsers.filter(u => u.role !== 'admin');
    nonAdmins.forEach(u => deleteUser(u.uid));
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  // Filter users
  const filtered = allUsers.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handlers
  const handleToggleBan = (uid: string) => {
    toggleBanUser(uid);
  };

  const handleDeleteUser = (uid: string) => {
    deleteUser(uid);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(editingUser.uid, editingUser);
    setEditingUser(null);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email) return;

    addUser(newUser);
    setIsAddModalOpen(false);
    setNewUser({
      username: '',
      email: '',
      role: 'user',
      plan: 'Free Tier',
      status: 'Active'
    });
  };

  return (
    <div className="space-y-6 text-left max-w-6xl animate-in fade-in pb-12">
      
      {resetSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> User Management Data Reset Successfully! Clean accounts restored.
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500">
              <Users className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-white font-display tracking-wide">
                User Management & Access Controls
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                View registered users, active VIP subscriptions, edit roles, and manage access rights.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleDeleteAllNonAdmins}
            className="px-4 py-2.5 rounded-2xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            title="Delete all standard user mail IDs, keeping only Admins"
          >
            <Trash2 className="w-4 h-4 text-red-400" /> Delete Non-Admin Mail IDs
          </button>

          <button 
            onClick={handleResetUsersData}
            className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            title="Reset User Management data to clean default admin accounts"
          >
            <RotateCcw className="w-4 h-4" /> Reset User Data
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Add New User
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search email or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-red-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-zinc-400">Role Filter:</span>
          {(['All', 'admin', 'user'] as const).map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === role 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {role === 'All' ? 'All Roles' : role === 'admin' ? 'Admins' : 'Users'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] font-extrabold border-b border-zinc-800 tracking-wider">
              <tr>
                <th className="p-4">User Details</th>
                <th className="p-4">Role</th>
                <th className="p-4">Subscription Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 font-bold">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.uid} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-white text-sm flex items-center gap-2">
                        {u.username}
                        {u.role === 'admin' && <Shield className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{u.email}</div>
                    </td>

                    <td className="p-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 font-bold text-[10px] uppercase tracking-wider">
                          <Crown className="w-3 h-3 text-red-400" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-[10px] uppercase tracking-wider">
                          User
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="font-extrabold text-amber-400 flex items-center gap-1 text-xs">
                        {u.plan}
                      </span>
                    </td>

                    <td className="p-4">
                      {u.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : u.status === 'Banned' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-400 font-bold text-[10px] uppercase tracking-wider">
                          <Ban className="w-3 h-3" /> Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-mono text-[11px] text-zinc-400">{u.regDate}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingUser(u)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-sky-400" /> Edit
                        </button>

                        <button 
                          onClick={() => handleToggleBan(u.uid)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                            u.status === 'Banned' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30' 
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                          }`}
                        >
                          {u.status === 'Banned' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          {u.status === 'Banned' ? 'Unban' : 'Ban'}
                        </button>

                        <button 
                          onClick={() => handleDeleteUser(u.uid)}
                          className="p-1.5 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600/20 text-red-500">
                  <Edit2 className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-black text-white font-display">Edit User Settings</h3>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Username</label>
                <input 
                  type="text" 
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-2xl font-bold focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-2xl font-mono focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">User Role</label>
                  <select 
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'admin' | 'user' })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-2xl font-bold focus:border-red-500 outline-none"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Account Status</label>
                  <select 
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'Active' | 'Banned' | 'Inactive' })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-2xl font-bold focus:border-red-500 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Banned">Banned / Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Subscription Plan</label>
                <select 
                  value={editingUser.plan}
                  onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 text-amber-400 p-3 rounded-2xl font-bold focus:border-red-500 outline-none"
                >
                  <option value="Diamond Admin VIP">Diamond Admin VIP</option>
                  <option value="Gold Plan (90 Days)">Gold Plan (90 Days)</option>
                  <option value="Silver Plan (30 Days)">Silver Plan (30 Days)</option>
                  <option value="Free Tier">Free Tier</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black flex items-center gap-2 shadow-lg shadow-red-600/30"
                >
                  <Save className="w-4 h-4" /> Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600/20 text-red-500">
                  <UserPlus className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-black text-white font-display">Create New User Account</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. JohnMovieFan"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-2xl font-bold focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-2xl font-mono focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Assign Role</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-2xl font-bold focus:border-red-500 outline-none"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Initial Subscription</label>
                  <select 
                    value={newUser.plan}
                    onChange={(e) => setNewUser({ ...newUser, plan: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-amber-400 p-3 rounded-2xl font-bold focus:border-red-500 outline-none"
                  >
                    <option value="Free Tier">Free Tier</option>
                    <option value="Silver Plan (30 Days)">Silver Plan (30 Days)</option>
                    <option value="Gold Plan (90 Days)">Gold Plan (90 Days)</option>
                    <option value="Diamond Admin VIP">Diamond Admin VIP</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black flex items-center gap-2 shadow-lg shadow-red-600/30"
                >
                  <UserPlus className="w-4 h-4" /> Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
