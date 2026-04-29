// Assessment Questions Configuration
// This can be managed by Org Admin / Super Admin through the admin panel
//
// Questions are grouped by domain (Legal · Financial · Digital · Physical).
// The 5 questions below are placeholders — the full 40-question bank
// (10 per domain) replaces this file when the content team delivers it.

export type AssessmentDomain = 'legal' | 'financial' | 'digital' | 'physical';

export interface AssessmentQuestion {
  id: string;
  questionOrder: number;        // ordering within the domain
  domain: AssessmentDomain;
  questionText: string;
  questionType: 'single_choice' | 'multiple_choice' | 'text';
  options: AssessmentOption[];
  weight?: number;
}

export interface AssessmentOption {
  id: string;
  value: string;
  label: string;
  score: number; // 0–10
}

export interface DomainMeta {
  id: AssessmentDomain;
  number: string;
  label: string;
  blurb: string;
}

export const ASSESSMENT_DOMAINS: DomainMeta[] = [
  { id: 'legal',     number: '01', label: 'LEGAL',     blurb: 'Will, executor, healthcare proxy' },
  { id: 'financial', number: '02', label: 'FINANCIAL', blurb: 'Accounts, beneficiaries, obligations' },
  { id: 'digital',   number: '03', label: 'DIGITAL',   blurb: 'Logins, devices, online identity' },
  { id: 'physical',  number: '04', label: 'PHYSICAL',  blurb: 'Belongings, ceremony, location of papers' },
];

export const assessmentQuestions: AssessmentQuestion[] = [
  // ─── LEGAL ─────────────────────────────────────────────────
  {
    id: 'q1',
    questionOrder: 1,
    domain: 'legal',
    questionText: 'Do you have a will or trust in place?',
    questionType: 'single_choice',
    options: [
      { id: 'q1-a', value: 'yes_recent', label: 'Yes, reviewed recently', score: 10 },
      { id: 'q1-b', value: 'yes_old',    label: 'Yes, but not updated',   score: 6  },
      { id: 'q1-c', value: 'no_planned', label: 'No, but planning to',    score: 3  },
      { id: 'q1-d', value: 'no_unsure',  label: 'No, need guidance',      score: 0  },
    ],
    weight: 2,
  },
  {
    id: 'q4',
    questionOrder: 2,
    domain: 'legal',
    questionText: 'Have you set up healthcare directives?',
    questionType: 'single_choice',
    options: [
      { id: 'q4-a', value: 'complete',  label: 'Yes, all set up',     score: 10 },
      { id: 'q4-b', value: 'partial',   label: 'Partially done',      score: 5  },
      { id: 'q4-c', value: 'discussed', label: 'Discussed only',      score: 2  },
      { id: 'q4-d', value: 'not_done',  label: 'Not addressed',       score: 0  },
    ],
    weight: 1.5,
  },

  // ─── FINANCIAL ─────────────────────────────────────────────
  {
    id: 'q2',
    questionOrder: 1,
    domain: 'financial',
    questionText: 'Have you documented your important financial accounts and assets?',
    questionType: 'single_choice',
    options: [
      { id: 'q2-a', value: 'complete',    label: 'Yes, fully documented', score: 10 },
      { id: 'q2-b', value: 'partial',     label: 'Partially documented',  score: 6  },
      { id: 'q2-c', value: 'started',     label: 'Just started',          score: 3  },
      { id: 'q2-d', value: 'not_started', label: 'Not started',           score: 0  },
    ],
    weight: 2,
  },

  // ─── DIGITAL ───────────────────────────────────────────────
  {
    id: 'q5',
    questionOrder: 1,
    domain: 'digital',
    questionText: 'How confident are you that your digital accounts could be accessed by your loved ones?',
    questionType: 'single_choice',
    options: [
      { id: 'q5-a', value: 'very',       label: 'Very confident — vault and instructions in place', score: 10 },
      { id: 'q5-b', value: 'somewhat',   label: 'Somewhat — partial setup',                         score: 6  },
      { id: 'q5-c', value: 'not_very',   label: 'Not very — only I know',                           score: 3  },
      { id: 'q5-d', value: 'not_at_all', label: 'Need help — never thought about it',               score: 0  },
    ],
    weight: 1.5,
  },

  // ─── PHYSICAL ──────────────────────────────────────────────
  {
    id: 'q3',
    questionOrder: 1,
    domain: 'physical',
    questionText: 'Do your loved ones know where to find your important documents and belongings?',
    questionType: 'single_choice',
    options: [
      { id: 'q3-a', value: 'yes_detailed', label: 'Yes, detailed information shared', score: 10 },
      { id: 'q3-b', value: 'yes_general',  label: 'Yes, general knowledge',           score: 7  },
      { id: 'q3-c', value: 'some_know',    label: 'Some people know',                 score: 3  },
      { id: 'q3-d', value: 'no_one',       label: 'No one knows',                     score: 0  },
    ],
    weight: 2,
  },
];

