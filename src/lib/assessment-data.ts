// Assessment Questions Configuration
// This can be managed by HR/Super Admin through the admin panel

export interface AssessmentQuestion {
  id: string;
  questionOrder: number;
  questionText: string;
  questionType: 'single_choice' | 'multiple_choice' | 'text';
  options: AssessmentOption[];
  weight?: number; // Used for scoring
}

export interface AssessmentOption {
  id: string;
  value: string;
  label: string;
  score: number; // Risk score contribution (0-10)
}

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'q1',
    questionOrder: 1,
    questionText: 'Do you have a will or trust in place?',
    questionType: 'single_choice',
    options: [
      { id: 'q1-a', value: 'yes_recent', label: 'Yes, reviewed in last 12 months', score: 10 },
      { id: 'q1-b', value: 'yes_old', label: 'Yes, but not reviewed recently', score: 7 },
      { id: 'q1-c', value: 'no_planned', label: 'No, but I know I need one', score: 3 },
      { id: 'q1-d', value: 'no_unsure', label: "No, and I'm not sure where to start", score: 0 },
    ],
    weight: 2,
  },
  {
    id: 'q2',
    questionOrder: 2,
    questionText: 'Have you documented your important financial accounts and assets?',
    questionType: 'single_choice',
    options: [
      { id: 'q2-a', value: 'complete', label: 'Yes, everything is documented', score: 10 },
      { id: 'q2-b', value: 'partial', label: 'Partially documented', score: 6 },
      { id: 'q2-c', value: 'started', label: 'Just getting started', score: 3 },
      { id: 'q2-d', value: 'not_started', label: 'Not yet', score: 0 },
    ],
    weight: 2,
  },
  {
    id: 'q3',
    questionOrder: 3,
    questionText: 'Do your loved ones know where to find important documents?',
    questionType: 'single_choice',
    options: [
      { id: 'q3-a', value: 'yes_detailed', label: 'Yes, they have detailed information', score: 10 },
      { id: 'q3-b', value: 'yes_general', label: 'Yes, they have general knowledge', score: 7 },
      { id: 'q3-c', value: 'some_know', label: 'Some people know', score: 4 },
      { id: 'q3-d', value: 'no_one', label: 'No one knows', score: 0 },
    ],
    weight: 2,
  },
  {
    id: 'q4',
    questionOrder: 4,
    questionText: 'Have you set up healthcare directives or advance care planning?',
    questionType: 'single_choice',
    options: [
      { id: 'q4-a', value: 'complete', label: 'Yes, all set up', score: 10 },
      { id: 'q4-b', value: 'partial', label: 'Some documents in place', score: 6 },
      { id: 'q4-c', value: 'discussed', label: 'Discussed with family only', score: 3 },
      { id: 'q4-d', value: 'not_done', label: 'Not yet addressed', score: 0 },
    ],
    weight: 1.5,
  },
  {
    id: 'q5',
    questionOrder: 5,
    questionText: 'Do you have a plan for your digital assets (online accounts, social media)?',
    questionType: 'single_choice',
    options: [
      { id: 'q5-a', value: 'documented', label: 'Yes, fully documented', score: 10 },
      { id: 'q5-b', value: 'partial', label: 'Partially documented', score: 6 },
      { id: 'q5-c', value: 'thought_about', label: 'Thought about it but not documented', score: 3 },
      { id: 'q5-d', value: 'not_considered', label: "Haven't considered it", score: 0 },
    ],
    weight: 1,
  },
  {
    id: 'q6',
    questionOrder: 6,
    questionText: 'Have you had conversations with your family about your legacy wishes?',
    questionType: 'single_choice',
    options: [
      { id: 'q6-a', value: 'detailed', label: 'Yes, detailed conversations', score: 10 },
      { id: 'q6-b', value: 'general', label: 'General discussions', score: 7 },
      { id: 'q6-c', value: 'brief', label: 'Brief mentions only', score: 4 },
      { id: 'q6-d', value: 'not_yet', label: 'Not yet', score: 0 },
    ],
    weight: 1.5,
  },
  {
    id: 'q7',
    questionOrder: 7,
    questionText: 'Do you have life insurance or other protection in place?',
    questionType: 'single_choice',
    options: [
      { id: 'q7-a', value: 'adequate', label: 'Yes, adequate coverage', score: 10 },
      { id: 'q7-b', value: 'some', label: 'Some coverage', score: 6 },
      { id: 'q7-c', value: 'evaluating', label: 'Currently evaluating options', score: 4 },
      { id: 'q7-d', value: 'none', label: 'No coverage yet', score: 0 },
    ],
    weight: 1,
  },
  {
    id: 'q8',
    questionOrder: 8,
    questionText: 'Have you designated beneficiaries on your accounts?',
    questionType: 'single_choice',
    options: [
      { id: 'q8-a', value: 'all_updated', label: 'Yes, all accounts updated', score: 10 },
      { id: 'q8-b', value: 'most', label: 'Most accounts', score: 7 },
      { id: 'q8-c', value: 'some', label: 'Some accounts', score: 4 },
      { id: 'q8-d', value: 'not_sure', label: 'Not sure/none', score: 0 },
    ],
    weight: 2,
  },
  {
    id: 'q9',
    questionOrder: 9,
    questionText: 'Do you have a plan for your personal belongings and sentimental items?',
    questionType: 'single_choice',
    options: [
      { id: 'q9-a', value: 'documented', label: 'Yes, documented', score: 10 },
      { id: 'q9-b', value: 'verbal', label: 'Verbal wishes shared', score: 7 },
      { id: 'q9-c', value: 'thinking', label: 'Thinking about it', score: 4 },
      { id: 'q9-d', value: 'no_plan', label: 'No plan yet', score: 0 },
    ],
    weight: 0.5,
  },
  {
    id: 'q10',
    questionOrder: 10,
    questionText: 'How confident do you feel about your legacy readiness?',
    questionType: 'single_choice',
    options: [
      { id: 'q10-a', value: 'very', label: 'Very confident', score: 10 },
      { id: 'q10-b', value: 'somewhat', label: 'Somewhat confident', score: 7 },
      { id: 'q10-c', value: 'not_very', label: 'Not very confident', score: 3 },
      { id: 'q10-d', value: 'not_at_all', label: 'Not confident at all', score: 0 },
    ],
    weight: 1,
  },
];

