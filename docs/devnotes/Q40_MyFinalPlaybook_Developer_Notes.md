# Q40 / My Final Playbook — React Developer Notes

**Project:** ENDevo / My Final Playbook
**Component:** Q40 Comprehensive Readiness Assessment + Personalized Project Plan
**Spec owner:** Niki Weiss (Product Owner), April 2026
**Engine reference:** This document (engine pseudo code in Section 4)
**Builds in scope:** (1) UI/UX prototype for demo, (2) production SaaS MVP

---

## 1. Two-Track Build Strategy

This document covers two builds. Same component tree. Different acceptance criteria.

| | TRACK A: PROTOTYPE | TRACK B: PRODUCTION SAAS |
|---|---|---|
| **Purpose** | Investor demos, pilot pitches, B2B sales calls | Real users, paid product, retention |
| **Data** | Hardcoded sample answers, mock results | Live engine, persistent state, GHL sync |
| **Engine** | Stub functions returning fixture data | Full deterministic engine (Section 4) |
| **Persistence** | None (refresh = reset) | localStorage + GHL webhook sync |
| **Auth** | None | Email-keyed localStorage (no login in v1) |
| **PDF export** | Static sample PDF | Generated from user's actual plan |
| **Mobile** | Desktop-only acceptable | Mobile-first required |
| **Time to ship** | 5 days | 2-3 weeks (P0 = 36 hours) |

**Critical:** Build Track A first. Use it for the next 5 enterprise pitches. Use real demo feedback to lock UX before writing production code.

---

## 2. Architecture Decision

**NO Claude API. NO AI generation. 100% deterministic.**

Same principle as Q12. All personalization comes from:

- Score calculation (0-1000 total, weighted by task priority)
- Band assignment (5 bands per spreadsheet)
- Domain weakness ranking with tie-break
- Question-to-task mapping (locked data table)
- Level-gating dependency (L1 → L2 → L3 → L4)

The "Jesse" personalized voice is delivered via static band-specific wrapper copy. Same quality every user, every time, zero API latency, zero cost per assessment.

**Why this matters for valuation:** Deterministic = predictable margins. AI-per-call = unpredictable COGS that kills SaaS gross margin. Investors prefer the former.

---

## 3. The 5 Screens (Entire App Surface Area)

Everything else is a sub-component of one of these.

| # | Route | Screen | Purpose | Time on screen |
|---|---|---|---|---|
| 1 | `/welcome` | Welcome | Capture name + email + scenario focus. Resume returning user. | 30 sec |
| 2 | `/assessment` | Assessment | 40 questions, one per screen, grouped by 6 domains, progress bar. | 8-12 min |
| 3 | `/results` | Results Reveal | Score / 1000, band, domain breakdown, scenario readiness, CTA. | 1 min |
| 4 | `/dashboard` | Dashboard | Home for every return visit. Score, next 5 actions, level progress, % complete. | Returns weekly |
| 5 | `/task/:id` | Task Detail | Single task: description, deliverable, how-to, status update, notes. | 5-15 min per task |

---

## 4. Engine Reference (TypeScript)

Drop this into `q40-engine.ts`. Same pattern as `q12-engine.ts`.

### 4.1 Type Definitions

