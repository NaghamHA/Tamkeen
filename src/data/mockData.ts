import { Application, SystemSettings, AuditLogItem, User, Complaint } from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  parentOrganizationName: 'مؤسسة الزكاة والصدقات القطرية',
  parentOrgSubtext: 'مؤسسة خيرية تُعنى بجمع الزكاة والصدقات وصرفها في مصارفها الشرعية ودعم الأسر المتعففة',
  localBranchName: 'مؤسسة الزكاة والصدقات القطرية',
  localBranchRegion: 'دولياً وإقليمياً',
  isApplicationsOpen: true,
  dailyApplicationCap: 100,
  currentDayApplicationCount: 0,
  defaultCurrency: 'QAR',
  applicationCodePrefix: 'QTR-2026-',
  aboutText:
    'مؤسسة الزكاة والصدقات القطرية مؤسسة خيرية تُعنى بجمع أموال الزكاة والصدقات وتوزيعها على الفئات المستحقة من الأسر المتعففة والأيتام والمرضى وطلبة العلم، وتنفيذ المشاريع الموسمية والتنموية التي تسهم في تحسين الظروف المعيشية للمستفيدين.',
  missionText:
    'نسعى لإيصال أموال الزكاة والصدقات لمستحقيها وفق الضوابط الشرعية، ومساندة الأسر القادرة على العمل بمشاريع إنتاجية صغيرة تعينها على الاستقرار والاكتفاء الذاتي.',
  contactPhone: '+974 4400 0000',
  contactEmail: 'info@zakat-qatar.org',
  contactAddress: 'الدوحة - المقر الرئيسي لمؤسسة الزكاة والصدقات القطرية',
  isApplicationReceivingOpen: true,
  closureMessage: 'نعتذر، تم إيقاف استقبال الطلبات الإلكترونية مؤقتاً لاكتمال العدد المخصص لهذا الشهر.',
  maxMonthlyBudgetLimit: 500000,
  formSteps: [
    { id: 1, title: 'البيانات الشخصية ومكان السكن', description: 'الاسم الكامل، رقم الهوية، تاريخ الميلاد، أرقام الاتصال، والعنوان', enabled: true, order: 1, isMandatory: true },
    { id: 3, title: 'مراجعة البيانات وتأكيد الطلب', description: 'التأكد من صحة المعلومات المدخلة وتأكيد إرسال الطلب', enabled: true, order: 2, isMandatory: true },
  ],
  customFields: [],
};

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-001',
    name: 'د. محمود القاسم (مدير النظام)',
    email: 'admin@tamkeen-zakat.ps',
    phone: '0599123456',
    role: 'SYSTEM_ADMIN',
    branchId: 'br-main',
    branchName: 'المقر الرئيسي',
    isActive: true,
  },
];

export const INITIAL_APPLICATIONS: Application[] = [];

export const INITIAL_COMPLAINTS: Complaint[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [];

export const INITIAL_TASKS: any[] = [];
