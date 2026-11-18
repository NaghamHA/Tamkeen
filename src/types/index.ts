// TypeScript definitions for Tamkeen Zakat & Sadaqat Association - West Bank Platform

export type ApplicationStatus =
  | 'DRAFT' // مسودة
  | 'SUBMITTED' // تم التقديم
  | 'NEW' // طلب جديد
  | 'INITIAL_AUDIT' // قيد التدقيق الأولي
  | 'INCOMPLETE' // غير مكتمل
  | 'AWAITING_DOCS' // بانتظار مستندات
  | 'IN_STUDY' // قيد دراسة الحالة
  | 'ASSIGNED_RESEARCHER' // محال إلى الباحث الاجتماعي
  | 'AWAITING_VISIT' // بانتظار التحقق أو الزيارة
  | 'REFERRED_SUPERVISOR' // محال إلى المشرف
  | 'REFERRED_COMMITTEE' // محال إلى اللجنة
  | 'AWAITING_COMMITTEE_DECISION' // بانتظار قرار اللجنة
  | 'APPROVED' // موافق عليه
  | 'PARTIALLY_APPROVED' // موافق عليه جزئياً
  | 'REJECTED' // مرفوض
  | 'AWAITING_DISBURSEMENT_DATA' // بانتظار بيانات الصرف
  | 'DISBURSEMENT_IN_PROGRESS' // قيد الصرف
  | 'DISBURSED' // تم الصرف
  | 'CLOSED' // مغلق
  | 'CANCELLED' // ملغي
  | 'ARCHIVED' // مؤرشف
  | 'DUPLICATE' // طلب مكرر
  | 'NEEDS_FURTHER_AUDIT'; // يحتاج تدقيقاً إضافياً

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';

export type AidType =
  | 'FINANCIAL' // مساعدات مالية
  | 'MEDICAL' // علاجية وطبية
  | 'FOOD' // طرود غذائية
  | 'EDUCATION' // تعليمية وجامعية
  | 'HOUSING' // سكن وإيجار
  | 'UTILITIES' // سداد فواتير
  | 'DEBT_RELIEF' // سداد ديون ضرورية
  | 'DISABILITY_SUPPORT' // أصحاب الإعاقة
  | 'ORPHAN_CARE' // رعاية الأيتام
  | 'EMERGENCY_AID' // حالات طارئة
  | 'ECONOMIC_EMPOWERMENT' // تمكين اقتصادي
  | 'OTHER'; // غير ذلك

export type UserRole =
  | 'GENERAL_MANAGER' // المدير العام
  | 'CASE_MANAGER' // مدير الحالات
  | 'SOCIAL_RESEARCHER' // الباحث الاجتماعي
  | 'AUDIT_OFFICER' // موظف التدقيق
  | 'COMMITTEE_MEMBER' // عضو اللجنة
  | 'FINANCE_OFFICER' // موظف المالية
  | 'BENEFICIARY_SERVICE' // خدمة المستفيدين
  | 'DATA_ENTRY' // موظف إدخال البيانات
  | 'INTERNAL_AUDITOR' // المدقق الداخلي
  | 'SYSTEM_ADMIN'; // مدير النظام

export interface FamilyMember {
  id: string;
  fullName: string;
  relation: string;
  age: number;
  gender: 'ذكر' | 'أنثى';
  educationLevel: string;
  occupation: string;
  monthlyIncome: number;
  healthStatus: string;
  hasDisability: boolean;
  receivesOtherAid: boolean;
}

export interface ExpenseItem {
  rent: number;
  food: number;
  utilities: number;
  medical: number;
  education: number;
  transport: number;
  debtInstallment: number;
  other: number;
}

export interface DocumentItem {
  id: string;
  type: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: 'ACCEPTED' | 'REJECTED' | 'NEEDS_UPDATE' | 'PENDING';
  rejectionReason?: string;
  reviewedBy?: string;
  expiryDate?: string;
}

export interface BankAccountInfo {
  accountHolderName: string;
  relationToApplicant: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  iban: string;
  currency: 'ILS' | 'USD' | 'JOD';
  isActive: boolean;
  isEncumbered: boolean;
  reasonForThirdParty?: string;
  proofDocumentUrl?: string;
}

export interface SocialResearchReport {
  id: string;
  researcherName: string;
  researchDate: string;
  contactMethod: 'زيارة ميدانية' | 'اتصال هاتفي' | 'مقابلة بمقر المؤسسة';
  summary: string;
  familyCondition: string;
  economicAssessment: string;
  healthAssessment: string;
  housingAssessment: string;
  verificationNotes: string;
  urgencyAssessment: UrgencyLevel;
  recommendedAidType: AidType;
  recommendedAmount: number;
  researcherNotes: string;
  supervisorApproval: boolean;
  supervisorNotes?: string;
}

