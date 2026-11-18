import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../../types';
import {
  Users,
  Shield,
  UserPlus,
  CheckCircle,
  Lock,
  Edit3,
  Search,
  Filter,
  Check,
  X,
  UserCheck,
  UserX,
  Trash2,
  KeyRound,
  ShieldAlert,
  Building,
  Info
} from 'lucide-react';

interface UsersAndRolesModuleProps {
  users: User[];
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser?: (userId: string, updatedFields: Partial<User>) => void;
  onDeleteUser?: (userId: string) => void;
}

export const UsersAndRolesModule: React.FC<UsersAndRolesModuleProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'add_employee' | 'roles_matrix'>('users');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [role, setRole] = useState<UserRole>('SOCIAL_RESEARCHER');
  const [branch, setBranch] = useState('المقر العام');
  const [editingPassword, setEditingPassword] = useState('');

  // Role Definitions & Arabic Labels
  const roleDetails: {
    [key in UserRole]: { label: string; bg: string; text: string; desc: string };
  } = {
    GENERAL_MANAGER: {
      label: 'المدير العام',
      bg: 'bg-[#13706A]/10',
      text: 'text-[#13706A]',
      desc: 'صلاحيات كاملة للتوثيق والاعتماد النهائي وإدارة كافة العمليات والتقارير التنفيذية.',
    },
    SYSTEM_ADMIN: {
      label: 'مدير النظام والتقنية',
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      desc: 'إدارة المستخدمين والأدوار والإعدادات التقنية وسجلات الأمان وتفعيل بوابات التقديم.',
    },
    CASE_MANAGER: {
      label: 'مدير الحالات والمتابعة',
      bg: 'bg-sky-100',
      text: 'text-sky-800',
      desc: 'إحالة الطلبات وتوزيعها على الباحثين الاجتماعيين ومتابعة استكمال النقص المستندي.',
    },
    SOCIAL_RESEARCHER: {
      label: 'الباحث الاجتماعي',
      bg: 'bg-teal-100',
      text: 'text-teal-800',
      desc: 'إجراء المقابلات الميدانية والزيارات وصياغة تقارير البحث والتوصيات المالية.',
    },
    AUDIT_OFFICER: {
      label: 'موظف التدقيق والوثائق',
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      desc: 'مراجعة الهويات والوثائق الثبوتية واعتماد اكتمال المرفقات قبل الاعتماد الإداري.',
    },
    COMMITTEE_MEMBER: {
      label: 'عضو الإدارة التنفيذية',
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      desc: 'المشاركة في اتخاذ القرارات الإدارية المباشرة واعتماد المساعدات الاجتماعية.',
    },
    FINANCE_OFFICER: {
      label: 'موظف المالية والصرف',
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      desc: 'تنفيذ حوالات البنوك والصرف المالي وتأكيد الشيكات والقسائم الشرائية.',
    },
    BENEFICIARY_SERVICE: {
      label: 'خدمة المستفيدين والشكاوى',
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      desc: 'استقبال استفسارات المواطنين وتتبع حالة الطلب بالهوية والرد على التظلمات.',
    },
    DATA_ENTRY: {
      label: 'موظف إدخال البيانات',
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      desc: 'تفريغ الطلبات الورقية والمسح الضوئي للمستندات وإضافتها للنظام.',
    },
    INTERNAL_AUDITOR: {
      label: 'المدقق الداخلي وسجلات الأمان',
      bg: 'bg-[#1E759A]/10',
      text: 'text-[#1E759A]',
      desc: 'مراجعة كافة عمليات النظام وضمان عدم وجود تضارب مصالح أو استغلال.',
    },
  };

  // Matrix Permissions Definition
  const permissionsMatrix = [
    {
      id: 'view_apps',
      name: 'استعراض الحالات وطلبات المساعدة',
      roles: ['GENERAL_MANAGER', 'SYSTEM_ADMIN', 'CASE_MANAGER', 'SOCIAL_RESEARCHER', 'AUDIT_OFFICER', 'COMMITTEE_MEMBER', 'FINANCE_OFFICER', 'BENEFICIARY_SERVICE', 'INTERNAL_AUDITOR'],
    },
    {
      id: 'edit_status',
      name: 'تعديل حالة الطلب وتأكيد النقص',
      roles: ['GENERAL_MANAGER', 'SYSTEM_ADMIN', 'CASE_MANAGER', 'AUDIT_OFFICER'],
    },
    {
      id: 'write_social_report',
      name: 'إعداد وتقييم البحث الاجتماعي',
      roles: ['GENERAL_MANAGER', 'CASE_MANAGER', 'SOCIAL_RESEARCHER'],
    },
    {
      id: 'committee_decision',
      name: 'التصويت واعتـماد قرار اللجنة',
      roles: ['GENERAL_MANAGER', 'COMMITTEE_MEMBER'],
    },
    {
      id: 'execute_finance',
      name: 'تنفيذ الصرف المالي وإدخال الحوالة',
      roles: ['GENERAL_MANAGER', 'FINANCE_OFFICER'],
    },
    {
      id: 'manage_users',
      name: 'إدارة المستخدمين ومنح الأدوار',
      roles: ['GENERAL_MANAGER', 'SYSTEM_ADMIN'],
    },
    {
      id: 'system_settings',
      name: 'إدارة استقبال الطلبات والإعدادات',
      roles: ['GENERAL_MANAGER', 'SYSTEM_ADMIN'],
    },
    {
      id: 'audit_logs',
      name: 'الاطلاع على سجلات التدقيق والحركات',
      roles: ['GENERAL_MANAGER', 'SYSTEM_ADMIN', 'INTERNAL_AUDITOR'],
    },
  ];

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (statusFilter === 'ACTIVE' && u.isActive === false) return false;
      if (statusFilter === 'INACTIVE' && u.isActive !== false) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = u.phone?.includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }

      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Form Handlers
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    onAddUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '0599000000',
      password: newPassword.trim() || '123456',
      role,
      branchId: 'br-wb',
      branchName: branch,
      branch: branch,
      isActive: true,
      active: true,
      permissions: ['read', 'write'],
    });

    setShowAddModal(false);
    setName('');
    setEmail('');
    setPhone('');
    setNewPassword('');
    alert(`تم إحداث حساب الموظف (${name}) بنجاح وتعيين دور (${roleDetails[role]?.label}).`);
  };

  const handleToggleStatus = (u: User) => {
    const nextState = u.isActive === false;
    if (onUpdateUser) {
      onUpdateUser(u.id, { isActive: nextState, active: nextState });
    } else {
      u.isActive = nextState;
      u.active = nextState;
    }
    alert(`تم ${nextState ? 'تفعيل' : 'تجميد'} حساب الموظف (${u.name}).`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#13706A]"></span>
            <h1 className="text-2xl font-black text-slate-800">إدارة المستخدمين والأدوار والصلاحيات</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة وصول الكادر الميداني والأكاديمي والمالي وتحديد مستويات الأمان والأدوار الوظيفية
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4 text-emerald-300" />
          <span>إضافة موظف / مستخدم جديد</span>
        </button>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block font-bold">إجمالي مستخدمي النظام</span>
            <span className="text-xl font-black text-slate-800 font-mono">{users.length} مستخدم</span>
          </div>
          <div className="w-10 h-10 bg-teal-50 text-[#13706A] rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-700 block font-bold">الحسابات النشطة</span>
            <span className="text-xl font-black text-emerald-800 font-mono">
              {users.filter((u) => u.isActive !== false).length}
            </span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-700 block font-bold">الأدوار المعتمدة</span>
            <span className="text-xl font-black text-amber-800 font-mono">10 أدوار</span>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-purple-700 block font-bold">مدراء النظام</span>
            <span className="text-xl font-black text-purple-800 font-mono">
              {users.filter((u) => u.role === 'GENERAL_MANAGER' || u.role === 'SYSTEM_ADMIN').length}
            </span>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-[#13706A] text-[#13706A] font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>قائمة الموظفين والمستخدمين ({filteredUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('add_employee')}
          className={`pb-3 transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'add_employee'
              ? 'border-[#13706A] text-[#13706A] font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-600" />
          <span>إضافة موظف جديد وتحديد الدور</span>
        </button>

        <button
          onClick={() => setActiveTab('roles_matrix')}
          className={`pb-3 transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'roles_matrix'
              ? 'border-[#13706A] text-[#13706A] font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>مصفوفة الأدوار وصلاحيات النظام</span>
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بأسماء الموظفين، البريد الإلكتروني أو الهاتف..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-xs font-medium focus:ring-2 focus:ring-[#13706A] focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="ALL">جميع الأدوار</option>
                {Object.entries(roleDetails).map(([roleKey, details]) => (
                  <option key={roleKey} value={roleKey}>
                    {details.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="ACTIVE">نشط فقط</option>
                <option value="INACTIVE">مجمد فقط</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="p-3.5">الموظف / المستكشف</th>
                  <th className="p-3.5">البريد الإلكتروني</th>
                  <th className="p-3.5">رقم الهاتف</th>
                  <th className="p-3.5">الدور الوظيفي</th>
                  <th className="p-3.5">الفرع المسؤول</th>
                  <th className="p-3.5">حالة الحساب</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      لا يوجد موظفون مطابقون لشروط التصفية الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const roleInfo = roleDetails[u.role] || {
                      label: u.role,
                      bg: 'bg-slate-100',
                      text: 'text-slate-700',
                    };

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#13706A]/10 text-[#13706A] rounded-full flex items-center justify-center font-black text-xs shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-xs">{u.name}</h4>
                              <p className="text-[10px] text-slate-400">كود: {u.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-slate-600">{u.email}</td>

                        <td className="p-3.5 font-mono text-slate-700" dir="ltr">
                          {u.phone || '0599000000'}
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${roleInfo.bg} ${roleInfo.text}`}>
                            {roleInfo.label}
                          </span>
                        </td>

                        <td className="p-3.5 text-slate-600 font-medium">
                          {u.branch || u.branchName || 'المقر العام'}
                        </td>

                        <td className="p-3.5">
                          {u.isActive !== false ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>حساب نشط</span>
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                              <span>حساب مجمد</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              title={u.isActive !== false ? 'تجميد الحساب' : 'تفعيل الحساب'}
                              className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                                u.isActive !== false
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {u.isActive !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => setEditingUser(u)}
                              title="تعديل الدور والصلاحيات"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ADD NEW EMPLOYEE WITH ROLES */}
      {activeTab === 'add_employee' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#13706A]" />
                <span>إضافة موظف جديد وتعيين الصلاحيات والأدوار</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                قم بتعبئة بيانات الكادر الميداني أو الإداري واختيار الدور الوظيفي لمنحه إمكانيات الوصول المناسبة.
              </p>
            </div>
            <span className="bg-teal-50 text-[#13706A] px-3 py-1 rounded-full text-xs font-bold border border-teal-200 hidden sm:inline-block">
              تفعيل الحساب فوراً
            </span>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الثلاثي المعتمد *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أ. إبراهيم يوسف السعدي"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني الرسمي *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ibrahim@tamkeen-zakat.ps"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف التواصل</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0599123456"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:bg-white focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الفرع / المحافظة المسؤولة *</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:bg-white focus:outline-none"
                >
                  <option value="المقر العام">المقر العام</option>
                  <option value="فرع نابلس">فرع نابلس</option>
                  <option value="فرع الخليل">فرع الخليل</option>
                  <option value="فرع رام الله والبيرة">فرع رام الله والبيرة</option>
                  <option value="فرع جنين">فرع جنين</option>
                  <option value="فرع بيت لحم">فرع بيت لحم</option>
                  <option value="فرع طولكرم">فرع طولكرم</option>
                  <option value="فرع قلقيلية وسلفيت">فرع قلقيلية وسلفيت</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور الخاصة بالحساب *</label>
                <div className="relative">
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور قوية للحساب..."
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                اختر الدور الوظيفي والصلاحية المطلوبة للموظف:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(roleDetails).map(([roleKey, details]) => {
                  const isSelected = role === roleKey;
                  return (
                    <div
                      key={roleKey}
                      onClick={() => setRole(roleKey as UserRole)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#13706A] bg-teal-50/50 shadow-xs ring-1 ring-[#13706A]'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${details.bg} ${details.text}`}>
                          {details.label}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-[#13706A] bg-[#13706A] text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{details.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className="px-5 py-3 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                إلغاء والعودة للقائمة
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl text-xs font-bold bg-[#13706A] hover:bg-[#0F5D58] text-white shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-emerald-300" />
                <span>حفظ الموظف وتفعيل الحساب فوراً</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'roles_matrix' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs text-slate-700">
            <Info className="w-5 h-5 text-[#13706A] shrink-0" />
            <p>
              تحدد مصفوفة الأدوار النطاق الوظيفي لكل مستخدم بالنظام للحفاظ على سرية ملفات الأسر المتعففة وتطابق القرارات المالية مع الضوابط الشرعية والإدارية.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#13706A] text-white font-bold">
                  <tr>
                    <th className="p-4 text-sm">الوظيفة / الصلاحية</th>
                    {Object.entries(roleDetails).slice(0, 8).map(([roleKey, details]) => (
                      <th key={roleKey} className="p-3 text-center text-[11px] whitespace-nowrap">
                        {details.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {permissionsMatrix.map((perm) => (
                    <tr key={perm.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-800 bg-slate-50/50">{perm.name}</td>
                      {Object.keys(roleDetails).slice(0, 8).map((roleKey) => {
                        const hasPermission = perm.roles.includes(roleKey);
                        return (
                          <td key={roleKey} className="p-3 text-center">
                            {hasPermission ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-400 rounded-full text-[10px]">
                                -
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-black text-base text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#13706A]" />
                <span>إضافة موظف / كادر جديد للنظام</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أ. محمد عبد الله"
                  className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني الوظيفي *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m.abdallah@tamkeen-zakat.ps"
                  className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف الشخصي / الوظيفي</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0599000000"
                  className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الدور الوظيفي والصلاحيات *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
                >
                  {Object.entries(roleDetails).map(([roleKey, details]) => (
                    <option key={roleKey} value={roleKey}>
                      {details.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الفرع أو المحافظة المسؤولة</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
                >
                  <option value="المقر العام">المقر العام</option>
                  <option value="فرع نابلس">فرع نابلس</option>
                  <option value="فرع الخليل">فرع الخليل</option>
                  <option value="فرع رام الله والبيرة">فرع رام الله والبيرة</option>
                  <option value="فرع جنين">فرع جنين</option>
                  <option value="فرع بيت لحم">فرع بيت لحم</option>
                  <option value="فرع طولكرم">فرع طولكرم</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#13706A] hover:bg-[#0F5D58] text-white shadow-xs"
                >
                  حفظ وإرسال الدعوة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER ROLE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-black text-base text-slate-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#13706A]" />
                <span>تعديل دور وصلاحيات: {editingUser.name}</span>
              </h2>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الدور الوظيفي الجديد:</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A]"
                >
                  {Object.entries(roleDetails).map(([roleKey, details]) => (
                    <option key={roleKey} value={roleKey}>
                      {details.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl space-y-1">
                <span className="font-bold text-[#13706A] block">وصف المسؤولية:</span>
                <p className="text-slate-600 text-[11px]">{roleDetails[editingUser.role]?.desc}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  تعيين كلمة مرور جديدة (اتركه فارغاً للإبقاء على كلمة المرور الحالية):
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={editingPassword}
                  onChange={(e) => setEditingPassword(e.target.value)}
                  placeholder="كلمة مرور جديدة..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-xs text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setEditingPassword('');
                  }}
                  className="px-4 py-2 rounded-xl font-bold bg-slate-100 text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    const updatedFields: Partial<User> = { role: editingUser.role };
                    if (editingPassword.trim()) {
                      updatedFields.password = editingPassword.trim();
                    }
                    if (onUpdateUser) {
                      onUpdateUser(editingUser.id, updatedFields);
                    } else {
                      const found = users.find((u) => u.id === editingUser.id);
                      if (found) {
                        found.role = editingUser.role;
                        if (editingPassword.trim()) found.password = editingPassword.trim();
                      }
                    }
                    alert(`تم تحديث بيانات وصلاحيات (${editingUser.name}) بنجاح.`);
                    setEditingUser(null);
                    setEditingPassword('');
                  }}
                  className="px-5 py-2 rounded-xl font-bold bg-[#13706A] text-white"
                >
                  تأكيد التعديل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
