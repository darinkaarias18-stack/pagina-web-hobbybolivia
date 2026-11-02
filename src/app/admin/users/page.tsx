'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
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
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  Crown,
  CheckCircle2,
  Mail,
  ExternalLink,
  Copy,
  Phone,
  MessageCircle,
  ChevronDown,
  X,
  User as UserIcon
} from 'lucide-react';
import type { User, UserRole } from '@/lib/types';

const COUNTRY_CODES = [
  { code: '+591', flag: '🇧🇴', name: 'Bolivia (+591)', placeholder: '77012345' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina (+54)', placeholder: '9112345678' },
  { code: '+51', flag: '🇵🇪', name: 'Perú (+51)', placeholder: '987654321' },
  { code: '+56', flag: '🇨🇱', name: 'Chile (+56)', placeholder: '912345678' },
  { code: '+55', flag: '🇧🇷', name: 'Brasil (+55)', placeholder: '11987654321' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia (+57)', placeholder: '3001234567' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador (+593)', placeholder: '991234567' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay (+595)', placeholder: '981123456' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay (+598)', placeholder: '99123456' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela (+58)', placeholder: '4121234567' },
  { code: '+52', flag: '🇲🇽', name: 'México (+52)', placeholder: '5512345678' },
  { code: '+1', flag: '🇺🇸', name: 'EE.UU. / Canadá (+1)', placeholder: '2025550143' },
  { code: '+34', flag: '🇪🇸', name: 'España (+34)', placeholder: '612345678' },
  { code: '+507', flag: '🇵🇦', name: 'Panamá (+507)', placeholder: '61234567' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica (+506)', placeholder: '81234567' },
];

interface EmailDispatchInfo {
  sentViaSmtp: boolean;
  recipient: string;
  subject: string;
  bodyText: string;
  gmailComposeUrl: string;
  whatsappShareUrl?: string;
  mailtoUrl: string;
  errorMessage?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Create User Modal (Exclusively creates ADMIN accounts with @gmail.com)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGmailUser, setNewGmailUser] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('+591');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  // Credentials Dispatch Confirmation Modal after creating an Admin
  const [dispatchedAccess, setDispatchedAccess] = useState<{
    adminName: string;
    username: string;
    password: string;
    phone?: string;
    emailDispatch: EmailDispatchInfo;
  } | null>(null);
  const [copiedAccess, setCopiedAccess] = useState(false);

  // Edit User Modal (Superadmin can edit name, Gmail, password, phone, and Role)
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCountryCode, setEditCountryCode] = useState('+591');
  const [editPhone, setEditPhone] = useState('');
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
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Identifica únicamente a la cuenta maestra principal del Superadmin (no eliminable)
  const isPrimaryMasterAccount = (u: User) => {
    const uname = (u.username || '').toLowerCase().trim();
    const uemail = (u.email || '').toLowerCase().trim();
    return (
      u.id === 1 ||
      uname === 'darinka.arias18@gmail.com' ||
      uemail === 'darinka.arias18@gmail.com'
    );
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
        setIsAuthorized(false);
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
    // Regla estricta: Gestión de Usuarios solo está disponible para el SUPERADMIN
    const role = localStorage.getItem('hb_user_role');
    if (role && role !== 'SUPERADMIN') {
      setIsAuthorized(false);
      router.replace('/admin');
      return;
    }
    setIsAuthorized(true);
    loadUsers();
  }, [loadUsers, router]);

  // Statistics for internal validation
  const stats = useMemo(() => {
    const superadmins = users.filter((u) => u.role === 'SUPERADMIN').length;
    return { superadmins };
  }, [users]);

  // Handle Create Admin User (Rule: must be @gmail.com, role is always ADMIN, sends credentials)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    const cleanName = newName.trim();
    const cleanGmail = newGmailUser.trim().toLowerCase();
    const cleanPassword = newPassword.trim();
    const cleanPhoneDigits = newPhone.trim().replace(/[^\d]/g, '');

    if (!cleanName || !cleanGmail || !cleanPassword || !cleanPhoneDigits) {
      setCreateError('Nombre completo, correo Gmail, número de teléfono/celular y contraseña son obligatorios.');
      return;
    }

    const gmailRegex = /^[a-z0-9._%+-]+@gmail\.com$/i;
    if (!gmailRegex.test(cleanGmail)) {
      setCreateError(
        'Por regla obligatoria, el usuario debe ser un correo válido de Gmail (ejemplo@gmail.com), a donde se enviarán los accesos.'
      );
      return;
    }

    if (cleanPassword.length < 6) {
      setCreateError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCreateSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          username: cleanGmail,
          email: cleanGmail,
          password: cleanPassword,
          countryCode: newCountryCode,
          phone: cleanPhoneDigits,
          role: 'ADMIN',
          isActive: newIsActive
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al crear usuario administrador');
      }

      setIsCreateOpen(false);
      setNewName('');
      setNewGmailUser('');
      setNewPassword('');
      setNewPhone('');
      setNewCountryCode('+591');
      setNewIsActive(true);

      if (data.emailDispatch) {
        setDispatchedAccess({
          adminName: cleanName,
          username: cleanGmail,
          password: cleanPassword,
          phone: `${newCountryCode} ${cleanPhoneDigits}`,
          emailDispatch: data.emailDispatch
        });
      }

      showToast(
        `Administrador "${cleanGmail}" creado con éxito. Listo para enviar accesos por WhatsApp.`
      );
      loadUsers();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setCreateSaving(false);
    }
  };

  // Inline Role Change by Superadmin directly from the table
  const handleQuickRoleChange = async (user: User, nextRole: UserRole) => {
    if (isPrimaryMasterAccount(user)) {
      showToast('La cuenta Superadmin maestra no puede cambiar de rol.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
        );
        showToast(
          `Rol de "${user.username}" actualizado a ${nextRole === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN'}.`
        );
      } else {
        showToast(data.error || 'No se pudo actualizar el rol', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error de red al cambiar el rol', 'error');
    }
  };

  // Open Edit Modal
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditUsername(user.username || '');
    setEditEmail(user.email || user.username || '');
    setEditCountryCode(user.countryCode || '+591');
    const existingDigits = user.phone ? user.phone.replace(/^\+\d+\s*/, '') : '';
    setEditPhone(existingDigits);
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
      const cleanUsername = editUsername.trim().toLowerCase();
      const cleanPhoneDigits = editPhone.trim().replace(/[^\d]/g, '');
      const payload: Record<string, unknown> = {
        name: editName.trim(),
        username: cleanUsername,
        email: editEmail.trim().toLowerCase() || cleanUsername,
        countryCode: editCountryCode,
        phone: cleanPhoneDigits ? `${editCountryCode} ${cleanPhoneDigits}` : '',
        role: isPrimaryMasterAccount(editingUser) ? 'SUPERADMIN' : editRole,
        isActive: isPrimaryMasterAccount(editingUser) ? true : editIsActive
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
      showToast(`Usuario "${cleanUsername}" actualizado con éxito.`);
      loadUsers();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setEditSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (user: User) => {
    const isMaster = isPrimaryMasterAccount(user) || (user.role === 'SUPERADMIN' && stats.superadmins <= 1);

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

  if (isAuthorized === false) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-[#D4A359] mb-3 animate-pulse" />
        <h2 className="text-xl font-black text-[#1A1817]">Acceso Exclusivo Superadmin</h2>
        <p className="text-xs text-[#5C5650] max-w-md mt-1">
          La sección de Gestión de Usuarios no está permitida para el rol Administrador. Redirigiendo al panel...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 border ${toast.type === 'success'
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
              Exclusivo Superadmin · Control de Accesos & Seguridad
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
            Gestión de Usuarios
          </h1>
          <p className="text-xs text-[#5C5650] mt-1 max-w-2xl leading-relaxed">
            Crea cuentas de administrador vinculadas a un correo Gmail, edita sus roles o revoca accesos del sistema.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-white text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs transition-colors"
          >
            <span>Volver al Dashboard</span>
          </Link>

          {/* Primary Action Button: "Crear Nuevo Usuario (Admin)" */}
          <button
            type="button"
            onClick={() => {
              setCreateError('');
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4A359] to-[#C69755] hover:from-[#C69755] hover:to-[#B8863A] text-[#161311] font-black text-xs uppercase tracking-wider shadow-md shadow-[#D4A359]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#161311]" />
            <span>Crear Nuevo Admin</span>
          </button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl border border-[#E2DCD3] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E2DCD3] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D4A359]" />
            <h2 className="text-xs font-black text-[#1A1817] uppercase tracking-wider">
              Cuentas Registradas ({users.length})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#8C827A]">
            Solo Superadmin puede editar roles y eliminar cuentas
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-[#8C827A] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4A359]" />
            <span className="font-semibold">Cargando directorio de administradores...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#8C827A] space-y-2">
            <p className="font-bold text-sm text-[#1A1817]">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto scrollbar-thin rounded-2xl border border-neutral-200 touch-pan-x">
            <table className="w-full text-left border-collapse text-xs min-w-[780px]">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E2DCD3] text-[#8C827A] font-black uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 min-w-[200px]">Usuario (Gmail)</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Nombre Completo</th>
                  <th className="py-3.5 px-4 min-w-[170px]">Teléfono / WhatsApp</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Rol Asignado</th>
                  <th className="py-3.5 px-4 min-w-[90px]">Estado</th>
                  <th className="py-3.5 px-4 text-right min-w-[120px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEAE2]">
                {users.map((u) => {
                  const isPrimaryMaster = isPrimaryMasterAccount(u);

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
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${u.role === 'SUPERADMIN'
                              ? 'bg-[#161311] text-[#D4A359] border border-[#D4A359]/30 shadow-xs'
                              : 'bg-[#FAF8F5] text-[#1A1817] border border-[#E2DCD3]'
                              }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono font-black text-[#1A1817] truncate flex items-center gap-1.5">
                              <span>{u.username}</span>
                              {isPrimaryMaster && (
                                <span title="Superadmin Maestro Principal" className="inline-flex items-center">
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

                      {/* 3. Teléfono / WhatsApp con Código de País */}
                      <td className="py-3.5 px-4">
                        {u.phone ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs text-[#1A1817]">
                            <Phone className="w-3.5 h-3.5 text-[#D4A359] shrink-0" />
                            <span className="font-bold whitespace-nowrap">{u.phone}</span>
                            <a
                              href={`https://api.whatsapp.com/send?phone=${u.phone.replace(/[^\d]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors cursor-pointer ml-1 inline-flex items-center"
                              title="Contactar o enviar mensaje por WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#8C827A] italic">No registrado</span>
                        )}
                      </td>

                      {/* 4. Rol Asignado (Único Superadmin Maestro; todas las demás cuentas son Administrador) */}
                      <td className="py-3.5 px-4">
                        {isPrimaryMaster ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#161311] text-[#D4A359] border border-[#D4A359]/40 shadow-xs">
                            <Crown className="w-3.5 h-3.5 text-[#D4A359]" />
                            <span>Superadmin Maestro</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF8F5] text-[#5C5650] border border-[#E2DCD3]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#D4A359]" />
                            <span>Administrador</span>
                          </span>
                        )}
                      </td>

                      {/* 4. Estado (Activo / Desactivado) */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          disabled={isPrimaryMaster && u.isActive}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${u.isActive !== false
                            ? 'bg-[#3E7B44]/15 text-[#3E7B44] border border-[#3E7B44]/30 hover:bg-[#3E7B44]/25 cursor-pointer'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer'
                            } ${isPrimaryMaster && u.isActive ? 'opacity-90 cursor-default' : ''}`}
                          title={
                            isPrimaryMaster && u.isActive
                              ? 'Cuenta maestra permanentemente activa'
                              : 'Clic para alternar estado'
                          }
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-[#3E7B44] animate-pulse' : 'bg-rose-500'
                              }`}
                          />
                          <span>{u.isActive !== false ? 'Activo' : 'Inactivo'}</span>
                        </button>
                      </td>

                      {/* 5. Acciones (Editar y Eliminar habilitados para Superadmin) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="px-2.5 py-1.5 rounded-xl border border-[#E2DCD3] hover:border-[#161311] bg-white hover:bg-[#161311] text-[#1A1817] hover:text-[#D4A359] font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                            title="Editar usuario, rol o contraseña"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>

                          {!isPrimaryMaster && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError('');
                                setUserToDelete(u);
                              }}
                              className="px-2.5 py-1.5 rounded-xl border border-rose-200 hover:border-rose-500 bg-rose-50/60 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                              title="Eliminar cuenta de administrador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Eliminar</span>
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
          MODAL: CREAR NUEVO USUARIO ADMINISTRADOR (SOLO ROL ADMIN + GMAIL)
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
                    Crear Nuevo Usuario Admin
                  </h3>
                  <span className="text-[11px] text-[#8C827A]">
                    El usuario debe ser un correo Gmail (los accesos se enviarán por WhatsApp)
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

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#1A1817] block mb-1">
                  Nombre Completo del Administrador *
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

              <div>
                <label className="font-bold text-[#1A1817] block mb-1">
                  Usuario (Correo Gmail de Acceso) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#D4A359] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={newGmailUser}
                    onChange={(e) => setNewGmailUser(e.target.value.trim().toLowerCase())}
                    placeholder="ejemplo@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-mono font-bold text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all"
                  />
                </div>
                <span className="text-[10px] text-[#8C827A] mt-1 block">
                  Regla obligatoria: debe terminar en <strong>@gmail.com</strong>. A este correo se enviarán el usuario y la contraseña.
                </span>
              </div>

              <div>
                <label className="font-bold text-[#1A1817] block mb-1">
                  Número de Teléfono / Celular de Contacto *
                </label>
                <div className="flex items-center gap-2">
                  {/* Selector de Código de País */}
                  <div className="relative shrink-0 w-36 sm:w-44">
                    <select
                      value={newCountryCode}
                      onChange={(e) => setNewCountryCode(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-bold text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all cursor-pointer appearance-none"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} ({c.name.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8C827A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Input de dígitos numéricos */}
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-[#D4A359] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value.replace(/[^\d]/g, ''))}
                      placeholder={COUNTRY_CODES.find((c) => c.code === newCountryCode)?.placeholder || '77012345'}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-mono font-bold text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-[#8C827A] mt-1 block">
                  Elige el código del país y escribe los números correspondientes para WhatsApp y contacto.
                </span>
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

              {/* Rol Fijo Informativo: ADMIN */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#D4A359]" />
                  </div>
                  <div>
                    <span className="font-black text-xs text-[#1A1817] block">
                      Rol Asignado: ADMIN (Estándar)
                    </span>
                    <span className="text-[10px] text-[#5C5650]">
                      Acceso a Productos, Stock, Gestión de Pedidos y Configuración General. No puede ver ni crear usuarios.
                    </span>
                  </div>
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
                    <Mail className="w-3.5 h-3.5" />
                  )}
                  <span>{createSaving ? 'Creando y enviando...' : 'Crear Admin y Enviar Accesos'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRMACIÓN DE ENVÍO DE ACCESOS AL ADMIN
      ======================================================== */}
      {dispatchedAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-[#1A1817] rounded-3xl max-w-md sm:max-w-lg w-full shadow-2xl border border-[#E2DCD3] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Cabecera del Modal */}
            <div className="p-6 pb-4 border-b border-[#E2DCD3] flex items-start justify-between gap-3 bg-[#FAF8F5]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <MessageCircle className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1A1817] leading-snug">
                    Administrador Creado
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                    <span className="text-xs text-[#5C5650] font-medium">
                      WhatsApp: <strong className="text-emerald-700 font-mono font-bold">{dispatchedAccess.phone || 'Sin número'}</strong>
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDispatchedAccess(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#211E1C] text-[#8C827A] hover:text-[#D4A359] border border-[#E2DCD3] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tarjeta de Credenciales Oficiales */}
              <div className="rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] overflow-hidden shadow-2xs">
                <div className="px-4 py-2.5 bg-[#F2EDE4] border-b border-[#E2DCD3] flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#7A7067] flex items-center gap-1.5">
                    <Key className="w-3 h-3 text-[#D4A359]" />
                    Credenciales de Acceso
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 border border-amber-300/60 px-2 py-0.5 rounded-md">
                    Acceso Oficial
                  </span>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  {/* Nombre */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#7A7067] font-semibold flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-[#8C827A]" />
                      Nombre:
                    </span>
                    <span className="font-black text-[#1A1817] text-right">{dispatchedAccess.adminName}</span>
                  </div>

                  {/* Usuario / Correo */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#7A7067] font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#8C827A]" />
                      Usuario:
                    </span>
                    <span className="font-mono font-bold text-[#1A1817] text-right truncate max-w-[240px]">
                      {dispatchedAccess.username}
                    </span>
                  </div>

                  {/* Contraseña */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#7A7067] font-semibold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#8C827A]" />
                      Contraseña:
                    </span>
                    <span className="font-mono font-black text-[#D4A359] bg-[#211E1C] px-3 py-1 rounded-xl text-xs tracking-wider border border-[#3A3530] shadow-2xs">
                      {dispatchedAccess.password}
                    </span>
                  </div>

                  {/* Teléfono / WhatsApp */}
                  {dispatchedAccess.phone && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#7A7067] font-semibold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#8C827A]" />
                        Teléfono / WhatsApp:
                      </span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-xs">
                        {dispatchedAccess.phone}
                      </span>
                    </div>
                  )}

                  {/* Rol Asignado */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#7A7067] font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8C827A]" />
                      Rol asignado:
                    </span>
                    <span className="font-black text-[11px] px-2.5 py-0.5 rounded-full bg-[#211E1C] text-[#D4A359] border border-[#3A3530]">
                      ADMINISTRADOR
                    </span>
                  </div>
                </div>
              </div>

              {/* Callout WhatsApp */}
              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#14532D] text-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <MessageCircle className="w-4 h-4 fill-white" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <h4 className="font-black text-xs text-[#14532D]">
                    Despacho directo por WhatsApp
                  </h4>
                  <p className="text-[11px] text-[#166534] leading-relaxed">
                    Al hacer clic en <strong className="font-bold">Enviar por WhatsApp</strong> se abrirá el chat con los datos de acceso prellenados y listos para enviar.
                  </p>
                </div>
              </div>

              {/* Barra de Acciones Estructurada */}
              <div className="pt-2 space-y-2.5">
                {/* Botón Principal: WhatsApp (Ancho Completo, Destacado) */}
                {dispatchedAccess.emailDispatch.whatsappShareUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        dispatchedAccess.emailDispatch.whatsappShareUrl,
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                    className="w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Enviar Accesos por WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                  </button>
                )}

                {/* Botones Secundarios: Copiar Accesos y Listo (50% / 50% Cuadrícula) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(dispatchedAccess.emailDispatch.bodyText);
                      setCopiedAccess(true);
                      setTimeout(() => setCopiedAccess(false), 2500);
                      showToast('Credenciales copiadas al portapapeles');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F0ECE1] text-[#1A1817] border border-[#E2DCD3] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedAccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-black">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#D4A359]" />
                        <span>Copiar Accesos</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDispatchedAccess(null)}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#5C5650] hover:text-[#1A1817] border border-[#E2DCD3] font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    Listo / Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDITAR USUARIO / ROL / CONTRASEÑA (EXCLUSIVO SUPERADMIN)
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
                    Editar Usuario y Rol
                  </h3>
                  <span className="text-[11px] font-mono text-[#8C827A]">
                    {editingUser.username} · ID #{editingUser.id}
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
                    Usuario (Login / Gmail)
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.trim().toLowerCase())}
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

              <div>
                <label className="font-bold text-[#1A1817] block mb-1">
                  Teléfono / Celular de Contacto
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0 w-36 sm:w-44">
                    <select
                      value={editCountryCode}
                      onChange={(e) => setEditCountryCode(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-bold text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all cursor-pointer appearance-none"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} ({c.name.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8C827A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-[#D4A359] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/[^\d]/g, ''))}
                      placeholder={COUNTRY_CODES.find((c) => c.code === editCountryCode)?.placeholder || '77012345'}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-mono font-bold text-[#1A1817] focus:bg-white focus:border-[#D4A359] outline-none transition-all"
                    />
                  </div>
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
              </div>

              {/* Rol Asignado: Fijo como Administrador para cuentas secundarias */}
              {!isPrimaryMasterAccount(editingUser) && (
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3]">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#D4A359]" />
                    <span className="font-bold text-xs text-[#1A1817]">Rol Asignado: Administrador (Fijo)</span>
                  </div>
                  <p className="text-[11px] text-[#5C5650] leading-relaxed">
                    Acceso a catálogo, productos y pedidos. La cuenta de Superadmin Maestro es única e intransferible por seguridad del sistema.
                  </p>
                </div>
              )}

              {/* Estado Activo (solo si no es la cuenta maestra) */}
              {!isPrimaryMasterAccount(editingUser) && (
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
                  ¿Eliminar este administrador?
                </h3>
                <p className="text-xs text-[#5C5650] leading-relaxed">
                  Estás a punto de revocar permanentemente los accesos de{' '}
                  <strong className="text-[#1A1817] font-bold">
                    {userToDelete.name}
                  </strong>{' '}
                  ({userToDelete.username}).
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
