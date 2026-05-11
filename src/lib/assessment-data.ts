// Assessment Questions Configuration
//
// This file now contains a Legal-domain pilot (10 questions) with
// explicit milestone mappings and weighted yes/maybe/no scoring.
//
// Scoring model for pilot:
// - yes   -> 1.0
// - maybe -> 0.5
// - no    -> 0.0
//
// For compatibility with existing score helpers, option scores are stored as
// 10 / 5 / 0 and normalized to percentages in calculateDomainScore.

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

export interface LegalMilestone {
  id: string;
  title: string;
  triggerQuestionIds: string[];
  protectionRationale: string;
  deliverables: string[];
}

export interface LegalQuestionGuidance {
  id: string;
  riskNudge: string;
  microPrompt: string;
  successCheck: string;
  nextAction: string;
}

export interface LegalMilestoneProgress {
  id: string;
  title: string;
  status: 'complete' | 'in_progress' | 'not_started';
  completion: number;
  protectionRationale: string;
  deliverables: string[];
}

export interface ProjectSetupMilestoneProgress {
  id: string;
  title: string;
  tier: 'standard' | 'boost';
  status: 'complete' | 'in_progress' | 'not_started' | 'recommended';
  completion: number;
  why: string;
  action: string;
}

export const ASSESSMENT_DOMAINS: DomainMeta[] = [
  { id: 'legal',     number: '01', label: 'LEGAL',     blurb: 'Will, executor, healthcare proxy' },
  { id: 'financial', number: '02', label: 'FINANCIAL', blurb: 'Accounts, beneficiaries, obligations' },
  { id: 'digital',   number: '03', label: 'DIGITAL',   blurb: 'Logins, devices, online identity' },
  { id: 'physical',  number: '04', label: 'PHYSICAL',  blurb: 'Belongings, ceremony, location of papers' },
];

export const LEGAL_MILESTONES: LegalMilestone[] = [
  {
    id: 'legal-1',
    title: 'Milestone Legal 1: Identified Executors of Your Estate',
    triggerQuestionIds: ['q1'],
    protectionRationale:
      'Protects the user because 88% of executors were never asked. Court-appointed administrators can delay estates for months and add significant fees.',
    deliverables: [
      'Identify primary, secondary, and tertiary executor by name',
      'Have the conversation and document acceptance from your final executor choice',
      'Record contact details for all executor candidates',
      'Send a one-page executor brief describing responsibilities',
    ],
  },
  {
    id: 'legal-2',
    title: 'Milestone Legal 2: Establish a Will and/or Trust',
    triggerQuestionIds: ['q2', 'q6', 'q7', 'q9'],
    protectionRationale:
      'Protects the user because many people die without current estate documents, and intestacy law rarely matches intent.',
    deliverables: [
      'Confirm whether Will/Trust exists, is current, or missing',
      'Draft or update legal intent with estate professional support',
      'Sign and witness per state requirements',
      'Store originals and document location for executor access',
    ],
  },
  {
    id: 'legal-3',
    title: 'Milestone Legal 3: Power of Attorney, Dual Track',
    triggerQuestionIds: ['q4', 'q5'],
    protectionRationale:
      'Protects the user because without financial and healthcare POA, families can face costly and time-consuming court proceedings during crises.',
    deliverables: [
      'Identify financial POA agent',
      'Identify healthcare POA agent',
      'Execute both documents and distribute copies to key parties',
      'Document scope and activation rules in writing',
    ],
  },
  {
    id: 'legal-4',
    title: 'Milestone Legal 4: Legal Document Inventory + Secure Storage',
    triggerQuestionIds: ['q3', 'q10'],
    protectionRationale:
      'Protects the user because documents that cannot be found are effectively missing in emergencies.',
    deliverables: [
      'Inventory all core legal documents and vital records',
      'Designate one secure storage location',
      'Create a digital index: document, location, date, expiration',
      'Brief executor and POA agents on how to access files',
    ],
  },
  {
    id: 'legal-5',
    title: 'Milestone Legal 5: Annual Legal Review Protocol',
    triggerQuestionIds: ['q8'],
    protectionRationale:
      'Protects the user because stale beneficiaries and outdated executors are common triggers of estate conflict.',
    deliverables: [
      'Set a fixed annual legal review date',
      'Track life-event triggers for immediate review',
      'Reconfirm executor, POA, and beneficiaries',
      'Update and re-execute documents after jurisdiction or beneficiary changes',
    ],
  },
];

