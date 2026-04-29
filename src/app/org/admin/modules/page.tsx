'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockModules, LearningModule } from '@/lib/mock-data';
import { useState, useMemo } from 'react';
import { useToast } from '@/components/common/Toast';
import { useRouter } from 'next/navigation';

export default function HRModulesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [modules, setModules] = useState<LearningModule[]>(mockModules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<LearningModule | null>(null);
  const [deleting, setDeleting] = useState<LearningModule | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'order' | 'lessons' | 'time'>('order');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Foundation',
    competency: 'Awareness',
    estimatedTime: '30 minutes',
    lessonsCount: 5,
    isRequired: true,
  });

  const categories = useMemo(() => [...new Set(modules.map((m) => m.category))], [modules]);

  const filtered = useMemo(() => {
    const list = modules.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || m.category === categoryFilter;
      return matchSearch && matchCategory;
    });
    if (sortBy === 'lessons') return [...list].sort((a, b) => b.lessonsCount - a.lessonsCount);
    if (sortBy === 'time') return [...list].sort((a, b) => b.estimatedHours - a.estimatedHours);
    return [...list].sort((a, b) => a.moduleOrder - b.moduleOrder);
  }, [modules, search, categoryFilter, sortBy]);

  const resetForm = () =>
    setForm({
      title: '',
      description: '',
      category: 'Foundation',
      competency: 'Awareness',
      estimatedTime: '30 minutes',
      lessonsCount: 5,
      isRequired: true,
    });

  const openEdit = (m: LearningModule) => {
    setEditing(m);
    setForm({
      title: m.title,
      description: m.description,
      category: m.category,
      competency: m.competency,
      estimatedTime: m.estimatedTime,
      lessonsCount: m.lessonsCount,
      isRequired: m.isRequired,
    });
  };

  const handleAdd = () => {
    if (!form.title.trim()) {
      toast('Lesson title is required', 'warn');
      return;
    }
    const newModule: LearningModule = {
      id: `module-${Date.now()}`,
      slug: form.title.toLowerCase().replace(/\s+/g, '-'),
      title: form.title,
      description: form.description,
      moduleOrder: modules.length + 1,
      estimatedHours: parseFloat(form.estimatedTime) || 0.5,
      isRequired: form.isRequired,
      status: 'published',
      category: form.category,
      estimatedTime: form.estimatedTime,
      lessonsCount: form.lessonsCount,
      competency: form.competency,
      isActive: true,
    };
    setModules([...modules, newModule]);
    setShowAddModal(false);
    resetForm();
    toast(`"${newModule.title}" added`, 'success');
  };

  const handleEdit = () => {
    if (!editing) return;
    setModules(
      modules.map((m) =>
        m.id === editing.id
          ? {
              ...m,
              title: form.title,
              description: form.description,
              category: form.category,
              competency: form.competency,
              estimatedTime: form.estimatedTime,
              lessonsCount: form.lessonsCount,
              isRequired: form.isRequired,
            }
          : m
      )
    );
    setEditing(null);
    resetForm();
    toast(`"${form.title}" updated`, 'success');
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setModules(modules.filter((m) => m.id !== deleting.id));
    toast(`"${deleting.title}" removed`, 'warn');
    setDeleting(null);
  };

  const toggleActive = (m: LearningModule) => {
    const next = m.isActive === false ? true : false;
    setModules(modules.map((x) => (x.id === m.id ? { ...x, isActive: next } : x)));
    toast(`"${m.title}" ${next ? 'enabled' : 'disabled'}`, 'info');
  };

  return (
    <DashboardLayout title="Lessons & Modules" role="org_admin">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
            Curriculum
          </p>
          <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.06em] mt-1">
            Lessons available to your members
          </h2>
        </div>
        <button onClick={() => setShowAddModal(true)} className="lr-btn-primary">
          + Add lesson
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <Stat label="Lessons" value={String(modules.length)} accent />
        <Stat label="Active" value={String(modules.filter((m) => m.isActive !== false).length)} />
        <Stat label="Total sub-lessons" value={String(modules.reduce((s, m) => s + m.lessonsCount, 0))} />
        <Stat label="Total hours" value={modules.reduce((s, m) => s + m.estimatedHours, 0).toFixed(1)} />
      </div>

      {/* Filters */}
      <div
        className="rounded-[14px] p-4 mb-6 flex flex-wrap gap-3"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <input
          type="text"
          placeholder="Search lessons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-64 rounded-[10px] px-4 py-2 text-sm text-(--lr-pearl) placeholder:text-(--lr-lavender-dust) focus:outline-none focus:border-(--lr-gold)"
          style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-[10px] px-4 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
          style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
        >
          <option value="all" style={{ background: 'var(--lr-navy-deep)' }}>All categories</option>
          {categories.map((c) => (
            <option key={c} value={c} style={{ background: 'var(--lr-navy-deep)' }}>{c}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'order' | 'lessons' | 'time')}
          className="rounded-[10px] px-4 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
          style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
        >
          <option value="order" style={{ background: 'var(--lr-navy-deep)' }}>Sort: Order</option>
          <option value="lessons" style={{ background: 'var(--lr-navy-deep)' }}>Sort: Lessons</option>
          <option value="time" style={{ background: 'var(--lr-navy-deep)' }}>Sort: Duration</option>
        </select>
      </div>

      {/* Grouped by category */}
      <div className="space-y-6">
        {categories.map((category) => {
          const list = filtered.filter((m) => m.category === category);
          if (list.length === 0) return null;
          return (
            <div
              key={category}
              className="rounded-[14px] p-6"
              style={{
                background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <p className="lr-eyebrow" style={{ color: 'var(--lr-gold-soft)' }}>
                    Category
                  </p>
                  <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.05em] mt-1">
                    {category}
                  </h3>
                </div>
                <span className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-pearl)">
                  {list.length} {list.length === 1 ? 'lesson' : 'lessons'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {list.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-[10px] p-4 transition-all"
                    style={{
                      background: m.isActive === false ? 'rgba(28,38,68,0.4)' : 'rgba(212,190,148,0.04)',
                      border: m.isActive === false ? '1px dashed rgba(212,190,148,0.18)' : '1px solid var(--border-subtle)',
                      opacity: m.isActive === false ? 0.6 : 1,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-(family-name:--font-italiana) text-(--lr-gold) text-base tracking-[0.04em]">
                          {m.title}
                        </h4>
                        {m.isActive === false && (
                          <span
                            className="inline-block mt-1 font-(family-name:--font-jura) text-[0.6rem] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                            style={{ color: '#A65454', border: '1px solid #A65454', background: 'rgba(166,84,84,0.16)' }}
                          >
                            Disabled
                          </span>
                        )}
                      </div>
                      {m.isRequired && (
                        <span
                          className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ color: 'var(--lr-gold)', border: '1px solid var(--border-gold)', background: 'rgba(212,190,148,0.1)' }}
                        >
                          Required
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-(--lr-pearl) opacity-85 leading-relaxed line-clamp-2 mb-4 min-h-[2.6em]">
                      {m.description}
                    </p>

                    <div className="flex items-center justify-between text-[0.65rem] mb-4 font-(family-name:--font-jura) tracking-[0.16em] uppercase">
                      <span className="text-(--lr-gold-soft)">⏱ {m.estimatedTime}</span>
                      <span className="text-(--lr-gold-soft)">{m.lessonsCount} lessons</span>
                      <span className="px-2 py-0.5 rounded-full" style={{ color: 'var(--lr-pearl)', border: '1px solid var(--border-subtle)', background: 'rgba(212,190,148,0.04)' }}>
                        {m.competency}
                      </span>
                    </div>

                    <hr className="lr-separator mb-3" />

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => router.push(`/org/member/modules/legal`)}
                        className="lr-btn-outline"
                        style={{ color: 'var(--lr-gold)' }}
                      >
                        Preview
                      </button>
                      <button onClick={() => openEdit(m)} className="lr-btn-outline" style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}>
                        Edit
                      </button>
                      <button onClick={() => toggleActive(m)} className="lr-btn-outline" style={{ color: 'var(--lr-gold-pale)', borderColor: 'var(--lr-gold-pale)' }}>
                        {m.isActive === false ? 'Enable' : 'Disable'}
                      </button>
                      <button onClick={() => setDeleting(m)} className="lr-btn-outline" style={{ color: '#A65454', borderColor: '#A65454' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-[14px] py-14 text-center" style={{ background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-(--lr-lavender-dust) text-sm">No lessons match your filter.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editing) && (
        <ModuleModal
          title={editing ? 'Edit lesson' : 'Add lesson'}
          form={form}
          setForm={setForm}
          categories={categories}
          submitLabel={editing ? 'Save changes' : 'Add lesson'}
          onSubmit={editing ? handleEdit : handleAdd}
          onCancel={() => {
            setShowAddModal(false);
            setEditing(null);
            resetForm();
          }}
        />
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-[14px] p-7 max-w-md w-full text-center"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid #A65454',
            }}
          >
            <p className="lr-eyebrow mb-2" style={{ color: '#A65454' }}>
              Confirm
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mb-3">
              Delete "{deleting.title}"?
            </h3>
            <p className="text-sm text-(--lr-pearl) opacity-85 mb-6 leading-relaxed">
              This removes the lesson from your tenant. Existing member progress is preserved but the lesson can no longer be assigned.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)} className="lr-btn-outline flex-1" style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}>
                Cancel
              </button>
              <button onClick={confirmDelete} className="lr-btn-outline flex-1" style={{ color: '#A65454', borderColor: '#A65454' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="rounded-[14px] p-5"
      style={{
        background: accent
          ? 'linear-gradient(180deg, rgba(212,190,148,0.16) 0%, rgba(212,190,148,0.06) 100%)'
          : 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
        border: accent ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
      }}
    >
      <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </p>
      <p className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-3xl">{value}</p>
    </div>
  );
}

function ModuleModal({
  title,
  form,
  setForm,
  categories,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  title: string;
  form: { title: string; description: string; category: string; competency: string; estimatedTime: string; lessonsCount: number; isRequired: boolean };
  setForm: React.Dispatch<React.SetStateAction<{ title: string; description: string; category: string; competency: string; estimatedTime: string; lessonsCount: number; isRequired: boolean }>>;
  categories: string[];
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-[14px] p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
          border: '1px solid var(--border-gold)',
        }}
      >
        <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
          Lesson
        </p>
        <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mb-5">
          {title}
        </h3>

        <div className="space-y-3">
          <Field label="Title">
            <Input value={form.title} onChange={(v) => setForm((s) => ({ ...s, title: v }))} placeholder="e.g. Plan Your Will" />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={3}
              className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) placeholder:text-(--lr-lavender-dust) focus:outline-none focus:border-(--lr-gold) resize-none"
              style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
              placeholder="Short description shown to members"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
                style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
              >
                {[...new Set([...categories, 'Foundation', 'Documentation', 'Digital', 'Financial', 'Healthcare', 'Communication'])].map((c) => (
                  <option key={c} value={c} style={{ background: 'var(--lr-navy-deep)' }}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Competency">
              <select
                value={form.competency}
                onChange={(e) => setForm((s) => ({ ...s, competency: e.target.value }))}
                className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
                style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
              >
                {['Awareness', 'Knowledge', 'Application', 'Mastery'].map((c) => (
                  <option key={c} value={c} style={{ background: 'var(--lr-navy-deep)' }}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estimated time">
              <Input value={form.estimatedTime} onChange={(v) => setForm((s) => ({ ...s, estimatedTime: v }))} placeholder="30 minutes" />
            </Field>
            <Field label="Lessons count">
              <input
                type="number"
                value={form.lessonsCount}
                onChange={(e) => setForm((s) => ({ ...s, lessonsCount: parseInt(e.target.value) || 0 }))}
                min={1}
                className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) focus:outline-none focus:border-(--lr-gold)"
                style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
              />
            </Field>
          </div>
          <label className="flex items-center gap-3 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isRequired}
              onChange={(e) => setForm((s) => ({ ...s, isRequired: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm text-(--lr-pearl)">Required for all members</span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onSubmit} className="lr-btn-primary flex-1">
            {submitLabel}
          </button>
          <button onClick={onCancel} className="lr-btn-outline" style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="lr-eyebrow block mb-1.5" style={{ color: 'var(--lr-gold-soft)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[10px] px-3 py-2 text-sm text-(--lr-pearl) placeholder:text-(--lr-lavender-dust) focus:outline-none focus:border-(--lr-gold)"
      style={{ background: 'rgba(28,38,68,0.7)', border: '1px solid var(--border-subtle)' }}
    />
  );
}