export interface CommitteeVote {
  memberId: string;
  memberName: string;
  memberRole: string;
  decision: 'APPROVE' | 'PARTIAL' | 'REJECT' | 'REQUEST_INFO' | 'DEFER';
  recommendedAmount?: number;
  notes?: string;
  votedAt: string;
}

export interface CommitteeDecision {
  meetingId: string;
  meetingDate: string;
  finalDecision: 'FULL_APPROVAL' | 'PARTIAL_APPROVAL' | 'MORE_INFO_NEEDED' | 'DEFERRED' | 'REJECTED';
  approvedAmount: number;
  currency: string;
  fundingSource: string;
  budgetCategory: string;
  justification: string;
  votes: CommitteeVote[];
}

export interface DisbursementRecord {
  id: string;
  disbursementCode: string;
  amount: number;
  currency: string;
  fundingSource: string;
  paymentMethod: 'تحويل بنكي' | 'شيك' | 'دفع مباشر للمزود' | 'قسيمة شرائية' | 'نقدي';
  recipientName: string;
  maskedBankIban: string;
  transactionReference: string;
  disbursedAt: string;
  executedBy: string;
  approvedBy: string;
  receiptUrl?: string;
  status: 'PENDING' | 'EXECUTED' | 'FAILED' | 'CANCELLED';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  previousStatus?: ApplicationStatus;
  newStatus?: ApplicationStatus;
}

export interface Application {
  id: string;
  code: string; // e.g. TMK-WB-2026-000102
  branchId: string;
  branchName: string;
  
  // Step 1: Personal
  fullName: string;
  nationalId: string;
  dob: string;
  age: number;
  gender: 'ذكر' | 'أنثى';
  maritalStatus: 'عازب/ة' | 'متزوج/ة' | 'أرمل/ة' | 'مطلق/ة' | 'مهجور/ة';
  phone: string;
  alternatePhone?: string;
  whatsappPhone?: string;
  email?: string;
  governorate: string; // e.g., رام الله والبيرة
  cityTownCamp: string;
  detailedAddress: string;
  nearestLandmark?: string;
  preferredContact: 'هاتف' | 'واتساب' | 'بريد إلكتروني';
  isApplicantBeneficiary: boolean;
  relationToBeneficiary?: string;

  // Step 2: Family & Social
  familyCount: number;
  dependentsCount: number;
  childrenCount: number;
  schoolStudentsCount: number;
  universityStudentsCount: number;
  elderlyCount: number;
  sickCount: number;
  disabledCount: number;
  isDeceasedFather: boolean;
  isDeceasedMother: boolean;
  hasFemaleBreadwinner: boolean;
  hasOrphans: boolean;
  socialAffairsRegistered: boolean;
  socialAffairsFileNo?: string;
  socialAffairsBranch?: string;
  familyMembers: FamilyMember[];

  // Step 3: Work & Income
  occupation: string;
  employmentStatus: 'يعمل براتب ثابت' | 'يعمل بمياومة' | 'عاطل عن العمل' | 'ربّة منزل' | 'متقاعد' | 'غير قادر على العمل';
  employerName?: string;
  workType?: string;
  monthlyIncome: number;
  otherIncomeSources: string;
  receivesNationalInsurance: boolean;
  insuranceType?: string;
  insuranceAmount?: number;
  pensionAmount?: number;
  alimonyAmount?: number;
  monthlyAssistanceAmount?: number;
  hasSmallBusiness: boolean;
  businessDescription?: string;
  hasDebt: boolean;
  totalDebtAmount?: number;
  creditorName?: string;
  monthlyDebtInstallment?: number;
  debtReason?: string;
  expenses: ExpenseItem;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  perCapitaIncome: number;

  // Step 4: Health & Education
  healthSummary?: string;
  hasChronicIllness?: boolean;
  patientName?: string;
  patientRelation?: string;
  illnessType?: string;
  isEmergencyHealth?: boolean;
  treatmentCostMonthly?: number;
  hasHealthInsurance?: boolean;
  hasDisability?: boolean;
  disabilityType?: string;
  specialMedicalNeeds?: string;
  treatmentCenterName?: string;
  isUniversityStudent?: boolean;
  hasChildrenInUniversity?: boolean;
  universityStudentsDetails?: string;
  universityName?: string;
  specialization?: string;
  academicYear?: string;
  requiredTuitionFees?: number;
  hasGrantOrScholarship?: boolean;
  educationAidRequested?: string;

