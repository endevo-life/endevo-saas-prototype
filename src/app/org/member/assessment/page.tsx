'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import LRMonogram from '@/components/common/LRMonogram';
import { useDemoMode } from '@/lib/demo-mode';
import {
  ASSESSMENT_DOMAINS,
  AssessmentDomain,
  assessmentQuestions,
  assignModulesFromScore,
  calculateAssessmentScore,
  calculateDomainScore,
  getLegalMilestoneProgress,
  getProjectSetupMilestones,
  getLegalQuestionGuidance,
  getDomainProgress,
  getQuestionsForDomain,
} from '@/lib/assessment-data';
import { mockModules } from '@/lib/mock-data';

type View = 'picker' | 'questions' | 'results';

export default function AssessmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDemoFocusMode } = useDemoMode();

  const [view, setView] = useState<View>('picker');
  const [activeDomain, setActiveDomain] = useState<AssessmentDomain | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const domainsInScope = isDemoFocusMode
    ? ASSESSMENT_DOMAINS.filter((d) => d.id === 'legal')
    : ASSESSMENT_DOMAINS;

  const scopedQuestionIds = domainsInScope
    .flatMap((d) => getQuestionsForDomain(d.id).map((q) => q.id));

  const totalAnswered = scopedQuestionIds.filter((id) => Boolean(answers[id])).length;
  const totalQuestions = scopedQuestionIds.length;
  const allComplete = domainsInScope.every((d) => getDomainProgress(d.id, answers).complete);

  /* ──────────── handlers ──────────── */

  const startDomain = (domain: AssessmentDomain) => {
    const qs = getQuestionsForDomain(domain);
    const firstUnansweredIdx = qs.findIndex((q) => !answers[q.id]);
    setActiveDomain(domain);
    setQuestionIndex(firstUnansweredIdx === -1 ? 0 : firstUnansweredIdx);
    setView('questions');
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (!activeDomain) return;
    const qs = getQuestionsForDomain(activeDomain);
    if (questionIndex < qs.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      // domain complete — return to picker
      setActiveDomain(null);
      setQuestionIndex(0);
      setView('picker');
    }
  };

  const handleBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
    } else {
      setActiveDomain(null);
      setView('picker');
    }
  };

  const handleSeeResults = () => setView('results');

  const handleFinish = () => {
    const score = calculateAssessmentScore(answers);
    const assignedModules = assignModulesFromScore(score, answers);
    if (user) {
      localStorage.setItem(
        `assessment_${user.id}`,
        JSON.stringify({
          userId: user.id,
          score,
          assignedModules,
          completedAt: new Date().toISOString(),
          answers,
        })
      );
    }
    router.push('/org/member/dashboard');
  };

  /* ──────────── RESULTS VIEW ──────────── */

  if (view === 'results') {
    const overallScore = calculateAssessmentScore(answers);
    const assignedModules = assignModulesFromScore(overallScore, answers);
    const legalMilestones = getLegalMilestoneProgress(answers);
    const setupMilestones = getProjectSetupMilestones(overallScore, answers);

    return (
      <DashboardLayout title="Assessment Results" role="org_member">
        <div className="max-w-4xl mx-auto">
          <FlowSteps current="results" />

          {/* Hero */}
          <section
            className="rounded-[18px] mb-7 px-8 py-9 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-gold)',
            }}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 opacity-15">
              <LRMonogram size={260} />
            </div>

            <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div>
                <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
                  Your starting line
                </p>
                <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-4xl tracking-[0.06em] leading-tight">
                  Assessment complete
                </h2>
                <p className="text-(--lr-pearl) mt-3 max-w-md leading-relaxed opacity-90">
                  Your readiness across the four domains. Each domain you strengthen lifts the whole picture.
                </p>
              </div>

              <div className="flex justify-center lg:justify-end">
                <ScoreDial score={overallScore} size={200} />
              </div>
            </div>
          </section>

          {/* Legal milestones */}
          <section
            className="rounded-[14px] p-7 mb-8"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
              Legal domain milestones
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mb-2">
              Your legal readiness map
            </h3>
            <p className="text-sm text-(--lr-pearl) opacity-85 mb-5 leading-relaxed">
              Based on your answers, these milestones show what is complete and what should be prioritized next.
            </p>

            <div className="space-y-3">
              {legalMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="rounded-[10px] px-4 py-4"
                  style={{
                    background: 'rgba(212,190,148,0.04)',
                    border:
                      milestone.status === 'complete'
                        ? '1px solid var(--lr-gold)'
                        : milestone.status === 'in_progress'
                        ? '1px solid var(--border-gold)'
                        : '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <p className="text-sm text-(--lr-pearl) font-(family-name:--font-jura) tracking-[0.06em]">
                      {milestone.title}
                    </p>
                    <span className="font-(family-name:--font-jetbrains) text-xs text-(--lr-gold) whitespace-nowrap">
                      {milestone.completion}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full mb-2" style={{ background: 'rgba(212,190,148,0.12)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${milestone.completion}%`, background: 'var(--lr-gold)' }}
                    />
                  </div>
                  <p className="text-xs text-(--lr-lavender-dust) leading-relaxed">
                    {milestone.protectionRationale}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            className="rounded-[14px] p-7 mb-8"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
              Project setup milestones
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mb-2">
              Core setup for everyone
            </h3>
            <p className="text-sm text-(--lr-pearl) opacity-85 mb-5 leading-relaxed">
              Three setup milestones are standard for everyone. Two additional boost milestones appear when readiness score is low.
            </p>

            <div className="space-y-3">
              {setupMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="rounded-[10px] px-4 py-4"
                  style={{
                    background: 'rgba(212,190,148,0.04)',
                    border:
                      milestone.status === 'complete'
                        ? '1px solid var(--lr-gold)'
                        : milestone.status === 'in_progress'
                        ? '1px solid var(--border-gold)'
                        : milestone.status === 'recommended'
                        ? '1px dashed var(--border-gold)'
                        : '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <p className="text-sm text-(--lr-pearl) font-(family-name:--font-jura) tracking-[0.06em]">
                      {milestone.title}
                    </p>
                    <span className="font-(family-name:--font-jura) text-[0.58rem] tracking-[0.2em] uppercase text-(--lr-gold-soft) whitespace-nowrap">
                      {milestone.tier === 'boost' ? 'Boost' : 'Standard'}
                    </span>
                  </div>

                  {milestone.status !== 'recommended' && (
                    <div className="w-full h-1.5 rounded-full mb-2" style={{ background: 'rgba(212,190,148,0.12)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${milestone.completion}%`, background: 'var(--lr-gold)' }}
                      />
                    </div>
                  )}

                  <p className="text-xs text-(--lr-lavender-dust) leading-relaxed mb-1">
                    {milestone.why}
                  </p>
                  <p className="text-xs text-(--lr-pearl) leading-relaxed">
                    <span className="text-(--lr-gold)">Action: </span>
                    {milestone.action}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Per-domain dials */}
          {!isDemoFocusMode && <section className="mb-8">
            <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
              By domain
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mb-5">
              Where you stand
            </h3>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {ASSESSMENT_DOMAINS.map((d) => {
                const score = calculateDomainScore(d.id, answers);
                return (
                  <div
                    key={d.id}
                    className="rounded-[14px] p-6"
                    style={{
                      background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="flex justify-center mb-4">
                      <DomainDial pct={score} size={120} />
                    </div>
                    <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.28em] uppercase text-center mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                      {d.number}
                    </p>
                    <p className="font-(family-name:--font-italiana) text-(--lr-gold) text-xl tracking-[0.08em] text-center">
                      {d.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>}

          {/* Personalised modules */}
          <section
            className="rounded-[14px] p-7 mb-7"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
              Your path
            </p>
            <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mb-2">
              Personalised lessons
            </h3>
            <p className="text-sm text-(--lr-pearl) opacity-85 mb-5 leading-relaxed">
              Based on your answers, {assignedModules.length} lessons have been added to your Legacy Path.
            </p>

            <div className="space-y-2">
              {assignedModules.map((moduleId, index) => {
                const module = mockModules.find((m) => m.id === moduleId);
                return (
                  <div
                    key={moduleId}
                    className="flex items-center gap-4 px-4 py-3 rounded-[10px]"
                    style={{ background: 'rgba(212,190,148,0.04)', border: '1px solid var(--border-subtle)' }}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center font-(family-name:--font-jetbrains) text-sm flex-shrink-0"
                      style={{ background: 'rgba(212,190,148,0.12)', color: 'var(--lr-gold)', border: '1px solid var(--border-gold)' }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-(--lr-pearl) truncate">{module?.title ?? moduleId}</p>
                      <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.18em] uppercase text-(--lr-gold-soft) mt-0.5">
                        {module?.estimatedTime ?? '—'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Privacy + finish */}
          <div
            className="rounded-[14px] px-6 py-5 flex items-start gap-4 mb-6"
            style={{ background: 'rgba(212,190,148,0.06)', border: '1px solid var(--border-gold)' }}
          >
            <span className="text-(--lr-gold) leading-none mt-0.5 text-lg">◆</span>
            <p className="text-sm text-(--lr-pearl) leading-relaxed opacity-90">
              <span className="font-(family-name:--font-jura) tracking-[0.16em] uppercase text-[0.7rem] text-(--lr-gold) block mb-1">
                Your answers stay yours
              </span>
              Your detailed responses are private. Org Admins only see that you completed the assessment, not what you answered.
            </p>
          </div>

          <button onClick={handleFinish} className="lr-btn-primary w-full">
            Begin your Legacy Path →
          </button>
        </div>
      </DashboardLayout>
    );
  }

  /* ──────────── QUESTIONS VIEW ──────────── */

  if (view === 'questions' && activeDomain) {
    const qs = getQuestionsForDomain(activeDomain);
    const currentQ = qs[questionIndex];
    const legalGuidance = activeDomain === 'legal' ? getLegalQuestionGuidance(currentQ.id) : null;
    const domain = ASSESSMENT_DOMAINS.find((d) => d.id === activeDomain)!;
    const currentAnswer = answers[currentQ.id];
    const isLastInDomain = questionIndex === qs.length - 1;
    const progress = ((questionIndex + 1) / qs.length) * 100;

    return (
      <DashboardLayout title="Peace of Mind Assessment" role="org_member">
        <div className="max-w-3xl mx-auto">
          <FlowSteps current="questions" />

          {/* Domain header strip */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <button
              onClick={() => {
                setActiveDomain(null);
                setView('picker');
              }}
              className="font-(family-name:--font-jura) text-[0.7rem] tracking-[0.22em] uppercase text-(--lr-gold-soft) hover:text-(--lr-gold) transition-colors"
            >
              ← Back to domains
            </button>
            <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.22em] uppercase text-(--lr-lavender-dust)">
              Question {questionIndex + 1} of {qs.length}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full mb-7" style={{ background: 'rgba(212,190,148,0.12)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'var(--lr-gold)' }}
            />
          </div>

          {/* Question card */}
          <section
            className="rounded-[18px] p-8 mb-6"
            style={{
              background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="mb-6">
              <p className="lr-eyebrow mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                {domain.number} · {domain.label}
              </p>
              <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.04em] leading-tight">
                {currentQ.questionText}
              </h2>
            </div>

            {legalGuidance && (
              <div
                className="rounded-[12px] px-5 py-4 mb-6"
                style={{ background: 'rgba(212,190,148,0.06)', border: '1px solid var(--border-gold)' }}
              >
                <p className="text-xs text-(--lr-lavender-dust) leading-relaxed mb-2">
                  <span className="text-(--lr-gold-soft)">Why it matters: </span>
                  {legalGuidance.riskNudge}
                </p>
                <p className="text-xs text-(--lr-lavender-dust) leading-relaxed mb-2">
                  <span className="text-(--lr-gold-soft)">Quick prompt: </span>
                  {legalGuidance.microPrompt}
                </p>
                <p className="text-xs text-(--lr-lavender-dust) leading-relaxed mb-2">
                  <span className="text-(--lr-gold-soft)">Success check: </span>
                  {legalGuidance.successCheck}
                </p>
                <p className="text-xs text-(--lr-pearl) leading-relaxed">
                  <span className="text-(--lr-gold)">Next action: </span>
                  {legalGuidance.nextAction}
                </p>
              </div>
            )}

            <div className="space-y-2.5 mb-7">
              {currentQ.options.map((option) => {
                const selected = currentAnswer === option.value;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(currentQ.id, option.value)}
                    className="w-full text-left px-5 py-4 rounded-[12px] transition-all"
                    style={{
                      background: selected
                        ? 'linear-gradient(180deg, rgba(212,190,148,0.18) 0%, rgba(212,190,148,0.06) 100%)'
                        : 'rgba(212,190,148,0.04)',
                      border: selected ? '1px solid var(--lr-gold)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{
                          background: selected ? 'var(--lr-gold)' : 'transparent',
                          border: `1px solid ${selected ? 'var(--lr-gold)' : 'var(--border-gold)'}`,
                        }}
                      >
                        {selected && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: 'var(--lr-navy-deep)' }}
                          />
                        )}
                      </span>
                      <span className="text-sm text-(--lr-pearl)">{option.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <button onClick={handleBack} className="lr-btn-outline" style={{ color: 'var(--lr-pearl)', borderColor: 'var(--lr-pearl)' }}>
                ← Back
              </button>
              <button
                onClick={handleNext}
                disabled={!currentAnswer}
                className="lr-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLastInDomain ? 'Finish domain →' : 'Next →'}
              </button>
            </div>
          </section>
        </div>
      </DashboardLayout>
    );
  }

  /* ──────────── PICKER (default landing) ──────────── */

  return (
    <DashboardLayout title="Peace of Mind Assessment" role="org_member">
      <div className="max-w-5xl mx-auto">
        <FlowSteps current="picker" />

        {/* Hero */}
        <section
          className="rounded-[18px] mb-7 px-8 py-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
            border: '1px solid var(--border-gold)',
          }}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 opacity-15">
            <LRMonogram size={240} />
          </div>

          <div className="relative">
            <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
              Begin your assessment
            </p>
            <h2 className="font-(family-name:--font-italiana) text-(--lr-gold) text-4xl tracking-[0.05em] leading-tight max-w-2xl">
              {isDemoFocusMode ? 'Begin with Legal domain' : `Choose where to begin, ${user?.firstName ?? 'friend'}`}
            </h2>
            <p className="text-(--lr-pearl) mt-3 max-w-2xl leading-relaxed opacity-90">
              {isDemoFocusMode
                ? 'This demo uses the same flow in a 10-question Legal slice. Start with Legal to generate milestones and your personalized plan.'
                : 'Four domains shape your Legacy Path. Take them in any order — pause and return whenever the moment is right. Each domain takes only a few minutes.'}
            </p>

            <div className="mt-5 flex items-center gap-5 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="font-(family-name:--font-jetbrains) text-(--lr-gold) text-2xl">
                  {totalAnswered}
                </span>
                <span className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.2em] uppercase text-(--lr-lavender-dust)">
                  / {totalQuestions} answered
                </span>
              </div>

              {allComplete && (
                <button onClick={handleSeeResults} className="lr-btn-primary">
                  See your results →
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Four domain cards */}
        <section>
          <p className="lr-eyebrow mb-2" style={{ color: 'var(--lr-gold-soft)' }}>
            The four domains
          </p>
          <h3 className="font-(family-name:--font-italiana) text-(--lr-gold) text-2xl tracking-[0.05em] mb-5">
            Pick a domain to begin
          </h3>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {domainsInScope.map((d) => {
              const { answered, total, complete } = getDomainProgress(d.id, answers);
              const inProgress = answered > 0 && !complete;
              const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

              return (
                <button
                  key={d.id}
                  onClick={() => total > 0 && startDomain(d.id)}
                  disabled={total === 0}
                  className="text-left rounded-[14px] p-6 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
                    border: complete
                      ? '1px solid var(--lr-gold)'
                      : inProgress
                      ? '1px solid var(--border-gold)'
                      : '1px solid var(--border-subtle)',
                    boxShadow: complete ? '0 14px 36px -22px rgba(212,190,148,0.45)' : 'none',
                  }}
                >
                  {/* Concentric ring node */}
                  <div className="flex justify-center mb-5">
                    <DomainNode pct={pct} status={complete ? 'complete' : inProgress ? 'active' : 'available'} size={120} />
                  </div>

                  <p className="font-(family-name:--font-jura) text-[0.65rem] tracking-[0.28em] uppercase mb-1" style={{ color: 'var(--lr-gold-soft)' }}>
                    {d.number}
                  </p>
                  <p className="font-(family-name:--font-italiana) text-2xl text-(--lr-gold) tracking-[0.08em] mb-2">
                    {d.label}
                  </p>
                  <p className="text-xs text-(--lr-pearl) leading-relaxed opacity-80 mb-4 min-h-[2.5em]">
                    {d.blurb}
                  </p>

                  <hr className="lr-separator mb-4" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-(family-name:--font-jetbrains) text-(--lr-pearl)">
                      {answered}/{total} questions
                    </span>
                    <span
                      className="font-(family-name:--font-jura) tracking-[0.18em] uppercase text-[0.62rem]"
                      style={{
                        color: complete
                          ? 'var(--lr-gold)'
                          : inProgress
                          ? 'var(--lr-gold-pale)'
                          : 'var(--lr-lavender-dust)',
                      }}
                    >
                      {complete ? '✓ Complete' : inProgress ? 'In progress' : 'Not started'}
                    </span>
                  </div>

                  <p className="text-[0.7rem] text-(--lr-gold-soft) mt-3 leading-relaxed">
                    {complete
                      ? 'Review your answers'
                      : inProgress
                      ? 'Continue where you left off'
                      : total === 0
                      ? 'Coming soon'
                      : 'Start this domain →'}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Privacy footer */}
        <div
          className="mt-8 rounded-[14px] px-6 py-5 flex items-start gap-4"
          style={{ background: 'rgba(212,190,148,0.06)', border: '1px solid var(--border-gold)' }}
        >
          <span className="text-(--lr-gold) leading-none mt-0.5 text-lg">◆</span>
          <p className="text-sm text-(--lr-pearl) leading-relaxed opacity-90">
            <span className="font-(family-name:--font-jura) tracking-[0.16em] uppercase text-[0.7rem] text-(--lr-gold) block mb-1">
              Private by design
            </span>
            Only you see your answers. Org Admins see only that you completed the assessment — never your individual responses.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ──────────── Visual primitives ──────────── */

function ScoreDial({ score, size = 200 }: { score: number; size?: number }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <circle cx={size / 2} cy={size / 2} r={r + 4} fill="none" stroke="var(--lr-steel)" strokeOpacity="0.25" strokeWidth="0.5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(212,190,148,0.16)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--lr-gold)"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="50%" y="42%" textAnchor="middle" fill="var(--lr-pearl)" fontFamily="var(--font-jura)" fontSize={size * 0.06} letterSpacing="0.22em">
        READINESS
      </text>
      <text x="50%" y="57%" textAnchor="middle" fill="var(--lr-gold)" fontFamily="var(--font-mono)" fontSize={size * 0.22}>
        {score}%
      </text>
    </svg>
  );
}

function DomainDial({ pct, size = 120 }: { pct: number; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <circle cx={size / 2} cy={size / 2} r={r + 2} fill="none" stroke="var(--lr-steel)" strokeOpacity="0.3" strokeWidth="0.6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(212,190,148,0.18)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--lr-gold)"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="50%" y="55%" textAnchor="middle" fill="var(--lr-gold)" fontFamily="var(--font-mono)" fontSize={size * 0.22} dominantBaseline="middle">
        {pct}%
      </text>
    </svg>
  );
}

function DomainNode({ pct, status, size = 120 }: { pct: number; status: 'complete' | 'active' | 'available'; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const ringColor =
    status === 'complete' ? 'var(--lr-gold)' :
    status === 'active'   ? 'var(--lr-gold-pale)' :
                            'var(--lr-lavender-dust)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <circle cx={size / 2} cy={size / 2} r={r + 2} fill="none" stroke="var(--lr-steel)" strokeOpacity="0.3" strokeWidth="0.6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(212,190,148,0.18)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={ringColor}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <circle cx={size / 2} cy={size / 2} r={r - 9} fill="none" stroke="var(--lr-gold)" strokeOpacity="0.18" strokeWidth="0.6" />
      {status === 'complete' ? (
        <text x="50%" y="58%" textAnchor="middle" fill="var(--lr-gold)" fontFamily="var(--font-mono)" fontSize={size * 0.32} dominantBaseline="middle">
          ✓
        </text>
      ) : (
        <text x="50%" y="55%" textAnchor="middle" fill={ringColor} fontFamily="var(--font-mono)" fontSize={size * 0.22} dominantBaseline="middle">
          {pct}%
        </text>
      )}
    </svg>
  );
}

function FlowSteps({ current }: { current: 'picker' | 'questions' | 'results' }) {
  const steps = [
    { id: 'picker', label: 'Choose Domain' },
    { id: 'questions', label: 'Answer Questions' },
    { id: 'results', label: 'See Plan' },
  ] as const;

  return (
    <div
      className="rounded-[12px] px-4 py-3 mb-5"
      style={{ background: 'rgba(212,190,148,0.05)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
        {steps.map((step, index) => {
          const active = step.id === current;
          const done = steps.findIndex((s) => s.id === current) > index;
          return (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] font-(family-name:--font-jetbrains)"
                style={{
                  background: done || active ? 'var(--lr-gold)' : 'rgba(212,190,148,0.08)',
                  color: done || active ? 'var(--lr-navy-deep)' : 'var(--lr-lavender-dust)',
                  border: done || active ? '1px solid var(--lr-gold)' : '1px solid var(--border-subtle)',
                }}
              >
                {done ? '✓' : index + 1}
              </span>
              <span
                className="text-[0.65rem] font-(family-name:--font-jura) tracking-[0.16em] uppercase"
                style={{ color: active ? 'var(--lr-gold)' : 'var(--lr-lavender-dust)' }}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && <span className="text-(--lr-lavender-dust) text-xs">→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