```typescript
export type Domain = "Beliefs" | "Communication" | "Digital" | "Financial" | "Legal" | "Physical";
export type Scenario = "D" | "T" | "LTC";
export type Level = 1 | 2 | 3 | 4;
export type Priority = "StartHere" | "Critical" | "High" | "Medium" | "Low";
export type TaskStatus = "Complete" | "InProgress" | "NotStarted" | "NA";
export type Band = "AT_RISK" | "STARTING" | "PREPARED" | "PROTECTED" | "LEGACY_READY";

export interface AnswerOption {
  label: string;
  value: string;
  status: TaskStatus;       // what status this answer assigns to mapped tasks
  pointsRatio: 0 | 0.5 | 1; // partial credit multiplier
}

export interface Question {
  id: string;               // "Q1" through "Q40"
  domain: Domain;
  text: string;
  options: AnswerOption[];
  mappedTaskIds: string[];  // 1-3 task IDs this question controls
  scenarioRelevance: Scenario[];
}

export interface Answer {
  questionId: string;
  value: string;
}

export interface Task {
  id: string;               // "T01" through "T64"
  name: string;
  description: string;
  domain: Domain;
  level: Level;
  priority: Priority;
  basePoints: number;       // 25 / 10 / 5 / 2 / 1 by priority
  scenarioTags: Scenario[];
  deliverableType: string;  // "Legal Doc" / "Inventory" / "Statement" / etc.
  howTo: string;            // step-by-step for Task Detail screen
}

export interface PersonalizedTask extends Task {
  status: TaskStatus;
  pointsEarned: number;
  recommendedOrder: number;
  unlocked: boolean;
  userNotes?: string;
  completedAt?: string;
}

export interface AssessmentResult {
  userId: string;
  totalScore: number;       // 0-1000
  band: Band;
  domainBreakdown: Record<Domain, { score: number; pctComplete: number }>;
  scenarioReadiness: Record<Scenario, number>;
  weakestDomain: Domain;
  weakestLevel: Level;
  personalizedPlan: PersonalizedTask[];
  nextActions: PersonalizedTask[];
}
```

### 4.2 Constants

```typescript
const PRIORITY_POINTS: Record<Priority, number> = {
  StartHere: 25,
  Critical: 10,
  High: 5,
  Medium: 2,
  Low: 1,
};

const TIE_BREAK_DOMAIN_ORDER: Domain[] = [
  "Digital", "Legal", "Financial", "Physical", "Communication", "Beliefs"
];

const LEVEL_UNLOCK_THRESHOLD: Record<Level, number> = {
  1: 0,    // L1 always unlocked
  2: 100,  // L2 unlocks at 100% L1
  3: 80,   // L3 unlocks at 80% L2
  4: 80,   // L4 unlocks at 80% L3
};

const BAND_THRESHOLDS = [
  { min: 900, band: "LEGACY_READY" as Band },
  { min: 750, band: "PROTECTED" as Band },
  { min: 500, band: "PREPARED" as Band },
  { min: 250, band: "STARTING" as Band },
  { min: 0,   band: "AT_RISK" as Band },
];
```

### 4.3 Core Functions

