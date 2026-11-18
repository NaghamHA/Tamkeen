import React, { useState } from 'react';
import { Application, SocialResearchReport, UrgencyLevel, AidType } from '../../types';
import { FileSearch, CheckCircle, Save, Printer, User, Calendar, MapPin, Plus } from 'lucide-react';

interface SocialResearchModuleProps {
  applications: Application[];
  onSaveReport: (appId: string, report: SocialResearchReport) => void;
}

export const SocialResearchModule: React.FC<SocialResearchModuleProps> = ({
  applications,
  onSaveReport,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const selectedApp = applications.find((a) => a.id === selectedAppId);

  const [researcherName, setResearcherName] = useState('أ. طارق الخليلي');
  const [researchDate, setResearchDate] = useState(new Date().toISOString().split('T')[0]);
  const [contactMethod, setContactMethod] = useState<'زيارة ميدانية' | 'اتصال هاتفي' | 'مقابلة بمقر المؤسسة'>('زيارة ميدانية');
  const [summary, setSummary] = useState('');
  const [familyCondition, setFamilyCondition] = useState('');
  const [economicAssessment, setEconomicAssessment] = useState('');
  const [healthAssessment, setHealthAssessment] = useState('');
  const [housingAssessment, setHousingAssessment] = useState('');
  const [urgencyAssessment, setUrgencyAssessment] = useState<UrgencyLevel>('HIGH');
  const [recommendedAidType, setRecommendedAidType] = useState<AidType>('FINANCIAL');
  const [recommendedAmount, setRecommendedAmount] = useState<number>(2500);
  const [researcherNotes, setResearcherNotes] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const report: SocialResearchReport = {
      id: 'srr-' + Date.now(),
      researcherName,
      researchDate,
      contactMethod,
      summary,
      familyCondition,
      economicAssessment,
      healthAssessment,
      housingAssessment,
      verificationNotes: 'تمت مطابقة البيانات بنجاح',
      urgencyAssessment,
      recommendedAidType,
      recommendedAmount,
      researcherNotes,
      supervisorApproval: true,
      supervisorNotes: 'معتمد للإحالة للجنة الزكاة',
    };

    onSaveReport(selectedApp.id, report);
    alert('تم حفظ تقرير البحث الاجتماعي واحتساب التوصية المالية بنجاح.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-800">وحدة البحث والتقييم الاجتماعي الميداني</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            إعداد ونشر تقارير دراسة الحالة وتحديد درجة الاحتياج الفعلية للأسرة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: App Selection */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-xs text-slate-800 border-b pb-2">قائمة الطلبات المحالة للبحث</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto no-scrollbar">
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  setSelectedAppId(app.id);
                  if (app.socialResearchReport) {
                    setSummary(app.socialResearchReport.summary);
                    setFamilyCondition(app.socialResearchReport.familyCondition);
                    setEconomicAssessment(app.socialResearchReport.economicAssessment);
                    setRecommendedAmount(app.socialResearchReport.recommendedAmount);
                  }
                }}
                className={`w-full text-right p-3.5 rounded-2xl border text-xs transition-all space-y-1 ${
                  selectedAppId === app.id
                    ? 'bg-[#13706A] text-white border-[#13706A] shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold">{app.code}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedAppId === app.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {app.socialResearchReport ? 'مستكمل البحث' : 'جديد للبحث'}
                  </span>
                </div>
                <div className="font-bold">{app.fullName}</div>
                <div className="text-[11px] opacity-80">{app.governorate} - {app.cityTownCamp}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Research Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          {selectedApp ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs">
                <div><span className="text-slate-500 block">المستفيد:</span><span className="font-bold text-slate-800">{selectedApp.fullName} ({selectedApp.code})</span></div>
                <div><span className="text-slate-500 block">المحافظة:</span><span className="font-bold">{selectedApp.governorate}</span></div>
                <div><span className="text-slate-500 block">نوع المساعدة:</span><span className="font-bold text-[#13706A]">{selectedApp.requestedAidType}</span></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الباحث الاجتماعي *</label>
                  <input
                    type="text"
                    required
                    value={researcherName}
                    onChange={(e) => setResearcherName(e.target.value)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طريقة البحث والتواصل *</label>
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-semibold"
                  >
                    <option value="زيارة ميدانية">زيارة ميدانية للبيت</option>
                    <option value="مقابلة بمقر المؤسسة">مقابلة بمقر المؤسسة</option>
                    <option value="اتصال هاتفي">اتصال هاتفي وتحقق</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ الموصى به (شيكل) *</label>
                  <input
                    type="number"
                    required
                    value={recommendedAmount}
                    onChange={(e) => setRecommendedAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-[#13706A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملخص نتيجة الزكاة والبحث الاجتماعي *</label>
                <textarea
                  required
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="اكتب خلاصة تقرير الباحث وتفاصيل الحالة المعيشية للأسرة..."
                  className="w-full bg-slate-50 border p-3 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>اعتماد وحفظ تقرير البحث الاجتماعي</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              يرجى اختيار حالة من القائمة الجانبية للبدء بملء تقرير البحث الميداني.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
