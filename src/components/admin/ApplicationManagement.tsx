import React, { useState, useMemo } from 'react';
import { Application, ApplicationStatus } from '../../types';
import {
  Search,
  LayoutGrid,
  List,
  Columns,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

interface ApplicationManagementProps {
  applications: Application[];
  onSelectApplication: (app: Application) => void;
  onUpdateStatus: (appId: string, newStatus: ApplicationStatus) => void;
}

export const ApplicationManagement: React.FC<ApplicationManagementProps> = ({
  applications,
  onSelectApplication,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'kanban'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [aidTypeFilter] = useState<string>('ALL');
  const [governorateFilter, setGovernorateFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [duplicateOnly] = useState(false);

  // Selected for Bulk
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Filtered Logic
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = app.fullName.toLowerCase().includes(q);
        const matchesCode = app.code.toLowerCase().includes(q);
        const matchesPhone = app.phone.includes(q);
        const matchesNationalId = app.nationalId.includes(q);
        const matchesIban = app.bankAccount?.iban?.toLowerCase().includes(q);
        const matchesSa = app.socialAffairsFileNo?.toLowerCase().includes(q);

        if (!matchesName && !matchesCode && !matchesPhone && !matchesNationalId && !matchesIban && !matchesSa) {
          return false;
        }
      }

      if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
      if (aidTypeFilter !== 'ALL' && app.requestedAidType !== aidTypeFilter) return false;
      if (governorateFilter !== 'ALL' && app.governorate !== governorateFilter) return false;
      if (urgencyFilter !== 'ALL' && app.urgency !== urgencyFilter) return false;
      if (duplicateOnly && !app.hasDuplicateAlert) return false;

      return true;
    });
  }, [applications, searchQuery, statusFilter, aidTypeFilter, governorateFilter, urgencyFilter, duplicateOnly]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAppIds(filteredApps.map((a) => a.id));
    } else {
      setSelectedAppIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedAppIds.includes(id)) {
      setSelectedAppIds(selectedAppIds.filter((i) => i !== id));
    } else {
      setSelectedAppIds([...selectedAppIds, id]);
    }
  };

  const handleExportCSV = () => {
    const headers = 'رمز الطلب,اسم المستفيد,رقم الهوية,المحافظة,نوع المساعدة,المبلغ المطلوب,الحالة,درجة الاستعجال\n';
    const rows = filteredApps
      .map(
        (a) =>
          `"${a.code}","${a.fullName}","${a.nationalId}","${a.governorate}","${a.requestedAidType}",${a.requestedAmount},"${a.status}","${a.urgency}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `qatar_zakat_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusBadge = (st: ApplicationStatus) => {
    const map: { [key in ApplicationStatus]?: { label: string; color: string } } = {
      SUBMITTED: { label: 'تم التقديم', color: 'bg-blue-100 text-blue-800' },
      NEW: { label: 'طلب جديد', color: 'bg-teal-100 text-teal-800' },
      INITIAL_AUDIT: { label: 'قيد التدقيق الأولي', color: 'bg-[#13706A] text-white' },
      INCOMPLETE: { label: 'غير مكتمل', color: 'bg-amber-100 text-amber-800' },
      AWAITING_DOCS: { label: 'بانتظار مستندات', color: 'bg-amber-100 text-amber-900' },
      IN_STUDY: { label: 'قيد دراسة الحالة', color: 'bg-purple-100 text-purple-800' },
      ASSIGNED_RESEARCHER: { label: 'محال للباحث', color: 'bg-indigo-100 text-indigo-800' },
      REFERRED_COMMITTEE: { label: 'قيد القرار الإداري', color: 'bg-cyan-100 text-cyan-900' },
      APPROVED: { label: 'موافق عليه', color: 'bg-emerald-100 text-emerald-800' },
      DISBURSED: { label: 'تم الصرف', color: 'bg-emerald-800 text-white' },
      REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-800' },
    };

    const item = map[st] || { label: st, color: 'bg-slate-200 text-slate-800' };
    return (
      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block ${item.color}`}>
        {item.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Control Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-800">إدارة ودراسة جميع طلبات المساعدة</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              إجمالي النتائج المفلترة: <span className="font-bold text-[#13706A]">{filteredApps.length}</span> من أصل {applications.length} طلب
            </p>
          </div>

          {/* View Mode Switcher & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  viewMode === 'table' ? 'bg-white text-[#13706A] shadow-xs' : 'text-slate-500'
                }`}
                title="عرض الجدول"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">جدول</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  viewMode === 'cards' ? 'bg-white text-[#13706A] shadow-xs' : 'text-slate-500'
                }`}
                title="عرض البطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">بطاقات</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  viewMode === 'kanban' ? 'bg-white text-[#13706A] shadow-xs' : 'text-slate-500'
                }`}
                title="عرض كانبان Kanban"
              >
                <Columns className="w-4 h-4" />
                <span className="hidden sm:inline">مسار Kanban</span>
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، رمز الطلب، رقم الهوية، الهاتف..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#13706A]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="SUBMITTED">تم التقديم</option>
            <option value="NEW">طلب جديد</option>
            <option value="INITIAL_AUDIT">قيد التدقيق الأولي</option>
            <option value="AWAITING_DOCS">بانتظار مستندات</option>
            <option value="ASSIGNED_RESEARCHER">محال للباحث</option>
            <option value="REFERRED_COMMITTEE">محال للجنة</option>
            <option value="APPROVED">موافق عليه</option>
            <option value="DISBURSED">تم الصرف</option>
            <option value="REJECTED">مرفوض</option>
          </select>

          {/* Governorate Filter */}
          <select
            value={governorateFilter}
            onChange={(e) => setGovernorateFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            <option value="ALL">جميع المناطق والمحافظات</option>
            <option value="الخليل">الخليل</option>
            <option value="نابلس">نابلس</option>
            <option value="رام الله والبيرة">رام الله والبيرة</option>
            <option value="جنين">جنين</option>
            <option value="طولكرم">طولكرم</option>
            <option value="بيت لحم">بيت لحم</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            <option value="ALL">جميع مستويات الاستعجال</option>
            <option value="CRITICAL">حالة طارئة جداً</option>
            <option value="HIGH">عالية</option>
            <option value="MEDIUM">متوسطة</option>
            <option value="LOW">عادية</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                <tr>
                  <th className="p-3.5">
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      checked={selectedAppIds.length === filteredApps.length && filteredApps.length > 0}
                    />
                  </th>
                  <th className="p-3.5">رمز الطلب</th>
                  <th className="p-3.5">اسم المستفيد</th>
                  <th className="p-3.5">المحافظة والمنطقة</th>
                  <th className="p-3.5">نوع المساعدة</th>
                  <th className="p-3.5">المبلغ المطلوب</th>
                  <th className="p-3.5">الحالة الحالية</th>
                  <th className="p-3.5">درجة الاستعجال</th>
                  <th className="p-3.5">تاريخ التقديم</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <input
                        type="checkbox"
                        checked={selectedAppIds.includes(app.id)}
                        onChange={() => handleToggleSelect(app.id)}
                      />
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[#13706A]">{app.code}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{app.fullName}</div>
                      <div className="text-[11px] text-slate-400">هوية: {app.nationalId.slice(0, 5)}****</div>
                    </td>
                    <td className="p-3.5 text-slate-600">{app.governorate} — {app.cityTownCamp}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{app.requestedAidType}</td>
                    <td className="p-3.5 font-bold text-[#13706A]">{app.requestedAmount} ₪</td>
                    <td className="p-3.5">{statusBadge(app.status)}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          app.urgency === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : app.urgency === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {app.urgency}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{app.submissionDate.split(' ')[0]}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 mx-auto shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>فتح الملف</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Cards Grid */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:border-[#13706A] transition-all relative"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-mono font-bold text-xs text-[#13706A]">{app.code}</span>
                {statusBadge(app.status)}
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-base">{app.fullName}</h3>
                <p className="text-xs text-slate-500">{app.governorate} — {app.cityTownCamp}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">نوع المساعدة:</span>
                  <span className="font-bold text-slate-800">{app.requestedAidType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المبلغ المطلوب:</span>
                  <span className="font-black text-[#13706A]">{app.requestedAmount} ₪</span>
                </div>
              </div>

              <button
                onClick={() => onSelectApplication(app)}
                className="w-full bg-[#13706A] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>عرض ودراسة الملف الكامل</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


