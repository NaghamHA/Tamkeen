import React, { useState } from 'react';
import { Application, AidType, UrgencyLevel, SystemSettings } from '../../types';
import {
  CheckCircle, ArrowRight, ArrowLeft, ShieldCheck,
  Printer, Lock, User, FileCheck2
} from 'lucide-react';

interface ApplicationWizardProps {
  settings: SystemSettings;
  onSubmitSuccess: (newApp: Application) => void;
  onCancel?: () => void;
}

export const ApplicationWizard: React.FC<ApplicationWizardProps> = ({
  settings,
  onSubmitSuccess,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedAppCode, setSubmittedAppCode] = useState<string | null>(null);

  // Step 1: المعلومات الشخصية والاتصال
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [dob, setDob] = useState('1992-01-01');
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>('ذكر');
  const [maritalStatus, setMaritalStatus] = useState<'عازب/ة' | 'متزوج/ة' | 'أرمل/ة' | 'مطلق/ة' | 'مهجور/ة'>('متزوج/ة');
  const [phone, setPhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cityTownCamp, setCityTownCamp] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [nearestLandmark, setNearestLandmark] = useState('');
  const [familyCount, setFamilyCount] = useState<number>(4);

  // Step 2: نوع المساعدة والاحتياج
  const [requestedAidType, setRequestedAidType] = useState<AidType>('FINANCIAL');
  const [requestTitle, setRequestTitle] = useState('');
  const [needDescription, setNeedDescription] = useState('');
  const [mainReason, setMainReason] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('MEDIUM');
  const [requestedAmount, setRequestedAmount] = useState<number>(1500);

  // Step 3: الإقرار والتعهد والتوقيع
  const [applicantSignature, setApplicantSignature] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Dynamic Custom Fields State
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  const handleCustomFieldChange = (fieldId: string, val: any) => {
    setCustomFieldValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  // Dynamic Steps Definition (Only Stage 1 & Stage 3 + any custom admin steps)
  const displaySteps = React.useMemo(() => {
    if (settings.formSteps && settings.formSteps.length > 0) {
      const enabled = settings.formSteps.filter((s) => s.enabled && s.id !== 2);
      if (enabled.length > 0) {
        return enabled.map((s, idx) => ({
          id: s.id,
          num: idx + 1,
          title: s.title,
          desc: s.description,
          icon: s.id === 1 ? User : FileCheck2,
        }));
      }
    }
    return [
      { id: 1, num: 1, title: 'المعلومات الشخصية والاتصال', icon: User, desc: 'بيانات الهوية والموقع' },
      { id: 3, num: 2, title: 'التعهد والإقرار النهائي', icon: FileCheck2, desc: 'مراجعة وتوقيع الطلب' },
    ];
  }, [settings.formSteps]);

  const steps = displaySteps;
  const activeStepObj = steps[currentStep - 1] || steps[0];

  // Age calculation
  const calculatedAge = React.useMemo(() => {
    if (!dob) return 30;
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    return Math.max(18, currentYear - birthYear);
  }, [dob]);

  const ReqAsterisk = () => (
    <span className="inline-flex items-center gap-1 mr-1 align-middle">
      <span className="text-red-600 font-black text-base leading-none">*</span>
      <span className="text-[10px] font-bold bg-red-50 text-red-700 px-1.5 py-0.5 rounded-md border border-red-200 select-none">
        مطلوب
      </span>
    </span>
  );

  const validateStep = (stepNum: number): boolean => {
    const stepTarget = steps[stepNum - 1];
    if (stepTarget?.id === 1 || stepNum === 1) {
      if (!fullName.trim()) {
        alert('يرجى كتابة الاسم الثلاثي الكامل لمقدم الطلب.');
        return false;
      }
      if (!nationalId.trim() || nationalId.trim().length < 5) {
        alert('يرجى إدخال رقم الهوية الشخصية أو جواز السفر بشكل صحيح.');
        return false;
      }
      if (!phone.trim()) {
        alert('يرجى إدخال رقم الهاتف الرئيسي للتواصل.');
        return false;
      }
      if (!cityTownCamp.trim() && !governorate.trim()) {
        alert('يرجى تحديد اسم البلدة أو المدينة أو المحافظة.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }
    if (!agreedToTerms || !applicantSignature.trim()) {
      alert('يرجى التوقيع الإلكتروني بالاسم الثلاثي والموافقة على الإقرار والتعهد قبل الإرسال.');
      return;
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newAppCode = `${settings.applicationCodePrefix || 'TMK-WB-2026-'}${randomNum}`;

    const newApplicationRecord: Application = {
      id: 'app-' + Date.now(),
      code: newAppCode,
      branchId: 'br-wb',
      branchName: settings.localBranchName || 'الفرع الرئيسي - الضفة الغربية',
      fullName: fullName.trim(),
      nationalId: nationalId.trim(),
      dob,
      age: calculatedAge,
      gender,
      maritalStatus,
      phone: phone.trim(),
      alternatePhone: '',
      whatsappPhone: whatsappPhone.trim() || phone.trim(),
      email: email.trim(),
      governorate: governorate.trim() || cityTownCamp.trim(),
      cityTownCamp: cityTownCamp.trim() || governorate.trim(),
      detailedAddress: detailedAddress.trim(),
      nearestLandmark: nearestLandmark.trim(),
      preferredContact: 'واتساب',
      isApplicantBeneficiary: true,
      relationToBeneficiary: 'نفسه',
      familyCount: familyCount || 1,
      dependentsCount: Math.max(0, familyCount - 1),
      childrenCount: Math.max(0, familyCount - 2),
      schoolStudentsCount: 0,
      universityStudentsCount: 0,
      elderlyCount: 0,
      sickCount: 0,
      disabledCount: 0,
      isDeceasedFather: false,
      isDeceasedMother: false,
      hasFemaleBreadwinner: gender === 'أنثى',
      hasOrphans: false,
      socialAffairsRegistered: false,
      socialAffairsFileNo: '',
      familyMembers: [],
      occupation: 'غير محدد',
      employmentStatus: 'عاطل عن العمل',
      employerName: '',
      monthlyIncome: 0,
      otherIncomeSources: '',
      receivesNationalInsurance: false,
      hasSmallBusiness: false,
      businessDescription: '',
      hasDebt: false,
      totalDebtAmount: 0,
      creditorName: '',
      monthlyDebtInstallment: 0,
      debtReason: '',
      expenses: {
        rent: 0,
        food: 0,
        utilities: 0,
        medical: 0,
        education: 0,
        transport: 0,
        debtInstallment: 0,
        other: 0,
      },
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      perCapitaIncome: 0,
      hasChronicIllness: false,
      patientName: '',
      illnessType: '',
      isEmergencyHealth: false,
      treatmentCostMonthly: 0,
      hasHealthInsurance: true,
      hasDisability: false,
      disabilityType: '',
      isUniversityStudent: false,
      universityName: '',
      specialization: '',
      academicYear: '',
      requiredTuitionFees: 0,
      hasGrantOrScholarship: false,
      housingType: 'بيت مستقل ملك',
      monthlyRentAmount: 0,
      hasRentArrears: false,
      rentArrearsAmount: 0,
      roomsCount: 3,
      occupantsCount: familyCount,
      housingCondition: 'متوسط',
      ownsRealEstate: false,
      ownsVehicle: false,
      receivesExternalAid: false,
      externalAidDetails: '',
      localZakatBranchAid: false,
      zakatBranchName: '',
      hasPreviousTamkeenApp: false,
      requestedAidType,
      requestTitle: requestTitle.trim() || `طلب مساعدة - ${fullName}`,
      needDescription: needDescription.trim() || 'طلب مساعدة إنسانية',
      mainReason: mainReason.trim() || 'ظروف معيشية واحتياج قائم',
      urgency,
      requestedAmount: requestedAmount || 0,
      isRecurringNeed: false,
      payeeName: fullName,
      hasPriceQuoteOrInvoice: false,
      interestedInCourses: false,
      selectedCourseTypes: [],
      canWork: true,
      seekingJob: true,
      wantsToStartProject: false,
      bankAccount: {
        accountHolderName: fullName,
        relationToApplicant: 'نفسه',
        bankName: 'غير محدد',
        branchName: 'الرئيسي',
        accountNumber: '---',
        iban: '---',
        currency: 'ILS',
        isActive: true,
        isEncumbered: false,
      },
      documents: [],
      applicantSignature: applicantSignature.trim(),
      submissionDate: new Date().toLocaleString('ar-EG'),
      status: 'SUBMITTED',
      eligibilityScore: Math.floor(65 + Math.random() * 30),
      eligibilityLevel: urgency === 'CRITICAL' || urgency === 'EMERGENCY' ? 'حالة طارئة' : 'احتياج مرتفع',
      internalNotes: [],
      activityLogs: [
        {
          id: 'al-' + Date.now(),
          timestamp: new Date().toLocaleString('ar-EG'),
          userName: fullName,
          userRole: 'BENEFICIARY',
          action: 'تقديم طلب مساعدة مبسط',
          details: 'تم تقديم الطلب بنجاح عبر النموذج المباشر',
        },
      ],
      hasDuplicateAlert: false,
      isOverdue: false,
      createdYear: new Date().getFullYear(),
    };

    setSubmittedAppCode(newAppCode);
    onSubmitSuccess(newApplicationRecord);
  };

  if (submittedAppCode) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-emerald-200 shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-[#13706A] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-300">
              تم إرسال الطلب بنجاح
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">شكراً لك، تم استلام طلبك بنجاح</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              سيتم مراجعة بيانات الطلب من قبل فريق المؤسسة المختص والتواصل معك قريباً.
            </p>
          </div>

          <div className="bg-slate-50 border-2 border-dashed border-[#13706A] p-6 rounded-2xl max-w-md mx-auto space-y-2">
            <span className="text-xs font-bold text-slate-500 block">رقم المتابعة المرجعي للطلب:</span>
            <div className="text-3xl font-mono font-black text-[#13706A] tracking-wider selection:bg-teal-200">
              {submittedAppCode}
            </div>
            <p className="text-[11px] text-slate-500">
              يمكنك استخدام هذا الرقم أو رقم هاتفك لمتابعة الحالة عبر بوابة المستفيدين.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الإيصال</span>
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <span>العودة للرئيسية</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderCustomFieldsForStep = (stepNum: number) => {
    const fields = (settings.customFields || []).filter((f) => f.stepId === stepNum && !f.isHidden);
    if (fields.length === 0) return null;

    return (
      <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
        <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
          <span>حقول وإدخالات مخصصة مطلوبة بالقسم ({fields.length}):</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {field.label} {field.isRequired && <ReqAsterisk />}
              </label>

              {field.fieldType === 'select' ? (
                <select
                  value={customFieldValues[field.id] || ''}
                  onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                >
                  <option value="">-- اختر من القائمة --</option>
                  {(field.options || []).map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.fieldType === 'checkbox' ? (
                <label className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!customFieldValues[field.id]}
                    onChange={(e) => handleCustomFieldChange(field.id, e.target.checked)}
                    className="w-4 h-4 text-[#13706A] rounded"
                  />
                  <span className="text-xs font-semibold text-slate-800">{field.placeholder || field.label}</span>
                </label>
              ) : field.fieldType === 'file' ? (
                <input
                  type="file"
                  onChange={(e) => handleCustomFieldChange(field.id, e.target.files?.[0]?.name || '')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-semibold"
                />
              ) : (
                <input
                  type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                  value={customFieldValues[field.id] || ''}
                  onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder || ''}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Wizard Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>طلب تقديم مساعدة إلكتروني</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {settings.localBranchName || 'الفرع الرئيسي'} — خطوات بسيطة ومباشرة لتقديم الطلب
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="bg-emerald-50 text-emerald-800 font-extrabold text-[11px] px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>خصوصية تامة ومشفرة</span>
            </span>
            <span className="bg-[#13706A]/10 text-[#13706A] font-bold text-xs px-3.5 py-1.5 rounded-xl">
              الخطوة {currentStep} من {steps.length}
            </span>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 border rounded-xl"
              >
                إلغاء
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
            <span>نسبة الإكمال: {Math.round((currentStep / steps.length) * 100)}%</span>
            <span className="text-slate-400 font-normal">يستغرق تقديم الطلب أقل من دقيقتين</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#13706A] to-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Visual Connected Stepper */}
        <div className="pt-2">
          <div className="relative flex items-center justify-between">
            {/* Horizontal Connector Line behind steps (desktop) */}
            <div className="hidden sm:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0" />

            <div className={`grid grid-cols-1 ${steps.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3 w-full relative z-10`}>
              {steps.map((stepItem) => {
                const Icon = stepItem.icon;
                const isActive = stepItem.num === currentStep;
                const isCompleted = stepItem.num < currentStep;

                return (
                  <button
                    key={stepItem.num}
                    type="button"
                    onClick={() => {
                      if (stepItem.num < currentStep || validateStep(currentStep)) {
                        setCurrentStep(stepItem.num);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex items-center gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-[#13706A] text-white border-[#13706A] shadow-md ring-4 ring-[#13706A]/15'
                        : isCompleted
                        ? 'bg-emerald-50 text-[#13706A] border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs relative ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isCompleted
                          ? 'bg-[#13706A] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      <span
                        className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-mono font-black flex items-center justify-center ${
                          isActive
                            ? 'bg-amber-400 text-slate-950'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {stepItem.num}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs truncate">{stepItem.title}</div>
                      <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-teal-100' : 'text-slate-500'}`}>
                        {stepItem.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={(e) => e.preventDefault()} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        {/* STAGE 1: Personal & Contact Information */}
        {activeStepObj?.id === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-[#13706A]" />
              <h2 className="text-lg font-black text-slate-900">1. المعلومات الشخصية ومكان السكن</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم الثلاثي الكامل <ReqAsterisk /></label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أحمد محمد علي"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهوية الشخصية / جواز السفر <ReqAsterisk /></label>
                <input
                  type="text"
                  required
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="رقم الهوية أو جواز السفر"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ الميلاد <ReqAsterisk /></label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">العمر المحسوب: {calculatedAge} سنة</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الجنس <ReqAsterisk /></label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold"
                >
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الحالة الاجتماعية <ReqAsterisk /></label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold"
                >
                  <option value="عازب/ة">عازب/ة</option>
                  <option value="متزوج/ة">متزوج/ة</option>
                  <option value="أرمل/ة">أرمل/ة</option>
                  <option value="مطلق/ة">مطلق/ة</option>
                  <option value="مهجور/ة">مهجور/ة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف الرئيسي <ReqAsterisk /></label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="059XXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الواتساب للتواصل</label>
                <input
                  type="tel"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="اختياري (إذا اختلف عن الرئيسي)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">البلدة / المدينة / المخيم <ReqAsterisk /></label>
                <input
                  type="text"
                  required
                  value={cityTownCamp}
                  onChange={(e) => {
                    setCityTownCamp(e.target.value);
                    setGovernorate(e.target.value);
                  }}
                  placeholder="أدخل اسم البلدة أو المدينة"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">العنوان التفصيلي وأقرب معلم</label>
                <input
                  type="text"
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  placeholder="اسم الشارع، الحي، بالقرب من..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عدد أفراد الأسرة <ReqAsterisk /></label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={familyCount}
                  onChange={(e) => setFamilyCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              </div>
            </div>
            {renderCustomFieldsForStep(1)}
          </div>
        )}

        {/* STAGE 3 (Now Step 2): Review, Declaration & Signature */}
        {activeStepObj?.id === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#13706A]" />
              <h2 className="text-lg font-black text-slate-900">2. مراجعة الطلب والتعهد والتوقيع</h2>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-2">ملخص بيانات الطلب:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div><span className="text-slate-500 block">مقدم الطلب:</span> <span className="font-bold text-slate-900">{fullName || '---'}</span></div>
                <div><span className="text-slate-500 block">رقم الهوية:</span> <span className="font-mono font-bold text-slate-900">{nationalId || '---'}</span></div>
                <div><span className="text-slate-500 block">الهاتف:</span> <span className="font-mono font-bold text-slate-900">{phone || '---'}</span></div>
                <div><span className="text-slate-500 block">البلدة:</span> <span className="font-bold text-slate-900">{cityTownCamp || governorate || '---'}</span></div>
                <div><span className="text-slate-500 block">الحالة الاجتماعية:</span> <span className="font-bold text-[#13706A]">{maritalStatus}</span></div>
                <div><span className="text-slate-500 block">عدد أفراد الأسرة:</span> <span className="font-bold text-slate-900">{familyCount} أفراد</span></div>
              </div>
            </div>

            {/* Terms and Declaration */}
            <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#13706A]">
                <ShieldCheck className="w-4 h-4" />
                <span>الإقرار والتعهد الإلكتروني:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                أقر وأتعهد أنا الموقّع أدناه بأن كافة البيانات والمعلومات المدخلة في هذا الطلب صحيحة ودقيقة تماماً، وأنني أتحمل المسئولية القانونية الكاملة عن صحة هذه البيانات، وأمنح المؤسسة الحق في التثبت والتحقق منها.
              </p>

              <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 rounded text-[#13706A] focus:ring-[#13706A]"
                />
                <span className="text-xs font-bold text-slate-900">
                  أوافق وأقر بصحة البيانات التامة المدخلة في هذا الطلب <ReqAsterisk />
                </span>
              </label>
            </div>

            {/* Electronic Signature */}
            <div className="max-w-md">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                التوقيع الإلكتروني (اكتب اسمك الثلاثي للتأكيد) <ReqAsterisk />
              </label>
              <input
                type="text"
                required
                value={applicantSignature}
                onChange={(e) => setApplicantSignature(e.target.value)}
                placeholder="أدخل الاسم الثلاثي للتوقيع الإلكتروني"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-[#13706A] focus:outline-none focus:ring-2 focus:ring-[#13706A]"
              />
            </div>
            {renderCustomFieldsForStep(3)}
          </div>
        )}

        {/* Dynamic Additional Steps added by Admin */}
        {activeStepObj && activeStepObj.id !== 1 && activeStepObj.id !== 3 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-base font-black text-slate-900">{activeStepObj.title}</h2>
              <p className="text-xs text-slate-500 mt-1">{activeStepObj.desc}</p>
            </div>
            {renderCustomFieldsForStep(activeStepObj.id)}
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              <span>الخطوة السابقة</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-[#13706A] hover:bg-[#0F5D58] text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all"
            >
              <span>متابعة للخطوة التالية</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitFinal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-lg transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>إرسال الطلب النهائي</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};


