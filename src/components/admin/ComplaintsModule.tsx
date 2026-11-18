import React, { useState } from 'react';
import { Complaint } from '../../types';
import {
  ShieldAlert, MessageSquare, CheckCircle2, Clock, Search, Filter,
  Send, User, Phone, FileText, Check, X, AlertCircle, HelpCircle
} from 'lucide-react';

interface ComplaintsModuleProps {
  complaints: Complaint[];
  onResolveComplaint: (id: string, response: string) => void;
}

export const ComplaintsModule: React.FC<ComplaintsModuleProps> = ({
  complaints,
  onResolveComplaint,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseInput, setResponseInput] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.applicantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nationalId?.includes(searchQuery) ||
      c.phone?.includes(searchQuery) ||
      c.relatedApplicationCode?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'INQUIRY') return c.type === 'استفسار';
    if (filterType === 'COMPLAINT') return c.type === 'شكوى' || c.type === 'تظلم';
    if (filterType === 'REVIEW') return c.type === 'طلب إعادة مراجعة';
    if (filterType === 'PENDING') return c.status !== 'تمت المعالجة' && c.status !== 'تم الرد' && c.status !== 'مغلق';
    if (filterType === 'RESOLVED') return c.status === 'تمت المعالجة' || c.status === 'تم الرد' || c.status === 'مغلق';

    return true;
  });

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !responseInput.trim()) return;

    onResolveComplaint(selectedComplaint.id, responseInput.trim());
    setSuccessToast(`تم تسجيل الرد الرسمي على الاستفسار/الشكوى برقم ${selectedComplaint.code} بنجاح وإغلاقها!`);
    setSelectedComplaint(null);
    setResponseInput('');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const getBadgeStyle = (status: string) => {
    if (status === 'تمت المعالجة' || status === 'تم الرد' || status === 'مغلق') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    return 'bg-amber-100 text-amber-900 border-amber-200';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast message */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#13706A]" />
            <span>إدارة الاستفسارات والشكاوى والتظلمات الواردة</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة جميع الاستفسارات، الشكاوى، وطلبات التظلم المقدمة عبر البوابة الإلكترونية والرد عليها مباشرة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-teal-50 border border-teal-200 text-[#13706A] px-3 py-1.5 rounded-2xl text-xs font-bold font-mono">
            إجمالي الوارد: {complaints.length}
          </span>
        </div>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'كافة الوارد', count: complaints.length },
              { id: 'INQUIRY', label: 'استفسارات', count: complaints.filter(c => c.type === 'استفسار').length },
              { id: 'COMPLAINT', label: 'شكاوى وتظلمات', count: complaints.filter(c => c.type === 'شكوى' || c.type === 'تظلم').length },
              { id: 'REVIEW', label: 'إعادة مراجعة', count: complaints.filter(c => c.type === 'طلب إعادة مراجعة').length },
              { id: 'PENDING', label: 'بانتظار الرد', count: complaints.filter(c => c.status !== 'تمت المعالجة' && c.status !== 'تم الرد').length },
              { id: 'RESOLVED', label: 'تم الرد والإنهاء', count: complaints.filter(c => c.status === 'تمت المعالجة' || c.status === 'تم الرد').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  filterType === tab.id
                    ? 'bg-[#13706A] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filterType === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، المرجع، الهوية..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl pr-9 pl-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#13706A]"
            />
          </div>
        </div>
      </div>

      {/* Complaints & Inquiries List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-slate-50/50">
              لا توجد استفسارات أو شكاوى مطابقة لمعايير البحث المحددة.
            </div>
          ) : (
            filteredComplaints.map((cmp) => (
              <div key={cmp.id} className="p-5 hover:bg-slate-50/80 transition-colors space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-[#13706A]/10 text-[#13706A] px-3 py-1 rounded-xl border border-[#13706A]/20">
                      {cmp.code}
                    </span>
                    <span className="font-bold text-sm text-slate-800">{cmp.applicantName}</span>
                    {cmp.nationalId && (
                      <span className="text-xs font-mono text-slate-500">(هوية: {cmp.nationalId})</span>
                    )}
                    {cmp.phone && (
                      <span className="text-xs font-mono text-slate-500" dir="ltr">({cmp.phone})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-xl font-bold">
                      النوع: {cmp.type || 'استفسار'}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-xl font-bold border ${getBadgeStyle(cmp.status)}`}>
                      {cmp.status}
                    </span>
                  </div>
                </div>

                {/* Question / Details Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>تاريخ الورود: {cmp.createdAt || 'اليوم'}</span>
                    {cmp.relatedApplicationCode && (
                      <span className="font-mono text-[#13706A] font-bold">
                        متعلق بالمعاملة رقم: {cmp.relatedApplicationCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium pt-1">
                    {cmp.details}
                  </p>
                </div>

                {/* Existing Response or Action Button */}
                {(cmp.response || cmp.responseDetails) ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#13706A] flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-[#13706A]" />
                        <span>الرد الرسمى الصادر من اللوحة الإدارية:</span>
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium pt-1">
                      {cmp.response || cmp.responseDetails}
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setSelectedComplaint(cmp);
                        setResponseInput('');
                      }}
                      className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>إضافة الرد الرسمي وإغلاق الاستفسار</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Response Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Tajawal',sans-serif]" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-[#0F5D58] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-300" />
                <h3 className="font-black text-base">الرد الرسمي على {selectedComplaint.type} رقم ({selectedComplaint.code})</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendResponse} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>المستفيد: {selectedComplaint.applicantName}</span>
                  {selectedComplaint.nationalId && <span>رقم الهوية: {selectedComplaint.nationalId}</span>}
                </div>
                <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                  "{selectedComplaint.details}"
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اكتب الرد الرسمي الذي سيظهر للمستفيد في البوابة الإلكترونية:
                </label>
                <textarea
                  required
                  rows={4}
                  value={responseInput}
                  onChange={(e) => setResponseInput(e.target.value)}
                  placeholder="مثال: تم استقبال استفساركم ومراجعة الملف من قبل قسم التدقيق... / نود إعلامكم بأن..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                ></textarea>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>اعتماد وإرسال الرد رسمياً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
