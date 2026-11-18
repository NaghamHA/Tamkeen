import React, { useState } from 'react';
import { Application, CommitteeDecision } from '../../types';
import { Gavel } from 'lucide-react';

interface CommitteeModuleProps {
  applications: Application[];
  onSaveCommitteeDecision: (appId: string, decision: CommitteeDecision) => void;
}

export const CommitteeModule: React.FC<CommitteeModuleProps> = ({
  applications,
  onSaveCommitteeDecision,
}) => {
  const committeeApps = applications.filter(
    (a) => a.status === 'REFERRED_COMMITTEE' || a.status === 'APPROVED' || a.committeeDecision
  );

  const [selectedAppId, setSelectedAppId] = useState<string>(committeeApps[0]?.id || '');
  const selectedApp = committeeApps.find((a) => a.id === selectedAppId);

  const [finalDecision, setFinalDecision] = useState<'FULL_APPROVAL' | 'PARTIAL_APPROVAL' | 'MORE_INFO_NEEDED' | 'DEFERRED' | 'REJECTED'>('FULL_APPROVAL');
  const [approvedAmount, setApprovedAmount] = useState<number>(selectedApp ? selectedApp.requestedAmount : 2000);
  const [fundingSource, setFundingSource] = useState('صندوق أموال الزكاة');
  const [justification, setJustification] = useState('');

  const handleSaveDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const decisionRecord: CommitteeDecision = {
      meetingId: 'mtg-' + Date.now(),
      meetingDate: new Date().toISOString().split('T')[0],
      finalDecision,
      approvedAmount,
      currency: 'ILS',
      fundingSource,
      budgetCategory: 'مساعدات طارئة وتنمية أسرية',
      justification: justification || 'بإجماع أعضاء اللجنة بعد مراجعة تقرير البحث الميداني والمستندات',
      votes: [
        {
          memberId: 'm1',
          memberName: 'د. يوسف التميمي',
          memberRole: 'رئيس اللجنة',
          decision: finalDecision === 'REJECTED' ? 'REJECT' : 'APPROVE',
          recommendedAmount: approvedAmount,
          votedAt: new Date().toLocaleString('ar-EG'),
        },
      ],
    };

    onSaveCommitteeDecision(selectedApp.id, decisionRecord);
    alert('تم اعتماد قرار اللجنة بنجاح وتحديث حالة الملف.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-800">إدارة اجتماعات وقرارات لجنة الزكاة والصدقات</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            عرض الحالات المعروضة على اللجنة والتصويت واعتماد المبالغ والموازنات
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Referred Applications List */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-xs text-slate-800 border-b pb-2">جدول أعمال اللجنة (الحالات المدرجة)</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto no-scrollbar">
            {committeeApps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  setSelectedAppId(app.id);
                  setApprovedAmount(app.committeeDecision?.approvedAmount || app.requestedAmount);
                  setJustification(app.committeeDecision?.justification || '');
                }}
                className={`w-full text-right p-3.5 rounded-2xl border text-xs transition-all space-y-1 ${
                  selectedAppId === app.id
                    ? 'bg-[#13706A] text-white border-[#13706A] shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold">{app.code}</span>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">
                    {app.requestedAmount} ₪
                  </span>
                </div>
                <div className="font-bold">{app.fullName}</div>
                <div className="text-[11px] opacity-80">{app.requestedAidType}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Decision Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          {selectedApp ? (
            <form onSubmit={handleSaveDecision} className="space-y-5">
              <div className="bg-[#13706A]/10 border border-[#13706A]/30 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-3 text-xs">
                <div><span className="text-slate-500 block">المستفيد:</span><span className="font-bold text-slate-800">{selectedApp.fullName} ({selectedApp.code})</span></div>
                <div><span className="text-slate-500 block">المبلغ المطلوب:</span><span className="font-bold text-red-700">{selectedApp.requestedAmount} ₪</span></div>
                <div><span className="text-slate-500 block">توصية الباحث:</span><span className="font-bold text-emerald-800">{selectedApp.socialResearchReport?.recommendedAmount || selectedApp.requestedAmount} ₪</span></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القرار النهائي للجنة *</label>
                  <select
                    value={finalDecision}
                    onChange={(e) => setFinalDecision(e.target.value as any)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-[#13706A]"
                  >
                    <option value="FULL_APPROVAL">موافقة كاملة بالمبلغ المطلوب</option>
                    <option value="PARTIAL_APPROVAL">موافقة جزئية بمبلغ محدد</option>
                    <option value="MORE_INFO_NEEDED">طلب معلومات أو زيارة ثانية</option>
                    <option value="DEFERRED">تأجيل للدورة القادمة</option>
                    <option value="REJECTED">رفض الطلب لعدم تنطبق المعايير</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المعتمد النهائي (شيكل) *</label>
                  <input
                    type="number"
                    required
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-black text-emerald-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">مصدر التمويل وبند الميزانية *</label>
                  <input
                    type="text"
                    required
                    value={fundingSource}
                    onChange={(e) => setFundingSource(e.target.value)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">أسباب ومبررات القرار *</label>
                  <textarea
                    required
                    rows={3}
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="اكتب أسباب القرار ومحضر التوصية..."
                    className="w-full bg-slate-50 border p-3 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs"
                >
                  <Gavel className="w-4 h-4" />
                  <span>اعتماد وإصدار قرار اللجنة الرسمي</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              لا توجد حالات مدرجة حالياً في جدول أعمال اللجنة.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
