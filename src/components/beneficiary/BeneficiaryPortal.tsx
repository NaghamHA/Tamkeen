import React, { useState } from 'react';
import { Application, Complaint } from '../../types';
import {
  Search,
  UserCheck,
  FileText,
  Upload,
  Download,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';

interface BeneficiaryPortalProps {
  applicationsList: Application[];
  onUploadMissingDoc: (appId: string, docType: string, file: File) => void;
  onSubmitGrievance: (complaint: Partial<Complaint>) => void;
}

export const BeneficiaryPortal: React.FC<BeneficiaryPortalProps> = ({
  applicationsList,
  onUploadMissingDoc,
  onSubmitGrievance,
}) => {
  const [searchPhoneOrCode, setSearchPhoneOrCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activePortalTab, setActivePortalTab] = useState<'status' | 'docs' | 'grievance'>('status');

  // Grievance Form state
  const [grievanceType, setGrievanceType] = useState<'استفسار' | 'شكوى' | 'تظلم' | 'طلب إعادة مراجعة'>('تظلم');
  const [grievanceDetails, setGrievanceDetails] = useState('');
  const [grievanceSubmittedMsg, setGrievanceSubmittedMsg] = useState(false);

  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const q = searchPhoneOrCode.trim().toLowerCase();
    if (q.length < 5) {
      setSearchError('يرجى إدخال رقم الملف الكامل أو رقم الهوية أو رقم الهاتف بشكل صحيح.');
      return;
    }

    const matched = applicationsList.find(
      (a) =>
        a.code.trim().toLowerCase() === q ||
        (a.nationalId && a.nationalId.trim().toLowerCase() === q) ||
        (a.phone && a.phone.trim() === q)
    );

    if (matched) {
      setSelectedApp(matched);
      setIsLoggedIn(true);
    } else {
      setSearchError('لم يتم العثور على طلب مطابق للبيانات المدخلة. يرجى التأكد من صحة الرقم والمحاولة مرة أخرى.');
    }
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceDetails.trim() || !selectedApp) return;

    onSubmitGrievance({
      code: 'CMP-' + Math.floor(1000 + Math.random() * 9000),
      applicantName: selectedApp.fullName,
      nationalId: selectedApp.nationalId,
      phone: selectedApp.phone,
      relatedApplicationCode: selectedApp.code,
      type: grievanceType,
      details: grievanceDetails,
      status: 'جديد',
      createdAt: new Date().toLocaleString('ar-EG'),
    });

    setGrievanceSubmittedMsg(true);
    setGrievanceDetails('');
  };

  // Status Lifecycle Timeline Nodes
  const lifecycleSteps = [
    { key: 'SUBMITTED', title: 'تقديم الطلب', desc: 'تم استلام البيانات بنجاح' },
    { key: 'INITIAL_AUDIT', title: 'التدقيق الأولي', desc: 'فحص المرفقات والأوراق الرسمية' },
    { key: 'ASSIGNED_RESEARCHER', title: 'البحث الاجتماعي', desc: 'دراسة الحالة ميدانياً' },
    { key: 'REFERRED_COMMITTEE', title: 'عُرض على اللجنة', desc: 'التقييم واتخاذ القرار الشرعي' },
    { key: 'APPROVED', title: 'اعتماد القرار', desc: 'صدور الموافقة واعتماد المبلغ' },
    { key: 'DISBURSED', title: 'تم الصرف', desc: 'تحويل المبلغ أو تسليم المساعدة' },
  ];

  const getStepState = (stepKey: string, currentStatus: string) => {
    const order = ['SUBMITTED', 'INITIAL_AUDIT', 'ASSIGNED_RESEARCHER', 'REFERRED_COMMITTEE', 'APPROVED', 'DISBURSED'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);

    if (currentStatus === 'REJECTED') {
      return stepIndex === 0 ? 'passed' : 'rejected';
    }

    if (stepIndex < currentIndex) return 'passed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  if (!isLoggedIn || !selectedApp) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 bg-teal-50 text-[#13706A] rounded-full flex items-center justify-center mx-auto">
            <UserCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">الاستعلام عن حالة الطلب</h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              أدخل رقم الملف الكامل أو رقم الهاتف المسجل أو رقم الهوية للاطلاع على حالة طلبك ومراحل دراسته
            </p>
          </div>

          {searchError && (
            <div className="max-w-md mx-auto bg-red-50 border border-red-200 text-red-800 text-xs font-medium p-3.5 rounded-2xl">
              {searchError}
            </div>
          )}

          <form onSubmit={handleSearchLogin} autoComplete="off" className="space-y-4 max-w-md mx-auto">
            <div>
              <input
                type="text"
                required
                autoComplete="off"
                value={searchPhoneOrCode}
                onChange={(e) => {
                  setSearchPhoneOrCode(e.target.value);
                  if (searchError) setSearchError(null);
                }}
                placeholder="رقم الملف / رقم الهاتف / رقم الهوية"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-center font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#13706A] hover:bg-[#0F5D58] text-white py-3.5 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>بحث عن الطلب</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            حفاظاً على خصوصية المتقدمين، يتطلب الاستعلام تطابقاً تاماً لرقم الملف أو رقم الهوية الشخصية.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Top Banner with Applicant Overview */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#13706A] text-white text-xs font-mono font-semibold px-3 py-1 rounded-lg">
                {selectedApp.code}
              </span>
              <span className="text-xs text-slate-500">تاريخ التسجيل: {selectedApp.submissionDate}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{selectedApp.fullName}</h1>
            <p className="text-xs text-slate-500">
              {selectedApp.governorate} - {selectedApp.cityTownCamp} | هاتف: {selectedApp.phone}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 px-4 py-2 rounded-xl font-semibold"
            >
              بحث عن طلب آخر
            </button>
          </div>
        </div>

        {/* Portal Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100">
          <button
            onClick={() => setActivePortalTab('status')}
            className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-all ${
              activePortalTab === 'status'
                ? 'border-[#13706A] text-[#13706A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            مراحل دراسة الطلب
          </button>

          <button
            onClick={() => setActivePortalTab('docs')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all ${
              activePortalTab === 'docs'
                ? 'border-[#13706A] text-[#13706A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            المرفقات والمستندات ({selectedApp.documents.length})
          </button>

          <button
            onClick={() => setActivePortalTab('grievance')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all ${
              activePortalTab === 'grievance'
                ? 'border-[#13706A] text-[#13706A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            تقديم تظلم أو استفسار
          </button>
        </div>
      </div>

      {/* TAB 1: Status Timeline */}
      {activePortalTab === 'status' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">حالة الطلب الحالية</h2>
              <p className="text-xs text-slate-500">
                نوع المساعدة: {selectedApp.requestedAidType} | المبلغ المطلوب: {selectedApp.requestedAmount} ₪
              </p>
            </div>

            <div className="text-left">
              <span className="text-xs font-bold text-slate-500 block">الحالة:</span>
              <span className="bg-[#13706A] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm inline-block">
                {selectedApp.status}
              </span>
            </div>
          </div>

          {/* Interactive Timeline */}
          <div className="py-4">
            <div className="relative border-r-2 border-slate-200 mr-4 pr-6 space-y-8">
              {lifecycleSteps.map((s, idx) => {
                const st = getStepState(s.key, selectedApp.status);

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Circle badge */}
                    <div
                      className={`absolute -right-[37px] w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm ${
                        st === 'passed'
                          ? 'bg-emerald-600'
                          : st === 'active'
                          ? 'bg-[#13706A] ring-4 ring-teal-100 animate-pulse'
                          : st === 'rejected'
                          ? 'bg-red-600'
                          : 'bg-slate-300'
                      }`}
                    >
                      {st === 'passed' ? '✓' : idx + 1}
                    </div>

                    <div className="space-y-1">
                      <h4 className={`font-bold text-sm ${st === 'active' ? 'text-[#13706A]' : 'text-slate-900'}`}>
                        {s.title}
                      </h4>
                      <p className="text-xs text-slate-500">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Box if available */}
          {selectedApp.committeeDecision && (
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-emerald-800 block">قرار اللجنة المعتمد:</span>
              <p className="text-xs text-slate-700 font-semibold">
                تم اعتماد مبلغ {selectedApp.committeeDecision.approvedAmount} ₪ لصالحك.
              </p>
              <p className="text-xs text-slate-600">{selectedApp.committeeDecision.justification}</p>
            </div>
          )}

          {/* Download Official Receipt button */}
          <div className="pt-4 border-t flex justify-end">
            <button
              onClick={() => window.print()}
              className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-900"
            >
              <Download className="w-4 h-4" />
              <span>طباعة / حفظ إيصال الطلب الإلكتروني (PDF)</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Missing Documents Upload */}
      {activePortalTab === 'docs' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-slate-900 border-b pb-3">المستندات الثبوتية والمستبدلة</h2>

          <div className="space-y-4">
            {selectedApp.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{doc.title}</span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        doc.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'NEEDS_UPDATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {doc.status === 'ACCEPTED'
                        ? 'مقبول'
                        : doc.status === 'NEEDS_UPDATE'
                        ? 'مطلوب تعديل/استبدال'
                        : 'قيد المراجعة'}
                    </span>
                  </div>
                  {doc.rejectionReason && (
                    <p className="text-xs text-red-600 font-semibold">سبب النقص/الرفض: {doc.rejectionReason}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="bg-[#13706A] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#0F5D58] cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>إعادة إرفاق</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          onUploadMissingDoc(selectedApp.id, doc.type, e.target.files[0]);
                          alert('تم إرفاق المستند بنجاح وإرساله للمدقق.');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Grievance & Appeal */}
      {activePortalTab === 'grievance' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-slate-900 border-b pb-3">تقديم استفسار أو تظلم بشأن القرار</h2>

          {grievanceSubmittedMsg ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">تم إرسال التظلم/الاستفسار بنجاح</h3>
              <p className="text-xs text-slate-600">
                سيقوم قسم خدمة المستفيدين بالرد عليك عبر البوابة أو الهاتف خلال 48 ساعة.
              </p>
              <button
                onClick={() => setGrievanceSubmittedMsg(false)}
                className="bg-[#13706A] text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                تقديم استفسار آخر
              </button>
            </div>
          ) : (
            <form onSubmit={handleGrievanceSubmit} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع المعاملة *</label>
                <select
                  value={grievanceType}
                  onChange={(e) => setGrievanceType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs"
                >
                  <option value="استفسار">استفسار عادي</option>
                  <option value="تظلم">تظلم من قرار رفض أو تقليص مبلغ</option>
                  <option value="طلب إعادة مراجعة">طلب إعادة مراجعة مستندات جديدة</option>
                  <option value="شكوى">شكوى عامة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل الاستفسار أو التظلم *</label>
                <textarea
                  required
                  rows={4}
                  value={grievanceDetails}
                  onChange={(e) => setGrievanceDetails(e.target.value)}
                  placeholder="اكتب رسالتك وتوضيحاتك هنا..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs"
                />
              </div>

              <button
                type="submit"
                className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>إرسال التظلم إلى قسم المتابعة</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};


