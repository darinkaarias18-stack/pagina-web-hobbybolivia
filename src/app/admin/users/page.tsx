'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Key,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Lock,
  UserCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import type { User, UserRole } from '@/lib/types';

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');

  // Create User Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit / Change Password Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      if (res.status === 403) {
        // Not superadmin
        router.replace('/admin/items');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = (localStorage.getItem('hb_user_role') as UserRole) || 'ADMIN';
    setCurrentRole(role);

    if (role !== 'SUPERADMIN') {
      router.replace('/admin/items');
      return;
    }

    loadUsers();
  }, [router]);

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) {
      setCreateError('Todos los campos son obligatorios');
      return;
    }

    setCreateSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          username: newUsername.trim(),
          password: newPassword.trim(),
          role: 'ADMIN'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al crear usuario');
      }

      setIsCreateOpen(false);
      setNewName('');
      setNewUsername('');
      setNewPassword('');
      showToast(`Usuario "${data.data.username}" creado exitosamente.`);
      loadUsers();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setCreateSaving(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPassword('');
    setEditIsActive(user.isActive !== false);
    setEditError('');
  };

  // Handle Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');

    setEditSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: editName.trim(),
        isActive: editIsActive
      };

      if (editPassword.trim().length > 0) {
        payload.password = editPassword.trim();
      }

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al actualizar usuario');
      }

      setEditingUser(null);
      showToast(`Usuario "${editingUser.username}" actualizado con éxito.`);
      loadUsers();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setEditSaving(false);
    }
  };

  // Toggle quick active status
  const handleToggleActive = async (user: User) => {
    if (user.username === 'superadmin') {
      alert('La cuenta principal SUPERADMIN no puede ser desactivada.');
      return;
    }

    const nextState = !user.isActive;
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState })
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: nextState } : u))
        );
        showToast(
          nextState
            ? `Usuario "${user.username}" activado.`
            : `Usuario "${user.username}" desactivado.`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Usuario "${userToDelete.username}" eliminado con éxito.`);
        setUserToDelete(null);
        loadUsers();
      } else {
        alert(data.error || 'No se pudo eliminar el usuario.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al eliminar usuario.');
    } finally {
      setDeleting(false);
    }
  };

  if (currentRole !== 'SUPERADMIN') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10202f] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-[#f2b705] animate-fade-in">
          <Check className="w-4 h-4 text-[#f2b705]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dcd5c4]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#f2b705] text-[#10202f] uppercase tracking-wider">
              Exclusivo Superadmin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10202f] tracking-tight">
            Usuarios / Accesos al Panel
          </h1>
          <p className="text-xs text-[#6b7480] mt-0.5">
            Crea cuentas de Administrador (`ADMIN`), administra accesos y actualiza contraseñas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreateError('');
            setIsCreateOpen(true);
          }}
          className="px-5 py-2.5 rounded-full bg-[#10202f] hover:bg-[#1b3248] text-[#f2b705] font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-[#f2b705]" />
          <span>Nuevo Usuario Admin</span>
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#dcd5c4] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f2b705]/20 text-[#10202f] flex items-center justify-center font-bold">
            <Users className="w-5 h-5 text-[#10202f]" />
          </div>
          <div>
            <span className="text-[11px] text-[#6b7480] font-semibold block">Total Cuentas</span>
            <span className="text-xl font-extrabold text-[#10202f] font-mono">{users.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#dcd5c4] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#6b7480] font-semibold block">Usuarios Activos</span>
            <span className="text-xl font-extrabold text-emerald-700 font-mono">
              {users.filter((u) => u.isActive !== false).length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#dcd5c4] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#10202f] text-[#f2b705] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#6b7480] font-semibold block">Cuenta Maestra</span>
            <span className="text-xs font-mono font-bold text-[#10202f] truncate block">
              superadmin (Rol SUPERADMIN)
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#dcd5c4] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[#10202f] uppercase tracking-wide">
            Cuentas Registradas
          </h2>
          <span className="text-xs text-[#6b7480] font-mono">
            {users.length} usuario{users.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#10202f]" />
            <span>Cargando lista de usuarios...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No hay usuarios registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Usuario (Login)</th>
                  <th className="py-3 px-4">Nombre Completo</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isMaster = u.username.toLowerCase() === 'superadmin';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          {isMaster ? (
                            <ShieldCheck className="w-4 h-4 text-[#f2b705]" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-blue-600" />
                          )}
                          <span>{u.username}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {u.name}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                            u.role === 'SUPERADMIN'
                              ? 'bg-[#10202f] text-[#f2b705]'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          disabled={isMaster}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            isMaster
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 opacity-90 cursor-default'
                              : u.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer'
                          }`}
                          title={isMaster ? 'Cuenta maestra activa permanente' : 'Alternar estado activo/desactivado'}
                        >
                          {u.isActive !== false ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{u.isActive !== false ? 'Activo' : 'Desactivado'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-[#10202f] hover:bg-[#10202f] hover:text-[#f2b705] text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                            title="Cambiar contraseña o nombre"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          {!isMaster && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: CREAR NUEVO USUARIO ADMIN
      ======================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#10202f] text-[#f2b705] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-[#10202f]">
                  Crear Nuevo Administrador
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-800 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo*</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Roberto Morales"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-[#10202f] focus:ring-1 focus:ring-[#10202f]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre de Usuario (Login)*</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  placeholder="Ej. rmorales"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono outline-none focus:border-[#10202f] focus:ring-1 focus:ring-[#10202f]"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Sin espacios ni acentos (letras, números, punto o guion).
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contraseña de Acceso*</label>
                <div className="relative">
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Contraseña segura"
                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg font-mono outline-none focus:border-[#10202f] focus:ring-1 focus:ring-[#10202f]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showCreatePassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showCreatePassword ? <EyeOff className="w-4 h-4 text-slate-700" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rol de Permisos</label>
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-extrabold text-[10px]">
                    ADMIN
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Podrá gestionar productos, fotos PNG/JPG de hasta 3MB, categorías y pedidos.
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-full text-xs font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createSaving}
                  className="px-5 py-2.5 rounded-full bg-[#10202f] hover:bg-[#1b3248] text-[#f2b705] font-extrabold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {createSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{createSaving ? 'Creando...' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDITAR / CAMBIAR CONTRASEÑA
      ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#10202f] text-[#f2b705] flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#10202f]">
                    Modificar Usuario
                  </h3>
                  <span className="text-xs font-mono text-slate-500">
                    @{editingUser.username}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-800 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-[#10202f]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nueva Contraseña (Opcional)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Dejar en blanco para mantener la actual"
                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg font-mono outline-none focus:border-[#10202f]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showEditPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4 text-slate-700" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {editingUser.username !== 'superadmin' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estado de la Cuenta</label>
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#10202f] rounded"
                    />
                    <span className="text-xs text-slate-700 font-semibold">
                      Cuenta activa (permite iniciar sesión)
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-full text-xs font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2.5 rounded-full bg-[#10202f] hover:bg-[#1b3248] text-[#f2b705] font-extrabold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRMAR ELIMINACIÓN DE USUARIO
      ======================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#10202f]">
                  ¿Eliminar este usuario?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Estás a punto de eliminar la cuenta de <strong className="text-slate-900 font-bold">{userToDelete.name}</strong> (@{userToDelete.username}). Ya no podrá ingresar al panel administrativo.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-full hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-colors"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{deleting ? 'Eliminando...' : 'Sí, Eliminar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
