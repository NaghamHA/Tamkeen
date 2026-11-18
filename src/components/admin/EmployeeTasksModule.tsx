import React, { useState, useMemo } from 'react';
import { EmployeeTask, Application, User, UserRole } from '../../types';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  Calendar,
  User as UserIcon,
  PhoneCall,
  FileSearch,
  Gavel,
  CreditCard,
  Building,
  CheckCircle2,
  Circle,
  Search,
  Filter,
  Trash2,
  Edit3,
  ExternalLink,
  Tag,
  ArrowRight,
  X,
  FileText
} from 'lucide-react';

interface EmployeeTasksModuleProps {
  tasks: EmployeeTask[];
  onAddTask: (task: Partial<EmployeeTask>) => void;
  onUpdateTask: (taskId: string, updatedFields: Partial<EmployeeTask>) => void;
  onDeleteTask: (taskId: string) => void;
  applications?: Application[];
  users?: User[];
  onSelectApplicationCode?: (appCode: string) => void;
  currentUserRole?: UserRole;
}

export const EmployeeTasksModule: React.FC<EmployeeTasksModuleProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  applications = [],
  users = [],
  onSelectApplicationCode,
  currentUserRole,
}) => {
  const [activeTabStatus, setActiveTabStatus] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<EmployeeTask | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EmployeeTask['category']>('REVIEW_FILE');
  const [priority, setPriority] = useState<EmployeeTask['priority']>('HIGH');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [assignedToName, setAssignedToName] = useState('د. محمود القاسم (مدير النظام)');
  const [relatedAppCode, setRelatedAppCode] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [notes, setNotes] = useState('');

  // Category display details
  const categoryMap: { [key in EmployeeTask['category']]: { label: string; icon: any; bg: string; text: string } } = {
    REVIEW_FILE: { label: 'مراجعة ملف مستفيد', icon: FileSearch, bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800' },
    CALL_BENEFICIARY: { label: 'اتصال بمستفيد', icon: PhoneCall, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
    COMMITTEE_PREP: { label: 'تحضير للجنة', icon: Gavel, bg: 'bg-[#13706A]/10 border-[#13706A]/30', text: 'text-[#13706A]' },
    FIELD_VISIT: { label: 'زيارة ميدانية', icon: Building, bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800' },
    FINANCE_VERIFY: { label: 'تدقيق وتدقيق مالي', icon: CreditCard, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800' },
    OTHER: { label: 'مهمة إدارية أخرى', icon: Tag, bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700' },
  };

  // Priority badge styling
  const priorityMap: { [key in EmployeeTask['priority']]: { label: string; bg: string; text: string } } = {
    HIGH: { label: 'عالية / طارئة', bg: 'bg-red-100 border-red-200', text: 'text-red-800' },
    MEDIUM: { label: 'متوسطة الأهمية', bg: 'bg-amber-100 border-amber-200', text: 'text-amber-800' },
    LOW: { label: 'عادية', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700' },
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status Filter
      if (activeTabStatus === 'PENDING' && t.status === 'COMPLETED') return false;
      if (activeTabStatus === 'IN_PROGRESS' && t.status !== 'IN_PROGRESS') return false;
      if (activeTabStatus === 'COMPLETED' && t.status !== 'COMPLETED') return false;

      // Category Filter
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;

      // Priority Filter
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesApp = t.relatedAppCode?.toLowerCase().includes(q);
        const matchesBen = t.beneficiaryName?.toLowerCase().includes(q);
        const matchesAssigned = t.assignedToName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesApp && !matchesBen && !matchesAssigned) return false;
      }

      return true;
    });
  }, [tasks, activeTabStatus, categoryFilter, priorityFilter, searchQuery]);

  // Quick Metrics
  const pendingCount = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'COMPLETED').length;
  const todayDate = new Date().toISOString().split('T')[0];
  const todayTasksCount = tasks.filter((t) => t.dueDate === todayDate && t.status !== 'COMPLETED').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title,
      category,
      priority,
      status: 'PENDING',
      dueDate,
      assignedToName: assignedToName || 'د. محمود القاسم (مدير النظام)',
      relatedAppCode: relatedAppCode || undefined,
      beneficiaryName: beneficiaryName || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });

    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setCategory('REVIEW_FILE');
    setPriority('HIGH');
    setDueDate(new Date().toISOString().split('T')[0]);
    setRelatedAppCode('');
    setBeneficiaryName('');
    setNotes('');
  };

  const handleToggleComplete = (task: EmployeeTask) => {
    const isComp = task.status === 'COMPLETED';
    onUpdateTask(task.id, {
      status: isComp ? 'PENDING' : 'COMPLETED',
      completedAt: isComp ? undefined : new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
  };

  const handleSelectAppCodeChange = (code: string) => {
    setRelatedAppCode(code);
    const foundApp = applications.find((a) => a.code === code);
    if (foundApp) {
      setBeneficiaryName(foundApp.fullName);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#13706A]"></span>
            <h1 className="text-2xl font-black text-slate-800">قائمة المهام المعلقة والمتابعة الميدانية</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            جدولة وتنظيم المهام الخاصة بالموظفين (مراجعة الملفات، الاتصال بالمستفيدين، وتجهيز جلسات اللجان)
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-300" />
          <span>إضافة مهمة جديدة</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block font-bold">المهام المعلقة الإجمالية</span>
            <span className="text-xl font-black text-slate-800 font-mono">{pendingCount} مهمة</span>
          </div>
          <div className="w-10 h-10 bg-[#13706A]/10 text-[#13706A] rounded-xl flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-red-700 block font-bold">مهام طارئة / عالية الأهمية</span>
            <span className="text-xl font-black text-red-800 font-mono">{highPriorityCount} مهمة</span>
          </div>
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-700 block font-bold">مهام مجدولة لليوم</span>
            <span className="text-xl font-black text-amber-800 font-mono">{todayTasksCount} مهمة</span>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-700 block font-bold">المهام المكتملة حديثاً</span>
            <span className="text-xl font-black text-emerald-800 font-mono">{completedCount} مهمة</span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto text-xs font-bold border border-slate-200">
          <button
            onClick={() => setActiveTabStatus('PENDING')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTabStatus === 'PENDING'
                ? 'bg-white text-[#13706A] shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المعلقة ({tasks.filter((t) => t.status !== 'COMPLETED').length})
          </button>
          <button
            onClick={() => setActiveTabStatus('IN_PROGRESS')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTabStatus === 'IN_PROGRESS'
                ? 'bg-white text-[#13706A] shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            قيد التنفيذ ({tasks.filter((t) => t.status === 'IN_PROGRESS').length})
          </button>
          <button
            onClick={() => setActiveTabStatus('COMPLETED')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTabStatus === 'COMPLETED'
                ? 'bg-white text-[#13706A] shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المكتملة ({completedCount})
          </button>
          <button
            onClick={() => setActiveTabStatus('ALL')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTabStatus === 'ALL'
                ? 'bg-white text-[#13706A] shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({tasks.length})
          </button>
        </div>

        {/* Filters and Search Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم المهمة، المستفيد، أو رقم الطلب..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-xs font-medium focus:ring-2 focus:ring-[#13706A] focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
          >
            <option value="ALL">جميع أنواع المهام</option>
            {Object.entries(categoryMap).map(([catKey, details]) => (
              <option key={catKey} value={catKey}>
                {details.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
          >
            <option value="ALL">جميع الأولويات</option>
            <option value="HIGH">عالية / طارئة</option>
            <option value="MEDIUM">متوسطة</option>
            <option value="LOW">عادية</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">لا توجد مهام مطابقة للشروط الحالية</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              يمكنك إضافة مهمة جديدة أو تغيير خيارات التصفية من الشريط العلوي.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const catInfo = categoryMap[task.category] || categoryMap.OTHER;
            const prioInfo = priorityMap[task.priority] || priorityMap.LOW;
            const IconComponent = catInfo.icon;
            const isDone = task.status === 'COMPLETED';
            const isOverdue = !isDone && task.dueDate < todayDate;

            return (
              <div
                key={task.id}
                className={`bg-white p-5 rounded-3xl border transition-all shadow-2xs hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isDone
                    ? 'border-slate-200 bg-slate-50/60 opacity-80'
                    : isOverdue
                    ? 'border-red-300 ring-1 ring-red-100'
                    : 'border-slate-200 hover:border-[#13706A]/40'
                }`}
              >
                {/* Left side: Checkbox + Title + Meta */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Quick Toggle Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-[#13706A] text-transparent hover:text-slate-300'
                    }`}
                    title={isDone ? 'تغيير للحالة المعلقة' : 'إكمال المهمة'}
                  >
                    <CheckCircle2 className="w-5 h-5 fill-current" />
                  </button>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority Tag */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${prioInfo.bg} ${prioInfo.text}`}
                      >
                        {prioInfo.label}
                      </span>

                      {/* Category Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${catInfo.bg} ${catInfo.text}`}
                      >
                        <IconComponent className="w-3 h-3" />
                        <span>{catInfo.label}</span>
                      </span>

                      {/* Status Tag if in progress */}
                      {task.status === 'IN_PROGRESS' && (
                        <span className="bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          قيد المتابعة والتنفيذ
                        </span>
                      )}

                      {/* Overdue Warning */}
                      {isOverdue && (
                        <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>تجاوزت التاريخ المحدد</span>
                        </span>
                      )}
                    </div>

                    {/* Task Title */}
                    <h3
                      className={`text-sm font-bold text-slate-800 leading-snug ${
                        isDone ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Additional Notes if present */}
                    {task.notes && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                        {task.notes}
                      </p>
                    )}

                    {/* Beneficiary or App Code link */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                      {task.relatedAppCode && (
                        <div className="flex items-center gap-1 font-mono font-bold text-[#13706A] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                          <FileText className="w-3.5 h-3.5" />
                          <span>الطلب: {task.relatedAppCode}</span>
                          {onSelectApplicationCode && (
                            <button
                              onClick={() => onSelectApplicationCode(task.relatedAppCode!)}
                              className="text-xs hover:underline text-[#13706A] mr-1 inline-flex items-center gap-0.5"
                              title="استعراض ملف الحالة الكامل"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}

                      {task.beneficiaryName && (
                        <span className="flex items-center gap-1 text-slate-700 font-bold">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>المستفيد: {task.beneficiaryName}</span>
                        </span>
                      )}

                      <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>المكلف: {task.assignedToName}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Dates & Action buttons */}
                <div className="flex flex-row md:flex-col items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-3 shrink-0">
                  <div className="text-left font-mono text-[11px] text-slate-500 space-y-0.5">
                    <div className="flex items-center gap-1 justify-end font-bold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>موعد الإنجاز: {task.dueDate}</span>
                    </div>
                    {isDone && task.completedAt && (
                      <div className="text-[10px] text-emerald-700 font-bold">
                        أنجزت في: {task.completedAt}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        isDone
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-[#13706A] text-white hover:bg-[#0F5D58] shadow-xs'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isDone ? 'إلغاء المكتمل' : 'تم الإنجاز'}</span>
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف المهمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-black text-base text-slate-800 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#13706A]" />
                <span>إضافة مهمة جديدة لمتابعة الموظفين</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المهمة أو الإجراء المطلوب *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: الاتصال بالمواطن لتحديث كشف الحساب البنكي"
                  className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تصنيف المهمة *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
                  >
                    {Object.entries(categoryMap).map(([catKey, details]) => (
                      <option key={catKey} value={catKey}>
                        {details.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">درجة الأهمية / الأولوية *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
                  >
                    <option value="HIGH">عالية / طارئة</option>
                    <option value="MEDIUM">متوسطة</option>
                    <option value="LOW">عادية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الإنجاز المخطط *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الموظف المكلف</label>
                  <select
                    value={assignedToName}
                    onChange={(e) => setAssignedToName(e.target.value)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
                  >
                    <option value="د. محمود القاسم (مدير النظام)">د. محمود القاسم (مدير النظام)</option>
                    <option value="أ. سارة أحمد (باحثة اجتماعية)">أ. سارة أحمد (باحثة اجتماعية)</option>
                    <option value="م. خالد عمر (موظف المالية)">م. خالد عمر (موظف المالية)</option>
                    {users.map((u) => (
                      <option key={u.id} value={`${u.name} (${u.role})`}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Link to Application */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ربط بطلب مستفيد (اختياري)</label>
                {applications.length > 0 ? (
                  <select
                    value={relatedAppCode}
                    onChange={(e) => handleSelectAppCodeChange(e.target.value)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
                  >
                    <option value="">بدون ربط مباشر بطلب معين</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.code}>
                        {app.code} - {app.fullName} ({app.cityTownCamp})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={relatedAppCode}
                    onChange={(e) => setRelatedAppCode(e.target.value)}
                    placeholder="TMK-WB-2026-000102"
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none font-mono"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات أو توجيهات إضافية</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أدخل أي ملاحظات مساعدة للعمل الميداني أو التواصل..."
                  className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#13706A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#13706A] hover:bg-[#0F5D58] text-white shadow-xs"
                >
                  حفظ إضافة المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
