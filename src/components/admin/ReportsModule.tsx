import React, { useState, useMemo } from 'react';
import { Application } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  Search,
  Filter,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  Building,
  RefreshCw,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface ReportsModuleProps {
  applications: Application[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ applications }) => {
  const [reportType, setReportType] = useState<string>('ALL');
  const [governorateFilter, setGovernorateFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maskSensitive, setMaskSensitive] = useState<boolean>(true);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Status Helpers
  const isCompleted = (status: string) =>
    ['APPROVED', 'PARTIALLY_APPROVED', 'DISBURSED', 'CLOSED'].includes(status);

  const isPending = (status: string) =>
    !['APPROVED', 'PARTIALLY_APPROVED', 'DISBURSED', 'CLOSED', 'REJECTED', 'CANCELLED', 'ARCHIVED', 'DUPLICATE'].includes(status);

  // Filtered Applications List
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Report Type Filter
      if (reportType === 'APPROVED' && !isCompleted(app.status)) return false;
      if (reportType === 'PENDING' && !isPending(app.status)) return false;
      if (reportType === 'URGENT' && app.urgency !== 'CRITICAL' && app.urgency !== 'HIGH') return false;
      if (reportType === 'DISBURSED' && app.status !== 'DISBURSED') return false;

      // Governorate Filter
      if (governorateFilter !== 'ALL' && app.governorate !== governorateFilter) return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = app.code.toLowerCase().includes(q);
        const matchesName = app.fullName.toLowerCase().includes(q);
        const matchesId = app.nationalId?.includes(q);
        const matchesPhone = app.phone?.includes(q);
        if (!matchesCode && !matchesName && !matchesId && !matchesPhone) return false;
      }

      return true;
    });
  }, [applications, reportType, governorateFilter, searchQuery]);

  // Statistics for Current Filtered Set
  const totalCount = filteredApplications.length;
  const totalRequested = filteredApplications.reduce((acc, curr) => acc + (curr.requestedAmount || 0), 0);
  const totalApproved = filteredApplications.reduce(
    (acc, curr) => acc + (curr.committeeDecision?.approvedAmount || (isCompleted(curr.status) ? curr.requestedAmount : 0)),
    0
  );

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredApplications.length === 0) {
      alert('لا توجد بيانات متاحة للتصدير بناءً على الفلاتر المحددة.');
      return;
    }

    // Header Row in Arabic
    const headers = [
      'رمز الطلب',
      'اسم المستفيد بالكامل',
      'رقم الهوية',
      'رقم الهاتف',
      'المحافظة',
      'البلدة / القرية',
      'نوع المساعدة المطلوبة',
      'المبلغ المطلوب (شيكل)',
      'المبلغ المعتمد (شيكل)',
      'درجة الأولوية',
      'تاريخ التقديم',
      'حالة الطلب الحالية'
    ];

    // Helper to format string for CSV escaping
    const escapeCsv = (str: string | number | undefined | null) => {
      if (str === undefined || str === null) return '""';
      const text = String(str).replace(/"/g, '""');
      return `"${text}"`;
    };

    // Build Rows
    const rows = filteredApplications.map((app) => {
      const nationalIdFormatted = maskSensitive && app.nationalId
        ? `${app.nationalId.slice(0, 4)}*****`
        : app.nationalId || '';

      const phoneFormatted = maskSensitive && app.phone
        ? `${app.phone.slice(0, 4)}***${app.phone.slice(-3)}`
        : app.phone || '';

      const approvedAmt = app.committeeDecision?.approvedAmount || (isCompleted(app.status) ? app.requestedAmount : 0);

      return [
        escapeCsv(app.code),
        escapeCsv(app.fullName),
        escapeCsv(nationalIdFormatted),
        escapeCsv(phoneFormatted),
        escapeCsv(app.governorate),
        escapeCsv(app.cityTownCamp || ''),
        escapeCsv(app.requestedAidType),
        escapeCsv(app.requestedAmount),
        escapeCsv(approvedAmt),
        escapeCsv(app.urgency === 'CRITICAL' ? 'طارئة جداً' : app.urgency === 'HIGH' ? 'مرتفعة' : 'عادية'),
        escapeCsv(app.submissionDate || '2026-07-15'),
        escapeCsv(app.status)
      ].join(',');
    });

    // Add UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility with Arabic characters
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `تقارير_مؤسسة_الزكاة_والصدقات_القطرية_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccessMessage('تم تصدير ملف إكسل CSV بنجاح ورابط التنزيل جاهز!');
    setTimeout(() => setExportSuccessMessage(null), 4000);
  };

  // PDF Export / Print Handler
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#13706A]"></span>
            <h1 className="text-2xl font-black text-slate-800">مركز التقارير والتصدير المتقدم</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            استخراج وتصدير بيانات طلبات المساعدة إلى صيغ CSV و PDF الرسمية للمراجعة والتدقيق الخارجي
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xs transition-all flex items-center gap-2 active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>تصدير ملف CSV (Excel)</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xs transition-all flex items-center gap-2 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ PDF رسمي</span>
          </button>
        </div>
      </div>

      {/* Export Success Banner */}
      {exportSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between animate-fade-in text-xs font-bold shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
          <button onClick={() => setExportSuccessMessage(null)} className="text-emerald-600 hover:underline">
            إغلاق
          </button>
        </div>
      )}

      {/* Filter and Control Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#13706A]" />
            <h3 className="font-bold text-slate-800 text-sm">إعدادات وتصنيف التقرير</h3>
          </div>

          <label className="flex items-center gap-2 font-bold text-slate-700 text-xs cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            {maskSensitive ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
            <input
              type="checkbox"
              checked={maskSensitive}
              onChange={(e) => setMaskSensitive(e.target.checked)}
              className="rounded text-[#13706A] focus:ring-[#13706A]"
            />
            <span>تشفير الأرقام الحساسة (الهوية والهاتف) عند التصدير والطباعة</span>
          </label>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Report Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">تصنيف التقرير:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
            >
              <option value="ALL">جميع طلبات المساعدة المسجلة</option>
              <option value="APPROVED">الطلبات المنجزة والمصروفة فقط</option>
              <option value="PENDING">الطلبات قيد الدراسة والتدقيق</option>
              <option value="URGENT">الحالات الطارئة والسريرية العاجلة</option>
              <option value="DISBURSED">الطلبات المكتملة بصرف مالي</option>
            </select>
          </div>

          {/* Governorate Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">المحافظة:</label>
            <select
              value={governorateFilter}
              onChange={(e) => setGovernorateFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
            >
              <option value="ALL">جميع المحافظات</option>
              <option value="نابلس">نابلس</option>
              <option value="رام الله والبيرة">رام الله والبيرة</option>
              <option value="الخليل">الخليل</option>
              <option value="جنين">جنين</option>
              <option value="بيت لحم">بيت لحم</option>
              <option value="طولكرم">طولكرم</option>
              <option value="قلقيلية">قلقيلية</option>
              <option value="سلفيت">سلفيت</option>
              <option value="طوباس">طوباس</option>
              <option value="أريحا">أريحا</option>
              <option value="القدس">ضواحي القدس</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">تصفية حسب الاسم أو رقم الطلب:</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم بالكامل، رمز الطلب، أو الهوية..."
                className="w-full bg-slate-50 border border-slate-200 pr-9 pl-4 p-2.5 rounded-xl font-medium text-xs text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>
        </div>

        {/* Filter Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">عدد الحالات المفلترة:</span>
            <span className="text-base font-black text-[#13706A] font-mono">{totalCount} حالة</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">إجمالي المبالغ المطلوبة:</span>
            <span className="text-base font-black text-slate-800 font-mono">{totalRequested.toLocaleString()} ₪</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">إجمالي المبالغ المعتمدة:</span>
            <span className="text-base font-black text-emerald-800 font-mono">{totalApproved.toLocaleString()} ₪</span>
          </div>
        </div>
      </div>

      {/* Printable Official Document Layout */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Official Letterhead Header */}
        <div className="flex items-center justify-between border-b border-slate-300 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#13706A] text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0">
              ت
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">مؤسسة الزكاة والصدقات القطرية</h2>
              <p className="text-xs text-[#13706A] font-bold">الإدارة العامة للمساعدات والتمكين</p>
              <p className="text-[10px] text-slate-500 mt-0.5">تقرير رسمي معتمد لإدارة المساعدات والحالات الإنسانية</p>
            </div>
          </div>

          <div className="text-left font-mono text-xs text-slate-600 space-y-1">
            <p><span className="font-bold text-slate-800">التاريخ:</span> {new Date().toLocaleDateString('ar-EG')}</p>
            <p><span className="font-bold text-slate-800">التصنيف:</span> {reportType}</p>
            <p><span className="font-bold text-slate-800">المحافظة:</span> {governorateFilter === 'ALL' ? 'كافة المحافظات' : governorateFilter}</p>
          </div>
        </div>

        {/* Report Summary Cards for Print */}
        <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
          <div>
            <span className="text-[10px] text-slate-500 block font-bold">إجمالي الطلبات المدرجة</span>
            <span className="text-sm font-black text-slate-900 font-mono">{totalCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-bold">إجمالي المطلوبات</span>
            <span className="text-sm font-black text-slate-900 font-mono">{totalRequested.toLocaleString()} ₪</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-700 block font-bold">إجمالي المعتمد الصرف</span>
            <span className="text-sm font-black text-emerald-800 font-mono">{totalApproved.toLocaleString()} ₪</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-bold">حالة التشفير</span>
            <span className="text-xs font-bold text-[#13706A]">{maskSensitive ? 'محمي ومفرغ' : 'كامل العرض'}</span>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-[#13706A] text-white font-bold border-b border-slate-300">
                <th className="p-3">#</th>
                <th className="p-3">رمز الطلب</th>
                <th className="p-3">اسم المستفيد بالكامل</th>
                <th className="p-3">رقم الهوية</th>
                <th className="p-3">المحافظة والبلدة</th>
                <th className="p-3">نوع المساعدة</th>
                <th className="p-3">المبلغ المطلوب</th>
                <th className="p-3">المعتمد</th>
                <th className="p-3">الحالة الحالية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                    لا توجد طلبات مسجلة تطابق محددات التقرير المختارة.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app, index) => {
                  const nationalIdFormatted = maskSensitive && app.nationalId
                    ? `${app.nationalId.slice(0, 4)}*****`
                    : app.nationalId || '-';

                  const approvedAmt = app.committeeDecision?.approvedAmount || (isCompleted(app.status) ? app.requestedAmount : 0);

                  return (
                    <tr key={app.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="p-3 font-mono font-bold text-slate-400">{index + 1}</td>
                      <td className="p-3 font-mono font-bold text-[#13706A]">{app.code}</td>
                      <td className="p-3 font-bold text-slate-900">{app.fullName}</td>
                      <td className="p-3 font-mono text-slate-700">{nationalIdFormatted}</td>
                      <td className="p-3">{app.governorate} {app.cityTownCamp ? `• ${app.cityTownCamp}` : ''}</td>
                      <td className="p-3">{app.requestedAidType}</td>
                      <td className="p-3 font-mono font-bold">{app.requestedAmount?.toLocaleString()} ₪</td>
                      <td className="p-3 font-mono font-bold text-emerald-800">
                        {approvedAmt ? `${approvedAmt.toLocaleString()} ₪` : '-'}
                      </td>
                      <td className="p-3 font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                          isCompleted(app.status)
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPending(app.status)
                            ? 'bg-sky-100 text-[#1E759A]'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Printable Official Footer Signatures Block */}
        <div className="pt-10 border-t border-slate-300 grid grid-cols-3 gap-8 text-center text-xs text-slate-700 font-bold">
          <div className="space-y-8">
            <p>إعداد وتدقيق الباحث الاجتماعي</p>
            <p className="text-slate-400 font-normal">الاسم والتوقيع: .....................</p>
          </div>
          <div className="space-y-8">
            <p>مصادقة مقرر لجنة المساعدات</p>
            <p className="text-slate-400 font-normal">الاسم والتوقيع: .....................</p>
          </div>
          <div className="space-y-8">
            <p>اعتماد المدير العام</p>
            <p className="text-slate-400 font-normal">الاسم والتوقيع: .....................</p>
          </div>
        </div>
      </div>
    </div>
  );
};