```typescript
export function scoreAssessment(answers: Answer[]): {
  totalPoints: number;
  domainPoints: Record<Domain, number>;
  taskStatuses: Record<string, TaskStatus>;
} {
  const domainPoints: Record<Domain, number> = {
    Beliefs: 0, Communication: 0, Digital: 0,
    Financial: 0, Legal: 0, Physical: 0,
  };
  const taskStatuses: Record<string, TaskStatus> = {};
  let totalPoints = 0;

  for (const answer of answers) {
    const question = QUESTIONS.find(q => q.id === answer.questionId);
    if (!question) continue;
    const option = question.options.find(o => o.value === answer.value);
    if (!option) continue;

    for (const taskId of question.mappedTaskIds) {
      const task = TASK_POOL.find(t => t.id === taskId);
      if (!task) continue;

      // Last-write-wins if multiple Qs map to same task
      taskStatuses[taskId] = option.status;
      const earned = task.basePoints * option.pointsRatio;
      totalPoints += earned;
      domainPoints[task.domain] += earned;
    }
  }
  return { totalPoints, domainPoints, taskStatuses };
}

export function assignBand(totalPoints: number): Band {
  for (const { min, band } of BAND_THRESHOLDS) {
    if (totalPoints >= min) return band;
  }
  return "AT_RISK";
}

export function pctCompleteAtLevel(
  taskStatuses: Record<string, TaskStatus>,
  level: Level
): number {
  const levelTasks = TASK_POOL.filter(t => t.level === level);
  const complete = levelTasks.filter(t =>
    taskStatuses[t.id] === "Complete" || taskStatuses[t.id] === "NA"
  ).length;
  return Math.round((complete / levelTasks.length) * 100);
}

export function isLevelUnlocked(
  level: Level,
  taskStatuses: Record<string, TaskStatus>
): boolean {
  if (level === 1) return true;
  const previousLevel = (level - 1) as Level;
  return pctCompleteAtLevel(taskStatuses, previousLevel) >= LEVEL_UNLOCK_THRESHOLD[level];
}

export function rankDomainWeakness(
  domainPoints: Record<Domain, number>
): Record<Domain, number> {
  const domains: Domain[] = [
    "Digital", "Legal", "Financial", "Physical", "Communication", "Beliefs"
  ];
  const ranked = domains
    .map(d => ({
      domain: d,
      points: domainPoints[d],
      tieBreakIdx: TIE_BREAK_DOMAIN_ORDER.indexOf(d),
    }))
    .sort((a, b) => {
      if (a.points !== b.points) return a.points - b.points;
      return a.tieBreakIdx - b.tieBreakIdx;
    });
  const result: Record<Domain, number> = {} as any;
  ranked.forEach((item, idx) => { result[item.domain] = idx + 1; });
  return result;
}

export function buildPersonalizedPlan(
  taskStatuses: Record<string, TaskStatus>,
  domainPoints: Record<Domain, number>
): PersonalizedTask[] {
  const domainWeakness = rankDomainWeakness(domainPoints);

  const allTasks: PersonalizedTask[] = TASK_POOL.map(task => {
    const status = taskStatuses[task.id] || "NotStarted";
    const ratio = status === "Complete" ? 1 : status === "InProgress" ? 0.5 : 0;
    return {
      ...task,
      status,
      pointsEarned: task.basePoints * ratio,
      recommendedOrder: 0,
      unlocked: isLevelUnlocked(task.level, taskStatuses),
    };
  });

  const actionable = allTasks.filter(t =>
    t.status !== "Complete" && t.status !== "NA" && t.unlocked
  );

  actionable.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    if (b.basePoints !== a.basePoints) return b.basePoints - a.basePoints;
    return domainWeakness[a.domain] - domainWeakness[b.domain];
  });

  actionable.forEach((t, idx) => { t.recommendedOrder = idx + 1; });
  return actionable;
}

export function calculateScenarioReadiness(
  taskStatuses: Record<string, TaskStatus>
): Record<Scenario, number> {
  const result: Record<Scenario, number> = { D: 0, T: 0, LTC: 0 };
  for (const scenario of ["D", "T", "LTC"] as Scenario[]) {
    const relevant = TASK_POOL.filter(t => t.scenarioTags.includes(scenario));
    if (relevant.length === 0) continue;
    const complete = relevant.filter(t => taskStatuses[t.id] === "Complete").length;
    result[scenario] = Math.round((complete / relevant.length) * 100);
  }
  return result;
}

export function runQ40Assessment(userId: string, answers: Answer[]): AssessmentResult {
  const { totalPoints, domainPoints, taskStatuses } = scoreAssessment(answers);
  const band = assignBand(totalPoints);
  const plan = buildPersonalizedPlan(taskStatuses, domainPoints);
  const scenarioReadiness = calculateScenarioReadiness(taskStatuses);

  const domainBreakdown = {} as Record<Domain, { score: number; pctComplete: number }>;
  for (const d of ["Beliefs", "Communication", "Digital", "Financial", "Legal", "Physical"] as Domain[]) {
    const domainTasks = TASK_POOL.filter(t => t.domain === d);
    const maxPoints = domainTasks.reduce((sum, t) => sum + t.basePoints, 0);
    const completeCount = domainTasks.filter(t => taskStatuses[t.id] === "Complete").length;
    domainBreakdown[d] = {
      score: domainPoints[d],
      pctComplete: Math.round((completeCount / domainTasks.length) * 100),
    };
  }

  const weakestDomain = Object.entries(rankDomainWeakness(domainPoints))
    .find(([_, rank]) => rank === 1)![0] as Domain;

  const weakestLevel = ([1, 2, 3, 4] as Level[])
    .find(l => pctCompleteAtLevel(taskStatuses, l) < 100) || 4;

  return {
    userId,
    totalScore: Math.round(totalPoints),
    band,
    domainBreakdown,
    scenarioReadiness,
    weakestDomain,
    weakestLevel,
    personalizedPlan: plan,
    nextActions: plan.slice(0, 5),
  };
}
```

