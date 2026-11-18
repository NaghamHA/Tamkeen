import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, Building, CheckCircle2, KeyRound } from 'lucide-react';
import { User as UserType } from '../../types';

interface AdminLoginPageProps {
  onLoginSuccess: (user: Partial<UserType>) => void;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Check for requested credentials: admin / 123456 (or admin@tamkeen-zakat.ps)
      if (
        (cleanUsername === 'admin' || cleanUsername === 'admin@tamkeen-zakat.ps' || cleanUsername === 'مدير') &&
        cleanPassword === '123456'
      ) {
        onLoginSuccess({
          id: 'admin-001',
          name: 'د. محمود القاسم (مدير النظام)',
          email: 'admin@tamkeen-zakat.ps',
          role: 'GENERAL_MANAGER',
          branch: 'المقر العام',
          active: true,
        });
      } else if (cleanUsername === 'researcher' && cleanPassword === '123456') {
        onLoginSuccess({
          id: 'researcher-002',
          name: 'أ. سارة أحمد (باحثة اجتماعية)',
          email: 'sara@tamkeen-zakat.ps',
          role: 'SOCIAL_RESEARCHER',
          branch: 'نابلس',
          active: true,
        });
      } else if (cleanUsername === 'finance' && cleanPassword === '123456') {
        onLoginSuccess({
          id: 'finance-003',
          name: 'م. خالد عمر (موظف المالية)',
          email: 'khaled@tamkeen-zakat.ps',
          role: 'FINANCE_OFFICER',
          branch: 'الخليل',
          active: true,
        });
      } else {
        setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات والمحاولة مجدداً.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('123456');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Top Return & Branding Header */}
        <div className="text-center space-y-3">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#13706A] font-bold transition-colors mb-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للصفحة الرئيسية للموقع</span>
          </button>

          <div className="mx-auto w-16 h-16 bg-[#13706A] text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md border-2 border-emerald-400">
            ت
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">بوابة الدخول الإدارية</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              مؤسسة الزكاة والصدقات القطرية
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#13706A]" />
              <span>تسجيل دخول الموظفين والإدارة</span>
            </span>
            <span className="bg-teal-50 text-[#13706A] text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              نظام آمن 256-bit
            </span>
          </div>

          {/* Quick Credential Helper Box */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-700 font-bold">
              <span className="flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>بيانات الدخول التجريبية الخاصة بالإدارة:</span>
              </span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] bg-[#13706A] text-white px-2.5 py-1 rounded-lg font-bold hover:bg-[#0F5D58] transition-colors"
              >
                تعبئة تلقائية
              </button>
            </div>
            <div className="font-mono text-[11px] text-slate-600 grid grid-cols-2 gap-2 bg-white p-2 rounded-xl border border-slate-100">
              <div><span className="text-slate-400">اسم المستخدم:</span> <strong className="text-slate-900">admin</strong></div>
              <div><span className="text-slate-400">كلمة المرور:</span> <strong className="text-slate-900">123456</strong></div>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-red-800 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                اسم المستخدم أو البريد الوظيفي
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ادخل اسم المستخدم (مثال: admin)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A] focus:bg-white transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ادخل كلمة المرور (مثال: 123456)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-10 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A] focus:bg-white transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#13706A] hover:bg-[#0F5D58] text-white py-3.5 rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <span>جاري التحقق من الصلاحية...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>تسجيل الدخول إلى لوحة التحكم</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
            خاص بموظفي وأعضاء لجان مؤسسة الزكاة والصدقات القطرية. جميع المحاولات مسجلة ومحمية.
          </div>
        </div>
      </div>
    </div>
  );
};
