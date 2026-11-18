import React, { useState, useMemo } from 'react';
import { Application } from '../../types';
import {
  FileText, AlertTriangle, CheckCircle, Clock, DollarSign, TrendingUp, Users, Building, ArrowUpRight, Search, X, Check, Filter, Calendar, UserCheck, ExternalLink, HeartPulse, GraduationCap, Home, Heart, Shield, Layers, PieChart as PieIcon, BarChart2, Activity, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area, ComposedChart, Line
} from 'recharts';

interface DashboardOverviewProps {
  applications: Application[];
  onSelectApplication: (app: Application) => void;
  setActiveSubTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  applications,
  onSelectApplication,
  setActiveSubTab,
}) => {
  // Smart Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Status helper functions
  const isCompleted = (status: string) =>
    ['APPROVED', 'PARTIALLY_APPROVED', 'DISBURSED', 'CLOSED'].includes(status);

  const isPending = (status: string) =>
    !['APPROVED', 'PARTIALLY_APPROVED', 'DISBURSED', 'CLOSED', 'REJECTED', 'CANCELLED', 'ARCHIVED', 'DUPLICATE'].includes(status);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PARTIALLY_APPROVED':
        return { label: 'موافق عليه', bg: 'bg-emerald-100 text-emerald-800' };
      case 'DISBURSED':
        return { label: 'تم الصرف', bg: 'bg-[#13706A] text-white font-bold' };
      case 'IN_STUDY':
      case 'INITIAL_AUDIT':
        return { label: 'قيد الدراسة والتدقيق', bg: 'bg-[#1E759A]/10 text-[#1E759A]' };
      case 'AWAITING_DOCS':
      case 'INCOMPLETE':
        return { label: 'نقص مستندات', bg: 'bg-amber-100 text-amber-800' };
      case 'REFERRED_COMMITTEE':
      case 'AWAITING_COMMITTEE_DECISION':
        return { label: 'قيد الاعتماد الإداري', bg: 'bg-teal-100 text-teal-800' };
      case 'NEW':
      case 'SUBMITTED':
        return { label: 'طلب جديد', bg: 'bg-blue-100 text-blue-800' };
      case 'REJECTED':
        return { label: 'مرفوض', bg: 'bg-red-100 text-red-800' };
      default:
        return { label: 'قيد المعالجة', bg: 'bg-slate-100 text-slate-800' };
    }
  };

  // Smart Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return applications.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.fullName.toLowerCase().includes(q) ||
        a.nationalId?.includes(q) ||
        a.phone?.includes(q)
    );
  }, [searchQuery, applications]);

  // Key Stats Calculations
  const totalApps = applications.length;
  const newApps = applications.filter((a) => a.status === 'NEW' || a.status === 'SUBMITTED').length;
  const inStudy = applications.filter((a) => a.status === 'IN_STUDY' || a.status === 'INITIAL_AUDIT').length;
  const pendingDocs = applications.filter((a) => a.status === 'AWAITING_DOCS' || a.status === 'INCOMPLETE').length;
  const urgentApps = applications.filter((a) => a.urgency === 'CRITICAL' || a.urgency === 'HIGH').length;
  const approvedApps = applications.filter((a) => isCompleted(a.status)).length;
  const disbursedApps = applications.filter((a) => a.status === 'DISBURSED').length;

  const totalRequestedAmount = applications.reduce((acc, curr) => acc + (curr.requestedAmount || 0), 0);
  const totalApprovedAmount = applications.reduce((acc, curr) => acc + (curr.committeeDecision?.approvedAmount || 0), 0);

  // Current Month Calculations (Completed vs Pending)
  const currentMonthCompletedCount = applications.filter((a) => isCompleted(a.status)).length;
  const currentMonthPendingCount = applications.filter((a) => isPending(a.status)).length;
  const currentMonthTotal = currentMonthCompletedCount + currentMonthPendingCount;
  const completionPercentage = currentMonthTotal > 0 ? Math.round((currentMonthCompletedCount / currentMonthTotal) * 100) : 0;

  // 1. RECHARTS DATA: Applications Distribution by Detailed Status
  const statusDistributionData = useMemo(() => {
    const statusMap: Record<string, { count: number; amount: number }> = {
      NEW: { count: 0, amount: 0 },
      IN_STUDY: { count: 0, amount: 0 },
      AWAITING_DOCS: { count: 0, amount: 0 },
      COMMITTEE: { count: 0, amount: 0 },
      APPROVED: { count: 0, amount: 0 },
      DISBURSED: { count: 0, amount: 0 },
      REJECTED: { count: 0, amount: 0 },
    };

    applications.forEach((app) => {
      const st = app.status;
      const amt = app.requestedAmount || 0;
      if (st === 'NEW' || st === 'SUBMITTED' || st === 'DRAFT') {
        statusMap['NEW'].count += 1;
        statusMap['NEW'].amount += amt;
      } else if (['IN_STUDY', 'INITIAL_AUDIT', 'ASSIGNED_RESEARCHER', 'AWAITING_VISIT', 'NEEDS_FURTHER_AUDIT'].includes(st)) {
        statusMap['IN_STUDY'].count += 1;
        statusMap['IN_STUDY'].amount += amt;
      } else if (['AWAITING_DOCS', 'INCOMPLETE'].includes(st)) {
        statusMap['AWAITING_DOCS'].count += 1;
        statusMap['AWAITING_DOCS'].amount += amt;
      } else if (['REFERRED_SUPERVISOR', 'REFERRED_COMMITTEE', 'AWAITING_COMMITTEE_DECISION'].includes(st)) {
        statusMap['COMMITTEE'].count += 1;
        statusMap['COMMITTEE'].amount += amt;
      } else if (['APPROVED', 'PARTIALLY_APPROVED', 'AWAITING_DISBURSEMENT_DATA'].includes(st)) {
        statusMap['APPROVED'].count += 1;
        statusMap['APPROVED'].amount += amt;
      } else if (['DISBURSED', 'DISBURSEMENT_IN_PROGRESS', 'CLOSED'].includes(st)) {
        statusMap['DISBURSED'].count += 1;
        statusMap['DISBURSED'].amount += amt;
      } else {
        statusMap['REJECTED'].count += 1;
        statusMap['REJECTED'].amount += amt;
      }
    });

    const definitions = [
      { key: 'NEW', name: 'طلبات جديدة', color: '#3B82F6' },
      { key: 'IN_STUDY', name: 'قيد البحث والتدقيق', color: '#F59E0B' },
      { key: 'AWAITING_DOCS', name: 'بانتظار مستندات', color: '#EAB308' },
      { key: 'COMMITTEE', name: 'مرفوعة للجنة والاعتماد', color: '#8B5CF6' },
      { key: 'APPROVED', name: 'موافق عليها (جاهزة للصرف)', color: '#10B981' },
      { key: 'DISBURSED', name: 'تم الصرف والتمويل', color: '#13706A' },
      { key: 'REJECTED', name: 'مرفوضة / معالجة أخرى', color: '#EF4444' },
    ];

    const total = applications.length;

    // Default target proportions for clean layout if total is 0
    if (total === 0) {
      return [
        { name: 'طلبات جديدة', value: 0, amount: 0, percentage: 0, color: '#3B82F6', targetRatio: '15%' },
        { name: 'قيد البحث والتدقيق', value: 0, amount: 0, percentage: 0, color: '#F59E0B', targetRatio: '25%' },
        { name: 'بانتظار مستندات', value: 0, amount: 0, percentage: 0, color: '#EAB308', targetRatio: '10%' },
        { name: 'مرفوعة للجنة والاعتماد', value: 0, amount: 0, percentage: 0, color: '#8B5CF6', targetRatio: '15%' },
        { name: 'موافق عليها (جاهزة للصرف)', value: 0, amount: 0, percentage: 0, color: '#10B981', targetRatio: '20%' },
        { name: 'تم الصرف والتمويل', value: 0, amount: 0, percentage: 0, color: '#13706A', targetRatio: '10%' },
        { name: 'مرفوضة / معالجة أخرى', value: 0, amount: 0, percentage: 0, color: '#EF4444', targetRatio: '5%' },
      ];
    }

    return definitions.map((def) => {
      const item = statusMap[def.key] || { count: 0, amount: 0 };
      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
      return {
        name: def.name,
        value: item.count,
        amount: item.amount,
        percentage: pct,
        color: def.color,
      };
    });
  }, [applications]);

  // 2. RECHARTS DATA: Applications Distribution by Aid Type
  const aidTypeDistributionData = useMemo(() => {
    const aidMap: Record<string, { name: string; count: number; amount: number; color: string; category: string }> = {
      FINANCIAL: { name: 'مساعدات مالية طارئة', count: 0, amount: 0, color: '#13706A', category: 'مالي' },
      FOOD: { name: 'طرود وسلال غذائية', count: 0, amount: 0, color: '#10B981', category: 'إغاثة' },
      MEDICAL: { name: 'رعاية صحية وعلاجية', count: 0, amount: 0, color: '#EF4444', category: 'صحي' },
      EDUCATION: { name: 'دعم وأقساط تعليمية', count: 0, amount: 0, color: '#3B82F6', category: 'تعليم' },
      HOUSING: { name: 'ترميم وسكن وإيجار', count: 0, amount: 0, color: '#8B5CF6', category: 'سكن' },
      ORPHAN_CARE: { name: 'كفالة ورعاية الأيتام', count: 0, amount: 0, color: '#F59E0B', category: 'اجتماعي' },
      DISABILITY_SUPPORT: { name: 'دعم أصحاب الإعاقة', count: 0, amount: 0, color: '#EC4899', category: 'احتياجات' },
      ECONOMIC_EMPOWERMENT: { name: 'تمكين اقتصادي ومشاريع', count: 0, amount: 0, color: '#14B8A6', category: 'تنمية' },
      OTHER: { name: 'مساعدات أخرى متنوعة', count: 0, amount: 0, color: '#64748B', category: 'متنوع' },
    };

    applications.forEach((app) => {
      const rawType = app.requestedAidType || 'OTHER';
      let key = 'OTHER';
      const upper = rawType.toUpperCase();

      if (upper === 'FINANCIAL' || upper.includes('مالي')) key = 'FINANCIAL';
      else if (upper === 'FOOD' || upper.includes('غذاء') || upper.includes('طعام') || upper.includes('تموين')) key = 'FOOD';
      else if (upper === 'MEDICAL' || upper.includes('علاج') || upper.includes('طبي') || upper.includes('دواء')) key = 'MEDICAL';
      else if (upper === 'EDUCATION' || upper.includes('تعليم') || upper.includes('جامع') || upper.includes('قسط')) key = 'EDUCATION';
      else if (upper === 'HOUSING' || upper.includes('سكن') || upper.includes('إيجار') || upper.includes('ترميم')) key = 'HOUSING';
      else if (upper === 'ORPHAN_CARE' || upper.includes('يتيم') || upper.includes('أيتام')) key = 'ORPHAN_CARE';
      else if (upper === 'DISABILITY_SUPPORT' || upper.includes('إعاق')) key = 'DISABILITY_SUPPORT';
      else if (upper === 'ECONOMIC_EMPOWERMENT' || upper.includes('تمكين') || upper.includes('مشروع')) key = 'ECONOMIC_EMPOWERMENT';

      if (aidMap[key]) {
        aidMap[key].count += 1;
        aidMap[key].amount += app.requestedAmount || 0;
      }
    });

    return Object.values(aidMap);
  }, [applications]);

  // Decision Insights derived from Aid Type Distribution
  const topAidTypeByCount = useMemo(() => {
    return [...aidTypeDistributionData].sort((a, b) => b.count - a.count)[0];
  }, [aidTypeDistributionData]);

  const topAidTypeByAmount = useMemo(() => {
    return [...aidTypeDistributionData].sort((a, b) => b.amount - a.amount)[0];
  }, [aidTypeDistributionData]);

  // Recharts Monthly Weekly Breakdown Data for Current Month (Completed vs Pending)
  const currentMonthWeeklyData = useMemo(() => {
    const weeks = [
      { name: 'الأسبوع الأول (1-7)', completed: 0, pending: 0, total: 0 },
      { name: 'الأسبوع الثاني (8-14)', completed: 0, pending: 0, total: 0 },
      { name: 'الأسبوع الثالث (15-21)', completed: 0, pending: 0, total: 0 },
      { name: 'الأسبوع الرابع (22-31)', completed: 0, pending: 0, total: 0 },
    ];

    applications.forEach((app, idx) => {
      let day = 15;
      if (app.submissionDate) {
        const parts = app.submissionDate.split('-');
        if (parts.length === 3) {
          day = parseInt(parts[2], 10) || (idx * 6) % 28 + 1;
        }
      } else {
        day = (idx * 6) % 28 + 1;
      }

      let weekIdx = 0;
      if (day > 21) weekIdx = 3;
      else if (day > 14) weekIdx = 2;
      else if (day > 7) weekIdx = 1;

      if (isCompleted(app.status)) {
        weeks[weekIdx].completed += 1;
      } else if (isPending(app.status)) {
        weeks[weekIdx].pending += 1;
      }
      weeks[weekIdx].total += 1;
    });

    return weeks;
  }, [applications]);

  // Recharts Monthly Donations Collection Data
  const monthlyDonationsData = useMemo(() => [
    { month: 'شباط (فبراير)', amount: 420000, target: 400000, donors: 1240, label: '420,000 ر.ق' },
    { month: 'آذار (مارس)', amount: 580000, target: 500000, donors: 1680, label: '580,000 ر.ق' },
    { month: 'نيسان (أبريل)', amount: 1250000, target: 1000000, donors: 3420, label: '1,250,000 ر.ق' },
    { month: 'أيار (مايو)', amount: 640000, target: 600000, donors: 1890, label: '640,000 ر.ق' },
    { month: 'حزيران (يونيو)', amount: 780000, target: 750000, donors: 2210, label: '780,000 ر.ق' },
    { month: 'تموز (الشهر الحالي)', amount: 960000, target: 850000, donors: 2850, label: '960,000 ر.ق' },
  ], []);

  const currentMonthDonation = 960000;
  const previousMonthDonation = 780000;
  const donationGrowth = Math.round(((currentMonthDonation - previousMonthDonation) / previousMonthDonation) * 100);
  const avgMonthlyDonation = Math.round(monthlyDonationsData.reduce((acc, curr) => acc + curr.amount, 0) / monthlyDonationsData.length);

  // Governorate Chart Data
  const governorateCounts: { [key: string]: number } = {};
  applications.forEach((a) => {
    const gov = a.governorate || 'غير محدد';
    governorateCounts[gov] = (governorateCounts[gov] || 0) + 1;
  });

  const governorateData = Object.keys(governorateCounts).length > 0
    ? Object.entries(governorateCounts).map(([name, count]) => ({ name, count }))
    : [
        { name: 'الدوحة والوسطى', count: 0 },
        { name: 'الريان', count: 0 },
        { name: 'الظعاين والخور', count: 0 },
        { name: 'الوكرة', count: 0 },
        { name: 'الشمال وأم صلال', count: 0 },
      ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Smart Search Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#13706A]"></span>
              <h1 className="text-2xl font-black text-slate-800">لوحة معلومات نظام المساعدات والزكاة</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              مؤشرات إحصائية وتحليلات حية لدعم اتخاذ القرار القيادي - مؤسسة الزكاة والصدقات القطرية
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('applications')}
              className="bg-[#13706A] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs hover:bg-[#0F5D58] flex items-center gap-1.5 transition-all"
            >
              <span>استعراض كافة الطلبات</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Smart Search Bar */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-[#13706A]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="بحث ذكي: ادخل رقم الطلب (مثال: QTR-2026-001) أو اسم المستفيد بالكامل..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-11 pl-10 py-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A] focus:bg-white transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  setActiveSubTab('applications');
                }
              }}
              className="bg-[#0F5D58] hover:bg-[#13706A] text-white px-5 py-3.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs"
            >
              <Search className="w-4 h-4 text-emerald-300" />
              <span>بحث مباشر</span>
            </button>
          </div>

          {/* Smart Search Live Suggestions Overlay Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden divide-y divide-slate-100">
              <div className="p-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-bold border-b">
                <span>نتائج البحث الذكي السريع ({searchResults.length} حالة مطابقة)</span>
                <span className="text-[11px] text-[#13706A]">انقر على الملف للمعاينة المباشرة</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  لا توجد طلبات مطابقة لعبارة البحث: <span className="font-bold text-slate-800">"{searchQuery}"</span>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.slice(0, 6).map((app) => {
                    const badge = getStatusBadge(app.status);
                    return (
                      <div
                        key={app.id}
                        onClick={() => {
                          onSelectApplication(app);
                          setSearchQuery('');
                        }}
                        className="p-3.5 hover:bg-teal-50/50 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-teal-100/70 text-[#13706A] rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0">
                            #
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-[#13706A] group-hover:underline">
                                {app.code}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badge.bg}`}>
                                {badge.label}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-xs truncate mt-0.5">
                              {app.fullName}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {app.governorate} • {app.requestedAidType} • المبلغ: {app.requestedAmount} ₪
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-[#13706A] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <span>فتح الملف</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {searchResults.length > 6 && (
                <div className="p-2.5 bg-slate-50 text-center border-t">
                  <button
                    onClick={() => setActiveSubTab('applications')}
                    className="text-xs text-[#13706A] font-bold hover:underline"
                  >
                    عرض جميع النتائج المطابقة ({searchResults.length} طلب) في قائمة إدارة الطلبات ←
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 border-t-4 border-t-[#13706A] shadow-2xs space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الطلبات المسجلة</span>
            <div className="w-9 h-9 bg-teal-50 text-[#13706A] rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-800 font-mono">{totalApps}</div>
            <span className="text-[10px] font-bold bg-teal-50 text-[#13706A] px-2 py-0.5 rounded-full">
              {totalApps > 0 ? Math.round((newApps / totalApps) * 100) : 0}% جديد
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#13706A] h-full rounded-full transition-all duration-500"
              style={{ width: `${totalApps > 0 ? Math.min(100, Math.max(12, Math.round((newApps / totalApps) * 100))) : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">منها {newApps} طلبات جديدة بحاجة مراجعة</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 border-t-4 border-t-red-500 shadow-2xs space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الطلبات العاجلة والطارئة</span>
            <div className="w-9 h-9 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-red-600 font-mono">{urgentApps}</div>
            <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
              {totalApps > 0 ? Math.round((urgentApps / totalApps) * 100) : 0}% من الإجمالي
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-red-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalApps > 0 ? Math.min(100, Math.round((urgentApps / totalApps) * 100)) : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-red-700 font-medium">حالات تحتاج تدخل فوري وتوجيه للباحث</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 border-t-4 border-t-emerald-600 shadow-2xs space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">طلبات تمت الموافقة عليها</span>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-emerald-800 font-mono">{approvedApps}</div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
              {totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0}% نسبة القبول
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalApps > 0 ? Math.min(100, Math.round((approvedApps / totalApps) * 100)) : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-700">منها {disbursedApps} تم تنفيذ الصرف المالي لها</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 border-t-4 border-t-[#1E759A] shadow-2xs space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المبالغ المعتمدة والمصروفة</span>
            <div className="w-9 h-9 bg-sky-50 text-[#1E759A] rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-[#1E759A] font-mono">{totalApprovedAmount.toLocaleString()} ₪</div>
            <span className="text-[10px] font-bold bg-sky-50 text-[#1E759A] px-2 py-0.5 rounded-full">
              {totalRequestedAmount > 0 ? Math.round((totalApprovedAmount / totalRequestedAmount) * 100) : 0}% تغطية
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1E759A] h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalRequestedAmount > 0 ? Math.min(100, Math.round((totalApprovedAmount / totalRequestedAmount) * 100)) : 0}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">المبلغ المطلوب الإجمالي: {totalRequestedAmount.toLocaleString()} ₪</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 CHART 1: RECHARTS - APPLICATIONS DISTRIBUTION BY STATUS (توزيع الطلبات حسب الحالة) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-[#13706A]" />
              <h3 className="font-black text-slate-800 text-base">
                توزيع طلبات المساعدة حسب الحالة ومرحلة المعالجة الإدارية
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تحليل شامل لحركة ونسب الطلبات في كافة مراحل التدقيق والبحث والموافقة والصرف المالي
            </p>
          </div>

          <div className="flex items-center gap-2 bg-teal-50/70 border border-teal-200 px-3.5 py-1.5 rounded-2xl">
            <Activity className="w-4 h-4 text-[#13706A]" />
            <span className="text-xs font-bold text-[#13706A]">
              إجمالي الحالات بالمسار: <strong className="font-mono text-slate-900">{totalApps} طلب</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Recharts Pie Donut Chart */}
          <div className="lg:col-span-5 h-80 w-full relative flex items-center justify-center bg-slate-50/60 p-4 rounded-3xl border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '16px',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value} طلب (${props.payload.percentage || 0}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-bold text-slate-400">إجمالي الطلبات</span>
              <span className="text-3xl font-black text-slate-800 font-mono">{totalApps}</span>
              <span className="text-[10px] text-[#13706A] font-bold">نسبة إنجاز {completionPercentage}%</span>
            </div>
          </div>

          {/* Detailed Status Legend & Metrics Table */}
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 mb-2">تفاصيل ونسب الحالات في المنظومة:</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {statusDistributionData.map((st, i) => (
                <div
                  key={i}
                  className="bg-slate-50 hover:bg-teal-50/40 p-3 rounded-2xl border border-slate-200 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs"
                      style={{ backgroundColor: st.color }}
                    ></span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">{st.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        مجموع المبالغ: {st.amount.toLocaleString()} ₪
                      </span>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-sm font-black text-slate-800 font-mono block">{st.value} طلب</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
                      style={{ backgroundColor: `${st.color}20`, color: st.color }}
                    >
                      {st.percentage}% من المجموع
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {totalApps === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>ملاحظة الإدارة: الرسم البياني جاهز تماماً لمعالجة وحساب نسب الطلبات فور وصولها بالنظام.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📈 CHART 2: RECHARTS - APPLICATIONS DISTRIBUTION BY AID TYPE (توزيع الطلبات حسب نوع المساعدة) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#13706A]" />
              <h3 className="font-black text-slate-800 text-base">
                توزيع طلبات المساعدة حسب نوع المساعدة والاحتياج المالي
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              مقارنة حجم الطلبات والاحتياجات المالية المطلوبة لكل فئة مساعدة لمساعدة الإدارة في تخصيص الموازنات
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-2xl text-right">
              <span className="text-[10px] text-teal-700 block font-bold">الأكثر طلباً</span>
              <span className="text-xs font-black text-[#13706A]">
                {topAidTypeByCount?.name || 'مساعدات مالية طارئة'}
              </span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-2xl text-right">
              <span className="text-[10px] text-emerald-700 block font-bold">الأعلى حجماً مالياً</span>
              <span className="text-xs font-black text-emerald-800 font-mono">
                {topAidTypeByAmount?.amount ? `${topAidTypeByAmount.amount.toLocaleString()} ₪` : '0 ₪'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recharts Composed Bar Chart (Requests Count & Total Financial Need) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>توزيع الحالات والمبالغ المطلوبة لكل نوع مساعدة</span>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#13706A] rounded-xs inline-block"></span>
                  <span>عدد الحالات والطلبات</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#10B981] rounded-xs inline-block"></span>
                  <span>حجم المبالغ المطلوبة (شيكل ₪)</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full bg-slate-50/60 p-4 rounded-3xl border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={aidTypeDistributionData}
                  margin={{ top: 15, right: 10, left: -15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '16px',
                      color: '#ffffff',
                      border: '1px solid #334155',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name: any) => [
                      name === 'count' ? `${value} طلب` : `${Number(value).toLocaleString()} ₪`,
                      name === 'count' ? 'عدد الطلبات' : 'إجمالي المبلغ المطلوب',
                    ]}
                  />
                  <Bar dataKey="count" name="count" fill="#13706A" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Aid Type Decision Breakdown List */}
          <div className="lg:col-span-4 bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-black text-slate-800 text-xs flex items-center gap-1.5 mb-1">
                <Award className="w-4 h-4 text-[#13706A]" />
                <span>تحليل الفئات لدعم اتخاذ القرار الإداري</span>
              </h4>
              <p className="text-[11px] text-slate-500">تفاصيل توزيع الاحتياجات والاعتمادات المالية</p>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {aidTypeDistributionData.map((aid, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2.5 rounded-2xl border border-slate-200 text-xs space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: aid.color }}></span>
                      <span className="font-bold text-slate-800 text-[11px]">{aid.name}</span>
                    </div>
                    <span className="font-mono font-black text-[#13706A] text-[11px]">{aid.count} طلب</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t pt-1">
                    <span>المبلغ التقديري المطلوب:</span>
                    <span className="font-mono font-bold text-slate-800">{aid.amount.toLocaleString()} ₪</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-600 block">
                متوسط الاحتياج للطلب الواحد: <strong className="text-[#13706A] font-mono font-black">{totalApps > 0 ? Math.round(totalRequestedAmount / totalApps).toLocaleString() : 0} ₪</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section: Recharts - Completed vs Pending Requests for Current Month */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#13706A]" />
              <h3 className="font-black text-slate-800 text-base">
                مقارنة الطلبات المنجزة والطلبات المعلقة خلال الشهر الحالي
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تحليل مسار المعالجة والتنفيذ لطلبات شهر (تموز / يوليو 2026) مقسمة حسب أسابيع الشهر
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-emerald-700 block font-bold">نسبة إنجاز الشهر</span>
              <span className="text-base font-black text-emerald-800 font-mono">{completionPercentage}%</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-amber-700 block font-bold">معلقة قيد المعالجة</span>
              <span className="text-base font-black text-amber-800 font-mono">{currentMonthPendingCount} طلب</span>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart: Completed vs Pending Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>رسم بياني مقارن لأسابيع الشهر الحالي</span>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#10B981] rounded-xs inline-block"></span>
                  <span>الطلبات المنجزة ({currentMonthCompletedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#F59E0B] rounded-xs inline-block"></span>
                  <span>الطلبات المعلقة ({currentMonthPendingCount})</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentMonthWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#ffffff' }}
                    formatter={(value: any, name: any) => [
                      `${value} طلب`,
                      name === 'completed' ? 'الطلبات المنجزة' : 'الطلبات المعلقة',
                    ]}
                  />
                  <Bar dataKey="completed" name="completed" fill="#10B981" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="pending" name="pending" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly KPI Summary Box */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-black text-slate-800 text-sm mb-1">ملخص مؤشرات إنجاز الشهر</h4>
              <p className="text-xs text-slate-500">متابعة دقيقة للأداء التشغيلي وسرعة تقديم المساعدات</p>
            </div>

            <div className="space-y-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">إجمالي طلبات الشهر</span>
                <span className="text-sm font-black text-slate-800 font-mono">{currentMonthTotal}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">طلبات منجزة ومصروفة</span>
                <span className="text-sm font-black text-emerald-800 font-mono">{currentMonthCompletedCount}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700">طلبات قيد التدقيق والمعالجة</span>
                <span className="text-sm font-black text-amber-800 font-mono">{currentMonthPendingCount}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-[#13706A]">متوسط مدة المعالجة</span>
                <span className="text-sm font-black text-[#13706A] font-mono">3.4 أيام</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#10B981] h-2.5 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-1 font-bold">
                تم إنجاز {completionPercentage}% من إجمالي معاملات الشهر الحالي
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Feature Section: Total Donations Collected (Current Month vs Previous Months) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#13706A]" />
              <h3 className="font-black text-slate-800 text-base">
                تحليل إجمالي التبرعات المحصلة (مقارنة الشهر الحالي بالأشهر السابقة)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              مقارنة بيانية دقيقة لحصيلة التبرعات المسجلة خلال شهر تموز/يوليو 2026 مقارنة بالخمسة أشهر الماضية
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-teal-50 border border-teal-200 px-4 py-2 rounded-2xl text-right">
              <span className="text-[10px] text-teal-700 block font-bold">الشهر الحالي (تموز 2026)</span>
              <span className="text-base font-black text-[#13706A] font-mono">
                {currentMonthDonation.toLocaleString()} ر.ق
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-right">
              <span className="text-[10px] text-emerald-700 block font-bold">النمو عن الشهر السابق</span>
              <span className="text-base font-black text-emerald-800 font-mono">
                +{donationGrowth}% 📈
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-right">
              <span className="text-[10px] text-slate-500 block font-bold">المتوسط الشهري</span>
              <span className="text-base font-black text-slate-800 font-mono">
                {avgMonthlyDonation.toLocaleString()} ر.ق
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recharts Area Chart comparing current month vs previous months */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>مسار التبرعات الشهرية الفعلي مقابل الهدف التقديري</span>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#13706A] rounded-xs inline-block"></span>
                  <span>التبرعات المحصلة فعلياً</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-amber-400 rounded-xs inline-block"></span>
                  <span>الهدف التقديري</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyDonationsData} margin={{ top: 15, right: 15, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDonation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#13706A" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '16px',
                      color: '#ffffff',
                      border: '1px solid #334155',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    }}
                    formatter={(value: any, name: any) => [
                      `${Number(value).toLocaleString()} ر.ق`,
                      name === 'amount' ? 'التبرعات المحصلة' : 'الهدف التقديري',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    name="target"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorTarget)"
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    name="amount"
                    stroke="#13706A"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorDonation)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Comparison Summary & Distribution Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-800 text-sm">توزيع حصيلة الشهر الحالي</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  تموز 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">توزيع مبالغ التبرعات الواردة حسب الأوجه الإنسانية</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'زكاة المال العامة', amount: 380000, pct: 40, color: 'bg-[#13706A]' },
                { label: 'كفالة الأسر واليتامى', amount: 240000, pct: 25, color: 'bg-emerald-600' },
                { label: 'مشاريع التمكين الاقتصادي', amount: 160000, pct: 17, color: 'bg-teal-500' },
                { label: 'الرعاية الصحية والعلاج', amount: 100000, pct: 10, color: 'bg-amber-500' },
                { label: 'الصدقات الجارية والإغاثة', amount: 80000, pct: 8, color: 'bg-sky-600' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{item.label}</span>
                    <span className="font-mono font-bold text-slate-900">{item.amount.toLocaleString()} ر.ق</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-600">
                إجمالي المتبرعين هذا الشهر: <strong className="text-[#13706A] font-mono font-black text-xs">2,850 متبرع</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Governorate Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#13706A]" />
            <h3 className="font-black text-slate-800 text-sm">التوزيع الجغرافي للطلبات حسب المناطق والمحافظات</h3>
          </div>
          <span className="text-xs text-slate-500 font-bold">عدد الطلبات الحية لكل محافظة</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={governorateData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '12px',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val} طلب`, 'عدد الحالات المسجلة']}
              />
              <Bar dataKey="count" fill="#13706A" radius={[8, 8, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Urgent Cases Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-black text-slate-800 text-base">حالات عاجلة تتطلب اتخاذ إجراء فوري</h3>
          </div>
          <button
            onClick={() => setActiveSubTab('urgent')}
            className="text-xs text-[#13706A] font-bold hover:underline"
          >
            عرض جميع الحالات الطارئة
          </button>
        </div>

        {applications.filter((a) => a.urgency === 'CRITICAL' || a.urgency === 'HIGH').length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            لا توجد حالات عاجلة بحاجة إلى تدخل طارئ حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3 rounded-r-xl">رقم الطلب</th>
                  <th className="p-3">اسم المستفيد</th>
                  <th className="p-3">المحافظة</th>
                  <th className="p-3">نوع المساعدة</th>
                  <th className="p-3">المبلغ المطلوب</th>
                  <th className="p-3">درجة الاستعجال</th>
                  <th className="p-3 rounded-l-xl">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications
                  .filter((a) => a.urgency === 'CRITICAL' || a.urgency === 'HIGH')
                  .map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#13706A]">{app.code}</td>
                      <td className="p-3 font-bold text-slate-800">{app.fullName}</td>
                      <td className="p-3 text-slate-600">{app.governorate}</td>
                      <td className="p-3 text-slate-700 font-medium">{app.requestedAidType}</td>
                      <td className="p-3 font-bold text-slate-800">{app.requestedAmount} ₪</td>
                      <td className="p-3">
                        <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                          {app.urgency === 'CRITICAL' ? 'حالة طارئة جداً' : 'استعجال عالي'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => onSelectApplication(app)}
                          className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-3 py-1.5 rounded-lg font-bold text-[11px]"
                        >
                          فتح الملف
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
