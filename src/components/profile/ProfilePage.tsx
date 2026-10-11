import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Bell,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Save,
  KeyRound,
  Sliders,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfileName, changePassword, updatePreferences } = useAuth();

  // Name editing
  const [name, setName] = useState(user?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  // Password changing
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Notification Preferences
  const [scanNotif, setScanNotif] = useState(
    user?.preferences?.emailScanResults ?? true
  );
  const [updatesNotif, setUpdatesNotif] = useState(
    user?.preferences?.emailProductUpdates ?? false
  );
  const [securityNotif, setSecurityNotif] = useState(
    user?.preferences?.securityAlerts ?? true
  );
  const [prefSaved, setPrefSaved] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMessage(null);
    try {
      await updateProfileName(name);
      setNameMessage({ text: 'Nama profil berhasil diperbarui.', type: 'success' });
      setIsEditingName(false);
    } catch (err: any) {
      setNameMessage({
        text: err?.message || 'Gagal memperbarui nama profil.',
        type: 'error',
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({
        text: 'Kata sandi baru harus minimal 6 karakter.',
        type: 'error',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        text: 'Konfirmasi kata sandi tidak cocok.',
        type: 'error',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage({
        text: 'Kata sandi akun Anda berhasil diubah.',
        type: 'success',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({
        text: err?.message || 'Gagal mengubah kata sandi.',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updatePreferences({
        emailScanResults: scanNotif,
        emailProductUpdates: updatesNotif,
        securityAlerts: securityNotif,
      });
      setPrefSaved(true);
      setTimeout(() => setPrefSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1E2E42]">Pengaturan Akun</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Atur nama profil, ganti kata sandi, dan sesuaikan notifikasi email kamu.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-zinc-100">
          <div className="w-16 h-16 rounded-full bg-[#1E2E42] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900">{user?.displayName || 'Pengguna DIO'}</h2>
            <p className="text-xs text-zinc-500">{user?.email}</p>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3 h-3 text-[#1E2E42]" />
              <span>Akun Aktif</span>
            </div>
          </div>
        </div>

        {/* Display Name Form */}
        <form onSubmit={handleUpdateName} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Nama Pengguna
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsEditingName(true);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#1E2E42] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Alamat Email (Akun)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {nameMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                nameMessage.type === 'success'
                  ? 'bg-zinc-100 border border-zinc-300 text-zinc-800'
                  : 'bg-zinc-100 border border-zinc-300 text-zinc-800'
              }`}
            >
              {nameMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#1E2E42]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#1E2E42]" />
              )}
              <span>{nameMessage.text}</span>
            </div>
          )}

          {isEditingName && (
            <button
              type="submit"
              className="py-2 px-4 bg-[#1E2E42] hover:bg-[#162332] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Simpan Perubahan Nama
            </button>
          )}
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 space-y-4">
        <div className="pb-3 border-b border-zinc-100 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#1E2E42]" />
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Ubah Kata Sandi</h3>
            <p className="text-xs text-zinc-500">Perbarui kata sandi untuk menjaga keamanan akun Anda.</p>
          </div>
        </div>

        {passwordMessage && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              passwordMessage.type === 'success'
                ? 'bg-zinc-100 border border-zinc-300 text-zinc-800'
                : 'bg-zinc-100 border border-zinc-300 text-zinc-800'
            }`}
          >
            {passwordMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#1E2E42]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#1E2E42]" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Kata Sandi Saat Ini
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama"
                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#1E2E42] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#1E2E42] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Konfirmasi Kata Sandi Baru
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#1E2E42] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="py-2.5 px-4 bg-[#1E2E42] hover:bg-[#162332] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {passwordLoading ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
          </button>
        </form>
      </div>

      {/* Notification Preferences Card */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 space-y-4">
        <div className="pb-3 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1E2E42]" />
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Preferensi Notifikasi</h3>
              <p className="text-xs text-zinc-500">Atur pemberitahuan yang ingin Anda terima melalui email.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* Toggle 1: Scan Results */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-100">
            <div>
              <span className="text-xs font-semibold text-zinc-900 block">
                Notifikasi Hasil Pemindaian Gambar
              </span>
              <span className="text-[11px] text-zinc-500 block">
                Kirimkan ringkasan laporan hasil setiap kali analisis gambar selesai diproses.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={scanNotif}
                onChange={(e) => setScanNotif(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E2E42]"></div>
            </label>
          </div>

          {/* Toggle 2: New Features */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-100">
            <div>
              <span className="text-xs font-semibold text-zinc-900 block">
                Pemberitahuan Fitur Baru & Model AI
              </span>
              <span className="text-[11px] text-zinc-500 block">
                Dapatkan informasi pembaruan model pendeteksi (seperti versi baru Midjourney, Flux, SDXL).
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={updatesNotif}
                onChange={(e) => setUpdatesNotif(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E2E42]"></div>
            </label>
          </div>

          {/* Toggle 3: Security Alerts */}
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-xs font-semibold text-zinc-900 block">
                Peringatan Keamanan & Audit Forensik
              </span>
              <span className="text-[11px] text-zinc-500 block">
                Kirim email konfirmasi jika ada aktivitas masuk mencurigakan pada akun Anda.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={securityNotif}
                onChange={(e) => setSecurityNotif(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E2E42]"></div>
            </label>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="py-2.5 px-4 bg-[#1E2E42] hover:bg-[#162332] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Preferensi Notifikasi</span>
            </button>
            {prefSaved && (
              <span className="text-xs text-zinc-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#1E2E42]" />
                Preferensi berhasil disimpan!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
