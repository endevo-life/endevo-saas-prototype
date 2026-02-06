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
      { id: 'q1-a', value: 'yes_recent', label: 'Yes, reviewed recently', score: 10 },
      { id: 'q1-b', value: 'yes_old', label: 'Yes, but not updated', score: 6 },
      { id: 'q1-c', value: 'no_planned', label: 'No, but planning to', score: 3 },
      { id: 'q1-d', value: 'no_unsure', label: 'No, need guidance', score: 0 },
    ],
    weight: 2,
  },
  {
    id: 'q2',
    questionOrder: 2,
    questionText: 'Have you documented your important financial accounts and assets?',
    questionType: 'single_choice',
    options: [
      { id: 'q2-a', value: 'complete', label: 'Yes, fully documented', score: 10 },
      { id: 'q2-b', value: 'partial', label: 'Partially documented', score: 6 },
      { id: 'q2-c', value: 'started', label: 'Just started', score: 3 },
      { id: 'q2-d', value: 'not_started', label: 'Not started', score: 0 },
    ],
    weight: 2,
  },
  {
    id: 'q3',
    questionOrder: 3,
    questionText: 'Do your loved ones know where to find important documents?',
    questionType: 'single_choice',
    options: [
      { id: 'q3-a', value: 'yes_detailed', label: 'Yes, detailed information shared', score: 10 },
      { id: 'q3-b', value: 'yes_general', label: 'Yes, general knowledge', score: 7 },
      { id: 'q3-c', value: 'some_know', label: 'Some people know', score: 3 },
      { id: 'q3-d', value: 'no_one', label: 'No one knows', score: 0 },
    ],
    weight: 2,
  },
  {
    id: 'q4',
    questionOrder: 4,
    questionText: 'Have you set up healthcare directives?',
    questionType: 'single_choice',
    options: [
      { id: 'q4-a', value: 'complete', label: 'Yes, all set up', score: 10 },
      { id: 'q4-b', value: 'partial', label: 'Partially done', score: 5 },
      { id: 'q4-c', value: 'discussed', label: 'Discussed only', score: 2 },
      { id: 'q4-d', value: 'not_done', label: 'Not addressed', score: 0 },
    ],
    weight: 1.5,
  },
  {
    id: 'q5',
    questionOrder: 5,
    questionText: 'How confident are you about your overall legacy readiness?',
    questionType: 'single_choice',
    options: [
      { id: 'q5-a', value: 'very', label: 'Very confident', score: 10 },
      { id: 'q5-b', value: 'somewhat', label: 'Somewhat confident', score: 6 },
      { id: 'q5-c', value: 'not_very', label: 'Not very confident', score: 3 },
      { id: 'q5-d', value: 'not_at_all', label: 'Need help', score: 0 },
    ],
    weight: 1.5,
  },
];

// Module Assignment Logic based on assessment scores
export function assignModulesFromScore(totalScore: number, answers: Record<string, string>): string[] {
  const assignedModules: string[] = [];

  // Foundation module for everyone
  assignedModules.push('module-1'); // Understanding Your Legacy

  // Assign based on specific answers
  const willAnswer = answers['q1'];
  if (willAnswer === 'no_planned' || willAnswer === 'no_unsure' || willAnswer === 'yes_old') {
    assignedModules.push('module-2'); // Wills & Trusts Basics
  }

  const financialAnswer = answers['q2'];
  if (financialAnswer === 'started' || financialAnswer === 'not_started' || financialAnswer === 'partial') {
    assignedModules.push('module-4'); // Financial Accounts & Assets
  }

  const communicationAnswer = answers['q3'];
  if (communicationAnswer === 'some_know' || communicationAnswer === 'no_one') {
    assignedModules.push('module-6'); // Communicating Your Wishes
  }

  const healthcareAnswer = answers['q4'];
  if (healthcareAnswer === 'discussed' || healthcareAnswer === 'not_done' || healthcareAnswer === 'partial') {
    assignedModules.push('module-5'); // Healthcare Directives
  }

  // If score is very low (< 40), assign all core modules
  if (totalScore < 40) {
    return ['module-1', 'module-2', 'module-3', 'module-4', 'module-5'];
  }

  // Always add digital assets module if not present
  if (!assignedModules.includes('module-3')) {
    assignedModules.push('module-3');
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
