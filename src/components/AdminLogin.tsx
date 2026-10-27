import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { AdminUser } from '../types.js';
import { Logo } from './Logo.js';
import { safeFetchJson } from '../utils/api.js';

interface AdminLoginProps {
  onSuccess: (user: AdminUser, token: string) => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToSite }) => {
  const [username, setUsername] = useState('ieltscampadmin1010');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // First-login password change flow
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [tempToken, setTempToken] = useState<string>('');
  const [tempUser, setTempUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeSuccessMessage, setChangeSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Login va parolni kiriting.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await safeFetchJson<{
        token: string;
        mustChangePassword: boolean;
        user: AdminUser;
      }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Login yoki parol noto‘g‘ri kiritildi.');
      }

      const data = result.data;

      // Check if first-login password change is mandatory
      if (data.mustChangePassword) {
        setTempToken(data.token);
        setTempUser(data.user);
        setMustChangePassword(true);
        setIsLoading(false);
        return;
      }

      // Store token and proceed
      localStorage.setItem('ielts_camp_admin_token', data.token);
      onSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Kirishda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('Yangi parol kamida 8 ta belgidan iborat bo‘lishi shart.');
      return;
    }

    if (newPassword === 'admin1010') {
      setErrorMessage('Yangi parol boshlang‘ich "admin1010" parolidan farq qilishi kerak.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Yangi parollar bir-biriga mos kelmadi. Iltimos, qayta tekshiring.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await safeFetchJson<{
        token: string;
        message: string;
      }>('/api/admin/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({
          currentPassword: password,
          newPassword,
        }),
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Parolni yangilashda xatolik yuz berdi.');
      }

      setChangeSuccessMessage(result.data.message || 'Parol yangilandi!');
      localStorage.setItem('ielts_camp_admin_token', result.data.token);

      setTimeout(() => {
        if (tempUser) {
          onSuccess({ ...tempUser, must_change_password: false }, result.data!.token);
        }
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Parolni almashtirishda xatolik.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bosh sahifaga qaytish</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center space-y-3">
          <div className="inline-flex justify-center mb-2">
            <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-800">
              <Logo size="lg" />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Administrator Tizimiga Kirish
          </h2>
          <p className="text-xs text-slate-400">
            IELTS CAMP kurslari va o‘quvchilar arizalarini boshqarish
          </p>
        </div>

        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {mustChangePassword ? (
            /* First-login mandatory password change screen */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-1">Xavfsizlik talabi (Birinchi kirish):</strong>
                  Standart boshlang‘ich parolni shaxsiy va xavfsiz yangi parolga almashtiring.
                </div>
              </div>

              {changeSuccessMessage ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>{changeSuccessMessage} Tizimga yo‘naltirilmoqda...</span>
                </div>
              ) : (
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Yangi parol (kamida 8 ta belgi)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Yangi mustahkam parol"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Yangi parolni tasdiqlang
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Parolni qayta tering"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Parolni yangilash va Tizimga kirish</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Administrator logini
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Parol
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Parolni kiriting"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Login Helper Card for authorized administrator */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Rasmiy administrator hisobi:</div>
                <div className="flex items-center justify-between font-mono text-slate-300">
                  <span>Login: <span className="text-red-400">ieltscampadmin1010</span></span>
                  <span>Boshlang‘ich parol: <span className="text-red-400">admin1010</span></span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Tizimga kirish</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
