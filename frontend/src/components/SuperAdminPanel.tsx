import React, { useState } from 'react';
import { UserPlus, Users, Edit3, CheckCircle, XCircle, Shield, Key, User } from 'lucide-react';
import { useAuth, AdminAccount } from '../context/AuthContext';

export const SuperAdminPanel: React.FC = () => {
  const { admins, addAdmin, updateAdmin } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Form states for Add Admin
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addError, setAddError] = useState('');

  // Editing state for Manage Admins
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUsername.trim() || !newPassword.trim()) {
      setAddError('Both username and password are required.');
      return;
    }

    // Check if username already exists
    const exists = admins.some(a => a.username.toLowerCase() === newUsername.trim().toLowerCase());
    if (exists) {
      setAddError('Username already exists. Please choose a different username.');
      return;
    }

    await addAdmin(newUsername.trim(), newPassword.trim());
    setNewUsername('');
    setNewPassword('');
    setAddError('');
    setIsAddModalOpen(false);
  };

  const startEdit = (admin: AdminAccount) => {
    setEditingAdminId(admin.id);
    setEditUsername(admin.username);
    setEditPassword('');
  };

  const saveEdit = async (admin: AdminAccount) => {
    if (!editUsername.trim()) return;
    await updateAdmin(admin.id, editUsername.trim(), editPassword.trim() || undefined, admin.status);
    setEditingAdminId(null);
  };

  const toggleStatus = async (admin: AdminAccount) => {
    const nextStatus = admin.status === 'active' ? 'deactivated' : 'active';
    await updateAdmin(admin.id, admin.username, undefined, nextStatus);
  };


  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-center">
      
      {/* Super Admin Welcome Banner */}
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-3xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,23,42,0.05)] mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1B365D] to-[#2563EB] text-white flex items-center justify-center shadow-md">
          <Shield className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#0F172A] tracking-tight">
          SUPER ADMIN CONTROL PANEL
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-[#64748B] mt-2 max-w-md mx-auto">
          Manage system tenants, create new admin credentials, and toggle account access statuses.
        </p>
      </div>

      {/* ONLY TWO MAIN ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        
        {/* Button 1: + Add New Admin */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#2563EB] hover:bg-[#1d4ed8] border-2 border-[#2563EB] text-[#FFFFFF] flex flex-col items-center justify-center p-8 rounded-3xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 text-center group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <span className="text-xl font-black font-heading tracking-wide">
            + Add New Admin
          </span>
          <span className="text-xs opacity-90 mt-1 font-semibold">
            Create new tenant credentials (Username & Password)
          </span>
        </button>

        {/* Button 2: Manage Admins */}
        <button
          onClick={() => setIsManageModalOpen(true)}
          className="bg-[#D4E5EC] hover:bg-[#cbd5e1] border-2 border-[#BCCED7] text-[#0F172A] flex flex-col items-center justify-center p-8 rounded-3xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 text-center group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-8 h-8 text-[#2563EB]" />
          </div>
          <span className="text-xl font-black font-heading tracking-wide text-[#0F172A]">
            Manage Admins
          </span>
          <span className="text-xs text-[#64748B] mt-1 font-semibold">
            View admins, edit credentials & toggle Active/Deactivated
          </span>
        </button>

      </div>

      {/* MODAL 1: Add New Admin */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-fadeIn text-left">
          <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-2xl max-w-lg w-full p-7 sm:p-8 shadow-2xl relative text-[#0F172A]">
            
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#BCCED7] pb-4 mb-6">
              <div className="p-3 bg-[#E2E8F0] text-[#2563EB] rounded-2xl border border-[#94A3B8]">
                <UserPlus className="w-7 h-7 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="text-2xl font-black font-heading text-[#0F172A]">Register New Admin</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-0.5">Create login credentials for a new admin</p>
              </div>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#475569] mb-1.5">
                  Username (Will display as "Welcome, Mr. [Username]")
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-3.5 text-[#64748B]" />
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value);
                      setAddError('');
                    }}
                    placeholder="e.g. satish"
                    autoFocus
                    className="w-full pl-11 pr-4 py-3 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-base font-bold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#475569] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-5 h-5 absolute left-3.5 top-3.5 text-[#64748B]" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setAddError('');
                    }}
                    placeholder="Enter password"
                    className="w-full pl-11 pr-4 py-3 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-base font-bold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {addError && (
                <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs font-bold text-[#B91C1C]">
                  {addError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-black text-base rounded-xl shadow-md transition-all mt-2 cursor-pointer"
              >
                Create Admin Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manage Admins (Enlarged Modal & Larger Item Cards) */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0F172A]/50 backdrop-blur-xs animate-fadeIn text-left">
          {/* Expanded Modal Width: max-w-3xl (768px wide) */}
          <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[88vh] flex flex-col text-[#0F172A]">
            
            {/* Close Button */}
            <button
              onClick={() => setIsManageModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#E2E8F0] transition-colors"
            >
              <XCircle className="w-7 h-7" />
            </button>

            {/* Header Title */}
            <div className="flex items-center gap-3.5 border-b border-[#BCCED7] pb-5 mb-6">
              <div className="p-3 bg-[#E2E8F0] text-[#2563EB] rounded-2xl border border-[#94A3B8]">
                <Users className="w-7 h-7 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black font-heading text-[#0F172A] tracking-tight">
                  Manage Admin Accounts
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] font-bold mt-0.5">
                  Edit credentials or toggle accounts between Active and Deactivated
                </p>
              </div>
            </div>

            {/* Admin Cards List with Increased Size */}
            <div className="flex-1 overflow-y-auto pr-1.5 space-y-4">
              {admins.map((admin) => {
                const isEditing = editingAdminId === admin.id;
                const isActive = admin.status === 'active';

                return (
                  <div
                    key={admin.id}
                    className={`p-5 sm:p-6 bg-[#F8FAFC] border-2 border-[#CBD5E1] rounded-2xl transition-all shadow-xs ${
                      isEditing ? 'ring-2 ring-[#2563EB] bg-[#FFFFFF]' : ''
                    }`}
                  >
                    {isEditing ? (
                      /* Spacious Edit Form */
                      <div className="space-y-4 w-full">
                        <div className="text-sm font-black text-[#2563EB] uppercase tracking-wider border-b border-[#CBD5E1] pb-2">
                          Editing Account: {admin.username}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
                              Username
                            </label>
                            <input
                              type="text"
                              value={editUsername}
                              onChange={(e) => setEditUsername(e.target.value)}
                              className="w-full px-4 py-3 bg-[#FFFFFF] border-2 border-[#94A3B8] rounded-xl text-base font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                              placeholder="Enter username"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
                              Password
                            </label>
                            <input
                              type="text"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              className="w-full px-4 py-3 bg-[#FFFFFF] border-2 border-[#94A3B8] rounded-xl text-base font-black text-[#0F172A] font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                              placeholder="Leave blank to keep current password"
                            />

                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => saveEdit(admin)}
                            className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingAdminId(null)}
                            className="px-4 py-2.5 bg-[#E2E8F0] hover:bg-[#cbd5e1] text-[#1E293B] font-bold text-sm rounded-xl border border-[#94A3B8] transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Row Card (Large Visible Fonts) */
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        
                        <div className="space-y-1.5">
                          {/* Username Line */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-base sm:text-lg font-black text-[#0F172A]">
                              Username: <strong className="text-[#2563EB] font-black text-lg sm:text-xl ml-1">{admin.username}</strong>
                            </span>
                            
                            {/* Active / Deactivated Pill Badge */}
                            <span className={`px-3 py-1 text-xs font-black rounded-lg uppercase border-2 tracking-wider ${
                              isActive
                                ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                                : 'bg-[#FEE2E2] border-[#FCA5A5] text-[#B91C1C]'
                            }`}>
                              {admin.status}
                            </span>
                          </div>

                          {/* Password Line */}
                          <div className="text-sm sm:text-base font-bold text-[#334155]">
                            Password: <span className="text-[#0F172A] font-black font-mono tracking-wider ml-1">{admin.password}</span>
                          </div>
                        </div>

                        {/* Action Buttons: Edit & Deactivate */}
                        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                          {/* Edit Button */}
                          <button
                            onClick={() => startEdit(admin)}
                            className="px-4 py-2.5 bg-[#E2E8F0] hover:bg-[#cbd5e1] text-[#1E293B] border-2 border-[#94A3B8] rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            <Edit3 className="w-4 h-4 text-[#2563EB]" />
                            <span>Edit</span>
                          </button>

                          {/* Status Toggle Button (Activate / Deactivate) */}
                          <button
                            onClick={() => toggleStatus(admin)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer border-2 ${
                              isActive
                                ? 'bg-[#FEE2E2] hover:bg-[#fca5a5] border-[#FCA5A5] text-[#B91C1C]'
                                : 'bg-[#DCFCE7] hover:bg-[#86efac] border-[#86EFAC] text-[#15803D]'
                            }`}
                          >
                            {isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