### 4.4 Critical Data Tables (Niki to Lock)

These two arrays are the entire knowledge base. Engine works the moment they're filled.

```typescript
export const QUESTIONS: Question[] = [
  // 40 entries. See Section 11 for the locked spec.
  // Example shape:
  {
    id: "Q1",
    domain: "Legal",
    text: "Do you have a Will and/or Trust that reflects your current wishes?",
    options: [
      { label: "Yes", value: "Y", status: "Complete", pointsRatio: 1 },
      { label: "In Progress", value: "IP", status: "InProgress", pointsRatio: 0.5 },
      { label: "No", value: "N", status: "NotStarted", pointsRatio: 0 },
      { label: "Don't know", value: "DK", status: "NotStarted", pointsRatio: 0 },
    ],
    mappedTaskIds: ["T16_LastWill"],
    scenarioRelevance: ["D", "T", "LTC"],
  },
  // ... 39 more
];

export const TASK_POOL: Task[] = [
  // 64 entries. Source: spreadsheet Project Plan tab + Deliverables tabs.
  // Example shape:
  {
    id: "T16_LastWill",
    name: "Last Will and Testament",
    description: "Executed Will designating executor, beneficiaries, guardianship, and asset distribution.",
    domain: "Legal",
    level: 1,
    priority: "StartHere",
    basePoints: 25,
    scenarioTags: ["D", "T", "LTC"],
    deliverableType: "Legal Doc",
    howTo: "Hire estate attorney OR use FreeWill.com. Sign + witness + notarize per state requirements. Store original with executor.",
  },
  // ... 63 more
];
```

---

## 5. State Shape (Zustand Store)

