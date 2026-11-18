import React, { useState } from 'react';
import { UserRole, SystemSettings, Application } from '../../types';
import {
  LayoutDashboard,
  FileText,
  Clock,
  AlertTriangle,
  CheckSquare,
  Users,
  FileSearch,
  BarChart2,
  Settings,
  ShieldAlert,
  Menu,
  X,
  Bell,
  User,
  Building,
  LogOut,
} from 'lucide-react';

interface AdminLayoutProps {
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  settings: SystemSettings;
  applications: Application[];
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUserRole,
  applications,
  activeSubTab,
  setActiveSubTab,
  onLogout,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Count metrics for badges
  const urgentCount = applications.filter((a) => a.urgency === 'CRITICAL' || a.urgency === 'HIGH').length;
  const pendingDocsCount = applications.filter(
    (a) => a.status === 'AWAITING_DOCS' || a.status === 'INCOMPLETE'
  ).length;

  const roleLabels: { [key in UserRole]: string } = {
    GENERAL_MANAGER: 'المدير العام (الإدارة التنفيذية)',
    CASE_MANAGER: 'مدير الحالات والقرارات',
    SOCIAL_RESEARCHER: 'الباحث الاجتماعي',
    AUDIT_OFFICER: 'موظف التدقيق والوثائق',
    COMMITTEE_MEMBER: 'عضو الإدارة التنفيذية',
    FINANCE_OFFICER: 'موظف الصرف المالي',
    BENEFICIARY_SERVICE: 'خدمة المستفيدين',
    DATA_ENTRY: 'موظف إدخال البيانات',
    INTERNAL_AUDITOR: 'المدقق الداخلي',
    SYSTEM_ADMIN: 'مدير النظام',
  };

  const menuItems = [
    { id: 'dashboard', label: 'لوحة المعلومات والملخص', icon: LayoutDashboard },
    { id: 'employee_tasks', label: 'المهام المعلقة (To-Do)', icon: CheckSquare, badge: 3, badgeColor: 'bg-[#13706A]' },
    { id: 'applications', label: 'إدارة الطلبات الشاملة', icon: FileText, badge: applications.length },
    { id: 'urgent', label: 'الطلبات العاجلة والطارئة', icon: AlertTriangle, badge: urgentCount, badgeColor: 'bg-red-500' },
    { id: 'pending_docs', label: 'طلبات تحتاج استكمال', icon: Clock, badge: pendingDocsCount, badgeColor: 'bg-amber-500' },
    { id: 'social_research', label: 'البحث والتقييم الاجتماعي', icon: FileSearch },
    { id: 'complaints', label: 'الشكاوى والتظلمات', icon: ShieldAlert },
    { id: 'reports', label: 'مركز التقارير والإحصائيات', icon: BarChart2 },
    { id: 'users_roles', label: 'المستخدمون والصلاحيات', icon: Users },
    { id: 'content_mgmt', label: 'إدارة محتوى نموذج الطلب', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0F5D58] text-white shrink-0 border-l border-emerald-900 shadow-xl no-print">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-emerald-800 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white leading-tight">
              مؤسسة الزكاة والصدقات القطرية
            </span>
          </div>
          <p className="text-xs text-emerald-200 font-medium">لوحة التحكم الإدارية المركزية</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-white text-[#13706A] shadow-md font-bold'
                    : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#13706A]' : 'text-emerald-300'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] text-white px-2 py-0.5 rounded-full font-bold ${
                      item.badgeColor || 'bg-emerald-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Role Card */}
        <div className="p-4 border-t border-emerald-800 bg-emerald-950/40 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-emerald-300 text-[11px]">المستخدم الحالي:</span>
            <span className="bg-emerald-800 text-white text-[10px] px-2 py-0.5 rounded">نشط</span>
          </div>
          <div className="font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-300" />
            <span>{roleLabels[currentUserRole]}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Scope Badge */}
            <div className="flex items-center gap-2 bg-teal-50 text-[#13706A] px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-200">
              <Building className="w-4 h-4 text-[#13706A]" />
              <span>مؤسسة الزكاة والصدقات القطرية</span>
            </div>
          </div>

          {/* Notifications & Logout */}
          <div className="flex items-center gap-3">
            <button
              className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 border border-gray-200"
              title="الإشعارات العاجلة"
            >
              <Bell className="w-4 h-4" />
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {urgentCount}
                </span>
              )}
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 flex items-center gap-1.5 transition-colors"
                title="تسجيل الخروج من لوحة التحكم"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile Slide-over Sidebar */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex">
            <div className="w-72 bg-[#0F5D58] text-white p-4 space-y-4 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-emerald-800 pb-3 mb-3">
                  <span className="font-bold text-sm">القائمة الإدارية</span>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X className="w-5 h-5 text-emerald-200" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSubTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                          activeSubTab === item.id ? 'bg-white text-[#13706A]' : 'text-emerald-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Admin Module View */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};