  // Step 5: Housing
  housingType: 'بيت مستقل ملك' | 'بيت إيجار' | 'مع الأهل' | 'سكن طلاب' | 'سكن مشترك' | 'سكن مؤقت' | 'منزل مهدد بالإخلاء' | 'منزل غير صالح للسكن' | 'غير ذلك';
  monthlyRentAmount?: number;
  hasRentArrears?: boolean;
  rentArrearsAmount?: number;
  roomsCount: number;
  occupantsCount: number;
  housingCondition: 'ممتاز' | 'جيد' | 'متوسط' | 'سيء' | 'غير صالح للسكن';
  ownsRealEstate: boolean;
  ownsVehicle: boolean;
  otherPropertiesDescription?: string;

  // Step 6: External Aid
  receivesExternalAid: boolean;
  externalAidDetails?: string;
  localZakatBranchAid: boolean;
  zakatBranchName?: string;
  zakatAidAmount?: number;
  hasPreviousTamkeenApp: boolean;
  previousAppCode?: string;
  previousAidType?: string;

  // Step 7: Aid Request
  requestedAidType: AidType;
  requestTitle: string;
  needDescription: string;
  mainReason: string;
  urgency: UrgencyLevel;
  requestedAmount: number;
  isRecurringNeed: boolean;
  neededByDate?: string;
  payeeName?: string; // Vendor or Hospital or College
  hasPriceQuoteOrInvoice: boolean;

  // Step 8: Empowerment & Courses
  interestedInCourses: boolean;
  selectedCourseTypes?: string[];
  canWork: boolean;
  seekingJob: boolean;
  wantsToStartProject: boolean;
  skillsDescription?: string;

  // Step 9: Bank Account
  bankAccount: BankAccountInfo;

  // Step 10: Documents
  documents: DocumentItem[];

  // Step 11: Declarations
  applicantSignature: string;
  submissionDate: string;

  // Workflow & Management
  status: ApplicationStatus;
  assignedOfficerName?: string;
  assignedResearcherName?: string;
  eligibilityScore: number; // 0-100 calculated
  eligibilityLevel: 'احتياج منخفض' | 'احتياج متوسط' | 'احتياج مرتفع' | 'احتياج شديد' | 'حالة طارئة';
  socialResearchReport?: SocialResearchReport;
  committeeDecision?: CommitteeDecision;
  disbursementRecord?: DisbursementRecord;
  internalNotes: { id: string; author: string; role: string; date: string; text: string }[];
  activityLogs: ActivityLog[];
  hasDuplicateAlert: boolean;
  isOverdue: boolean; // Delayed past threshold
  createdYear: number;
}

export type AuditLogEntry = AuditLogItem;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  username?: string;
  password?: string;
  role: UserRole;
  branchId: string;
  branchName: string;
  isActive: boolean;
  avatarUrl?: string;
  branch?: string;
  active?: boolean;
  permissions?: string[];
}

export interface FormStepConfig {
  id: number;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  isMandatory: boolean;
}

export interface CustomFieldConfig {
  id: string;
  stepId: number;
  label: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'file';
  isRequired: boolean;
  isHidden: boolean;
  placeholder?: string;
  options?: string[];
}

export interface SystemSettings {
  parentOrganizationName: string;
  parentOrgSubtext: string;
  localBranchName: string;
  localBranchRegion: string;
  isApplicationsOpen: boolean;
  closingReasonMessage?: string;
  dailyApplicationCap: number;
  currentDayApplicationCount: number;
  defaultCurrency: 'QAR' | 'USD' | 'EUR' | 'ILS' | 'JOD' | string;
  applicationCodePrefix: string;
  aboutText: string;
  missionText: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  isApplicationReceivingOpen?: boolean;
  closureMessage?: string;
  maxMonthlyBudgetLimit?: number;
  formSteps?: FormStepConfig[];
  customFields?: CustomFieldConfig[];
}

export interface Complaint {
  id: string;
  code: string;
  applicantName: string;
  nationalId: string;
  phone: string;
  relatedApplicationCode?: string;
  type: 'استفسار' | 'شكوى' | 'تظلم' | 'طلب إعادة مراجعة';
  details: string;
  status: 'جديد' | 'قيد المتابعة' | 'تم الرد' | 'مغلق';
  response?: string;
  responseDetails?: string;
  assignedTo?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  actionType: string;
  resourceCode: string;
  details: string;
  ipAddress: string;
  deviceInfo: string;
}

export interface EmployeeTask {
  id: string;
  title: string;
  category: 'REVIEW_FILE' | 'CALL_BENEFICIARY' | 'COMMITTEE_PREP' | 'FIELD_VISIT' | 'FINANCE_VERIFY' | 'OTHER';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  assignedToName: string;
  assignedToRole?: UserRole;
  relatedAppCode?: string;
  beneficiaryName?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

