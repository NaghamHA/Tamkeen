import React from 'react';
import { SystemSettings } from '../../types';
import { Lock } from 'lucide-react';

interface FooterProps {
  settings: SystemSettings;
  setActiveTab?: (tab: 'home' | 'apply' | 'track' | 'admin' | 'complaints') => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, setActiveTab }) => {
  return (
    <footer className="bg-[#0F5D58] text-white border-t border-emerald-900 mt-12 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-emerald-100 space-y-2">
        <p className="font-bold text-sm text-white">
          جميع الحقوق محفوظة © {new Date().getFullYear()} - {settings.localBranchName || 'مؤسسة الزكاة والصدقات القطرية'}
        </p>
        <p className="text-[11px] text-emerald-200/80">
          النظام الإلكتروني لإدارة طلبات الزكاة والصدقات والتمكين المجتمعي
        </p>
        {setActiveTab && (
          <div className="pt-2 border-t border-emerald-800/50 max-w-xs mx-auto">
            <button
              onClick={() => setActiveTab('admin')}
              className="text-[11px] text-emerald-300/70 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors py-1 px-3 rounded-lg hover:bg-emerald-800/40"
              title="دخول الكادر الإداري"
            >
              <Lock className="w-3 h-3" />
              <span>دخول الكادر الإداري واللجان المختصة</span>
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};
