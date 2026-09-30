import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; email: string } | null;
  onSuccess: (user: { id: string; email: string } | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess
}) => {
  // 'signin': Đăng nhập với mật khẩu | 'signup': Đăng ký tài khoản | 'magic': Gửi link qua email
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('Chưa tìm thấy cấu hình Supabase. Vui lòng kiểm tra lại file .env');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'magic') {
        // Đăng nhập một chạm qua Email (Magic Link / OTP)
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        setSuccessMsg(`Đã gửi liên kết đăng nhập đến ${email}. Hãy kiểm tra hòm thư của bạn!`);
      } else if (authMode === 'signin') {
        // Đăng nhập bằng Email + Mật khẩu
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
        if (data.user) {
          onSuccess({ id: data.user.id, email: data.user.email || email.trim() });
          onClose();
        }
      } else {
        // Đăng ký tài khoản mới bằng Email + Mật khẩu
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;

        if (data.user && !data.session) {
          setSuccessMsg('Đăng ký thành công! Hãy kiểm tra email để xác nhận kích hoạt tài khoản.');
        } else if (data.user) {
          onSuccess({ id: data.user.id, email: data.user.email || email.trim() });
          onClose();
        }
      }
    } catch (err: any) {
      // Dịch các lỗi phổ biến sang tiếng Việt thân thiện
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Email hoặc mật khẩu không chính xác.');
      } else if (msg.includes('User already registered')) {
        setErrorMsg('Email này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập.');
      } else if (msg.includes('Password should be at least')) {
        setErrorMsg('Mật khẩu phải có tối thiểu 6 ký tự.');
      } else {
        setErrorMsg(msg || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('Chưa tìm thấy cấu hình Supabase trong file .env');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi đăng nhập bằng Google.');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    onSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header tối giản, không icon rườm rà */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {currentUser 
                ? 'Tài khoản của bạn' 
                : authMode === 'signup' 
                  ? 'Đăng ký tài khoản' 
                  : authMode === 'magic'
                    ? 'Đăng nhập qua Email'
                    : 'Đăng nhập'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser 
                ? 'Đang đồng bộ dữ liệu đám mây' 
                : 'Lưu tiến độ từ vựng, Kanji và streak trên mọi thiết bị'}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentUser ? (
          /* Trạng thái đã đăng nhập */
          <div className="space-y-5 text-center py-2">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">
                Tài khoản đang hoạt động
              </span>
              <strong className="text-slate-900 dark:text-white text-base font-mono">
                {currentUser.email}
              </strong>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Toàn bộ tiến độ học từ vựng, từ yêu thích và điểm số bài kiểm tra của bạn đang được tự động sao lưu an toàn.
            </p>

            <button
              onClick={handleSignOut}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-700 dark:text-zinc-200 text-xs font-bold transition"
            >
              Đăng xuất khỏi tài khoản
            </button>
          </div>
        ) : (
          /* Form Đăng nhập / Đăng ký */
          <div className="space-y-4">
            {/* Nút Đăng nhập bằng Google (Gmail) */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-100 font-bold text-sm shadow-xs flex items-center justify-center space-x-3 transition active:scale-98 disabled:opacity-60"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Đăng nhập bằng Google (Gmail)</span>
            </button>

            {/* Đường phân cách */}
            <div className="flex items-center space-x-3 text-slate-400 dark:text-zinc-600 text-xs">
              <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-800"></div>
              <span className="text-[11px] font-medium text-slate-400">hoặc sử dụng Email</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-800"></div>
            </div>

            {/* Bộ chuyển tab: Đăng nhập | Đăng ký */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2 rounded-xl transition ${
                  authMode !== 'signup'
                    ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2 rounded-xl transition ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Đăng ký
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Trường Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="nhapemail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                />
              </div>

              {/* Trường Mật khẩu (nếu không phải chế độ magic link) */}
              {authMode !== 'magic' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Mật khẩu
                    </label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('magic');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        className="text-[11px] text-blue-600 dark:text-sky-400 font-semibold hover:underline"
                      >
                        Đăng nhập không cần mật khẩu?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                  />
                </div>
              )}

              {/* Thông báo lỗi */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Thông báo thành công */}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                  {successMsg}
                </div>
              )}

              {/* Nút gửi form */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition active:scale-95 disabled:opacity-50"
              >
                {loading 
                  ? 'Đang xử lý...' 
                  : authMode === 'magic'
                    ? 'Gửi liên kết đăng nhập đến Email'
                    : authMode === 'signin'
                      ? 'Đăng nhập bằng Email'
                      : 'Tạo tài khoản bằng Email'}
              </button>

              {/* Tùy chọn quay lại đăng nhập mật khẩu nếu đang ở chế độ Magic Link */}
              {authMode === 'magic' && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 font-semibold"
                  >
                    ← Quay lại đăng nhập bằng mật khẩu
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