One store. Persist everything to localStorage. Sync to GHL on debounced change.

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // User identity
  user: {
    firstName: string;
    email: string;
    scenarioFocus: Scenario | "ALL";
  } | null;

  // Assessment phase
  answers: Record<string, string>;       // { Q1: "Y", Q2: "IP", ... }
  currentQuestionIndex: number;
  assessmentComplete: boolean;

  // Computed result (cached after each recompute)
  result: AssessmentResult | null;

  // Plan tracking - the persistent layer that makes Q40 a relationship product
  taskOverrides: Record<string, {
    status: TaskStatus;
    notes: string;
    completedAt: string | null;
    deliverableUrl?: string;             // P2: file uploads
  }>;

  // Actions
  setUser: (u: AppState['user']) => void;
  answerQuestion: (qId: string, value: string) => void;
  goToNextQuestion: () => void;
  completeAssessment: () => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, notes?: string) => void;
  recomputeResult: () => void;
  syncToGHL: () => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      answers: {},
      currentQuestionIndex: 0,
      assessmentComplete: false,
      result: null,
      taskOverrides: {},

      setUser: (u) => set({ user: u }),

      answerQuestion: (qId, value) => {
        const updated = { ...get().answers, [qId]: value };
        set({ answers: updated });
      },

      goToNextQuestion: () => {
        set({ currentQuestionIndex: get().currentQuestionIndex + 1 });
      },

      completeAssessment: () => {
        set({ assessmentComplete: true });
        get().recomputeResult();
        get().syncToGHL();
      },

      updateTaskStatus: (taskId, status, notes) => {
        const overrides = {
          ...get().taskOverrides,
          [taskId]: {
            status,
            notes: notes || get().taskOverrides[taskId]?.notes || '',
            completedAt: status === 'Complete' ? new Date().toISOString() : null,
          },
        };
        set({ taskOverrides: overrides });
        get().recomputeResult();
        get().syncToGHL();
      },

      recomputeResult: () => {
        const state = get();
        if (!state.user) return;
        // Merge original assessment answers with task overrides
        const effectiveStatuses = computeEffectiveStatuses(state.answers, state.taskOverrides);
        const result = runQ40AssessmentWithOverrides(
          state.user.email,
          state.answers,
          state.taskOverrides
        );
        set({ result });
      },

      syncToGHL: async () => {
        const state = get();
        if (!state.user || !state.result) return;
        await fetch(import.meta.env.VITE_GHL_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toGHLPayload(state)),
        });
      },

      reset: () => set({
        user: null, answers: {}, currentQuestionIndex: 0,
        assessmentComplete: false, result: null, taskOverrides: {},
      }),
    }),
    {
      name: 'endevo-q40-store',
      // Optional: key by email so multiple users on shared device don't collide
    }
  )
);
```

---

## 6. Component Tree

```
<App>
├── <Layout>                        // Header, brand chrome, footer
│   ├── <BrandHeader />             // Logo, "Live Fully. Die Ready." tagline
│   └── <Footer />                  // Privacy, contact, copyright
│
└── <Routes>
    │
    ├── /welcome  → <Welcome>
    │                ├── <NameEmailForm />
    │                ├── <ScenarioSelector />     // D / T / LTC / All
    │                └── <ResumeBanner />          // if returning user
    │
    ├── /assessment → <Assessment>
    │                ├── <DomainBanner />          // current domain section
    │                ├── <ProgressBar />           // "12 of 40"
    │                ├── <QuestionCard />          // single Q + options
    │                ├── <CelebrationMicrocopy />  // between domain groups
    │                └── <BackButton hidden />     // no back during quiz
    │
    ├── /results → <ResultsReveal>
    │                ├── <ScoreHero />             // "{score}/1000 · {band}"
    │                ├── <DomainRadar />           // 6-axis radar chart
    │                ├── <ScenarioBars />          // D/T/LTC % horizontal
    │                ├── <WhyThisPlan />           // band-specific copy
    │                ├── <Day1Preview />           // first task inline
    │                └── <CTAToDashboard />        // "See your full plan"
    │
    ├── /dashboard → <Dashboard>
    │                ├── <ScoreSummary />          // mini score + band badge
    │                ├── <NextActionsList />       // top 5 from engine
    │                │   └── <ActionCard />        // tap → Task Detail
    │                ├── <LevelProgress />         // L1→L4 vertical stepper
    │                ├── <DomainBreakdown />       // 6 domain bars
    │                ├── <ScenarioReadinessCard /> // D/T/LTC %
    │                └── <DownloadPDFButton />     // P1
    │
    └── /task/:id → <TaskDetail>
                     ├── <TaskHeader />            // name, level, priority, points
                     ├── <DescriptionBlock />
                     ├── <HowToContent />          // step-by-step
                     ├── <DeliverableInfo />       // what artifact gets created
                     ├── <StatusDropdown />        // NotStarted/InProgress/Complete/NA
                     ├── <NotesField />            // user's private notes
                     ├── <DeliverableUpload P2 />  // optional file upload
                     └── <BackToDashboard />
