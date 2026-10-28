'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Key,
  Trash2,
  Edit2,
  Check,
  Loader2,
  AlertTriangle,
  UserCheck,
  Eye,
  EyeOff,
  Search,
  Crown,
  CheckCircle2
} from 'lucide-react';
import type { User, UserRole } from '@/lib/types';

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPERADMIN' | 'ADMIN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Create User Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('ADMIN');
  const [newIsActive, setNewIsActive] = useState(true);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('ADMIN');
  const [editIsActive, setEditIsActive] = useState(true);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      if (res.status === 401) {
        router.replace('/login?redirect=/admin/users');
        return;
      }
      if (res.status === 403) {
        router.replace('/admin');
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        showToast(data.error || 'Error al obtener usuarios', 'error');
      }
    } catch (e) {
      console.error('Error fetching users:', e);
      showToast('Error de red al consultar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const role = localStorage.getItem('hb_user_role');
    if (role && role !== 'SUPERADMIN') {
      router.replace('/admin');
      return;
    }
    loadUsers();
  }, [loadUsers, router]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        u.name?.toLowerCase().includes(query) ||
        u.username?.toLowerCase().includes(query) ||
        (u.email && u.email.toLowerCase().includes(query));

      const matchRole =
        roleFilter === 'ALL' ? true : u.role === roleFilter;

      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ACTIVE'
          ? u.isActive !== false
          : u.isActive === false;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const superadmins = users.filter((u) => u.role === 'SUPERADMIN').length;
    const admins = users.filter((u) => u.role === 'ADMIN').length;
    const active = users.filter((u) => u.isActive !== false).length;
    return { total, superadmins, admins, active };
  }, [users]);

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) {
      setCreateError('Nombre, usuario y contraseña son campos obligatorios.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setCreateError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCreateSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          username: newUsername.trim().toLowerCase(),
          email: newEmail.trim() || `${newUsername.trim().toLowerCase()}@hobbybolivia.com`,
          password: newPassword.trim(),
          role: newRole,
          isActive: newIsActive
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al crear usuario');
      }

      setIsCreateOpen(false);
      setNewName('');
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('ADMIN');
      setNewIsActive(true);
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
    setEditName(user.name || '');
    setEditUsername(user.username || '');
    setEditEmail(user.email || '');
    setEditPassword('');
    setEditRole(user.role || 'ADMIN');
    setEditIsActive(user.isActive !== false);
    setEditError('');
  };

  // Handle Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');

    if (!editName.trim()) {
      setEditError('El nombre completo es requerido.');
      return;
    }

    if (editPassword.trim() && editPassword.trim().length < 6) {
      setEditError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setEditSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: editName.trim(),
        username: editUsername.trim().toLowerCase(),
        email: editEmail.trim(),
        role: editRole,
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

  // Toggle active status
  const handleToggleActive = async (user: User) => {
    const isMaster =
      user.id === 1 ||
      user.username.toLowerCase() === 'darinka.arias18@gmail.com' ||
      (user.role === 'SUPERADMIN' && stats.superadmins <= 1);

    if (isMaster && user.isActive) {
      showToast('La cuenta Superadmin principal no puede ser desactivada.', 'error');
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
            ? `Usuario "${user.username}" activado con éxito.`
            : `Usuario "${user.username}" desactivado.`
        );
      } else {
        const data = await res.json();
        showToast(data.error || 'No se pudo cambiar el estado', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error de conexión al actualizar estado', 'error');
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Usuario "${userToDelete.username}" eliminado con éxito.`);
        setUserToDelete(null);
        loadUsers();
      } else {
        setDeleteError(data.error || 'No se pudo eliminar el usuario.');
      }
    } catch (e) {
      console.error(e);
      setDeleteError('Error de red al comunicarse con el servidor.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 border ${
            toast.type === 'success'
              ? 'bg-[#161311] text-[#FAF8F5] border-[#D4A359]'
              : 'bg-rose-950 text-white border-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#D4A359]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD3]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D4A359] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#D4A359]">
              Control de Accesos & Seguridad · Hobby Bolivia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
            Gestión de Usuarios
          </h1>
          <p className="text-xs text-[#5C5650] mt-1 max-w-2xl leading-relaxed">
            Administra las cuentas de administradores, asigna roles y gestiona credenciales de acceso seguro al panel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-white text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs transition-colors"
          >
            <span>Volver al Dashboard</span>
          </Link>

          {/* Primary Action Button: "Crear Nuevo Usuario" */}
          <button
            type="button"
            onClick={() => {
              setCreateError('');
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4A359] to-[#C69755] hover:from-[#C69755] hover:to-[#B8863A] text-[#161311] font-black text-xs uppercase tracking-wider shadow-md shadow-[#D4A359]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#161311]" />
            <span>Crear Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards (Warm Tech Aesthetic) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Usuarios (Dark Charcoal Hero Card) */}
        <div className="bg-[#161311] text-[#FAF8F5] p-5 rounded-3xl border border-[#2D2622] shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#A89F91] font-bold uppercase tracking-wider block mb-1">
              Total Registrados
            </span>
            <span className="text-3xl font-black text-[#D4A359] font-mono tracking-tight">
              {stats.total}
            </span>
            <span className="text-[10px] text-[#8C827A] block mt-0.5">
              Cuentas en base de datos
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#D4A359]/15 border border-[#D4A359]/30 text-[#D4A359] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#D4A359]" />
          </div>
        </div>

        {/* Card 2: Superadmins */}
        <div className="bg-white p-5 rounded-3xl border border-[#E2DCD3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#8C827A] font-bold uppercase tracking-wider block mb-1">
              Superadmins
            </span>
            <span className="text-3xl font-black text-[#B8863A] font-mono tracking-tight">
              {stats.superadmins}
            </span>
            <span className="text-[10px] text-[#8C827A] block mt-0.5">
              Acceso maestro total
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#D4A359]/20 border border-[#D4A359]/40 text-[#B8863A] flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6 text-[#B8863A]" />
          </div>
        </div>

        {/* Card 3: Administradores */}
        <div className="bg-white p-5 rounded-3xl border border-[#E2DCD3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#8C827A] font-bold uppercase tracking-wider block mb-1">
              Admins Estándar
            </span>
            <span className="text-3xl font-black text-[#1A1817] font-mono tracking-tight">
              {stats.admins}
            </span>
            <span className="text-[10px] text-[#8C827A] block mt-0.5">
              Catálogo & Cotizaciones
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] text-[#F85606] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#F85606]" />
          </div>
        </div>

        {/* Card 4: Cuentas Activas */}
        <div className="bg-white p-5 rounded-3xl border border-[#E2DCD3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#8C827A] font-bold uppercase tracking-wider block mb-1">
              Cuentas Activas
            </span>
            <span className="text-3xl font-black text-[#3E7B44] font-mono tracking-tight">
              {stats.active}
            </span>
            <span className="text-[10px] text-[#3E7B44] block mt-0.5 font-bold">
              Sesiones habilitadas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#3E7B44]/15 border border-[#3E7B44]/30 text-[#3E7B44] flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6 text-[#3E7B44]" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-[#E2DCD3] p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, usuario o email..."
            className="w-full pl-10 pr-8 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-semibold text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all placeholder:text-[#A89F91]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-[#8C827A] hover:text-[#1A1817] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-bold text-[#1A1817] focus:border-[#D4A359] outline-none cursor-pointer"
          >
            <option value="ALL">Todos los Roles</option>
            <option value="SUPERADMIN">Solo Superadmins</option>
            <option value="ADMIN">Solo Administradores</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-bold text-[#1A1817] focus:border-[#D4A359] outline-none cursor-pointer"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVE">Solo Activos</option>
            <option value="INACTIVE">Solo Inactivos</option>
          </select>
        </div>
      </div>

      {/* Users Table Card (Fits 100% on screen, NO horizontal scroll) */}
      <div className="bg-white rounded-3xl border border-[#E2DCD3] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E2DCD3] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D4A359]" />
            <h2 className="text-xs font-black text-[#1A1817] uppercase tracking-wider">
              Cuentas Registradas ({filteredUsers.length})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#8C827A]">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-[#8C827A] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4A359]" />
            <span className="font-semibold">Cargando directorio de administradores...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#8C827A] space-y-2">
            <p className="font-bold text-sm text-[#1A1817]">No se encontraron usuarios</p>
            <p className="text-[11px]">
              Intenta cambiar los términos de búsqueda o los filtros seleccionados.
            </p>
          </div>
        ) : (
          <table className="w-full table-fixed text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E2DCD3] text-[#8C827A] font-black uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-[28%]">Usuario & Credencial</th>
                <th className="py-3.5 px-4 w-[26%]">Nombre Completo</th>
                <th className="py-3.5 px-4 w-[16%]">Rol Asignado</th>
                <th className="py-3.5 px-4 w-[14%]">Estado</th>
                <th className="py-3.5 px-4 text-right w-[16%]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEAE2]">
              {filteredUsers.map((u) => {
                const isMaster =
                  u.id === 1 ||
                  u.username.toLowerCase() === 'darinka.arias18@gmail.com' ||
                  u.role === 'SUPERADMIN';

                // Initial Avatar letters
                const initials = (u.name || u.username)
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <tr key={u.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    {/* 1. Usuario & Credencial */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                            u.role === 'SUPERADMIN'
                              ? 'bg-[#161311] text-[#D4A359] border border-[#D4A359]/30 shadow-xs'
                              : 'bg-[#FAF8F5] text-[#1A1817] border border-[#E2DCD3]'
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono font-black text-[#1A1817] truncate flex items-center gap-1.5">
                            <span>{u.username}</span>
                            {isMaster && (
                              <span title="Superadmin Maestro" className="inline-flex items-center">
                                <Crown className="w-3.5 h-3.5 text-[#D4A359] shrink-0" />
                              </span>
                            )}
                          </div>
                          {u.email && (
                            <span className="text-[10px] text-[#8C827A] truncate block font-sans">
                              {u.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Nombre Completo */}
                    <td className="py-3.5 px-4 font-bold text-[#1A1817] truncate">
                      {u.name}
                    </td>

                    {/* 3. Rol Asignado */}
                    <td className="py-3.5 px-4">
                      {u.role === 'SUPERADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#161311] text-[#D4A359] border border-[#D4A359]/40 shadow-xs">
                          <Crown className="w-3 h-3 text-[#D4A359]" />
                          <span>Superadmin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FAF8F5] text-[#1A1817] border border-[#E2DCD3]">
                          <ShieldCheck className="w-3 h-3 text-[#F85606]" />
                          <span>Admin</span>
                        </span>
                      )}
                    </td>

                    {/* 4. Estado (Activo / Desactivado) */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(u)}
                        disabled={isMaster && u.isActive}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                          u.isActive !== false
                            ? 'bg-[#3E7B44]/15 text-[#3E7B44] border border-[#3E7B44]/30 hover:bg-[#3E7B44]/25 cursor-pointer'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer'
                        } ${isMaster && u.isActive ? 'opacity-90 cursor-default' : ''}`}
                        title={
                          isMaster && u.isActive
                            ? 'Cuenta maestra permanentemente activa'
                            : 'Clic para alternar estado'
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.isActive !== false ? 'bg-[#3E7B44] animate-pulse' : 'bg-rose-500'
                          }`}
                        />
                        <span>{u.isActive !== false ? 'Activo' : 'Inactivo'}</span>
                      </button>
                    </td>

                    {/* 5. Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="px-2.5 py-1.5 rounded-xl border border-[#E2DCD3] hover:border-[#161311] bg-white hover:bg-[#161311] text-[#1A1817] hover:text-[#D4A359] font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                          title="Editar usuario o contraseña"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>

                        {!isMaster && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError('');
                              setUserToDelete(u);
                            }}
                            className="p-1.5 rounded-xl border border-rose-200 hover:border-rose-400 bg-white hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
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
        )}
      </div>

      {/* ========================================================
          MODAL: CREAR NUEVO USUARIO
      ======================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white text-[#1A1817] rounded-3xl max-w-lg w-full shadow-2xl border border-[#E2DCD3] p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD3]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#161311] text-[#D4A359] flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1A1817]">
                    Crear Nuevo Usuario
                  </h3>
                  <span className="text-[11px] text-[#8C827A]">
                    Autoriza credenciales de acceso al panel de administración
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] text-[#8C827A] hover:text-[#1A1817] hover:bg-[#EFEAE2] flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#1A1817] block mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Roberto Morales"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-semibold text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1A1817] block mb-1">
                    Usuario (Login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) =>
                      setNewUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '')
                      )
                    }
                    placeholder="ej. rmorales"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-mono font-bold text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all"
                  />
                  <span className="text-[10px] text-[#8C827A] mt-0.5 block">
                    Solo minúsculas, números o punto.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-[#1A1817] block mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="rmorales@hobbybolivia.com"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-semibold text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1A1817] block mb-1">
                  Contraseña de Acceso *
                </label>
                <div className="relative">
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-mono text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-[#8C827A] hover:text-[#1A1817] transition-colors cursor-pointer"
                  >
                    {showCreatePassword ? (
                      <EyeOff className="w-4 h-4 text-[#1A1817]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#8C827A]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Rol Asignado */}
              <div>
                <label className="font-bold text-[#1A1817] block mb-1">
                  Rol de Privilegios
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setNewRole('ADMIN')}
                    className={`p-3 rounded-2xl border cursor-pointer flex flex-col gap-1 transition-all ${
                      newRole === 'ADMIN'
                        ? 'border-[#D4A359] bg-[#FAF8F5] shadow-xs'
                        : 'border-[#E2DCD3] bg-white opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[#1A1817]">ADMIN</span>
                      <ShieldCheck className="w-4 h-4 text-[#F85606]" />
                    </div>
                    <span className="text-[10px] text-[#5C5650] leading-tight">
                      Gestión de catálogo, productos y cotizaciones.
                    </span>
                  </label>

                  <label
                    onClick={() => setNewRole('SUPERADMIN')}
                    className={`p-3 rounded-2xl border cursor-pointer flex flex-col gap-1 transition-all ${
                      newRole === 'SUPERADMIN'
                        ? 'border-[#D4A359] bg-[#161311] text-[#FAF8F5] shadow-xs'
                        : 'border-[#E2DCD3] bg-white opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-black text-xs ${newRole === 'SUPERADMIN' ? 'text-[#D4A359]' : 'text-[#1A1817]'}`}>
                        SUPERADMIN
                      </span>
                      <Crown className={`w-4 h-4 ${newRole === 'SUPERADMIN' ? 'text-[#D4A359]' : 'text-[#8C827A]'}`} />
                    </div>
                    <span className={`text-[10px] leading-tight ${newRole === 'SUPERADMIN' ? 'text-[#A89F91]' : 'text-[#5C5650]'}`}>
                      Acceso total, usuarios y ajustes del sistema.
                    </span>
                  </label>
                </div>
              </div>

              {/* Estado Activo */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#D4A359] rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#1A1817]">
                    Cuenta activa inmediatamente al guardar
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E2DCD3] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 border border-[#E2DCD3] text-[#1A1817] hover:bg-[#FAF8F5] rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createSaving}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4A359] to-[#C69755] hover:from-[#C69755] hover:to-[#B8863A] text-[#161311] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {createSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{createSaving ? 'Creando...' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDITAR USUARIO / CAMBIAR CONTRASEÑA
      ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white text-[#1A1817] rounded-3xl max-w-lg w-full shadow-2xl border border-[#E2DCD3] p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD3]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#161311] text-[#D4A359] flex items-center justify-center shadow-xs">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1A1817]">
                    Editar Usuario
                  </h3>
                  <span className="text-[11px] font-mono text-[#8C827A]">
                    @{editingUser.username} · ID #{editingUser.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] text-[#8C827A] hover:text-[#1A1817] hover:bg-[#EFEAE2] flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#1A1817] block mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-semibold text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1A1817] block mb-1">
                    Nombre de Usuario (Login)
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) =>
                      setEditUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '')
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-mono font-bold text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A1817] block mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-semibold text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Cambiar contraseña */}
              <div>
                <label className="font-bold text-[#1A1817] block mb-1">
                  Nueva Contraseña (Opcional)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Dejar en blanco para mantener la actual"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-mono text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-[#8C827A] hover:text-[#1A1817] transition-colors cursor-pointer"
                  >
                    {showEditPassword ? (
                      <EyeOff className="w-4 h-4 text-[#1A1817]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#8C827A]" />
                    )}
                  </button>
                </div>
                <span className="text-[10px] text-[#8C827A] mt-0.5 block">
                  Solo escribe si deseas cambiar la contraseña de esta cuenta.
                </span>
              </div>

              {/* Rol */}
              <div>
                <label className="font-bold text-[#1A1817] block mb-1">
                  Rol Asignado
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setEditRole('ADMIN')}
                    className={`p-3 rounded-2xl border cursor-pointer flex flex-col gap-1 transition-all ${
                      editRole === 'ADMIN'
                        ? 'border-[#D4A359] bg-[#FAF8F5] shadow-xs'
                        : 'border-[#E2DCD3] bg-white opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[#1A1817]">ADMIN</span>
                      <ShieldCheck className="w-4 h-4 text-[#F85606]" />
                    </div>
                    <span className="text-[10px] text-[#5C5650] leading-tight">
                      Acceso a productos y pedidos.
                    </span>
                  </label>

                  <label
                    onClick={() => setEditRole('SUPERADMIN')}
                    className={`p-3 rounded-2xl border cursor-pointer flex flex-col gap-1 transition-all ${
                      editRole === 'SUPERADMIN'
                        ? 'border-[#D4A359] bg-[#161311] text-[#FAF8F5] shadow-xs'
                        : 'border-[#E2DCD3] bg-white opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-black text-xs ${editRole === 'SUPERADMIN' ? 'text-[#D4A359]' : 'text-[#1A1817]'}`}>
                        SUPERADMIN
                      </span>
                      <Crown className={`w-4 h-4 ${editRole === 'SUPERADMIN' ? 'text-[#D4A359]' : 'text-[#8C827A]'}`} />
                    </div>
                    <span className={`text-[10px] leading-tight ${editRole === 'SUPERADMIN' ? 'text-[#A89F91]' : 'text-[#5C5650]'}`}>
                      Control maestro total.
                    </span>
                  </label>
                </div>
              </div>

              {/* Estado Activo (solo si no es la cuenta maestra) */}
              {editingUser.id !== 1 &&
                editingUser.username.toLowerCase() !== 'darinka.arias18@gmail.com' && (
                  <div className="pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsActive}
                        onChange={(e) => setEditIsActive(e.target.checked)}
                        className="w-4 h-4 accent-[#D4A359] rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-[#1A1817]">
                        Cuenta activa (permite el inicio de sesión)
                      </span>
                    </label>
                  </div>
                )}

              <div className="pt-4 border-t border-[#E2DCD3] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 border border-[#E2DCD3] text-[#1A1817] hover:bg-[#FAF8F5] rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4A359] to-[#C69755] hover:from-[#C69755] hover:to-[#B8863A] text-[#161311] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {editSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white text-[#1A1817] rounded-3xl max-w-md w-full shadow-2xl border border-[#E2DCD3] p-6 sm:p-7 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#1A1817]">
                  ¿Eliminar este usuario?
                </h3>
                <p className="text-xs text-[#5C5650] leading-relaxed">
                  Estás a punto de revocar permanentemente los accesos de{' '}
                  <strong className="text-[#1A1817] font-bold">
                    {userToDelete.name}
                  </strong>{' '}
                  (@{userToDelete.username}).
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
                {deleteError}
              </div>
            )}

            <div className="pt-4 border-t border-[#E2DCD3] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-5 py-2.5 border border-[#E2DCD3] text-[#1A1817] hover:bg-[#FAF8F5] rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{deleting ? 'Eliminando...' : 'Sí, Eliminar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
