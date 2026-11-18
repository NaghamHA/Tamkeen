import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { User as UserType } from '../../types';
import { Logo } from '../common/Logo';

interface AdminLoginPageProps {
  users?: UserType[];
  onLoginSuccess: (user: Partial<UserType>) => void;
  onLoginFailed?: (usernameAttempt: string) => void;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  users = [],
  onLoginSuccess,
  onLoginFailed,
  onBackToHome,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Brute-force lockout state (max 5 failed attempts -> 60s cooldown)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const cleanPassword = password.trim();

      // 1. Check against dynamic users table first
      const matchedUser = users.find((u) => {
        const emailMatch = u.email?.trim().toLowerCase() === cleanUsername;
        const usernameMatch = u.username?.trim().toLowerCase() === cleanUsername;
        const defaultAdminAlias =
          u.id === 'admin-001' && (cleanUsername === 'admin' || cleanUsername === 'مدير');
        const expectedPass = u.password || '123456';
        return (emailMatch || usernameMatch || defaultAdminAlias) && cleanPassword === expectedPass;
      });

      if (matchedUser) {
        if (matchedUser.isActive === false) {
          setErrorMsg('هذا الحساب مجمّد حالياً. يرجى مراجعة مدير النظام.');
          setIsLoading(false);
          onLoginFailed?.(cleanUsername);
          return;
        }
        setFailedAttempts(0);
        onLoginSuccess({
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          branch: matchedUser.branch || matchedUser.branchName || 'المقر العام',
          active: true,
        });
        return;
      }

      // 2. Fallback check if INITIAL_USERS wasn't matched
      if (
        (cleanUsername === 'admin' || cleanUsername === 'admin@tamkeen-zakat.ps') &&
        cleanPassword === '123456' &&
        !users.some((u) => u.id === 'admin-001' && u.password && u.password !== '123456')
      ) {
        setFailedAttempts(0);
        onLoginSuccess({
          id: 'admin-001',
          name: 'د. محمود القاسم (مدير النظام)',
          email: 'admin@tamkeen-zakat.ps',
          role: 'GENERAL_MANAGER',
          branch: 'المقر العام',
          active: true,
        });
        return;
      }

      // Failed attempt handling
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      onLoginFailed?.(cleanUsername || 'unknown');

      if (nextAttempts >= 5) {
        setLockoutSeconds(60);
        setErrorMsg('تم تجاوز الحد المسموح لمحاولات الدخول. تم إيقاف المحاولات مؤقتاً لمدة 60 ثانية لدواعي الأمان.');
      } else {
        setErrorMsg('بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور.');
      }
      setPassword('');
      setIsLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Top Return & Branding Header */}
        <div className="text-center space-y-3">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#13706A] font-semibold transition-colors mb-2 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للصفحة الرئيسية</span>
          </button>

          <div className="flex justify-center">
            <Logo size="md" variant="compact" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">بوابة الدخول الإدارية</h2>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              مؤسسة الزكاة والصدقات القطرية
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#13706A]" />
              <span>تسجيل دخول الموظفين واللجان</span>
            </span>
            <span className="bg-teal-50 text-[#13706A] text-[10px] px-2.5 py-0.5 rounded-full font-medium border border-teal-200/70">
              اتصال محمي ومشفر
            </span>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-medium text-red-800 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>
                {errorMsg}
                {lockoutSeconds > 0 && (
                  <strong className="font-mono underline mr-1">({lockoutSeconds} ثانية)</strong>
                )}
              </span>
            </div>
          )}

          {/* Login Form with AutoComplete Disabled */}
          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                اسم المستخدم أو البريد الوظيفي
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="admin_portal_user"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  disabled={lockoutSeconds > 0 || isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم أو البريد الرسمي"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A] focus:bg-white transition-all disabled:opacity-60"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="admin_portal_secret"
                  autoComplete="new-password"
                  required
                  disabled={lockoutSeconds > 0 || isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-10 py-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A] focus:bg-white transition-all font-mono disabled:opacity-60"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || lockoutSeconds > 0}
              className="w-full bg-[#13706A] hover:bg-[#0F5D58] text-white py-3.5 rounded-2xl text-xs font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>جاري التحقق من بيانات الدخول...</span>
              ) : lockoutSeconds > 0 ? (
                <span>الرجاء الانتظار ({lockoutSeconds} ثانية)</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400 font-normal">
            مخصص لكادر ولجان مؤسسة الزكاة والصدقات القطرية. يتم تسجيل كافة عمليات الدخول في سجل الرقابة والأمان.
          </div>
        </div>
      </div>
    </div>
  );
};