// Module Assignment Logic based on assessment scores
export function assignModulesFromScore(totalScore: number, answers: Record<string, string>): string[] {
  const assignedModules: string[] = [];

  // Everyone gets these foundation modules
  assignedModules.push('module-1'); // Understanding Your Legacy

  // Assign based on specific answers
  const willAnswer = answers['q1'];
  if (willAnswer === 'no_planned' || willAnswer === 'no_unsure') {
    assignedModules.push('module-2'); // Wills & Trusts Basics
  }

  const financialAnswer = answers['q2'];
  if (financialAnswer === 'started' || financialAnswer === 'not_started') {
    assignedModules.push('module-4'); // Financial Accounts & Assets
  }

  const digitalAnswer = answers['q5'];
  if (digitalAnswer === 'thought_about' || digitalAnswer === 'not_considered') {
    assignedModules.push('module-3'); // Digital Assets & Online Accounts
  }

  const healthcareAnswer = answers['q4'];
  if (healthcareAnswer === 'discussed' || healthcareAnswer === 'not_done') {
    assignedModules.push('module-5'); // Healthcare Directives
  }

  const communicationAnswer = answers['q6'];
  if (communicationAnswer === 'brief' || communicationAnswer === 'not_yet') {
    assignedModules.push('module-6'); // Communicating Your Wishes
  }

  // If score is very low (< 30), assign all modules
  if (totalScore < 30) {
    return ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6'];
  }

  return assignedModules;
}

export function calculateAssessmentScore(answers: Record<string, string>): number {
  let totalScore = 0;
  let totalWeight = 0;

  assessmentQuestions.forEach((question) => {
    const selectedValue = answers[question.id];
    const selectedOption = question.options.find((opt) => opt.value === selectedValue);

    if (selectedOption) {
      const weight = question.weight || 1;
      totalScore += selectedOption.score * weight;
      totalWeight += 10 * weight; // Max score per question is 10
    }
  });

  // Return percentage score (0-100)
  return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
}