const PROJECT_SETUP_LOW_SCORE_THRESHOLD = 55;

const PROJECT_SETUP_STANDARD = [
  {
    id: 'setup-1',
    title: 'Know / Love / Trust Stakeholder Map',
    triggerQuestionIds: ['q1', 'q3'],
    why: 'Names and communication prevent decision paralysis in the first 24 hours of a crisis.',
    action: 'Complete your stakeholder map and confirm each role directly.',
  },
  {
    id: 'setup-2',
    title: 'Phone + Password Access Readiness',
    triggerQuestionIds: ['q7', 'qd1'],
    why: 'Most urgent blockers are account access and device lockouts, not missing intent.',
    action: 'Set password vault access and emergency device unlock instructions.',
  },
  {
    id: 'setup-3',
    title: 'Crucial Doc Box + Storage Index',
    triggerQuestionIds: ['q10', 'qp1'],
    why: 'Document retrieval speed determines whether executor actions begin or stall.',
    action: 'Create one secure storage location and share access instructions.',
  },
] as const;

const PROJECT_SETUP_BOOST = [
  {
    id: 'setup-boost-1',
    title: 'Avoidance Reset Sprint',
    why: 'Low scores often reflect avoidance, not capability. A quick reset restores momentum.',
    action: 'Take the Avoidance Quiz and commit to one action in the next 48 hours.',
  },
  {
    id: 'setup-boost-2',
    title: '7-Day Legal Momentum Plan',
    why: 'Small, daily actions are the fastest route from not started to protected.',
    action: 'Complete one legal deliverable per day for 7 days with reminders.',
  },
] as const;

export const LEGAL_QUESTION_GUIDANCE: Record<string, LegalQuestionGuidance> = {
  q1: {
    id: 'q1',
    riskNudge: 'Your executor carries major responsibility. Most people never ask the person first.',
    microPrompt: 'Ask directly: "Would you be willing to be my executor?"',
    successCheck: 'Good start. Confirm they understand the role and expected effort.',
    nextAction: 'Identify, communicate, and formally appoint your executor.',
  },
  q2: {
    id: 'q2',
    riskNudge: 'A large share of people still have no will or trust. You are not alone if this is unfinished.',
    microPrompt: 'Write one sentence: "If I died tomorrow, I would want..."',
    successCheck: 'Great. If documents exist, check whether they reflect your life today.',
    nextAction: 'Draft or update your will and/or trust.',
  },
  q3: {
    id: 'q3',
    riskNudge: 'Many people create legal documents but never ensure anyone can find them quickly.',
    microPrompt: 'Text one trusted person: "My legal docs are in [location]."',
    successCheck: 'Strong move. Include your attorney or advisor contact details.',
    nextAction: 'Write a letter of instruction and share document locations.',
  },
  q4: {
    id: 'q4',
    riskNudge: 'Financial POA is often delayed until stress is high and choices are harder.',
    microPrompt: 'Write down the one person you trust with financial decisions.',
    successCheck: 'Protection improves when that person has a signed copy.',
    nextAction: 'Draft, assign, and execute durable financial POA.',
  },
  q5: {
    id: 'q5',
    riskNudge: 'Healthcare proxy is different from a living will, and both matter.',
    microPrompt: 'Who would you trust with life-or-death medical decisions?',
    successCheck: 'Excellent. Discuss your values with that person directly.',
    nextAction: 'Draft, assign, and execute healthcare proxy.',
  },
  q6: {
    id: 'q6',
    riskNudge: 'Guardianship choices are hard. Many families delay this until crisis.',
    microPrompt: 'Review one beneficiary account today and confirm who is listed.',
    successCheck: 'Great progress. Keep guardian and beneficiary choices aligned.',
    nextAction: 'Review and update guardian and beneficiary designations.',
  },
  q7: {
    id: 'q7',
    riskNudge: 'Digital assets are often overlooked in estate instructions.',
    microPrompt: 'List your top three critical digital accounts.',
    successCheck: 'Strong planning. Ensure legal language grants digital access rights.',
    nextAction: 'Add digital account access authority to legal documents.',
  },
  q8: {
    id: 'q8',
    riskNudge: 'Outdated legal plans fail when life changes but documents do not.',
    microPrompt: 'Set one annual legal review reminder now.',
    successCheck: 'Excellent. Add life-event triggers that force immediate review.',
    nextAction: 'Adopt an annual and life-event legal review protocol.',
  },
  q9: {
    id: 'q9',
    riskNudge: 'A will cannot capture every practical instruction your executor needs.',
    microPrompt: 'Start with one page: wishes, locations, and key contacts.',
    successCheck: 'Great. Tell your executor where this instruction letter lives.',
    nextAction: 'Complete and store your executor letter of instruction.',
  },
  q10: {
    id: 'q10',
    riskNudge: 'Scattered documents create delays during emergencies and probate.',
    microPrompt: 'Set up a single secure and fireproof storage location this week.',
    successCheck: 'Excellent operational readiness. Access matters as much as storage.',
    nextAction: 'Build and maintain one Crucial Doc Box.',
  },
};