```

---

## 7. Track A Build Spec (Prototype for Demos)

**Goal:** Working demo Niki can show in pitches by Day 5. No real engine. No persistence. Hardcoded happy path.

### 7.1 Acceptance Criteria

- All 5 screens render with realistic content
- User can click through entire flow with one fixture user (e.g., "Sarah, 52, scenario: All")
- Results show plausible score (e.g., 487/1000, STARTING band)
- Dashboard shows 5 sample next actions and one example completed task
- Task Detail screen renders one fully populated task
- One sample PDF available for download (pre-rendered, not generated)
- Mobile responsive not required, but no horizontal scroll on desktop

### 7.2 Stub the Engine

```typescript
// q40-engine.stub.ts (Track A only)
export function runQ40Assessment(): AssessmentResult {
  return MOCK_RESULT_FIXTURE;  // see /fixtures/sample-result.json
}
```

### 7.3 What to Skip

- localStorage persistence
- GHL webhook
- Real PDF generation
- URL params
- Status update flow (read-only Task Detail)
- Domain radar (use static SVG image)
- Multi-user state

### 7.4 Time Budget: 5 Days

| Day | Deliverable |
|---|---|
| 1 | Welcome + Assessment screens (single fixture user, hardcoded answers replayed) |
| 2 | Results Reveal screen with static score + radar PNG |
| 3 | Dashboard with mock task cards |
| 4 | Task Detail screen + brand polish |
| 5 | Internal review with Niki, screen recording for pitch deck, sample PDF link |

---

## 8. Track B Build Spec (Production SaaS MVP)

**Goal:** Real users complete assessment, save plan, return to update task status, get GHL emails.

### 8.1 Acceptance Criteria

- Engine produces correct score for the 3 test fixtures in Section 12
- Score updates in real time as user marks tasks complete on Dashboard
- localStorage persists across page reloads and browser sessions
- GHL webhook fires on assessment complete + every task status change
- Mobile usable at 375px width
- PDF generation works on mobile Safari + Chrome
- All 40 questions render with correct mapping
- Level-gating enforces L1→L2→L3→L4 progression

### 8.2 Build Sequence

| Priority | Task | Hours |
|---|---|---|
| P0 | Drop in `q40-engine.ts` and lock 40 Qs + 64 Tasks | 4 |
| P0 | Zustand store with persist middleware | 3 |
| P0 | Welcome + Assessment screens (port from Q12) | 8 |
| P0 | Results Reveal screen | 4 |
| P0 | Dashboard with NextActionsList | 6 |
| P0 | Task Detail screen with status updates | 5 |
| P0 | GHL webhook integration | 2 |
| P0 | Mobile responsive polish | 4 |
| P1 | Domain radar + scenario bars (recharts or d3) | 5 |
| P1 | PDF export of full plan | 8 |
| P2 | Deliverable file uploads | 6 |
| P2 | Stakeholder registry screen | 6 |
| P2 | Multi-device auth via Supabase | 12 |

**P0 total: 36 hours. Shippable in 2 weeks of focused dev.**

### 8.3 Tech Stack

```
React 18 + Vite                  // matches Q12 stack
TypeScript                       // engine types are non-negotiable
Zustand + persist middleware     // state + localStorage
React Router v6                  // 5 routes
Tailwind CSS                     // matches existing brand system
shadcn/ui                        // accessible components, free
React Hook Form                  // task notes form
Recharts                         // domain radar + scenario bars
React PDF (renderer)             // P1: client-side PDF generation
```

No backend in v1. localStorage + GHL webhook is enough for first 100 paying users. Add Supabase only when someone complains about losing their plan on a new device.

---

## 9. UI/UX Rules

### Assessment Flow

1. **One question per screen.** Mobile-first. Large tap targets.
2. **Progress bar persistent at top:** "12 of 40"
3. **Domain section headers** between groups:
   - Before Q1: "Beliefs (3 questions)"
   - Before Q4: "Communication (8 questions)"
   - Before Q12: "Digital (6 questions)"
   - Before Q18: "Financial (8 questions)"
   - Before Q26: "Legal (10 questions)"
   - Before Q36: "Physical (5 questions)"
   - (Niki to confirm exact distribution in Section 11)
4. **Celebration microcopy** between domain groups: "Beliefs section done. 37 to go."
5. **No back button during quiz** (reduces abandonment)
6. **Auto-advance** on answer selection (no Next button)
7. **Save state every answer** to localStorage (resume mid-quiz)

### Dashboard Rules

1. **Score is hero.** Big number. Band badge. Domain radar below.
2. **Next actions = top 5 only.** Do not overwhelm. "See full plan" link to expand.
3. **Each action card shows:** title, time estimate, level/priority badge, domain icon.
4. **Tap action card → Task Detail.**
5. **Level progress is vertical stepper.** Show locked levels grayed with unlock condition.
6. **Returning user lands here.** Welcome screen only on first visit per device.

### Task Detail Rules

1. **Status dropdown is the primary action.** Big, obvious, top of screen.
2. **On status change to Complete:** confetti micro-animation + return to Dashboard with score updated.
3. **Notes field** is optional, autosaves on blur.
4. **How-To content** rendered as markdown for rich formatting.
5. **No "Mark as Started" button.** Status dropdown handles all transitions.

### Brand

- Palette: Ink #0D0D0F, Paper #F7F4EF, Bone #EDE8DF, Red #B8341B, Gold #C9A84C
- Typography: Cormorant Garamond (headings), DM Sans (body), DM Mono (data labels)
- Tagline always visible in footer: "Live Fully. Die Ready."
- Tone: Direct. Bold. Mission-forward. Not grief-forward. No em dashes anywhere in UI copy.

---

## 10. GHL Webhook Payload Contract

POST to `VITE_GHL_WEBHOOK_URL` on (1) assessment complete, (2) every task status change.

```json
{
  "event_type": "assessment_complete | task_updated",
  "first_name": "Sarah",
  "email": "sarah@example.com",
  "scenario_focus": "ALL",
  "total_score": 487,
  "max_score": 1000,
  "band": "STARTING",
  "weakest_domain": "Legal",
  "weakest_level": 1,
  "domain_breakdown": {
    "Beliefs": { "score": 12, "pctComplete": 33 },
    "Communication": { "score": 25, "pctComplete": 27 },
    "Digital": { "score": 80, "pctComplete": 55 },
    "Financial": { "score": 95, "pctComplete": 47 },
    "Legal": { "score": 175, "pctComplete": 38 },
    "Physical": { "score": 100, "pctComplete": 60 }
  },
  "scenario_readiness": {
    "D": 41,
    "T": 39,
    "LTC": 35
  },
  "next_5_actions": [
    { "task_id": "T16_LastWill", "name": "Last Will and Testament", "level": 1, "priority": "StartHere" }
  ],
  "completed_tasks": ["T03_PhoneLegacyContact", "T11_DigitalLegacyDirective"],
  "level_completion": { "L1": 45, "L2": 0, "L3": 0, "L4": 0 },
  "completed_at": "2026-04-28T14:30:00.000Z",
  "last_activity_at": "2026-04-28T14:30:00.000Z"
}
```

### GHL Tags to Apply

- Primary band: `Q40_AT_RISK` / `Q40_STARTING` / `Q40_PREPARED` / `Q40_PROTECTED` / `Q40_LEGACY_READY`
- Weakest domain: `Q40_WEAKEST_LEGAL` / `_DIGITAL` / `_FINANCIAL` / `_PHYSICAL` / `_BELIEFS` / `_COMMUNICATION`
- Engagement: `Q40_ACTIVE` (any task update in last 14 days), `Q40_DORMANT` (no activity 30+ days)

---

## 11. Open Items Niki Must Lock Before P0 Sprint

These are blockers for Track B. Track A can proceed with placeholder data.

### 11.1 The 40 Questions

Niki: lock all 40 questions in the same format as Q12. Need:

- Question text
- Domain assignment
- Answer options + values + status mapping + points ratio
- Mapped task IDs (1-3 per question)
- Scenario relevance (D / T / LTC)

**Suggested distribution (Niki to confirm):**
- Beliefs: 3 questions
- Communication: 8 questions
- Digital: 6 questions
- Financial: 8 questions
- Legal: 10 questions
- Physical: 5 questions
- **Total: 40**

### 11.2 The 64 Tasks

Already exist in spreadsheet. Need:

- Stable task IDs (T01-T64)
- `howTo` field for Task Detail rendering
- `scenarioTags` array per task
- Confirm priority assignments (Start Here / Critical / High / Medium / Low)

### 11.3 The Question-to-Task Map

For each of 40 questions, list which task IDs it controls. Spreadsheet shows this for Q12 (Maps To column). Need same for full Q40.

### 11.4 Partial Credit Rule

Spreadsheet implies binary (complete or not). Engine defaults to 0.5 for InProgress. **Niki to confirm:** does "In Progress" earn 50% of basePoints, or 0% until Complete?

### 11.5 Level-Gating Enforcement

Spreadsheet says "Complete 80% of L2 unlocks L3."

- Hard gate (truly hidden until unlocked) or
- Soft gate (visible but grayed with unlock messaging)?

Recommendation: **soft gate.** Better UX. Users see what's coming, builds anticipation.

### 11.6 Pricing + Conversion Path

What's the B2C price for Q40? What's the Stripe / invoicing flow? Does the user pay before answering, or after seeing teaser results?

---

## 12. Testing Checklist

### Engine Tests (Track B)

- [ ] All 40 questions render with correct options
- [ ] Score calculation matches expected for 3 test fixtures (AT_RISK / PREPARED / LEGACY_READY)
- [ ] Band thresholds correct at boundary values (249/250, 499/500, 749/750, 899/900)
- [ ] Level-gating: L2 stays locked until L1 = 100%
- [ ] Level-gating: L3 stays locked until L2 >= 80%
- [ ] Tie-break order respected for equal-weakness domains
- [ ] Domain percentages round to integers
- [ ] Marking task Complete on Dashboard updates score in real time
- [ ] Marking task back to NotStarted reduces score correctly
- [ ] Same task ID controlled by multiple Qs uses last-write-wins

### UX Tests

- [ ] Progress bar updates correctly through 40 questions
- [ ] Domain banners appear at correct question indices
- [ ] Auto-advance works on selection (no Next button needed)
- [ ] localStorage survives page refresh mid-quiz
- [ ] localStorage survives browser close/reopen
- [ ] Returning user lands on Dashboard, not Welcome
- [ ] PDF downloads on mobile Safari
- [ ] PDF downloads on mobile Chrome
- [ ] All copy renders without em dashes (regex test)
- [ ] All emoji removed from UI copy unless explicitly approved by Niki

### GHL Tests

- [ ] assessment_complete event fires with full payload
- [ ] task_updated event fires on every status change
- [ ] Webhook receives correct band
- [ ] Webhook receives correct weakest_domain
- [ ] Tags applied correctly in GHL
- [ ] Email sequence triggers on tag apply

---

## 13. What NOT to Build in v1 (Either Track)

- No user login / auth (email + localStorage is enough)
- No Claude API or AI generation anywhere
- No collaborative editing (single user only)
- No notifications/reminders in app (GHL handles email cadence)
- No survivor roadmap view (executor-facing product, future release)
- No stakeholder registry in v1 (spreadsheet does this today)
- No payment integration in app (Stripe checkout happens before /welcome)
- No multi-language support
- No dark mode

---

## 14. Q12 → Q40 Handoff (Important)

When a Q12 user upgrades to Q40, carry their 12 answers forward. The Q40 app should:

1. Detect URL param: `?from=q12&token=xxx`
2. Fetch Q12 answers from GHL custom fields via webhook
3. Pre-fill the matching 12 questions (Q1-Q12 if mapping is 1:1)
4. Skip directly to question 13 in the Assessment flow
5. Show banner: "Welcome back. We've kept your previous answers. 28 questions to go."

This is critical for conversion. Removing friction at the paywall = higher conversion.

---

## 15. Handoff Summary

**Track A (Prototype) ships in 5 days.**
**Track B (Production MVP) ships in 2-3 weeks once Niki locks the 40 Qs + question-task map.**

The engine is fully specified above. Drop it in. Wire to UI. Sync to GHL. Ship.

No external dependencies on AI, auth, or payment for v1. Same architectural discipline that made Q12 cheap and reliable.

---

**Live Fully. Die Ready.**

Niki Weiss, Founder & CEO, ENDevo
endevo.life | finalplaybook.com | linkedin.com/in/nikiweiss
