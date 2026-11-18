import React, { useState } from 'react';
import { Logo } from './Logo';
import { FileText, UserCheck, Menu, X, ShieldAlert, PhoneCall, HeartHandshake } from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  activeTab: 'home' | 'apply' | 'track' | 'admin' | 'complaints';
  setActiveTab: (tab: 'home' | 'apply' | 'track' | 'admin' | 'complaints') => void;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  isApplicationsOpen: boolean;
  onOpenDonateModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isApplicationsOpen,
  onOpenDonateModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Top Notification Bar / Branch Context */}
      <div className="bg-[#0F5D58] text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-300"></span>
            <span className="font-medium tracking-wide text-teal-50">
              مؤسسة الزكاة والصدقات القطرية
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-teal-100/90 hidden md:inline">
              الزكاة تنمية وتمكين • خدمة المستفيدين والتبرع المباشر
            </span>
            <a
              href="tel:+97444000000"
              className="flex items-center gap-1 hover:underline text-amber-200 font-medium"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span dir="ltr">+974 4400 0000</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="cursor-pointer transition-transform active:scale-98"
        >
          <Logo size="md" variant="full" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#13706A]/10 text-[#13706A] font-semibold'
                : 'text-slate-700 hover:text-[#13706A] hover:bg-slate-50'
            }`}
          >
            الرئيسية
          </button>

          <button
            onClick={() => setActiveTab('apply')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'apply'
                ? 'bg-[#13706A]/10 text-[#13706A] font-semibold'
                : 'text-slate-700 hover:text-[#13706A] hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 text-[#13706A]" />
            <span>تقديم طلب مساعدة</span>
            {!isApplicationsOpen && (
              <span className="bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                مغلق
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'track'
                ? 'bg-[#13706A]/10 text-[#13706A] font-semibold'
                : 'text-slate-700 hover:text-[#13706A] hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#1E759A]" />
            <span>متابعة الطلب</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'complaints'
                ? 'bg-[#13706A]/10 text-[#13706A] font-semibold'
                : 'text-slate-700 hover:text-[#13706A] hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>الاستفسارات والتظلمات</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {onOpenDonateModal && (
            <button
              onClick={onOpenDonateModal}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-semibold px-5 py-2.5 rounded-xl text-sm shadow-xs hover:shadow-md transition-all flex items-center gap-2 active:scale-95 border border-amber-300/80 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4 text-slate-950" />
              <span>تبرع الآن</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('apply')}
            className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-xs hover:shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>تقديم طلب مساعدة</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          {onOpenDonateModal && (
            <button
              onClick={onOpenDonateModal}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shadow-2xs"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>تبرع الآن</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl">
          <button
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full text-right px-4 py-3 rounded-xl font-medium text-slate-800 hover:bg-slate-100 flex items-center justify-between"
          >
            <span>الرئيسية</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('apply');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right px-4 py-3 rounded-xl font-semibold text-white bg-[#13706A] flex items-center justify-between"
          >
            <span>تقديم طلب مساعدة</span>
            <FileText className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setActiveTab('track');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right px-4 py-3 rounded-xl font-medium text-slate-800 hover:bg-slate-100 flex items-center justify-between border border-slate-200"
          >
            <span>متابعة حالة الطلب</span>
            <UserCheck className="w-5 h-5 text-[#1E759A]" />
          </button>

          <button
            onClick={() => {
              setActiveTab('complaints');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right px-4 py-3 rounded-xl font-medium text-slate-800 hover:bg-slate-100 flex items-center justify-between"
          >
            <span>الاستفسارات والتظلمات</span>
            <ShieldAlert className="w-5 h-5 text-[#13706A]" />
          </button>
        </div>
      )}
    </header>
  );
};
