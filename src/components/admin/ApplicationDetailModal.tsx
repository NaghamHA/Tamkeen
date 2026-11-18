import React, { useState } from 'react';
import { Application, ApplicationStatus, UserRole } from '../../types';
import {
  X, User, Users, DollarSign, HeartPulse, Home, History, Target, CreditCard,
  Paperclip, FileSearch, Gavel, CheckCircle2, Clock, MessageSquare, Lock, Printer,
  ShieldCheck, AlertTriangle, Send, Eye, ShieldAlert, Edit3, Check, Calendar
} from 'lucide-react';

interface ApplicationDetailModalProps {
  app: Application;
  currentUserRole: UserRole;
  onClose: () => void;
  onUpdateStatus: (appId: string, newStatus: ApplicationStatus, note?: string) => void;
  onUpdateApplicationDetails?: (appId: string, updatedFields: Partial<Application>) => void;
  onAddInternalNote: (appId: string, text: string) => void;
  onLogBankView: (appCode: string) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  app,
  currentUserRole,
  onClose,
  onUpdateStatus,
  onUpdateApplicationDetails,
  onAddInternalNote,
  onLogBankView,
}) => {
  const [activeModalTab, setActiveModalTab] = useState<string>('status_action');
  const [showFullBankDetails, setShowFullBankDetails] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Status Change State
  const [selectedTargetStatus, setSelectedTargetStatus] = useState<ApplicationStatus>(app.status);
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [statusSuccessMsg, setStatusSuccessMsg] = useState<string | null>(null);

  // Edit Application Form State
  const [editForm, setEditForm] = useState({
    fullName: app.fullName,
    nationalId: app.nationalId,
    phone: app.phone,
    governorate: app.governorate,
    cityTownCamp: app.cityTownCamp,
    requestedAidType: app.requestedAidType,
    requestedAmount: app.requestedAmount,
    urgency: app.urgency,
    maritalStatus: app.maritalStatus,
  });
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  const modalTabs = [
    { id: 'status_action', label: 'تغيير الحالة والقرار', icon: Target },
    { id: 'summary', label: 'تفاصيل الطلب والاحتياج', icon: CheckCircle2 },
    { id: 'personal', label: 'المعلومات الشخصية والاتصال', icon: User },
    { id: 'bank', label: 'بيانات الحساب والصرف', icon: CreditCard },
    { id: 'executive_decision', label: 'قرار الإدارة والصرف', icon: ShieldCheck },
    { id: 'social_research', label: 'التقييم الاجتماعي', icon: FileSearch },
    { id: 'activity_log', label: 'سجل حركات الطلب', icon: History, badge: app.activityLogs?.length || 0 },
    { id: 'edit_app', label: 'تعديل بيانات المعاملة', icon: Edit3 },
    { id: 'notes', label: 'الملاحظات الداخلية', icon: MessageSquare, badge: app.internalNotes?.length || 0 },
  ];

  const handleRevealBank = () => {
    setShowFullBankDetails(true);
    onLogBankView(app.code);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddInternalNote(app.id, newNoteText.trim());
    setNewNoteText('');
  };

  const handleConfirmStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(app.id, selectedTargetStatus, statusChangeReason.trim());
    setStatusSuccessMsg(`تم تغيير حالة الطلب بنجاح إلى "${statusLabel(selectedTargetStatus)}" وتسجيل الحركة بالسجل!`);
    setTimeout(() => setStatusSuccessMsg(null), 4000);
  };

  const handleSaveAppDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateApplicationDetails) {
      onUpdateApplicationDetails(app.id, {
        fullName: editForm.fullName,
        nationalId: editForm.nationalId,
        phone: editForm.phone,
        governorate: editForm.governorate,
        cityTownCamp: editForm.cityTownCamp,
        requestedAidType: editForm.requestedAidType as any,
        requestedAmount: Number(editForm.requestedAmount),
        urgency: editForm.urgency as any,
        maritalStatus: editForm.maritalStatus as any,
      });
      setEditSuccessMsg('تم حفظ وتعديل بيانات المعاملة بنجاح وتحديث السجل!');
      setTimeout(() => setEditSuccessMsg(null), 4000);
    }
  };

  const statusLabel = (st: ApplicationStatus) => {
    const map: { [key in ApplicationStatus]?: string } = {
      SUBMITTED: 'تم التقديم',
      NEW: 'طلب جديد',
      INITIAL_AUDIT: 'قيد التدقيق الأولي',
      INCOMPLETE: 'غير مكتمل المستندات',
      AWAITING_DOCS: 'بانتظار مستندات',
      IN_STUDY: 'قيد دراسة وتقييم الحالة',
      ASSIGNED_RESEARCHER: 'محال للباحث الاجتماعي',
      REFERRED_COMMITTEE: 'قيد المراجعة والتقييم النهائي',
      APPROVED: 'مكتمل ومستوفٍ للشروط',
      DISBURSED: 'مكتمل التقييم',
      REJECTED: 'طلب غير مستوفٍ للشروط (مرفوض)',
      CLOSED: 'معاملة مغلقة ومؤرشفة',
    };
    return map[st] || st;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-['Tajawal',sans-serif]" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Top Header */}
        <div className="bg-[#0F5D58] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="bg-white/10 text-emerald-200 font-mono font-bold px-3 py-1 rounded-xl text-xs border border-white/20">
              {app.code}
            </span>
            <div>
              <h2 className="text-lg font-black text-white">{app.fullName}</h2>
              <p className="text-xs text-emerald-100">
                {app.governorate} - {app.cityTownCamp} | تاريخ التقديم: {app.submissionDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-emerald-800 text-emerald-100 text-xs px-3.5 py-1.5 rounded-full font-bold border border-emerald-600">
              الحالة الحالية: {statusLabel(app.status)}
            </span>

            <button
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl text-xs flex items-center gap-1 font-bold"
              title="طباعة الملف"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tab Horizontal Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 pt-2 overflow-x-auto no-scrollbar flex items-center gap-1 shrink-0">
          {modalTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeModalTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveModalTab(tab.id)}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border-b-2 ${
                  isActive
                    ? 'bg-white text-[#13706A] border-[#13706A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-teal-100 text-[#13706A] text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body Scrollable Content with Persistent Beneficiary Summary Sidebar */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Persistent Right Sidebar: Beneficiary Quick Summary */}
            <aside className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 lg:sticky lg:top-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#13706A] flex items-center justify-center font-black text-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">بطاقة المستفيد المرجعية</span>
                    <h3 className="text-sm font-black text-slate-900">{app.fullName}</h3>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                  {app.age} سنة
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">رقم الهوية</span>
                  <span className="font-mono font-bold text-slate-800">{app.nationalId}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">رقم التواصل</span>
                  <span className="font-mono font-bold text-slate-800" dir="ltr">{app.phone}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">الحالة وأفراد الأسرة</span>
                  <span className="font-bold text-slate-800">{app.maritalStatus} ({app.familyCount} أفراد)</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">البلدة / المحافظة</span>
                  <span className="font-bold text-slate-800 truncate block">{app.cityTownCamp || app.governorate}</span>
                </div>
              </div>

              {/* Financial & Eligibility Highlight */}
              <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">نوع المساعدة:</span>
                  <span className="text-xs font-black text-[#13706A]">{app.requestedAidType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">المبلغ المطلوب:</span>
                  <span className="text-sm font-black font-mono text-slate-900">{app.requestedAmount} ₪</span>
                </div>
                <div className="pt-1 border-t border-teal-200/60 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">درجة الاستحقاق:</span>
                  <span className="text-xs font-mono font-black bg-[#13706A] text-white px-2.5 py-0.5 rounded-full">
                    {app.eligibilityScore}/100 ({app.eligibilityLevel})
                  </span>
                </div>
              </div>

              {/* Quick Tab Shortcuts */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalTab('status_action')}
                  className="flex-1 bg-[#13706A] hover:bg-[#0F5D58] text-white text-[11px] font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  تغيير الحالة
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('edit_app')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  تعديل البيانات
                </button>
              </div>
            </aside>

            {/* Main Left Content Area for Active Tab */}
            <div className="lg:col-span-8 space-y-6">
              {/* TAB 1: Change Status & Take Decision */}
              {activeModalTab === 'status_action' && (
                <div className="space-y-6 animate-fade-in">
                  {statusSuccessMsg && (
                    <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                        <span>{statusSuccessMsg}</span>
                      </div>
                    </div>
                  )}

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#13706A]" />
                    <span>اتخاذ قرار وتغيير حالة الطلب</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    اختر الحالة الجديدة واكتب التوصية أو مبرر القرار، ثم اضغط زر "حفظ وتأكيد القرار" لتطبيق التعديل وإدراجه بالسجل.
                  </p>
                </div>

                <form onSubmit={handleConfirmStatusChange} className="space-y-5">
                  {/* Status Options Grid */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">1. حدد الحالة الجديدة للطلب:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {[
                        { id: 'NEW', label: 'طلب جديد' },
                        { id: 'INITIAL_AUDIT', label: 'قيد التدقيق الأولي' },
                        { id: 'AWAITING_DOCS', label: 'طلب مستندات استكمالية' },
                        { id: 'IN_STUDY', label: 'قيد دراسة وتقييم الحالة' },
                        { id: 'ASSIGNED_RESEARCHER', label: 'محال للباحث الاجتماعي' },
                        { id: 'REFERRED_COMMITTEE', label: 'قيد المراجعة والتقييم' },
                        { id: 'APPROVED', label: 'مكتمل ومستوفٍ للشروط' },
                        { id: 'REJECTED', label: 'غير مستوفٍ للشروط (مرفوض)' },
                        { id: 'CLOSED', label: 'إغلاق المعاملة وأرشفتها' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedTargetStatus(opt.id as ApplicationStatus)}
                          className={`p-3 rounded-2xl border text-xs font-bold transition-all text-right flex items-center justify-between ${
                            selectedTargetStatus === opt.id
                              ? 'bg-[#13706A] text-white border-[#13706A] shadow-md ring-2 ring-[#13706A]/30'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {selectedTargetStatus === opt.id && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Decision Justification */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. مبرر اتخاذ القرار والتوصية المرفقة (اختياري / يسجل بالسجل الرسمى):
                    </label>
                    <textarea
                      rows={3}
                      value={statusChangeReason}
                      onChange={(e) => setStatusChangeReason(e.target.value)}
                      placeholder="اكتب أسباب تغير الحالة أو الملاحظات المرفقة للمستفيد والموظفين..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                    ></textarea>
                  </div>

                  {/* Explicit Save Action Button */}
                  <div className="pt-2 border-t flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>حفظ وتأكيد تغيير حالة الطلب وتسجيل الحركة</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: Edit Application Details */}
          {activeModalTab === 'edit_app' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              {editSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>{editSuccessMsg}</span>
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-[#13706A]" />
                    <span>تعديل البيانات الأساسية للمعاملة</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    تعديل بيانات المستفيد، نوع المساعدة، المبلغ المطلوب، أو المحافظة.
                  </p>
                </div>

                <form onSubmit={handleSaveAppDetails} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستفيد الكامل</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهوية</label>
                      <input
                        type="text"
                        value={editForm.nationalId}
                        onChange={(e) => setEditForm({ ...editForm, nationalId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نوع المساعدة المطلوبة</label>
                      <input
                        type="text"
                        value={editForm.requestedAidType}
                        onChange={(e) => setEditForm({ ...editForm, requestedAidType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المطلوب (₪)</label>
                      <input
                        type="number"
                        value={editForm.requestedAmount}
                        onChange={(e) => setEditForm({ ...editForm, requestedAmount: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono text-[#13706A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">درجة الاستعجال</label>
                      <select
                        value={editForm.urgency}
                        onChange={(e) => setEditForm({ ...editForm, urgency: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      >
                        <option value="CRITICAL">حالة طارئة جداً</option>
                        <option value="HIGH">عالية</option>
                        <option value="MEDIUM">متوسطة</option>
                        <option value="LOW">عادية</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة</label>
                      <input
                        type="text"
                        value={editForm.governorate}
                        onChange={(e) => setEditForm({ ...editForm, governorate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">المدينة / القرية / المخيم</label>
                      <input
                        type="text"
                        value={editForm.cityTownCamp}
                        onChange={(e) => setEditForm({ ...editForm, cityTownCamp: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-8 py-3 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>حفظ البيانات المعدلة على الملف</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: Application Activity Log (سجل حركات الطلب) */}
          {activeModalTab === 'activity_log' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <History className="w-5 h-5 text-[#13706A]" />
                      <span>سجل حركات ومراحل معالجة الطلب</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      التوثيق الكامل لجميع القرارات وتغييرات الحالة والعمليات المنفذة على هذا الملف.
                    </p>
                  </div>
                  <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold font-mono">
                    {app.activityLogs?.length || 0} حركة مسجلة
                  </span>
                </div>

                <div className="space-y-3">
                  {(!app.activityLogs || app.activityLogs.length === 0) ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed">
                      لا توجد حركات مسجلة حالياً على هذه المعاملة.
                    </div>
                  ) : (
                    app.activityLogs.map((log, idx) => (
                      <div key={log.id || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 relative">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#13706A] bg-teal-100/70 px-2.5 py-0.5 rounded-lg">
                              {log.action || 'تحديث معاملة'}
                            </span>
                            <span className="font-bold text-slate-800">{log.userName || 'موظف النظام'}</span>
                            <span className="text-[11px] text-slate-500">({log.userRole || 'مسؤول'})</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{log.timestamp}</span>
                          </span>
                        </div>

                        {log.previousStatus && log.newStatus && (
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-slate-500">الحالة السابقة: <strong className="text-slate-800">{statusLabel(log.previousStatus)}</strong></span>
                            <span>➔</span>
                            <span className="text-slate-500">الحالة الجديدة: <strong className="text-[#13706A] font-bold">{statusLabel(log.newStatus)}</strong></span>
                          </div>
                        )}

                        {log.details && (
                          <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed">
                            {log.details}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Summary & Details */}
          {activeModalTab === 'summary' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">درجة الاستحقاق الأولي</span>
                  <div className="text-3xl font-black text-[#13706A] font-mono">{app.eligibilityScore} / 100</div>
                  <span className="inline-block bg-[#13706A] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    {app.eligibilityLevel}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">المبلغ المطلوب وسقف المساعدة</span>
                  <div className="text-2xl font-black text-slate-800 font-mono">{app.requestedAmount} ₪</div>
                  <span className="text-xs text-slate-500 block">نوع المساعدة: {app.requestedAidType}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">درجة الاستعجال وقوام الأسرة</span>
                  <div className="text-2xl font-black text-amber-600 font-mono">{app.urgency}</div>
                  <span className="text-xs text-slate-500 block">عدد أفراد الأسرة: {app.familyCount} أفراد</span>
                </div>
              </div>

              {/* Application Need Details */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#13706A]" />
                  <span>تفاصيل وموضوع الطلب المقدم</span>
                </h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">موضوع/عنوان الطلب:</span>
                    <span className="font-bold text-slate-800 text-sm bg-slate-50 p-2.5 rounded-xl block border border-slate-200">
                      {app.requestTitle || `طلب مساعدة - ${app.fullName}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">شرح وتفاصيل الاحتياج والظروف المعيشية:</span>
                    <p className="text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 leading-relaxed font-medium">
                      {app.needDescription || 'لم يتم إضافة شرح تفصيلي.'}
                    </p>
                  </div>

                  {app.mainReason && (
                    <div>
                      <span className="text-slate-500 block mb-1">السبب الرئيسي للتقدم بالطلب:</span>
                      <span className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl block border border-slate-200">
                        {app.mainReason}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Declaration & Electronic Signature */}
              <div className="bg-teal-50/70 border border-teal-200 p-5 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#13706A]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>التوقيع والإقرار الإلكتروني المسجل</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div><span className="text-slate-500 block">اسم الموقّع:</span><span className="font-bold text-slate-800">{app.applicantSignature || app.fullName}</span></div>
                  <div><span className="text-slate-500 block">حالة التعهد:</span><span className="font-bold text-emerald-700">مقر وموافق بصحة البيانات</span></div>
                  <div><span className="text-slate-500 block">تاريخ التقديم:</span><span className="font-bold font-mono text-slate-700">{app.submissionDate}</span></div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-xs text-slate-800">إجراءات سريعة على الملف</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveModalTab('status_action')}
                    className="bg-[#13706A] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5"
                  >
                    <Target className="w-4 h-4" />
                    <span>تغيير الحالة واتخاذ قرار</span>
                  </button>

                  <button
                    onClick={() => setActiveModalTab('edit_app')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Edit3 className="w-4 h-4 text-slate-600" />
                    <span>تعديل بيانات المعاملة</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Personal & Contact */}
          {activeModalTab === 'personal' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-3">البيانات الشخصية والتعريفية</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div><span className="text-slate-500 block">اسم مقدم الطلب:</span><span className="font-bold text-slate-800">{app.fullName}</span></div>
                  <div><span className="text-slate-500 block">رقم الهوية / جواز السفر:</span><span className="font-bold font-mono text-slate-800">{app.nationalId}</span></div>
                  <div><span className="text-slate-500 block">تاريخ الميلاد والعمر:</span><span className="font-bold text-slate-800">{app.dob} ({app.age} سنة)</span></div>
                  <div><span className="text-slate-500 block">الجنس:</span><span className="font-bold text-slate-800">{app.gender || 'ذكر'}</span></div>
                  <div><span className="text-slate-500 block">الحالة الاجتماعية:</span><span className="font-bold text-slate-800">{app.maritalStatus}</span></div>
                  <div><span className="text-slate-500 block">عدد أفراد الأسرة:</span><span className="font-bold text-slate-800">{app.familyCount} أفراد</span></div>
                  <div><span className="text-slate-500 block">رقم الهاتف الرئيسي:</span><span className="font-bold font-mono text-slate-800" dir="ltr">{app.phone}</span></div>
                  <div><span className="text-slate-500 block">رقم الواتساب:</span><span className="font-bold font-mono text-slate-800" dir="ltr">{app.whatsappPhone || app.phone}</span></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-3">بيانات العنوان ومكان السكن</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div><span className="text-slate-500 block">المحافظة:</span><span className="font-bold text-slate-800">{app.governorate || '---'}</span></div>
                  <div><span className="text-slate-500 block">البلدة / المدينة / المخيم:</span><span className="font-bold text-slate-800">{app.cityTownCamp || '---'}</span></div>
                  <div><span className="text-slate-500 block">العنوان التفصيلي:</span><span className="font-bold text-slate-800">{app.detailedAddress || 'غير محدد'}</span></div>
                  <div><span className="text-slate-500 block">أقرب معلم معروف:</span><span className="font-bold text-slate-800">{app.nearestLandmark || 'غير محدد'}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Bank Details */}
          {activeModalTab === 'bank' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Lock className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>البيانات البنكية محمية بخصوصية وسجل تدقيق أمني. كل عملية فتح تسجل باسمك.</span>
                </div>
                {!showFullBankDetails && (
                  <button
                    onClick={handleRevealBank}
                    className="bg-amber-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-2xs hover:bg-amber-900"
                  >
                    عرض IBAN وتأكيد الصلاحية
                  </button>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                <div><span className="text-slate-500 block">اسم صاحب الحساب:</span><span className="font-bold text-sm text-slate-800">{app.bankAccount?.accountHolderName}</span></div>
                <div><span className="text-slate-500 block">اسم البنك والفرع:</span><span className="font-bold text-sm text-slate-800">{app.bankAccount?.bankName} - {app.bankAccount?.branchName}</span></div>
                <div><span className="text-slate-500 block">رقم الحساب:</span><span className="font-mono font-bold text-sm">{showFullBankDetails ? app.bankAccount?.accountNumber : '******' + (app.bankAccount?.accountNumber?.slice(-3) || '')}</span></div>
                <div className="md:col-span-2"><span className="text-slate-500 block">رقم IBAN كامل:</span><span className="font-mono font-bold text-sm text-[#13706A]">{showFullBankDetails ? app.bankAccount?.iban : 'PS90PALS...000' + (app.bankAccount?.accountNumber?.slice(-3) || '')}</span></div>
              </div>
            </div>
          )}

          {/* TAB: Documents */}
          {activeModalTab === 'documents' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-bold text-sm text-slate-800">الملفات الثبوتية والمستندات المرفقة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {app.documents?.map((doc) => (
                  <div key={doc.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">{doc.title}</span>
                      <span className="text-[11px] text-slate-500">{doc.fileName} ({doc.fileSize})</span>
                    </div>
                    <button className="bg-[#13706A] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة الملف</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Social Research */}
          {activeModalTab === 'social_research' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm border-b pb-2">تقرير وتوصية البحث الاجتماعي الميداني</h4>
                {app.socialResearchReport ? (
                  <div className="space-y-2">
                    <p className="text-slate-700 leading-relaxed">{app.socialResearchReport.summary || app.socialResearchReport.researcherNotes}</p>
                    <div className="pt-2 text-[#13706A] font-bold">المبلغ الموصى به: {app.socialResearchReport.recommendedAmount} ₪</div>
                  </div>
                ) : (
                  <div className="text-slate-400">لم يتم رفع تقرير ميداني بعد.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Executive Decision & Disbursement */}
          {activeModalTab === 'executive_decision' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="font-black text-[#13706A] text-sm flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#13706A]" />
                    <span>قرار الإدارة التنفيذية المباشر</span>
                  </span>
                  <span className="bg-[#13706A] text-white px-3 py-1 rounded-full font-bold text-xs">
                    الحالة: {app.status === 'APPROVED' || app.status === 'DISBURSED' ? 'معتمد ومقبول' : 'قيد المعالجة الإدارية'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div>
                    <span className="text-slate-500 block">المبلغ الموصى به/المعتمد:</span>
                    <span className="font-black text-[#13706A] text-base">
                      {app.committeeDecision?.approvedAmount || app.requestedAmount} ₪
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">جهة التمويل والاعتماد:</span>
                    <span className="font-bold text-slate-800">
                      {app.committeeDecision?.fundingSource || 'صندوق أموال الزكاة والصدقات - الإدارة العامة'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">مسؤول الاعتماد:</span>
                    <span className="font-bold text-slate-800">د. محمود القاسم (المدير العام)</span>
                  </div>
                </div>

                {app.disbursementRecord && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/80 bg-white p-4 rounded-xl space-y-2">
                    <span className="font-bold text-emerald-900 block">بيانات الصرف المالي المنفذ:</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-700">
                      <div><span className="text-slate-400 block">كود الصرف:</span><strong className="font-mono">{app.disbursementRecord.disbursementCode}</strong></div>
                      <div><span className="text-slate-400 block">طريقة الصرف:</span><strong>{app.disbursementRecord.paymentMethod}</strong></div>
                      <div><span className="text-slate-400 block">رقم المرجع:</span><strong className="font-mono">{app.disbursementRecord.transactionReference}</strong></div>
                      <div><span className="text-slate-400 block">تاريخ التنفيذ:</span><strong>{app.disbursementRecord.disbursedAt}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Internal Notes */}
          {activeModalTab === 'notes' && (
            <div className="space-y-6 animate-fade-in">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="إضافة ملاحظة داخلية خاصة بالملف..."
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
                />
                <button type="submit" className="bg-[#13706A] text-white px-4 py-2 rounded-xl font-bold text-xs">
                  إضافة
                </button>
              </form>

              <div className="space-y-3">
                {app.internalNotes?.map((n) => (
                  <div key={n.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{n.author} ({n.role})</span>
                      <span className="text-slate-400 font-normal">{n.date}</span>
                    </div>
                    <p className="text-slate-600">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