/* ============================================================
   Helpers
   ============================================================ */

export function getQuestionsForDomain(domain: AssessmentDomain): AssessmentQuestion[] {
  return assessmentQuestions
    .filter((q) => q.domain === domain)
    .sort((a, b) => a.questionOrder - b.questionOrder);
}

export function getDomainProgress(
  domain: AssessmentDomain,
  answers: Record<string, string>
): { answered: number; total: number; complete: boolean } {
  const qs = getQuestionsForDomain(domain);
  const answered = qs.filter((q) => answers[q.id]).length;
  return { answered, total: qs.length, complete: answered === qs.length && qs.length > 0 };
}

export function calculateDomainScore(
  domain: AssessmentDomain,
  answers: Record<string, string>
): number {
  const qs = getQuestionsForDomain(domain);
  if (qs.length === 0) return 0;

  let score = 0;
  let weightSum = 0;
  qs.forEach((q) => {
    const sel = q.options.find((o) => o.value === answers[q.id]);
    const weight = q.weight ?? 1;
    if (sel) {
      score += sel.score * weight;
      weightSum += 10 * weight;
    }
  });
  return weightSum > 0 ? Math.round((score / weightSum) * 100) : 0;
}

export function calculateAssessmentScore(answers: Record<string, string>): number {
  let totalScore = 0;
  let totalWeight = 0;

  assessmentQuestions.forEach((question) => {
    const selectedValue = answers[question.id];
    const selectedOption = question.options.find((opt) => opt.value === selectedValue);

    if (selectedOption) {
      const weight = question.weight ?? 1;
      totalScore += selectedOption.score * weight;
      totalWeight += 10 * weight;
    }
  });

  return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
}

/* ============================================================
   Module assignment — based on per-question answers
   (kept compatible with the rest of the app)
   ============================================================ */
export function assignModulesFromScore(
  totalScore: number,
  answers: Record<string, string>
): string[] {
  const assignedModules: string[] = ['module-1']; // Foundation for everyone

  const willAnswer = answers['q1'];
  if (willAnswer === 'no_planned' || willAnswer === 'no_unsure' || willAnswer === 'yes_old') {
    assignedModules.push('module-2');
  }

  const financialAnswer = answers['q2'];
  if (financialAnswer === 'started' || financialAnswer === 'not_started' || financialAnswer === 'partial') {
    assignedModules.push('module-4');
  }

  const communicationAnswer = answers['q3'];
  if (communicationAnswer === 'some_know' || communicationAnswer === 'no_one') {
    assignedModules.push('module-6');
  }

  const healthcareAnswer = answers['q4'];
  if (healthcareAnswer === 'discussed' || healthcareAnswer === 'not_done' || healthcareAnswer === 'partial') {
    assignedModules.push('module-5');
  }

  if (totalScore < 40) {
    return ['module-1', 'module-2', 'module-3', 'module-4', 'module-5'];
  }

  if (!assignedModules.includes('module-3')) {
    assignedModules.push('module-3');
  }

  return assignedModules;
}
