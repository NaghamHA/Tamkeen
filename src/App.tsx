import React, { useState } from 'react';
import {
  Application,
  ApplicationStatus,
  User,
  UserRole,
  SystemSettings,
  Complaint,
  AuditLogEntry,
  AuditLogItem,
  SocialResearchReport,
  CommitteeDecision,
  DisbursementRecord,
  EmployeeTask,
} from './types';
import {
  INITIAL_APPLICATIONS,
  INITIAL_USERS,
  INITIAL_SETTINGS,
  INITIAL_COMPLAINTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TASKS,
} from './data/mockData';

import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './components/home/HomePage';
import { ApplicationWizard } from './components/wizard/ApplicationWizard';
import { BeneficiaryPortal } from './components/beneficiary/BeneficiaryPortal';
import { DonationModal } from './components/donation/DonationModal';

import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { ApplicationManagement } from './components/admin/ApplicationManagement';
import { ApplicationDetailModal } from './components/admin/ApplicationDetailModal';
import { SocialResearchModule } from './components/admin/SocialResearchModule';
import { CommitteeModule } from './components/admin/CommitteeModule';
import { FinanceModule } from './components/admin/FinanceModule';
import { ReportsModule } from './components/admin/ReportsModule';
import { UsersAndRolesModule } from './components/admin/UsersAndRolesModule';
import { ContentManagementModule } from './components/admin/ContentManagementModule';
import { AuditLogModule } from './components/admin/AuditLogModule';
import { ComplaintsModule } from './components/admin/ComplaintsModule';
import { EmployeeTasksModule } from './components/admin/EmployeeTasksModule';
import { AdminLoginPage } from './components/admin/AdminLoginPage';

