import { Application, SystemSettings, AuditLogItem, User, Complaint } from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  parentOrganizationName: 'مؤسسة الزكاة والصدقات القطرية',
  parentOrgSubtext: 'مؤسسة الزكاة والصدقات القطرية هي الجهة المعتمدة للتمكين الاجتماعي والخدمات الإنسانية والتبرعات',
  localBranchName: 'مؤسسة الزكاة والصدقات القطرية',
  localBranchRegion: 'دولياً وإقليمياً',
  isApplicationsOpen: true,
  dailyApplicationCap: 100,
  currentDayApplicationCount: 0,
  defaultCurrency: 'QAR',
  applicationCodePrefix: 'QTR-2026-',
  aboutText:
    'في قلب مجتمعنا العربي، حيث تتشابك التحديات بأمل التغيير، تقف مؤسسة الزكاة والصدقات القطرية كحصن منيع يدافع عن قيم العدالة والإنسانية. نعمل على تحويل الزكاة من واجب إلى استراتيجية تمكينية تفتح آفاقًا جديدة للتنمية والازدهار.',
  missionText:
    'مدفوعون بإيمان راسخ بأن "الزكاة تنمية وتمكين"، نلتزم ليس فقط بتوزيع الأموال، بل بزرع بذور التغيير الإيجابي في المجتمع العربي، مع الحفاظ على كرامة الإنسان وتحقيق العدالة الاجتماعية.',
  contactPhone: '+974 4400 0000',
  contactEmail: 'info@zakat-qatar.org',
  contactAddress: 'الدوحة - المقر الرئيسي لمؤسسة الزكاة والصدقات القطرية',
  isApplicationReceivingOpen: true,
  closureMessage: 'نعتذر، تم إغلاق استقبال الطلبات الإلكترونية مؤقتاً لاكتفاء الموازنة المخصصة لهذا الشهر.',
  maxMonthlyBudgetLimit: 500000,
  formSteps: [
    { id: 1, title: 'البيانات الشخصية ومكان السكن', description: 'الاسم الثلاثي، رقم الهوية، تاريخ الميلاد، التواصل، والعنوان', enabled: true, order: 1, isMandatory: true },
    { id: 3, title: 'مراجعة الطلب والتعهد والتوقيع', description: 'الإقرار بصحة البيانات والتوقيع الإلكتروني لمقدم الطلب', enabled: true, order: 2, isMandatory: true },
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
