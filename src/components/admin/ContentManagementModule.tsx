import React, { useState } from 'react';
import { SystemSettings, FormStepConfig, CustomFieldConfig } from '../../types';
import { ApplicationWizard } from '../wizard/ApplicationWizard';
import {
  Save, Layers, Plus, Trash2, Edit3,
  ArrowUp, ArrowDown, Eye, EyeOff, CheckSquare, X, PlusCircle,
  FolderOpen, Settings, ListPlus, CheckCircle2, FileText, ChevronRight
} from 'lucide-react';

interface ContentManagementModuleProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
}

export const ContentManagementModule: React.FC<ContentManagementModuleProps> = ({
  settings,
  onUpdateSettings,
}) => {
  // Form Steps State (default to 2-step setup: Personal Info & Final Declaration)
  const [steps, setSteps] = useState<FormStepConfig[]>(
    settings.formSteps && settings.formSteps.length > 0
      ? settings.formSteps.filter((s) => s.id !== 2)
      : [
          { id: 1, title: '1. البيانات الشخصية ومكان السكن', description: 'الاسم الثلاثي، رقم الهوية، تاريخ الميلاد، التواصل، والعنوان', enabled: true, order: 1, isMandatory: true },
          { id: 3, title: '2. مراجعة الطلب والتعهد والتوقيع', description: 'الإقرار بصحة البيانات والتوقيع الإلكتروني لمقدم الطلب', enabled: true, order: 2, isMandatory: true },
        ]
  );

  // Custom Fields State
  const [customFields, setCustomFields] = useState<CustomFieldConfig[]>(
    settings.customFields || []
  );

  // Active Selected Section for editing and managing fields
  const [selectedStepId, setSelectedStepId] = useState<number>(steps[0]?.id || 1);

  // Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Modal State for New Step
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepMandatory, setNewStepMandatory] = useState(true);

  // Temporary Fields Builder State inside Add Step Modal
  const [newStepInitialFields, setNewStepInitialFields] = useState<
    {
      id: string;
      label: string;
      fieldType: CustomFieldConfig['fieldType'];
      isRequired: boolean;
      placeholder?: string;
      optionsRaw?: string;
    }[]
  >([]);

  // Temp field form inputs inside Add Step Modal
  const [tempFieldLabel, setTempFieldLabel] = useState('');
  const [tempFieldType, setTempFieldType] = useState<CustomFieldConfig['fieldType']>('text');
  const [tempFieldRequired, setTempFieldRequired] = useState(false);
  const [tempFieldPlaceholder, setTempFieldPlaceholder] = useState('');
  const [tempFieldOptionsRaw, setTempFieldOptionsRaw] = useState('');

  // Modal State for Field (Add & Edit in Workspace)
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldStepId, setFieldStepId] = useState<number>(1);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldConfig['fieldType']>('text');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldOptionsRaw, setFieldOptionsRaw] = useState('');

  // Selected Step Object
  const currentStepObj = steps.find((s) => s.id === selectedStepId) || steps[0];

  // Fields belonging to the currently selected step
  const currentStepFields = customFields.filter((f) => f.stepId === selectedStepId);

  const handleSaveFormStructure = () => {
    onUpdateSettings({
      formSteps: steps,
      customFields: customFields,
    });
    alert('تم حفظ وتطبيق التعديلات على هيكل وأقسام وحقول نموذج تقديم الطلب بنجاح!');
  };

  // Section Management Handlers
  const toggleStepEnabled = (stepId: number) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const toggleStepMandatory = (stepId: number) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, isMandatory: !s.isMandatory } : s))
    );
  };

  const updateStepTitle = (stepId: number, title: string) => {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, title } : s)));
  };

  const updateStepDesc = (stepId: number, description: string) => {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, description } : s)));
  };

  const handleDeleteStep = (stepId: number) => {
    if (steps.length <= 1) {
      alert('يجب الإبقاء على مرحلة واحدة على الأقل بالنموذج.');
      return;
    }
    const stepToDelete = steps.find((s) => s.id === stepId);
    if (!confirm(`هل أنت متأكد من رغبتك في حذف قسم "${stepToDelete?.title}" وجميع الحقول التابعة له؟`)) {
      return;
    }

    const filteredSteps = steps.filter((s) => s.id !== stepId);
    const reindexed = filteredSteps.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(reindexed);

    // Remove custom fields in this step
    setCustomFields((prev) => prev.filter((f) => f.stepId !== stepId));

    if (selectedStepId === stepId) {
      setSelectedStepId(reindexed[0]?.id || 1);
    }
  };

  const moveStep = (index: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === steps.length - 1) return;

    const newSteps = [...steps];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;

    const reindexed = newSteps.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(reindexed);
  };

  // Add field to temporary list inside Add Section Modal
  const handleAddTempFieldToNewStep = () => {
    if (!tempFieldLabel.trim()) {
      alert('يرجى كتابة اسم أو عنوان الحقل المخصص.');
      return;
    }
    setNewStepInitialFields((prev) => [
      ...prev,
      {
        id: 'temp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        label: tempFieldLabel.trim(),
        fieldType: tempFieldType,
        isRequired: tempFieldRequired,
        placeholder: tempFieldPlaceholder.trim(),
        optionsRaw: tempFieldOptionsRaw.trim(),
      },
    ]);
    // Reset inputs
    setTempFieldLabel('');
    setTempFieldType('text');
    setTempFieldRequired(false);
    setTempFieldPlaceholder('');
    setTempFieldOptionsRaw('');
  };

  const handleDeleteTempField = (tempId: string) => {
    setNewStepInitialFields((prev) => prev.filter((f) => f.id !== tempId));
  };

  const handleAddStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;

    const maxId = steps.reduce((acc, s) => Math.max(acc, s.id), 0);
    const newId = maxId + 1;
    const newStepObj: FormStepConfig = {
      id: newId,
      title: newStepTitle.trim(),
      description: newStepDesc.trim() || 'قسم مخصص جديد لنموذج الطلب',
      enabled: true,
      order: steps.length + 1,
      isMandatory: newStepMandatory,
    };

    setSteps((prev) => [...prev, newStepObj]);

    // Attach initial custom fields to this newly created step
    if (newStepInitialFields.length > 0) {
      const createdFields: CustomFieldConfig[] = newStepInitialFields.map((tf, i) => ({
        id: 'cf-' + Date.now() + '-' + i,
        stepId: newId,
        label: tf.label,
        fieldType: tf.fieldType,
        isRequired: tf.isRequired,
        isHidden: false,
        placeholder: tf.placeholder,
        options:
          tf.fieldType === 'select' && tf.optionsRaw
            ? tf.optionsRaw.split(',').map((o) => o.trim()).filter(Boolean)
            : undefined,
      }));
      setCustomFields((prev) => [...prev, ...createdFields]);
    }

    setSelectedStepId(newId);
    setShowAddStepModal(false);
    setNewStepTitle('');
    setNewStepDesc('');
    setNewStepMandatory(true);
    setNewStepInitialFields([]);
  };

  // Field Management Handlers inside Workspace
  const openAddFieldModal = (targetStepId?: number) => {
    setEditingFieldId(null);
    setFieldStepId(targetStepId || selectedStepId);
    setFieldLabel('');
    setFieldType('text');
    setFieldRequired(false);
    setFieldPlaceholder('');
    setFieldOptionsRaw('');
    setShowFieldModal(true);
  };

  const openEditFieldModal = (field: CustomFieldConfig) => {
    setEditingFieldId(field.id);
    setFieldStepId(field.stepId);
    setFieldLabel(field.label);
    setFieldType(field.fieldType);
    setFieldRequired(field.isRequired);
    setFieldPlaceholder(field.placeholder || '');
    setFieldOptionsRaw(field.options ? field.options.join(', ') : '');
    setShowFieldModal(true);
  };

  const handleSaveFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel.trim()) return;

    const parsedOptions = fieldType === 'select'
      ? fieldOptionsRaw.split(',').map((o) => o.trim()).filter(Boolean)
      : undefined;

    if (editingFieldId) {
      // Edit existing field
      setCustomFields((prev) =>
        prev.map((f) =>
          f.id === editingFieldId
            ? {
                ...f,
                stepId: fieldStepId,
                label: fieldLabel.trim(),
                fieldType,
                isRequired: fieldRequired,
                placeholder: fieldPlaceholder.trim(),
                options: parsedOptions,
              }
            : f
        )
      );
    } else {
      // Add new field
      const newField: CustomFieldConfig = {
        id: 'cf-' + Date.now(),
        stepId: fieldStepId,
        label: fieldLabel.trim(),
        fieldType,
        isRequired: fieldRequired,
        isHidden: false,
        placeholder: fieldPlaceholder.trim(),
        options: parsedOptions,
      };
      setCustomFields((prev) => [...prev, newField]);
    }

    setShowFieldModal(false);
  };

  const handleDeleteCustomField = (fieldId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحقل من هذا القسم؟')) return;
    setCustomFields((prev) => prev.filter((f) => f.id !== fieldId));
  };

  const toggleCustomFieldRequired = (fieldId: string) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, isRequired: !f.isRequired } : f))
    );
  };

  const moveField = (fieldId: string, direction: 'UP' | 'DOWN') => {
    const stepFields = customFields.filter((f) => f.stepId === selectedStepId);
    const index = stepFields.findIndex((f) => f.id === fieldId);
    if (index === -1) return;
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === stepFields.length - 1) return;

    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    const targetField = stepFields[targetIdx];

    // Swap position in full customFields array
    const updated = [...customFields];
    const idx1 = updated.findIndex((f) => f.id === fieldId);
    const idx2 = updated.findIndex((f) => f.id === targetField.id);

    const temp = updated[idx1];
    updated[idx1] = updated[idx2];
    updated[idx2] = temp;

    setCustomFields(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Save / Preview Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#13706A]"></span>
            <h1 className="text-2xl font-black text-slate-800">إدارة محتوى وأقسام وحقول نموذج الطلب</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            التحكم الشامل بإضافة الأقسام، تحديد أنواع الحقول، ومعاينة نموذج تقديم طلب المساعدة حياً
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* PREVIEW BUTTON */}
          <button
            onClick={() => setShowPreviewModal(true)}
            className="bg-teal-50 hover:bg-teal-100 text-[#13706A] border border-teal-200 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95"
            title="معاينة كيفية ظهور النموذج للمستفيد بعد التعديلات"
          >
            <Eye className="w-4 h-4 text-[#13706A]" />
            <span>معاينة النموذج</span>
          </button>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSaveFormStructure}
            className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <Save className="w-4 h-4 text-emerald-300" />
            <span>حفظ وتطبيق إعدادات النموذج الحية</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Sections Selector) | Right Column (Selected Section & Fields Workspace) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: SECTIONS LIST & MANAGEMENT (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#13706A]" />
                <h2 className="font-black text-slate-800 text-sm">أقسام ومراحل الطلب ({steps.length})</h2>
              </div>

              <button
                onClick={() => {
                  setNewStepInitialFields([]);
                  setShowAddStepModal(true);
                }}
                className="bg-[#13706A] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-[#0F5D58] transition-all"
                title="إضافة قسم جديد وتحديد حقوله"
              >
                <Plus className="w-4 h-4" />
                <span>قسم جديد</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              اختر أي قسم من القائمة أدناه للدخول إلى تفاصيله وإضافة أو ترتيب الحقول التابعة له:
            </p>

            {/* List of Steps Cards */}
            <div className="space-y-3">
              {steps.map((step, idx) => {
                const isSelected = step.id === selectedStepId;
                const fieldsCount = customFields.filter((f) => f.stepId === step.id).length;

                return (
                  <div
                    key={step.id}
                    onClick={() => setSelectedStepId(step.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-teal-50/80 border-[#13706A] shadow-sm ring-2 ring-[#13706A]/20'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                    } ${!step.enabled ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-[#13706A] text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </span>

                        <div className="min-w-0 space-y-1">
                          <h3 className="font-bold text-xs text-slate-800 truncate">{step.title}</h3>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{step.description}</p>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                step.isMandatory
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {step.isMandatory ? 'إجباري' : 'اختياري'}
                            </span>

                            <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                              {fieldsCount} حقول مخصصة
                            </span>

                            {!step.enabled && (
                              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                مخفي
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-[#13706A] translate-x-1' : 'text-slate-400'
                        }`}
                      />
                    </div>

                    {/* Quick Section Ordering Controls */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-bold">
                        {isSelected ? '← القسم المختار حالياً' : 'انقر للدخول والتعديل'}
                      </span>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          disabled={idx === 0}
                          onClick={() => moveStep(idx, 'UP')}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg disabled:opacity-30"
                          title="تحريك لأعلى"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === steps.length - 1}
                          onClick={() => moveStep(idx, 'DOWN')}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg disabled:opacity-30"
                          title="تحريك لأسفل"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="حذف هذا القسم"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED SECTION & FIELDS WORKSPACE (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section Details Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-2xl bg-teal-100 text-[#13706A] font-black text-sm flex items-center justify-center shrink-0">
                  {steps.findIndex((s) => s.id === selectedStepId) + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-slate-800 text-base">
                      {currentStepObj?.title || 'إدارة القسم المختار'}
                    </h2>
                    <span className="text-xs text-teal-800 font-bold bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                      القسم نشط للعرض والتعديل
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{currentStepObj?.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleStepMandatory(selectedStepId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    currentStepObj?.isMandatory
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {currentStepObj?.isMandatory ? 'قسم إجباري مطلوب' : 'قسم اختياري'}
                </button>

                <button
                  onClick={() => toggleStepEnabled(selectedStepId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    currentStepObj?.enabled
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {currentStepObj?.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{currentStepObj?.enabled ? 'ظاهر بالنموذج' : 'مخفي'}</span>
                </button>
              </div>
            </div>

            {/* Direct Section Title & Description Inline Editors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تعديل عنوان القسم</label>
                <input
                  type="text"
                  value={currentStepObj?.title || ''}
                  onChange={(e) => updateStepTitle(selectedStepId, e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تعديل الوصف التوضيحي للقسم</label>
                <input
                  type="text"
                  value={currentStepObj?.description || ''}
                  onChange={(e) => updateStepDesc(selectedStepId, e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              </div>
            </div>

            {/* SECTION FIELDS BUILDER WORKSPACE */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
                    <ListPlus className="w-4 h-4 text-[#13706A]" />
                    <span>الحقول المخصصة المضافة لـ ({currentStepObj?.title})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    يمكنك إضافة حقول جديدة لهذا القسم، تحديد نوع البيانات، ترتيبها، أو تعديلها
                  </p>
                </div>

                <button
                  onClick={() => openAddFieldModal(selectedStepId)}
                  className="bg-[#13706A] text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#0F5D58] transition-all shrink-0"
                >
                  <Plus className="w-4 h-4 text-emerald-300" />
                  <span>+ إضافة حقل جديد لهذا القسم</span>
                </button>
              </div>

              {/* List Fields inside selected section */}
              {currentStepFields.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 space-y-2">
                  <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">لا توجد حقول مخصصة مضافة حالياً لـ هذا القسم</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    يتكون هذا القسم حالياً من الحقول الأساسية للنموذج. اضغط على زر "+ إضافة حقل جديد لهذا القسم" لإضافة حقول إضافية المباشرة.
                  </p>
                  <button
                    onClick={() => openAddFieldModal(selectedStepId)}
                    className="mt-2 bg-[#13706A] text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة حقل مخصص الآن</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentStepFields.map((field, fIdx) => (
                    <div
                      key={field.id}
                      className="bg-slate-50 hover:bg-teal-50/30 p-4 rounded-2xl border border-slate-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-6 h-6 bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {fIdx + 1}
                        </span>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-xs text-slate-800">{field.label}</span>
                            <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-mono font-bold">
                              {field.fieldType === 'text' && 'نص عادي'}
                              {field.fieldType === 'number' && 'رقمي'}
                              {field.fieldType === 'date' && 'تاريخ'}
                              {field.fieldType === 'select' && 'قائمة منسدلة'}
                              {field.fieldType === 'checkbox' && 'مربع اختيار'}
                              {field.fieldType === 'file' && 'مرفق / ملف'}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                field.isRequired
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {field.isRequired ? 'حقل إجباري (*)' : 'حقل اختياري'}
                            </span>
                          </div>

                          {field.placeholder && (
                            <p className="text-[11px] text-slate-500">تلميح الحقل: {field.placeholder}</p>
                          )}
                          {field.options && field.options.length > 0 && (
                            <p className="text-[10px] text-slate-600 font-mono">
                              خيارات القائمة: {field.options.join(' | ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {/* Move Field Order */}
                        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200">
                          <button
                            disabled={fIdx === 0}
                            onClick={() => moveField(field.id, 'UP')}
                            className="p-1 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                            title="ترتيب لأعلى"
                          >
                            <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                          <button
                            disabled={fIdx === currentStepFields.length - 1}
                            onClick={() => moveField(field.id, 'DOWN')}
                            className="p-1 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                            title="ترتيب لأسفل"
                          >
                            <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                        </div>

                        {/* Toggle Required */}
                        <button
                          onClick={() => toggleCustomFieldRequired(field.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                            field.isRequired
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {field.isRequired ? 'إجباري' : 'اختياري'}
                        </button>

                        {/* Edit Field */}
                        <button
                          onClick={() => openEditFieldModal(field)}
                          className="p-1.5 text-slate-600 hover:text-[#13706A] hover:bg-teal-50 rounded-xl transition-colors border border-slate-200 bg-white"
                          title="تعديل بيانات الحقل"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Field */}
                        <button
                          onClick={() => handleDeleteCustomField(field.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200 bg-white"
                          title="حذف الحقل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FORM PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-100 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl relative border border-slate-300 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-4 bg-white p-4 rounded-2xl sticky top-0 z-30 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-[#13706A] flex items-center justify-center font-bold shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base text-slate-800">معاينة حيّة وتفاعلية لنموذج تقديم الطلب للمستفيد</h2>
                  <p className="text-xs text-slate-500">
                    تستعرض هذه الشاشة الشكل والتنقل الفعلي لنموذج الطلب مع كافة الأقسام والتعديلات والحقول المخصصة التي تم إعدادها
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl transition-colors"
                title="إغلاق المعاينة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-2 sm:p-4 rounded-3xl shadow-xs">
              <ApplicationWizard
                settings={{
                  ...settings,
                  formSteps: steps,
                  customFields: customFields,
                }}
                onSubmitSuccess={(app) => {
                  alert(`تجربة معاينة ناجحة! تم إنشاء نموذج تجريبي برقم: ${app.code}`);
                  setShowPreviewModal(false);
                }}
                onCancel={() => setShowPreviewModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED ADD NEW SECTION / STEP MODAL WITH DYNAMIC FIELDS BUILDER */}
      {showAddStepModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-black text-sm text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#13706A]" />
                <span>إضافة قسم جديد وتحديد حقوله المخصصة ديناميكياً</span>
              </h2>
              <button onClick={() => setShowAddStepModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStepSubmit} className="space-y-4">
              {/* SECTION BASIC DETAILS */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-black text-slate-800 border-b border-slate-200 pb-2">
                  1. بيانات واختيارات القسم الجديد:
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عنوان القسم/المرحلة الجديد *</label>
                  <input
                    type="text"
                    required
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    placeholder="مثال: بيانات الكفيل أو المرجع الاجتماعي"
                    className="w-full bg-white border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">وصف مختصر للقسم</label>
                  <input
                    type="text"
                    value={newStepDesc}
                    onChange={(e) => setNewStepDesc(e.target.value)}
                    placeholder="مثال: أدخل اسم ورقم هاتف المعرّف أو المرجع الاجتماعي"
                    className="w-full bg-white border p-2.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isStepMandatoryChk"
                    checked={newStepMandatory}
                    onChange={(e) => setNewStepMandatory(e.target.checked)}
                    className="w-4 h-4 rounded text-[#13706A] focus:ring-[#13706A]"
                  />
                  <label htmlFor="isStepMandatoryChk" className="text-xs font-bold text-slate-800 cursor-pointer">
                    تحديد هذا القسم كـ (قسم إجباري مطلوب تعبئته بالكامل)
                  </label>
                </div>
              </div>

              {/* DYNAMIC SECTION FIELDS BUILDER */}
              <div className="space-y-3 bg-teal-50/50 p-4 rounded-2xl border border-teal-200/80">
                <div className="flex items-center justify-between border-b border-teal-200/60 pb-2">
                  <h3 className="text-xs font-black text-[#13706A] flex items-center gap-1.5">
                    <span>2. إضافة وتنسيق حقول ديناميكية لهذا القسم الجديد:</span>
                  </h3>
                  <span className="text-[10px] font-bold bg-teal-100 text-[#13706A] px-2 py-0.5 rounded-full">
                    {newStepInitialFields.length} حقول مضافة
                  </span>
                </div>

                {/* Sub-form to add field */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-teal-200 shadow-2xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">عنوان الحقل المخصص *</label>
                    <input
                      type="text"
                      value={tempFieldLabel}
                      onChange={(e) => setTempFieldLabel(e.target.value)}
                      placeholder="مثال: صلة القرابة أو رقم هاتف الكفيل"
                      className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">نوع بيانات الحقل *</label>
                    <select
                      value={tempFieldType}
                      onChange={(e) => setTempFieldType(e.target.value as any)}
                      className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                    >
                      <option value="text">نص عادي (Text)</option>
                      <option value="number">رقمي (Number)</option>
                      <option value="date">تاريخ (Date)</option>
                      <option value="select">قائمة منسدلة (Dropdown Select)</option>
                      <option value="checkbox">مربع اختيار نعم/لا (Checkbox)</option>
                      <option value="file">رفع ملف/مستند (File Upload)</option>
                    </select>
                  </div>

                  {tempFieldType === 'select' && (
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">خيارات القائمة المنسدلة (مفصولة بفاصلة)</label>
                      <input
                        type="text"
                        value={tempFieldOptionsRaw}
                        onChange={(e) => setTempFieldOptionsRaw(e.target.value)}
                        placeholder="مثال: أب, أم, أخ, أخت, صديق"
                        className="w-full bg-slate-50 border p-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">تلميح إرشادي أو مثال</label>
                    <input
                      type="text"
                      value={tempFieldPlaceholder}
                      onChange={(e) => setTempFieldPlaceholder(e.target.value)}
                      placeholder="مثال: يرجى إدخال رقم هاتف يعمل بشكل مباشر"
                      className="w-full bg-slate-50 border p-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                    />
                  </div>

                  <div className="flex items-center justify-between sm:col-span-2 pt-1">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempFieldRequired}
                        onChange={(e) => setTempFieldRequired(e.target.checked)}
                        className="w-4 h-4 text-[#13706A] rounded"
                      />
                      <span>حقل إجباري (*)</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddTempFieldToNewStep}
                      className="bg-[#13706A] hover:bg-[#0F5D58] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة هذا الحقل للقسم</span>
                    </button>
                  </div>
                </div>

                {/* List of Added Temp Fields */}
                {newStepInitialFields.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold text-slate-700">الحقول المضافة لهذا القسم حتى الآن:</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {newStepInitialFields.map((tf, tIdx) => (
                        <div
                          key={tf.id}
                          className="bg-white p-2.5 rounded-xl border border-teal-200 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 bg-teal-100 text-[#13706A] rounded-md font-bold text-[10px] flex items-center justify-center shrink-0">
                              {tIdx + 1}
                            </span>
                            <span className="font-bold text-slate-800 truncate">{tf.label}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                              {tf.fieldType === 'text' && 'نص'}
                              {tf.fieldType === 'number' && 'رقم'}
                              {tf.fieldType === 'date' && 'تاريخ'}
                              {tf.fieldType === 'select' && 'قائمة'}
                              {tf.fieldType === 'checkbox' && 'اختيار'}
                              {tf.fieldType === 'file' && 'ملف'}
                            </span>
                            {tf.isRequired && (
                              <span className="text-[10px] text-red-600 font-bold">* إجباري</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteTempField(tf.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-lg"
                            title="حذف الحقل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddStepModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#13706A] text-white shadow-xs hover:bg-[#0F5D58] transition-all"
                >
                  حفظ وإضافة القسم بكل حقوله
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT SINGLE CUSTOM FIELD MODAL FOR WORKSPACE */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-black text-sm text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#13706A]" />
                <span>{editingFieldId ? 'تعديل الحقل المخصص' : 'إضافة حقل مخصص جديد'}</span>
              </h2>
              <button onClick={() => setShowFieldModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFieldSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">القسم/المرحلة المرتبطة *</label>
                <select
                  value={fieldStepId}
                  onChange={(e) => setFieldStepId(Number(e.target.value))}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                >
                  {steps.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان أو اسم الحقل المطلوب *</label>
                <input
                  type="text"
                  required
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  placeholder="مثال: رقم هاتف الكفيل أو المرجع الاجتماعي"
                  className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع إدخال البيانات *</label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as any)}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                >
                  <option value="text">نص عادي (Text)</option>
                  <option value="number">رقمي (Number)</option>
                  <option value="date">تاريخ (Date)</option>
                  <option value="select">قائمة منسدلة (Dropdown Select)</option>
                  <option value="checkbox">مربع اختيار نعم/لا (Checkbox)</option>
                  <option value="file">رفع ملف/مستند (File Upload)</option>
                </select>
              </div>

              {fieldType === 'select' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">خيارات القائمة المنسدلة (مفصولة بفاصلة) *</label>
                  <input
                    type="text"
                    required
                    value={fieldOptionsRaw}
                    onChange={(e) => setFieldOptionsRaw(e.target.value)}
                    placeholder="مثال: خيار 1, خيار 2, خيار 3"
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تلميح إرشادي أو مثال توضيحي</label>
                <input
                  type="text"
                  value={fieldPlaceholder}
                  onChange={(e) => setFieldPlaceholder(e.target.value)}
                  placeholder="مثال: أدخل رقم الهاتف المباشر للتواصل"
                  className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#13706A]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isRequiredFieldChk"
                  checked={fieldRequired}
                  onChange={(e) => setFieldRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-[#13706A] focus:ring-[#13706A]"
                />
                <label htmlFor="isRequiredFieldChk" className="text-xs font-bold text-slate-800 cursor-pointer">
                  تحديد هذا الحقل كـ (حقل إجباري مطلوب تعبئته *)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#13706A] text-white shadow-xs"
                >
                  {editingFieldId ? 'تحديث الحقل' : 'حفظ إضافة الحقل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