export default function App() {
  // Global State
  const [currentView, setCurrentView] = useState<'home' | 'apply' | 'portal' | 'admin'>('home');
  const [scrollToComplaints, setScrollToComplaints] = useState<boolean>(false);
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<string>('dashboard');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('GENERAL_MANAGER');
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [loggedInAdminUser, setLoggedInAdminUser] = useState<Partial<User> | null>(null);

  // Core Data Collections
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [auditLogs, setAuditLogs] = useState<any[]>(INITIAL_AUDIT_LOGS);
  const [employeeTasks, setEmployeeTasks] = useState<EmployeeTask[]>(INITIAL_TASKS);

  // Employee Task Handlers
  const handleAddEmployeeTask = (taskData: Partial<EmployeeTask>) => {
    const newTask: EmployeeTask = {
      id: 'task-' + Date.now(),
      title: taskData.title || 'مهمة متابعة جديدة',
      category: taskData.category || 'REVIEW_FILE',
      priority: taskData.priority || 'HIGH',
      status: taskData.status || 'PENDING',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      assignedToName: taskData.assignedToName || 'د. محمود القاسم (مدير النظام)',
      assignedToRole: taskData.assignedToRole || currentUserRole,
      relatedAppCode: taskData.relatedAppCode,
      beneficiaryName: taskData.beneficiaryName,
      notes: taskData.notes,
      createdAt: new Date().toLocaleString('ar-EG'),
    };
    setEmployeeTasks((prev) => [newTask, ...prev]);
    logAuditAction('إضافة مهمة موظف جديدة', newTask.relatedAppCode || 'TASK', `إضافة مهمة: ${newTask.title}`);
  };

  const handleUpdateEmployeeTask = (taskId: string, updatedFields: Partial<EmployeeTask>) => {
    setEmployeeTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updatedFields } : t))
    );
  };

  const handleDeleteEmployeeTask = (taskId: string) => {
    setEmployeeTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Modal State for Selected Application
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Helper: Log Action in Audit Trail
  const logAuditAction = (
    actionType: string,
    targetCode?: string,
    details?: string
  ) => {
    const newLog: AuditLogItem = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('ar-EG'),
      userName: 'د. محمود القاسم',
      userRole: currentUserRole,
      actionType,
      resourceCode: targetCode || 'SYS-WB',
      details: details || 'إجراء عادي عبر اللوحة الإدارية',
      ipAddress: '192.168.1.105',
      deviceInfo: 'Chrome / Windows 11',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Submit New Aid Application from Wizard
  const handleNewApplicationSubmit = (newApp: Application) => {
    setApplications((prev) => [newApp, ...prev]);
    logAuditAction('تقديم طلب جديد', newApp.code, `تم استقبال طلب جديد من ${newApp.fullName}`);
    setCurrentView('portal');
  };

  // Handler: Update Application Details
  const handleUpdateApplicationDetails = (appId: string, updatedFields: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const timestamp = new Date().toLocaleString('ar-EG');
          const newActivityLog = {
            id: 'act-' + Date.now(),
            timestamp,
            userName: loggedInAdminUser?.name || 'د. محمود القاسم',
            userRole: currentUserRole,
            action: 'تعديل بيانات المعاملة',
            details: 'تم تحديث البيانات الأساسية لملف المساعدة',
            previousStatus: a.status,
            newStatus: a.status,
          };
          const updated = {
            ...a,
            ...updatedFields,
            activityLogs: [newActivityLog, ...(a.activityLogs || [])],
          };
          if (selectedApplication?.id === appId) {
            setSelectedApplication(updated);
          }
          logAuditAction('تعديل ملف المعاملة', a.code, 'تعديل البيانات الأساسية للمستفيد');
          return updated;
        }
        return a;
      })
    );
  };

  // Handler: Update Application Status
  const handleUpdateStatus = (appId: string, newStatus: ApplicationStatus, note?: string) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const timestamp = new Date().toLocaleString('ar-EG');
          const newActivityLog = {
            id: 'act-' + Date.now(),
            timestamp,
            userName: loggedInAdminUser?.name || 'د. محمود القاسم',
            userRole: currentUserRole,
            action: 'تغيير حالة الطلب والقرار',
            details: note || `تغيير حالة المعاملة إلى ${newStatus}`,
            previousStatus: a.status,
            newStatus: newStatus,
          };

          const updatedNotes = note
            ? [
                ...a.internalNotes,
                {
                  id: 'note-' + Date.now(),
                  author: loggedInAdminUser?.name || 'د. محمود القاسم',
                  role: currentUserRole,
                  date: timestamp,
                  text: `تحديث الحالة إلى ${newStatus}: ${note}`,
                },
              ]
            : a.internalNotes;

          const updated = {
            ...a,
            status: newStatus,
            internalNotes: updatedNotes,
            activityLogs: [newActivityLog, ...(a.activityLogs || [])],
          };

          if (selectedApplication?.id === appId) {
            setSelectedApplication(updated);
          }
          logAuditAction('تغيير حالة الطلب', a.code, `تغيير الحالة إلى ${newStatus} - ${note || ''}`);
          return updated;
        }
        return a;
      })
    );
  };

  // Handler: Upload Missing Document from Portal
  const handleUploadMissingDoc = (appId: string, docType: string, file: File) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const updatedDocs = a.documents.map((d) =>
            d.type === docType
              ? { ...d, status: 'PENDING_AUDIT' as const, fileName: file.name, fileSize: '2.1 MB' }
              : d
          );
          logAuditAction('إعادة إرفاق مستند', a.code, `تم رفع مستند جديد: ${file.name}`);
          return { ...a, documents: updatedDocs, status: 'INITIAL_AUDIT' as ApplicationStatus };
        }
        return a;
      })
    );
  };

  // Handler: Add Internal Note
  const handleAddInternalNote = (appId: string, text: string) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const updatedNotes = [
            ...a.internalNotes,
            {
              id: 'note-' + Date.now(),
              author: 'د. محمود القاسم',
              role: currentUserRole,
              date: new Date().toLocaleString('ar-EG'),
              text,
            },
          ];
          const updated = { ...a, internalNotes: updatedNotes };
          if (selectedApplication?.id === appId) {
            setSelectedApplication(updated);
          }
          logAuditAction('إضافة ملاحظة داخلية', a.code, text);
          return updated;
        }
        return a;
      })
    );
  };

  // Handler: Save Social Research Report
  const handleSaveSocialResearch = (appId: string, report: SocialResearchReport) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          logAuditAction('حفظ تقرير البحث الاجتماعي', a.code, `المبلغ الموصى به: ${report.recommendedAmount} ₪`);
          return { ...a, socialResearchReport: report, status: 'REFERRED_COMMITTEE' as ApplicationStatus };
        }
        return a;
      })
    );
  };

  // Handler: Save Committee Decision
  const handleSaveCommitteeDecision = (appId: string, decision: CommitteeDecision) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const newStatus =
            decision.finalDecision === 'REJECTED' ? ('REJECTED' as const) : ('APPROVED' as const);
          logAuditAction('اعتماد قرار اللجنة', a.code, `المبلغ المعتمد: ${decision.approvedAmount} ₪`);
          return { ...a, committeeDecision: decision, status: newStatus };
        }
        return a;
      })
    );
  };

  // Handler: Execute Disbursement
  const handleExecuteDisbursement = (appId: string, record: DisbursementRecord) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          logAuditAction('تنفيذ الصرف المالي', a.code, `المبلغ المصروف: ${record.amount} ₪ | ${record.paymentMethod}`);
          return { ...a, disbursementRecord: record, status: 'DISBURSED' as ApplicationStatus };
        }
        return a;
      })
    );
  };

  // Handler: Submit Grievance
  const handleSubmitGrievance = (cmp: Partial<Complaint>) => {
    const newCmp: Complaint = {
      id: 'cmp-' + Date.now(),
      code: cmp.code || 'CMP-900',
      applicantName: cmp.applicantName || 'مستفيد',
      nationalId: cmp.nationalId || '',
      phone: cmp.phone || '',
      relatedApplicationCode: cmp.relatedApplicationCode || '',
      type: cmp.type || 'تظلم',
      details: cmp.details || '',
      status: 'جديد',
      createdAt: new Date().toLocaleString('ar-EG'),
    };
    setComplaints((prev) => [newCmp, ...prev]);
    logAuditAction('تقديم تظلم/شكوى', newCmp.relatedApplicationCode, newCmp.details);
  };

  // Handler: Add User
  const handleAddUser = (user: Partial<User>) => {
    const newUser: User = {
      id: 'u-' + Date.now(),
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'SOCIAL_RESEARCHER',
      branchId: 'br-wb',
      branchName: 'المقر العام',
      isActive: true,
      branch: user.branch || 'المقر العام',
      active: true,
      permissions: ['read', 'write'],
    };
    setUsers((prev) => [...prev, newUser]);
    logAuditAction('إضافة موظف جديد', newUser.email, `الدور: ${newUser.role}`);
  };

  // Handler: Update User Role/Status
  const handleUpdateUser = (userId: string, updatedFields: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...updatedFields };
          logAuditAction('تعديل صلاحيات/حالة موظف', u.email, `التحديث: ${JSON.stringify(updatedFields)}`);
          return updated;
        }
        return u;
      })
    );
  };

  const handleTabChange = (tab: 'home' | 'apply' | 'track' | 'admin' | 'complaints') => {
    if (tab === 'track') {
      setScrollToComplaints(false);
      setCurrentView('portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'complaints') {
      setCurrentView('home');
      setScrollToComplaints(true);
      setTimeout(() => {
        const el = document.getElementById('complaints-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else if (tab === 'home') {
      setScrollToComplaints(false);
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setScrollToComplaints(false);
      setCurrentView(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] flex flex-col font-['Tajawal',sans-serif]" dir="rtl">
        {/* Top Main Navigation Header */}
        <Header
          activeTab={currentView === 'portal' ? 'track' : scrollToComplaints ? 'complaints' : currentView}
          setActiveTab={handleTabChange}
          currentUserRole={currentUserRole}
          setCurrentUserRole={setCurrentUserRole}
          isApplicationsOpen={settings.isApplicationsOpen}
          onOpenDonateModal={() => setIsDonateModalOpen(true)}
        />

        {/* Main View Switcher */}
        <main className="flex-1">
          {currentView === 'home' && (
            <HomePage
              setActiveTab={handleTabChange}
              onStartApplication={() => {
                setScrollToComplaints(false);
                setCurrentView('apply');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onTrackApplication={() => {
                setScrollToComplaints(false);
                setCurrentView('portal');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenDonateModal={() => setIsDonateModalOpen(true)}
              settings={settings}
              complaints={complaints}
              onSubmitComplaint={handleSubmitGrievance}
              autoScrollToComplaints={scrollToComplaints}
            />
          )}

          {currentView === 'apply' && (
            <ApplicationWizard
              onSubmitSuccess={handleNewApplicationSubmit}
              settings={settings}
            />
          )}

          {currentView === 'portal' && (
            <BeneficiaryPortal
              applicationsList={applications}
              onUploadMissingDoc={handleUploadMissingDoc}
              onSubmitGrievance={handleSubmitGrievance}
            />
          )}

          {currentView === 'admin' &&
            (!isAdminAuthenticated ? (
              <AdminLoginPage
                onLoginSuccess={(u) => {
                  setIsAdminAuthenticated(true);
                  setLoggedInAdminUser(u);
                  if (u.role) setCurrentUserRole(u.role as UserRole);
                  logAuditAction('تسجيل دخول إداري', u.email || 'admin', 'تم تسجيل الدخول بنجاح إلى لوحة التحكم');
                }}
                onBackToHome={() => setCurrentView('home')}
              />
            ) : (
              <AdminLayout
                currentUserRole={currentUserRole}
                setCurrentUserRole={setCurrentUserRole}
                settings={settings}
                applications={applications}
                activeSubTab={activeAdminSubTab}
                setActiveSubTab={setActiveAdminSubTab}
                onLogout={() => {
                  logAuditAction('تسجيل خروج إداري', loggedInAdminUser?.email || 'admin', 'تم تسجيل الخروج من النظام');
                  setIsAdminAuthenticated(false);
                  setLoggedInAdminUser(null);
                  setCurrentView('home');
                }}
              >
                {activeAdminSubTab === 'dashboard' && (
                  <DashboardOverview
                    applications={applications}
                    onSelectApplication={(app) => setSelectedApplication(app)}
                    setActiveSubTab={setActiveAdminSubTab}
                  />
                )}

                {(activeAdminSubTab === 'applications' ||
                  activeAdminSubTab === 'urgent' ||
                  activeAdminSubTab === 'pending_docs') && (
                  <ApplicationManagement
                    applications={applications}
                    onSelectApplication={(app) => setSelectedApplication(app)}
                    onUpdateStatus={handleUpdateStatus}
                  />
                )}

                {activeAdminSubTab === 'social_research' && (
                  <SocialResearchModule
                    applications={applications}
                    onSaveReport={handleSaveSocialResearch}
                  />
                )}

                {activeAdminSubTab === 'reports' && (
                  <ReportsModule applications={applications} />
                )}

                {activeAdminSubTab === 'employee_tasks' && (
                  <EmployeeTasksModule
                    tasks={employeeTasks}
                    onAddTask={handleAddEmployeeTask}
                    onUpdateTask={handleUpdateEmployeeTask}
                    onDeleteTask={handleDeleteEmployeeTask}
                    applications={applications}
                    users={users}
                    currentUserRole={currentUserRole}
                    onSelectApplicationCode={(appCode) => {
                      const found = applications.find((a) => a.code === appCode);
                      if (found) setSelectedApplication(found);
                    }}
                  />
                )}

                {activeAdminSubTab === 'users_roles' && (
                  <UsersAndRolesModule
                    users={users}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                  />
                )}

                {activeAdminSubTab === 'content_mgmt' && (
                  <ContentManagementModule
                    settings={settings}
                    onUpdateSettings={(s) => setSettings((prev) => ({ ...prev, ...s }))}
                  />
                )}

                {activeAdminSubTab === 'complaints' && (
                  <ComplaintsModule
                    complaints={complaints}
                    onResolveComplaint={(id, resp) => {
                      setComplaints((prev) =>
                        prev.map((c) =>
                          c.id === id
                            ? { ...c, status: 'تم الرد', responseDetails: resp, response: resp }
                            : c
                        )
                      );
                      logAuditAction('الرد على استفسار/شكوى', id, `تم إرسال الرد الرسمي: ${resp}`);
                    }}
                  />
                )}
              </AdminLayout>
            ))}
        </main>

        {/* Application Detail Modal when a case file is opened */}
        {selectedApplication && (
          <ApplicationDetailModal
            app={selectedApplication}
            currentUserRole={currentUserRole}
            onClose={() => setSelectedApplication(null)}
            onUpdateStatus={handleUpdateStatus}
            onUpdateApplicationDetails={handleUpdateApplicationDetails}
            onAddInternalNote={handleAddInternalNote}
            onLogBankView={(appCode) => logAuditAction('عرض البيانات البنكية وIBAN', appCode, 'تم فك تشفير IBAN للمعاينة الرسمية')}
          />
        )}

        {/* Donation Modal */}
        <DonationModal
          isOpen={isDonateModalOpen}
          onClose={() => setIsDonateModalOpen(false)}
        />

        {/* Footer */}
        <Footer settings={settings} setActiveTab={handleTabChange} />
      </div>
  );
}