export const assessmentQuestions: AssessmentQuestion[] = [
  // ─── LEGAL ─────────────────────────────────────────────────
  {
    id: 'q1',
    questionOrder: 1,
    domain: 'legal',
    questionText: 'Have you officially named someone to handle your estate when you die?',
    questionType: 'single_choice',
    options: [
      { id: 'q1-a', value: 'yes', label: 'Yes, it is in writing', score: 10 },
      { id: 'q1-b', value: 'maybe', label: 'I picked someone, but it is not official', score: 5 },
      { id: 'q1-c', value: 'no', label: 'No', score: 0 },
    ],
    weight: 2,
  },
  {
    id: 'q2',
    questionOrder: 2,
    domain: 'legal',
    questionText: 'Do you have a will or trust that matches what you actually want today?',
    questionType: 'single_choice',
    options: [
      { id: 'q2-a', value: 'yes', label: 'Yes, it is current', score: 10 },
      { id: 'q2-b', value: 'maybe', label: 'I have one, but it is outdated', score: 5 },
      { id: 'q2-c', value: 'no', label: 'No', score: 0 },
    ],
    weight: 2,
  },
  {
    id: 'q3',
    questionOrder: 3,
    domain: 'legal',
    questionText:
      'Does your executor have copies of every estate document and know where originals are kept?',
    questionType: 'single_choice',
    options: [
      { id: 'q3-a', value: 'yes', label: 'Yes, full copies and original locations are known', score: 10 },
      { id: 'q3-b', value: 'maybe', label: 'Some copies exist, but not complete', score: 5 },
      { id: 'q3-c', value: 'no', label: 'No', score: 0 },
    ],
    weight: 1.5,
  },
  {
    id: 'q4',
    questionOrder: 4,
    domain: 'legal',
    questionText: 'If you could not manage money, have you legally named someone to do it for you?',
    questionType: 'single_choice',
    options: [
      { id: 'q4-a', value: 'yes', label: 'Yes, signed and on file', score: 10 },
      { id: 'q4-b', value: 'maybe', label: 'I picked someone but it is not legal yet', score: 5 },
      { id: 'q4-c', value: 'no', label: 'No', score: 0 },
    ],
    weight: 1.5,
  },
  {
    id: 'q5',
    questionOrder: 5,
    domain: 'legal',
    questionText:
      'If you could not speak for yourself in a medical emergency, have you legally named someone?',
    questionType: 'single_choice',
    options: [
      { id: 'q5-a', value: 'yes', label: 'Yes, signed and on file', score: 10 },
      { id: 'q5-b', value: 'maybe', label: 'I picked someone but it is not legal yet', score: 5 },
      { id: 'q5-c', value: 'no', label: 'No', score: 0 },
    ],
    weight: 1.5,
  },
  {
    id: 'q6',
    questionOrder: 6,
    domain: 'legal',
    questionText:
      'If you have kids or dependents, have you named a guardian in your will and asked them?',
    questionType: 'single_choice',
    options: [
      { id: 'q6-a', value: 'yes', label: 'Yes, both are done', score: 10 },
      { id: 'q6-b', value: 'maybe', label: 'Named but not discussed (or vice versa)', score: 5 },
      { id: 'q6-c', value: 'no', label: 'No / not applicable', score: 0 },
    ],
    weight: 1,
  },
  {
    id: 'q7',
    questionOrder: 7,
    domain: 'legal',
    questionText:
      'Does your will/trust explicitly allow your executor to access digital accounts and assets?',
    questionType: 'single_choice',
    options: [
      { id: 'q7-a', value: 'yes', label: 'Yes, clearly documented', score: 10 },
      { id: 'q7-b', value: 'maybe', label: 'I think so, but not sure', score: 5 },
      { id: 'q7-c', value: 'no', label: 'No', score: 0 },
    ],
    weight: 1,
  },
  {
    id: 'q8',
    questionOrder: 8,
    domain: 'legal',
    questionText:
      'Has your will/trust been reviewed in the last 3 years or since a major life event?',
    questionType: 'single_choice',
    options: [
      { id: 'q8-a', value: 'yes', label: 'Yes', score: 10 },
      { id: 'q8-b', value: 'maybe', label: 'Reviewed, but not since last major event', score: 5 },
      { id: 'q8-c', value: 'no', label: 'No', score: 0 },
    ],
    weight: 1,
  },
  {
    id: 'q9',
    questionOrder: 9,
    domain: 'legal',
    questionText:
      'Have you written a letter of instruction for your executor with personal wishes and document locations?',
    questionType: 'single_choice',
    options: [
      { id: 'q9-a', value: 'yes', label: 'Yes, complete and shared', score: 10 },
      { id: 'q9-b', value: 'maybe', label: 'Started, but incomplete or not shared', score: 5 },
      { id: 'q9-c', value: 'no', label: 'No', score: 0 },
    ],
    weight: 1,
  },
  {
    id: 'q10',
    questionOrder: 10,
    domain: 'legal',
    questionText:
      'Are all legal documents stored in one secure location your executor can access?',
    questionType: 'single_choice',
    options: [
      { id: 'q10-a', value: 'yes', label: 'Yes', score: 10 },
      { id: 'q10-b', value: 'maybe', label: 'Secure, but split across locations', score: 5 },
      { id: 'q10-c', value: 'no', label: 'No', score: 0 },
    ],
    weight: 1.5,
  },

  // ─── FINANCIAL ─────────────────────────────────────────────
  {
    id: 'qf1',
    questionOrder: 1,
    domain: 'financial',
    questionText: 'Have you documented your important financial accounts and assets?',
    questionType: 'single_choice',
    options: [
      { id: 'qf1-a', value: 'yes', label: 'Yes, fully documented', score: 10 },
      { id: 'qf1-b', value: 'maybe', label: 'Partially documented', score: 5 },
      { id: 'qf1-c', value: 'no', label: 'Not started', score: 0 },
    ],
    weight: 2,
  },

  // ─── DIGITAL ───────────────────────────────────────────────
  {
    id: 'qd1',
    questionOrder: 1,
    domain: 'digital',
    questionText: 'How confident are you that your digital accounts could be accessed by your loved ones?',
    questionType: 'single_choice',
    options: [
      { id: 'qd1-a', value: 'yes', label: 'Very confident', score: 10 },
      { id: 'qd1-b', value: 'maybe', label: 'Somewhat confident', score: 5 },
      { id: 'qd1-c', value: 'no', label: 'Need help', score: 0 },
    ],
    weight: 1.5,
  },

  // ─── PHYSICAL ──────────────────────────────────────────────
  {
    id: 'qp1',
    questionOrder: 1,
    domain: 'physical',
    questionText: 'Do your loved ones know where to find your important documents and belongings?',
    questionType: 'single_choice',
    options: [
      { id: 'qp1-a', value: 'yes', label: 'Yes, clearly documented', score: 10 },
      { id: 'qp1-b', value: 'maybe', label: 'Some people know', score: 5 },
      { id: 'qp1-c', value: 'no', label: 'No one knows', score: 0 },
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

function getNormalizedAnswerScore(question: AssessmentQuestion, answerValue?: string): number {
  if (!answerValue) return 0;
  const selected = question.options.find((o) => o.value === answerValue);
  if (!selected) return 0;
  return selected.score / 10;
}

export function getLegalQuestionGuidance(questionId: string): LegalQuestionGuidance | null {
  return LEGAL_QUESTION_GUIDANCE[questionId] ?? null;
}

export function getLegalMilestoneProgress(
  answers: Record<string, string>
): LegalMilestoneProgress[] {
  return LEGAL_MILESTONES.map((milestone) => {
    const triggerQuestions = milestone.triggerQuestionIds
      .map((id) => assessmentQuestions.find((q) => q.id === id))
      .filter((q): q is AssessmentQuestion => Boolean(q));

    if (triggerQuestions.length === 0) {
      return {
        id: milestone.id,
        title: milestone.title,
        status: 'not_started',
        completion: 0,
        protectionRationale: milestone.protectionRationale,
        deliverables: milestone.deliverables,
      };
    }

    const rawCompletion =
      triggerQuestions.reduce((sum, question) => {
        return sum + getNormalizedAnswerScore(question, answers[question.id]);
      }, 0) / triggerQuestions.length;

    const completion = Math.round(rawCompletion * 100);
    const status: LegalMilestoneProgress['status'] =
      completion >= 80 ? 'complete' : completion > 0 ? 'in_progress' : 'not_started';

    return {
      id: milestone.id,
      title: milestone.title,
      status,
      completion,
      protectionRationale: milestone.protectionRationale,
      deliverables: milestone.deliverables,
    };
  });
}

export function getProjectSetupMilestones(
  totalScore: number,
  answers: Record<string, string>
): ProjectSetupMilestoneProgress[] {
  const standard: ProjectSetupMilestoneProgress[] = PROJECT_SETUP_STANDARD.map((milestone) => {
    const triggerQuestions = milestone.triggerQuestionIds
      .map((id) => assessmentQuestions.find((q) => q.id === id))
      .filter((q): q is AssessmentQuestion => Boolean(q));

    const completion =
      triggerQuestions.length === 0
        ? 0
        : Math.round(
            (triggerQuestions.reduce((sum, question) => {
              return sum + getNormalizedAnswerScore(question, answers[question.id]);
            }, 0) /
              triggerQuestions.length) *
              100
          );

    const status: ProjectSetupMilestoneProgress['status'] =
      completion >= 80 ? 'complete' : completion > 0 ? 'in_progress' : 'not_started';

    return {
      id: milestone.id,
      title: milestone.title,
      tier: 'standard',
      status,
      completion,
      why: milestone.why,
      action: milestone.action,
    };
  });

  if (totalScore > PROJECT_SETUP_LOW_SCORE_THRESHOLD) {
    return standard;
  }

  const boost: ProjectSetupMilestoneProgress[] = PROJECT_SETUP_BOOST.map((milestone) => ({
    id: milestone.id,
    title: milestone.title,
    tier: 'boost',
    status: 'recommended',
    completion: 0,
    why: milestone.why,
    action: milestone.action,
  }));

  return [...standard, ...boost];
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

  const legalExecutor = answers['q1'];
  const legalWill = answers['q2'];
  if (legalExecutor !== 'yes' || legalWill !== 'yes') {
    assignedModules.push('module-2');
  }

  const poaFinancial = answers['q4'];
  const poaHealthcare = answers['q5'];
  if (poaFinancial !== 'yes' || poaHealthcare !== 'yes') {
    assignedModules.push('module-3');
  }

  const financialAnswer = answers['qf1'];
  if (financialAnswer !== 'yes') {
    assignedModules.push('module-4');
  }

  const communicationAnswer = answers['q9'];
  if (communicationAnswer !== 'yes') {
    assignedModules.push('module-6');
  }

  const documentAccess = answers['q10'];
  if (documentAccess !== 'yes') {
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
