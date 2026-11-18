import React from 'react';
import { AuditLogEntry } from '../../types';
import { History, Shield, Lock, Search } from 'lucide-react';

interface AuditLogModuleProps {
  logs: AuditLogEntry[];
}

export const AuditLogModule: React.FC<AuditLogModuleProps> = ({ logs }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-800">سجل التدقيق والأمان والنشاطات (Audit Trail)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تتبع غير القابل للتعديل لكافة الإجراءات والاطلاع على البيانات الحساسة والبنوك
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-100 font-bold border-b">
            <tr>
              <th className="p-3.5">التاريخ والوقت</th>
              <th className="p-3.5">المستخدم</th>
              <th className="p-3.5">الدور</th>
              <th className="p-3.5">نوع الإجراء</th>
              <th className="p-3.5">رمز المعاملة/الملف</th>
              <th className="p-3.5">التفاصيل / IP</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  لا توجد حركات مسجلة في سجل الأمان حتى الآن.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="p-3.5 font-bold text-slate-800">{log.userName}</td>
                  <td className="p-3.5 text-slate-600">{log.userRole}</td>
                  <td className="p-3.5 font-bold text-[#13706A]">{log.actionType}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-700">{log.resourceCode || (log as any).targetCode || '---'}</td>
                  <td className="p-3.5 text-slate-600">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
