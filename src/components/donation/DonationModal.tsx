import React, { useState, useEffect } from 'react';
import {
  Heart,
  X,
  Check,
  Building2,
  Download,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Pause,
  Play,
} from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<'DONATE' | 'SUCCESS'>('DONATE');
  const currency = 'شيكل'; // العملة الوحيدة المعتمدة: شيكل ₪

  const [selectedAmount, setSelectedAmount] = useState<number>(250);
  const [customAmount, setCustomAmount] = useState<string>('');
  
  // Payment Transfer Reference & Copy feedback
  const [transferRefNumber, setTransferRefNumber] = useState('');
  const [donorName, setDonorName] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-close countdown timer state for thank-you screen
  const [autoCloseSeconds, setAutoCloseSeconds] = useState<number>(15);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Result info
  const [receiptNumber, setReceiptNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetAmounts = [
    { amt: 50, impact: 'كسوة ومستلزمات' },
    { amt: 100, impact: 'حقيبة مدرسية' },
    { amt: 250, impact: 'طرد غذائي مكثف' },
    { amt: 500, impact: 'علاج ودواء شهري' },
    { amt: 1000, impact: 'كفالة أسرة كاملة' },
    { amt: 2500, impact: 'ترميم وتحسين سكن' },
  ];

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  // Auto-close timer effect when step === 'SUCCESS'
  useEffect(() => {
    if (step !== 'SUCCESS') {
      setAutoCloseSeconds(15);
      setIsTimerPaused(false);
      return;
    }

    if (isTimerPaused) return;

    if (autoCloseSeconds <= 0) {
      resetForm();
      return;
    }

    const timer = setInterval(() => {
      setAutoCloseSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, autoCloseSeconds, isTimerPaused]);

  if (!isOpen) return null;

  const handleProcessDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveAmount <= 0) {
      alert('يرجى تحديد مبلغ تبرع صحيح بالشيكل.');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 650));

      const generatedReceipt = 'REC-ILS-' + Math.floor(100000 + Math.random() * 900000);
      setReceiptNumber(generatedReceipt);
      setStep('SUCCESS');
    } catch {
      alert('حدث خطأ في معالجة التبرع، يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('DONATE');
    setReceiptNumber('');
    setAutoCloseSeconds(15);
    setIsTimerPaused(false);
    setTransferRefNumber('');
    setDonorName('');
    setCustomAmount('');
    setSelectedAmount(250);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-right">


        
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-[#0F5D58] via-[#13706A] to-[#1E759A] text-white p-5 relative">
          <button
            onClick={resetForm}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
              <Heart className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">منصة التبرع المباشر (بالشيكل ₪)</h3>
              <p className="text-xs text-[#E6F4F1] font-medium">مؤسسة الزكاة والصدقات القطرية</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 'DONATE' && (
            <form onSubmit={handleProcessDonation} className="space-y-5">
              
              {/* Amount Selection Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>1. تحديد مبلغ التبرع</span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
                      العملة: شيكل (ILS ₪)
                    </span>
                  </label>
                </div>

                {/* Preset Chips with Impact */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {presetAmounts.map((item) => {
                    const isSelected = selectedAmount === item.amt && !customAmount;
                    return (
                      <button
                        key={item.amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(item.amt);
                          setCustomAmount('');
                        }}
                        className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#13706A] text-white border-[#13706A] shadow-md ring-2 ring-[#13706A]/30'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-black text-sm">{item.amt} {currency}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                        </div>
                        <span className={`text-[10px] mt-1 font-semibold ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                          {item.impact}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input */}
                <div className="relative pt-1">
                  <input
                    type="number"
                    min="1"
                    placeholder="أدخل مبلغاً مخصصاً بالشيكل..."
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      if (e.target.value) setSelectedAmount(0);
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#13706A] focus:outline-none text-left"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    مبلغ آخر:
                  </span>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#13706A]">
                    شيكل ₪
                  </span>
                </div>

                {/* Dynamic Visual Impact Banner */}
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700">الأثر المتوقع لمساهمتك:</span>
                  </div>
                  <span className="text-xs font-black text-[#13706A] bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                    {effectiveAmount >= 2000
                      ? 'دعم ترميم وتأهيل مسكن أسرة متعففة'
                      : effectiveAmount >= 1000
                      ? 'كفالة معيشية شاملة لأسرة كاملة لشهر'
                      : effectiveAmount >= 500
                      ? 'تغطية علاج ودواء شهري لمريض محتاج'
                      : effectiveAmount >= 250
                      ? 'توفير طرد غذائي تمويني مكثف لأسرة'
                      : effectiveAmount >= 100
                      ? 'توفير حقيبة ومستلزمات مدرسية لطالب'
                      : effectiveAmount > 0
                      ? 'المساهمة في صندوق الإغاثة العاجلة'
                      : 'حدد مبلغ التبرع لعرض الأثر'}
                  </span>
                </div>
              </div>

              {/* Bank Accounts Section */}
              <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#13706A]" />
                  <h4 className="text-xs font-black text-[#13706A]">2. تفاصيل الحساب البنكي للتحويل المباشر</h4>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-teal-100 text-xs space-y-2.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">اسم الحساب الرسمي:</span>
                    <span className="font-black text-slate-900">مؤسسة الزكاة والصدقات القطرية</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">البنك المعتمد:</span>
                    <span className="font-bold text-slate-800">بنك فلسطين (حساب الشيكل)</span>
                  </div>

                  {/* Account Number */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">رقم الحساب (شيكل):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">2345678-001</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('2345678-001', 'account')}
                        className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-bold transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedField === 'account' ? 'تم النسخ' : 'نسخ'}</span>
                      </button>
                    </div>
                  </div>

                  {/* IBAN */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">رقم الآيبان (IBAN):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#13706A] text-xs">PS92 PALB 0000 0000 0234 5678 001</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('PS92 PALB 0000 0000 0234 5678 001', 'iban')}
                        className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-bold transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedField === 'iban' ? 'تم النسخ' : 'نسخ'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Donor Name & Reference (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم المتبرع (اختياري)</label>
                  <input
                    type="text"
                    placeholder="فاعل خير / اسمك الكريم..."
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">رقم مرجع الحوالة (اختياري)</label>
                  <input
                    type="text"
                    placeholder="رقم الإشعار أو المرجع..."
                    value={transferRefNumber}
                    onChange={(e) => setTransferRefNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                  />
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#13706A]" />
                <span>تحويل آمن ومباشر وموثق لدى مؤسسة الزكاة والصدقات القطرية</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-1/3 py-3 border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 text-xs transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 bg-gradient-to-r from-[#13706A] to-[#0F5D58] text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  {isSubmitting ? (
                    <span>جاري إصدار الإيصال...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تأكيد التبرع ({effectiveAmount} {currency})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-2 space-y-4">
              {/* Timer Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-right flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#13706A]">تقبل الله طاعتكم وجزاكم الله كل خير 🌸</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-600 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>إغلاق تلقائي:</span>
                  <span className="font-mono text-emerald-800 font-black px-1.5 py-0.5 bg-emerald-100 rounded">
                    {autoCloseSeconds}ث
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsTimerPaused(!isTimerPaused)}
                    className="p-1 text-slate-500 hover:text-slate-800"
                    title={isTimerPaused ? 'استئناف' : 'إيقاف'}
                  >
                    {isTimerPaused ? <Play className="w-3 h-3 text-emerald-600" /> : <Pause className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Official Framed Certificate / Receipt Voucher */}
              <div className="relative bg-gradient-to-b from-white to-slate-50 border-2 border-[#13706A]/30 rounded-3xl p-5 shadow-inner text-right space-y-4">
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-emerald-100 text-[#13706A] rounded-2xl flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        سند قبض وتبرع إلكتروني معتمد
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-0.5">مؤسسة الزكاة والصدقات القطرية</h3>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block">رقم السند المرجعي</span>
                    <span className="font-mono font-black text-xs text-[#13706A] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 inline-block">
                      {receiptNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">اسم المتبرع الكريم:</span>
                    <span className="font-bold text-slate-800">{donorName.trim() || 'فاعل خير'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">قيمة المساهمة المعتمدة:</span>
                    <span className="font-black text-emerald-700 text-sm font-mono">{effectiveAmount} {currency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">الحساب المستفيد:</span>
                    <span className="font-bold text-slate-800">بنك فلسطين - شيكل</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">تاريخ الإصدار:</span>
                    <span className="font-mono font-bold text-slate-700">{new Date().toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-bold text-[#13706A]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>موثق إلكترونياً لدى الدائرة المالية</span>
                  </span>
                  <span>الضفة الغربية - فلسطين</span>
                </div>
              </div>

              {/* Download, Print & Close Buttons */}
              <div className="flex flex-wrap justify-center items-center gap-3 pt-1">
                <button
                  onClick={() => {
                    const content = `إيصال تبرع رسمي - مؤسسة الزكاة والصدقات القطرية\nرقم الإيصال: ${receiptNumber}\nالمتبرع: ${donorName.trim() || 'فاعل خير'}\nالمبلغ: ${effectiveAmount} شيكل\nالتاريخ: ${new Date().toLocaleDateString('ar-EG')}`;
                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `إيصال_تبرع_${receiptNumber}.txt`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#13706A] text-white text-xs font-bold hover:bg-[#0F5D58] shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل السند</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>طباعة</span>
                </button>
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
