import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { SystemSettings, Complaint } from '../../types';
import {
  FileText,
  Search,
  HeartHandshake,
  CheckCircle2,
  FileSearch,
  Send,
  ArrowLeft,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';
import heroVolunteersBg from '../../assets/images/hero_volunteers_aid_parcels_1794989785712.jpg';
import grievanceSupportImg from '../../assets/images/grievance_support_illustration_1794986259458.jpg';

interface HomePageProps {
  settings: SystemSettings;
  complaints?: Complaint[];
  onSubmitComplaint?: (cmp: Partial<Complaint>) => void;
  setActiveTab?: (tab: 'home' | 'apply' | 'track' | 'admin' | 'complaints') => void;
  onStartApplication?: () => void;
  onTrackApplication?: () => void;
  onOpenDonateModal?: () => void;
  autoScrollToComplaints?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSubmitComplaint,
  setActiveTab,
  onStartApplication,
  onTrackApplication,
  onOpenDonateModal,
  autoScrollToComplaints,
}) => {
  const [complaintForm, setComplaintForm] = useState({
    applicantName: '',
    nationalId: '',
    phone: '',
    relatedApplicationCode: '',
    type: 'استفسار' as 'استفسار' | 'شكوى' | 'تظلم' | 'طلب إعادة مراجعة',
    details: '',
  });

  const [submittedComplaintCode, setSubmittedComplaintCode] = useState<string | null>(null);

  React.useEffect(() => {
    if (autoScrollToComplaints) {
      const el = document.getElementById('complaints-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [autoScrollToComplaints]);

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintForm.applicantName.trim() || !complaintForm.phone.trim() || !complaintForm.details.trim()) {
      alert('يرجى تعبئة الاسم الكامل ورقم الهاتف وتفاصيل الشكوى أو الاستفسار.');
      return;
    }

    const generatedCode = 'CMP-QTR-' + Math.floor(1000 + Math.random() * 9000);
    if (onSubmitComplaint) {
      onSubmitComplaint({
        ...complaintForm,
        code: generatedCode,
      });
    }
    setSubmittedComplaintCode(generatedCode);
    setComplaintForm({
      applicantName: '',
      nationalId: '',
      phone: '',
      relatedApplicationCode: '',
      type: 'شكوى',
      details: '',
    });
  };

  const handleApply = () => {
    if (onStartApplication) onStartApplication();
    else if (setActiveTab) setActiveTab('apply');
  };

  const handleTrack = () => {
    if (onTrackApplication) onTrackApplication();
    else if (setActiveTab) setActiveTab('track');
  };

  return (
    <div className="space-y-16 py-6 sm:py-8">
      {/* Hero Section with Photographic Humanitarian Background & Layered Brand Gradient */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-[#0A4642] text-[#FAF6EE] px-5 py-11 sm:px-12 sm:py-16 lg:py-20 shadow-xl border border-teal-800/70">
          {/* Layer 1: Full-Bleed Photographic Background (object-cover + blur(2px) + responsive crop) */}
          <img
            src={heroVolunteersBg}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-[52%_65%] sm:object-[center_55%] blur-[2px] scale-105 transition-transform duration-700 pointer-events-none select-none"
          />

          {/* Layer 2: Primary Identity Gradient Overlay (75% at edges up to 90% behind central text) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#093D3A]/85 via-[#0F5D58]/80 to-[#0B4B47]/88 sm:bg-gradient-to-r sm:from-[#093D3A]/75 sm:via-[#0F5D58]/88 sm:to-[#093D3A]/75 pointer-events-none"
          />

          {/* Layer 3: Radial Density Shield directly behind Headline & Description (up to 90% opacity) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(9,61,58,0.90)_0%,rgba(15,93,88,0.82)_52%,rgba(19,112,106,0.75)_100%)] pointer-events-none"
          />

          {/* Layer 4: Subtle Warm Golden-Hour Ambient Glow */}
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[34rem] h-56 bg-amber-300/10 rounded-full blur-3xl pointer-events-none"
          />

          {/* Layer 5: Foreground Content & High-Contrast CTAs */}
          <div className="relative z-20 max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            {/* Institution Header Badge */}
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 bg-[#072F2D]/65 backdrop-blur-md px-5 py-3 rounded-3xl border border-[#FAF6EE]/15 shadow-lg mx-auto">
              <Logo size="md" variant="full" light={true} showSubtitle={true} />
              <span className="hidden sm:inline-block h-6 w-px bg-[#FAF6EE]/20"></span>
              <span className="text-xs font-medium text-amber-200 bg-amber-400/15 border border-amber-300/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>البوابة الإلكترونية لخدمات المستفيدين والزكاة</span>
              </span>
            </div>

            {/* Main Headline in Warm Ivory with Brand Accent Highlights */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-relaxed sm:leading-snug text-[#FAF6EE] drop-shadow-xs px-1">
              الزكاة{' '}
              <span className="text-amber-300">تنمية وتمكين</span>.. عطاءٌ يصون الكرامة ويسند{' '}
              <span className="text-amber-200 underline decoration-amber-400/40 underline-offset-8">
                الأسر المتعففة
              </span>
            </h1>

            {/* Description / Mission Box with Enhanced Readability Shield */}
            <div className="bg-[#062927]/60 border border-[#FAF6EE]/15 backdrop-blur-md rounded-2xl p-5 sm:p-6 text-center text-[#F5F0E6] shadow-lg space-y-2.5 max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 text-amber-300 font-medium text-xs">
                <span>رسالة مؤسسة الزكاة والصدقات القطرية</span>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-[#F5F0E6]/95 leading-relaxed font-normal">
                تعمل{' '}
                <span className="font-semibold text-amber-300">
                  مؤسسة الزكاة والصدقات القطرية
                </span>{' '}
                على استقبال أموال الزكاة والصدقات وصرفها في مصارفها الشرعية، مع العناية بمساندة{' '}
                <span className="font-medium text-white">الأسر المتعففة</span> وتوفير احتياجاتها الأساسية، إلى جانب دعم البرامج التنموية والمشاريع الصغيرة التي تعين الأسر على{' '}
                <span className="font-semibold text-amber-200">الاكتفاء الذاتي</span> والاعتماد على النفس بكرامة.
              </p>
            </div>

            {/* Prominent Action CTAs in Foreground Layer */}
            <div className="pt-2 space-y-4">
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5 px-1 sm:px-0">
                <button
                  onClick={handleApply}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-8 py-4 rounded-2xl font-semibold text-sm shadow-xl shadow-black/25 transition-all flex items-center justify-center gap-2.5 active:scale-95 border border-amber-300 cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-slate-950" />
                  <span>تقديم طلب مساعدة</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {onOpenDonateModal && (
                  <button
                    onClick={onOpenDonateModal}
                    className="w-full sm:w-auto bg-[#FAF6EE] hover:bg-white text-[#0B4B47] px-7 py-4 rounded-2xl font-semibold text-sm shadow-lg shadow-black/20 transition-all flex items-center justify-center gap-2.5 active:scale-95 border border-[#FAF6EE] cursor-pointer"
                  >
                    <HeartHandshake className="w-5 h-5 text-[#13706A]" />
                    <span>التبرع والزكاة</span>
                  </button>
                )}

                <button
                  onClick={handleTrack}
                  className="w-full sm:w-auto bg-[#062927]/70 hover:bg-[#062927]/90 text-[#FAF6EE] border border-[#FAF6EE]/25 px-6 py-4 rounded-2xl font-medium text-xs backdrop-blur-xs transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-amber-300" />
                  <span>الاستعلام عن طلب</span>
                </button>
              </div>

              <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] text-[#F5F0E6]/90 font-normal pt-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>التسجيل متاح إلكترونياً بخطوات ميسّرة</span>
                </span>
                <span className="hidden sm:inline text-[#FAF6EE]/30">|</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>تُراجع الطلبات من قِبل لجان البحث المختصة</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About & Mission Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-[2.25rem] p-6 sm:p-10 bg-gradient-to-br from-[#0F5D58]/[0.05] via-teal-50/60 to-amber-50/40 border border-teal-900/10 shadow-xs overflow-hidden space-y-8">
          {/* Ambient Blurred Orbs */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#13706A]/12 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#1E759A]/12 blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-teal-900/10 pb-5">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-[#0F5D58] bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-teal-200/80 shadow-2xs">
                <span>نبذة عن المؤسسة</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2.5">
                من نحن ورسالتنا في خدمة المجتمع
              </h2>
            </div>
            <p className="text-xs text-slate-600 font-normal bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/80">
              نسعى لتقديم العون الإنساني لمستحقيه وفق الضوابط الشرعية، وبما يحفظ كرامة الأسرة واستقرارها
            </p>
          </div>

          {/* 12-Column Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* Card 1: من نحن (About Us) - 6 Cols */}
            <div className="lg:col-span-6 group relative overflow-hidden rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 ring-1 ring-slate-900/5 shadow-[0_8px_30px_rgb(15,93,88,0.06)] hover:shadow-[0_22px_45px_rgb(19,112,106,0.12)] hover:border-[#13706A]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between p-7 sm:p-8">
              <svg
                className="absolute -left-8 -top-8 w-44 h-44 text-[#13706A]/[0.04] group-hover:text-[#13706A]/[0.08] group-hover:scale-105 transition-all duration-500 pointer-events-none"
                viewBox="0 0 100 100"
                fill="none"
              >
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="4" strokeDasharray="6 6" />
                <polygon points="50,12 88,50 50,88 12,50" stroke="currentColor" strokeWidth="3" />
                <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="3" />
              </svg>

              <div className="space-y-6 relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F5D58] to-[#13706A] p-0.5 shadow-md shadow-teal-900/10 group-hover:scale-105 transition-transform duration-300 shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-[#0F5D58] to-[#13706A] rounded-[14px] flex items-center justify-center">
                        <svg className="w-8 h-8 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" className="text-teal-200/25" fill="currentColor" />
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#13706A] bg-teal-50/90 px-2.5 py-0.5 rounded-lg border border-teal-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#13706A]" />
                        <span>التعريف بالمؤسسة</span>
                      </span>
                      <h3 className="text-2xl font-bold text-slate-800 mt-1">من نحن</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md border border-teal-100/90 border-r-4 border-r-[#13706A] rounded-2xl p-4 sm:p-5 shadow-2xs">
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    مؤسسة الزكاة والصدقات القطرية مؤسسة خيرية تُعنى بجمع أموال الزكاة والصدقات وتوزيعها على الفئات المستحقة من الأسر المتعففة والأيتام والمرضى وطلبة العلم، وتنفيذ المشاريع الموسمية والتنموية التي تسهم في تحسين الظروف المعيشية للمستفيدين.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      title: 'الأمانة والوضوح',
                      sub: 'إيصال التبرعات لمستحقيها',
                      svg: (
                        <svg className="w-4 h-4 text-[#13706A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      ),
                    },
                    {
                      title: 'دراسة الحالات',
                      sub: 'لجان متخصصة لتقييم الاحتياج',
                      svg: (
                        <svg className="w-4 h-4 text-[#13706A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" rx="1.5" />
                          <rect x="14" y="3" width="7" height="7" rx="1.5" />
                          <rect x="14" y="14" width="7" height="7" rx="1.5" />
                          <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                      ),
                    },
                    {
                      title: 'رعاية الأسر',
                      sub: 'برامج إعانة وكفالات دورية',
                      svg: (
                        <svg className="w-4 h-4 text-[#13706A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      ),
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-teal-50/50 hover:bg-teal-50/90 backdrop-blur-xs border border-teal-200/60 rounded-2xl p-3 text-center transition-all flex flex-col items-center gap-1.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white shadow-2xs border border-teal-100 flex items-center justify-center">
                        {item.svg}
                      </div>
                      <div className="text-xs font-semibold text-slate-800">{item.title}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-200/70 flex items-center justify-between text-xs relative z-10">
                <div className="flex items-center gap-2 text-[#0F5D58] font-medium bg-emerald-50/80 px-3.5 py-1.5 rounded-xl border border-emerald-200/70">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>الالتزام بالمعايير الشرعية والإنسانية في صرف المساعدات</span>
                </div>
              </div>
            </div>

            {/* Card 2: رسالتنا وأهدافنا (Our Mission) - 6 Cols */}
            <div className="lg:col-span-6 group relative overflow-hidden rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 ring-1 ring-slate-900/5 shadow-[0_8px_30px_rgb(30,117,154,0.06)] hover:shadow-[0_22px_45px_rgb(30,117,154,0.12)] hover:border-[#1E759A]/35 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between p-7 sm:p-8">
              <svg
                className="absolute -left-8 -top-8 w-44 h-44 text-[#1E759A]/[0.04] group-hover:text-[#1E759A]/[0.08] group-hover:scale-105 transition-all duration-500 pointer-events-none"
                viewBox="0 0 100 100"
                fill="none"
              >
                <path d="M50 8 L88 25 V52 C88 74 71 89 50 95 C29 89 12 74 12 52 V25 L50 8 Z" stroke="currentColor" strokeWidth="3.5" />
                <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="3" strokeDasharray="5 5" />
              </svg>

              <div className="space-y-6 relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E759A] to-[#13706A] p-0.5 shadow-md shadow-sky-900/10 group-hover:scale-105 transition-transform duration-300 shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-[#1E759A] to-[#13706A] rounded-[14px] flex items-center justify-center">
                        <svg className="w-8 h-8 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="text-sky-200/25" fill="currentColor" />
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#1E759A] bg-sky-50/90 px-2.5 py-0.5 rounded-lg border border-sky-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1E759A]" />
                        <span>منهج العمل</span>
                      </span>
                      <h3 className="text-2xl font-bold text-slate-800 mt-1">رسالتنا وأهدافنا</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md border border-sky-100/90 border-r-4 border-r-[#1E759A] rounded-2xl p-4 sm:p-5 shadow-2xs">
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    لا يقتصر دورنا على تقديم الإعانات المالية والغذائية العاجلة فحسب، بل نحرص على مساندة الأسر القادرة على العمل وتأهيلها بمشاريع إنتاجية صغيرة تحقق لها دخلاً ثابتاً ومستقراً يغنيها عن السؤال.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      title: 'الإعانات العاجلة',
                      sub: 'تغطية النفقات الضرورية',
                      svg: (
                        <svg className="w-4 h-4 text-[#1E759A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      ),
                    },
                    {
                      title: 'التعليم والصحة',
                      sub: 'سداد الرسوم والعلاج',
                      svg: (
                        <svg className="w-4 h-4 text-[#1E759A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m22 7-8.5 8.5-5-5L2 17" />
                          <path d="M16 7h6v6" />
                        </svg>
                      ),
                    },
                    {
                      title: 'المشاريع الإنتاجية',
                      sub: 'تأهيل الأسر للاكتفاء الذاتي',
                      svg: (
                        <svg className="w-4 h-4 text-[#1E759A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="8" r="6" />
                          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                        </svg>
                      ),
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-sky-50/50 hover:bg-sky-50/90 backdrop-blur-xs border border-sky-200/60 rounded-2xl p-3 text-center transition-all flex flex-col items-center gap-1.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white shadow-2xs border border-sky-100 flex items-center justify-center">
                        {item.svg}
                      </div>
                      <div className="text-xs font-semibold text-slate-800">{item.title}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-200/70 relative z-10">
                <div className="flex items-center gap-2.5 text-xs text-emerald-900 bg-gradient-to-l from-emerald-50/90 to-teal-50/80 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[#13706A] shrink-0" />
                  <span className="font-medium">
                    نسعى لأن تكون الزكاة عوناً حقيقياً ينقل الأسرة من الحاجة إلى الاستقرار والإنتاج.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Application Steps with Clear Entry Action */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-1.5 text-right">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#13706A] bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              <FileText className="w-3.5 h-3.5" />
              <span>آلية التقديم</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">طريقة تقديم طلب المساعدة</h2>
            <p className="text-sm text-slate-500 font-normal">
              يمكنك تسجيل طلبك إلكترونياً عبر الموقع ومتابعة حالته في أي وقت من خلال الخطوات التالية
            </p>
          </div>
          <button
            onClick={handleApply}
            className="w-full sm:w-auto bg-[#13706A] hover:bg-[#0F5D58] text-white px-6 py-3.5 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>الانتقال لنموذج التقديم</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              step: '01',
              title: 'تعبئة بيانات الطلب',
              desc: 'إدخال البيانات الشخصية وعدد أفراد الأسرة ومكان السكن وأرقام الاتصال.',
              icon: FileText,
              borderAccent: 'border-t-4 border-t-[#13706A] ring-1 ring-[#13706A]/20 bg-gradient-to-b from-teal-50/40 to-white',
              iconStyle: 'bg-[#13706A] text-white shadow-xs',
              isActionCard: true,
              actionLabel: 'الدخول لنموذج التقديم',
              onClick: handleApply,
            },
            {
              step: '02',
              title: 'تأكيد البيانات واستلام الرقم',
              desc: 'مراجعة المعلومات المدخلة والموافقة على صحة البيانات لاستلام رقم الملف.',
              icon: Send,
              borderAccent: 'border-t-4 border-t-amber-500',
              iconStyle: 'bg-amber-50 text-amber-600',
              isActionCard: false,
            },
            {
              step: '03',
              title: 'مراجعة اللجنة المختصة',
              desc: 'تتولى لجنة البحث الاجتماعي دراسة الطلب والتحقق من البيانات لتقدير الاحتياج.',
              icon: FileSearch,
              borderAccent: 'border-t-4 border-t-[#1E759A]',
              iconStyle: 'bg-sky-50 text-[#1E759A]',
              isActionCard: false,
            },
            {
              step: '04',
              title: 'الرد على الطلب والصرف',
              desc: 'إشعار المتقدم بنتيجة الدراسة وموعد استلام المساعدة عند اعتمادها.',
              icon: CheckCircle2,
              borderAccent: 'border-t-4 border-t-emerald-600',
              iconStyle: 'bg-emerald-50 text-emerald-700',
              isActionCard: true,
              actionLabel: 'الاستعلام عن حالة طلبك',
              onClick: handleTrack,
            },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                onClick={item.onClick}
                role={item.isActionCard ? 'button' : undefined}
                tabIndex={item.isActionCard ? 0 : undefined}
                onKeyDown={
                  item.isActionCard && item.onClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          item.onClick?.();
                        }
                      }
                    : undefined
                }
                className={`clean-card p-6 relative overflow-hidden group flex flex-col justify-between transition-all ${
                  item.isActionCard ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-[#13706A]' : ''
                } ${item.borderAccent}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 ${item.iconStyle} rounded-xl flex items-center justify-center`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    {idx === 0 ? (
                      <span className="bg-[#13706A] text-white text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                        <span>ابدأ من هنا</span>
                      </span>
                    ) : (
                      <span className="text-3xl font-mono font-bold text-slate-200 group-hover:text-emerald-100 transition-colors">
                        {item.step}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800 text-base mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{item.desc}</p>
                </div>

                {item.isActionCard && (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#13706A] group-hover:text-[#0F5D58]">
                    <span>{item.actionLabel}</span>
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Complaints & Grievances Section on Homepage - Compact Side-by-Side Layout */}
      <section id="complaints-section" className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Expressive Visual & Trust Panel */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#0F5D58] to-[#0A3F3C] text-white p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[11px] px-3 py-1 rounded-full font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>خدمة المراجعين</span>
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                تواصل مباشر مع لجنة المراجعة
              </h2>
              <p className="text-xs text-teal-100/90 leading-relaxed font-normal">
                في حال وجود استفسار حول طلب سابق، أو الرغبة في تقديم تظلم لإعادة دراسة الحالة، يرجى مراسلتنا عبر النموذج المرفق وسيتم الرد عليكم في أقرب وقت.
              </p>
            </div>

            <div className="my-4 relative z-10 rounded-2xl overflow-hidden border border-white/15 shadow-md bg-[#0A3F3C]">
              <img
                src={grievanceSupportImg}
                alt="مكتب استقبال الاستفسارات والتظلمات والدعم المباشر"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/assets/images/')) {
                    target.src = '/assets/images/grievance_support_illustration_1794986259458.jpg';
                  }
                }}
                className="w-full h-48 sm:h-52 object-cover object-center block"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-teal-100 relative z-10">
              <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-1.5 border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>متابعة من اللجان المختصة</span>
              </div>
              <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-1.5 border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>خصوصية تامة للبيانات</span>
              </div>
            </div>
          </div>

          {/* Compact Inquiry / Grievance Form Panel */}
          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-center space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  تقديم استفسار أو تظلم مباشر
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
                  يرجى كتابة البيانات الصحيحة ورقم الطلب السابق إن وجد لتسهيل مراجعة ملفكم.
                </p>
              </div>
            </div>

            {submittedComplaintCode && (
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-900 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    تم استلام رسالتك بنجاح. رقم المرجع للمتابعة:{' '}
                    <strong className="font-mono text-xs underline px-1 font-semibold">{submittedComplaintCode}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setSubmittedComplaintCode(null)}
                  className="text-slate-500 hover:text-slate-800 text-[11px]"
                >
                  إغلاق
                </button>
              </div>
            )}

            <form onSubmit={handleComplaintSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={complaintForm.applicantName}
                    onChange={(e) => setComplaintForm({ ...complaintForm, applicantName: e.target.value })}
                    placeholder="الاسم الثلاثي أو الرباعي"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">رقم الهوية / جواز السفر</label>
                  <input
                    type="text"
                    value={complaintForm.nationalId}
                    onChange={(e) => setComplaintForm({ ...complaintForm, nationalId: e.target.value })}
                    placeholder="رقم البطاقة الشخصية"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">رقم الهاتف للتواصل *</label>
                  <input
                    type="text"
                    required
                    value={complaintForm.phone}
                    onChange={(e) => setComplaintForm({ ...complaintForm, phone: e.target.value })}
                    placeholder="059XXXXXXX / +974XXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">نوع المراسلة *</label>
                  <select
                    value={complaintForm.type}
                    onChange={(e) => setComplaintForm({ ...complaintForm, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                  >
                    <option value="استفسار">استفسار عام</option>
                    <option value="شكوى">ملاحظة أو شكوى</option>
                    <option value="تظلم">تظلم على قرار لجنة</option>
                    <option value="طلب إعادة مراجعة">طلب إعادة دراسة الحالة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">رقم الطلب السابق (اختياري)</label>
                <input
                  type="text"
                  value={complaintForm.relatedApplicationCode}
                  onChange={(e) => setComplaintForm({ ...complaintForm, relatedApplicationCode: e.target.value })}
                  placeholder="مثال: QTR-2026-000101"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">نص الرسالة أو التظلم *</label>
                <textarea
                  required
                  rows={3}
                  value={complaintForm.details}
                  onChange={(e) => setComplaintForm({ ...complaintForm, details: e.target.value })}
                  placeholder="اكتب تفاصيل استفسارك أو أسباب التظلم..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#13706A] hover:bg-[#0F5D58] text-white py-2.5 rounded-xl font-semibold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال إلى لجنة المراجعة</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Final Action & Privacy Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="clean-card p-8 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold text-slate-800">سرية البيانات وخصوصية المتقدمين</h3>
            <p className="text-xs text-slate-500 font-normal">
              جميع المعلومات والبيانات المسجلة عبر الموقع تُحفظ بسرية تامة، وتُطلّع عليها اللجان المختصة بدراسة الحالات فقط.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onOpenDonateModal && (
              <button
                onClick={onOpenDonateModal}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 px-8 py-3.5 rounded-xl font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>المساهمة بالتبرع</span>
              </button>
            )}

            <button
              onClick={handleApply}
              className="w-full sm:w-auto bg-[#13706A] hover:bg-[#0F5D58] text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>تسجيل طلب مساعدة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
