import React, { useState } from 'react';
import { Application, DisbursementRecord, CommitteeDecision } from '../../types';
import { CheckCircle, ShieldCheck } from 'lucide-react';

interface FinanceModuleProps {
  applications: Application[];
  onExecuteDisbursement: (appId: string, record: DisbursementRecord) => void;
  onSaveCommitteeDecision?: (appId: string, decision: CommitteeDecision) => void;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({
  applications,
  onExecuteDisbursement,
  onSaveCommitteeDecision,
}) => {
  const eligibleApps = applications.filter(
    (a) => a.status === 'APPROVED' || a.status === 'REFERRED_COMMITTEE' || a.status === 'IN_STUDY' || a.disbursementRecord || a.committeeDecision
  );

  const [selectedAppId, setSelectedAppId] = useState<string>(eligibleApps[0]?.id || applications[0]?.id || '');
  const selectedApp = applications.find((a) => a.id === selectedAppId);

  const [approvedAmount, setApprovedAmount] = useState<number>(selectedApp ? (selectedApp.committeeDecision?.approvedAmount || selectedApp.requestedAmount) : 2000);
  const [fundingSource, setFundingSource] = useState('صندوق أموال الزكاة والصدقات - الإدارة العامة');
  const [justification, setJustification] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'تحويل بنكي' | 'شيك' | 'دفع مباشر للمزود' | 'قسيمة شرائية' | 'نقدي'>('تحويل بنكي');
  const [transactionRef, setTransactionRef] = useState('FT26-' + Math.floor(10000 + Math.random() * 90000));
  const [executedBy] = useState('أ. خالد الرابي (المعاملات الإدارية والمالية)');

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    // Save decision if not exists or if updating
    if (onSaveCommitteeDecision) {
      const decisionRecord: CommitteeDecision = {
        meetingId: 'admin-dec-' + Date.now(),
        meetingDate: new Date().toISOString().split('T')[0],
        finalDecision: 'FULL_APPROVAL',
        approvedAmount: Number(approvedAmount),
        currency: 'ILS',
        fundingSource,
        budgetCategory: 'مساعدات طارئة وتنمية أسرية',
        justification: justification || 'باعتماد الإدارة التنفيذية بناءً على تقرير البحث الاجتماعي المستوفي للشروط',
        votes: [],
      };
      onSaveCommitteeDecision(selectedApp.id, decisionRecord);
    }

    const disbRecord: DisbursementRecord = {
      id: 'disb-' + Date.now(),
      disbursementCode: 'DISB-2026-' + Math.floor(1000 + Math.random() * 9000),
      amount: Number(approvedAmount),
      currency: 'ILS',
      fundingSource,
      paymentMethod,
      recipientName: selectedApp.fullName,
      maskedBankIban: selectedApp.bankAccount.iban ? `PS...${selectedApp.bankAccount.iban.slice(-6)}` : 'N/A',
      transactionReference: transactionRef,
      disbursedAt: new Date().toLocaleString('ar-EG'),
      executedBy,
      approvedBy: 'د. محمود القاسم (المدير العام)',
      status: 'EXECUTED',
    };

    onExecuteDisbursement(selectedApp.id, disbRecord);
    alert('تم اعتماد القرار الإداري وتأكيد عملية الصرف المالي بنجاح.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-800">وحدة القرارات الاعتمادية والصرف المالي الإداري</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            اعتماد قرارات المساعدة المباشرة وتنفيذ تحويل المساعدات إلى الحسابات البنكية تحت إدارة موحدة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Eligible Queue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-xs text-slate-800 border-b pb-2">قائمة الطلبات الجاهزة للاعتماد والصرف</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto no-scrollbar">
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  setSelectedAppId(app.id);
                  setApprovedAmount(app.committeeDecision?.approvedAmount || app.requestedAmount);
                }}
                className={`w-full text-right p-3.5 rounded-2xl border text-xs transition-all space-y-1 ${
                  selectedAppId === app.id
                    ? 'bg-[#13706A] text-white border-[#13706A] shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold">{app.code}</span>
                  <span className="text-[10px] bg-[#198754] text-white px-2 py-0.5 rounded-full font-bold">
                    {app.requestedAmount} ₪
                  </span>
                </div>
                <div className="font-bold">{app.fullName}</div>
                <div className="text-[11px] opacity-80">{app.bankAccount.bankName || app.governorate}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Execution Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          {selectedApp ? (
            <form onSubmit={handleExecute} className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#13706A]" />
                    <span>الاعتماد الإداري المباشر والصرف المالي</span>
                  </span>
                  <span className="bg-white text-[#13706A] px-2.5 py-0.5 rounded-full font-mono font-bold border border-emerald-300">
                    {selectedApp.code}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block">المستفيد:</span>
                    <span className="font-bold text-slate-800">{selectedApp.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">نوع المساعدة:</span>
                    <span className="font-bold text-slate-800">{selectedApp.requestedAidType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">المبلغ المطلوب:</span>
                    <span className="font-black text-[#13706A] text-sm">{selectedApp.requestedAmount} ₪</span>
                  </div>
                </div>

                {selectedApp.bankAccount?.iban && (
                  <div className="pt-2 border-t border-emerald-200/80">
                    <span className="text-slate-500 block">الحساب البنكي المعتمد:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedApp.bankAccount.bankName} - IBAN: {selectedApp.bankAccount.iban}
                    </span>
                  </div>
                )}
              </div>

              {/* Decision & Disbursement Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المعتمد للصرف (₪) *</label>
                  <input
                    type="number"
                    required
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-bold text-[#13706A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مصدر التمويل والخصم *</label>
                  <select
                    value={fundingSource}
                    onChange={(e) => setFundingSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="صندوق أموال الزكاة والصدقات - الإدارة العامة">صندوق أموال الزكاة والصدقات - الإدارة العامة</option>
                    <option value="موازنة الحالات العاجلة والطارئة">موازنة الحالات العاجلة والطارئة</option>
                    <option value="حساب الكفالات والتمكين الاجتماعي">حساب الكفالات والتمكين الاجتماعي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">وسيلة الصرف المالية *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-bold text-[#13706A]"
                  >
                    <option value="تحويل بنكي">تحويل بنكي إلكتروني (IBAN)</option>
                    <option value="شيك">شيك بنكي رسمي</option>
                    <option value="دفع مباشر للمزود">دفع مباشر للمستشفى/المزود</option>
                    <option value="قسيمة شرائية">قسيمة شرائية معتمدة</option>
                    <option value="نقدي">نقدي وفق الصلاحيات المعتمدة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الحوالة / المرجع المالي *</label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">سبب الاعتماد / الملاحظات الإدارية</label>
                  <input
                    type="text"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="استيفاء الشروط وتوصية التقييم الاجتماعي..."
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>اعتماد القرار وتأكيد الصرف المالي الفوري</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              اختر معاملة من القائمة لإكمال إتاحة القرار الإداري والصرف.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
