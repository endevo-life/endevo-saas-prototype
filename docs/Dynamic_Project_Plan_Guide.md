# Dynamic Project Management Plan for Employees
## GitHub Copilot Implementation Guide

---

## 1. WHAT IS THE "PROJECT PLAN"?

The employee's "project plan" is **NOT** traditional project management. It's a **personalized legacy readiness learning journey** that:

- Is generated dynamically from their Peace of Mind Assessment answers
- Shows a checklist of modules/tasks they need to complete
- Tracks progress through educational content
- Adapts based on what they already have vs. what they need
- Provides a clear path from "unprepared" to "prepared"

**Think of it as:** Duolingo for end-of-life planning, not Asana for tasks.

---

## 2. HOW IT WORKS (THE LOGIC)

### Step 1: Employee Takes Assessment
```
10 questions asking:
- Do you have a will? (Yes/No)
- Do you have a trust? (Yes/No)
- Have you assigned beneficiaries? (Yes/No)
- Do you have power of attorney? (Yes/No)
- Have you documented end-of-life preferences? (Yes/No)
- Do you have emergency contacts documented? (Yes/No)
- Have you organized digital accounts/passwords? (Yes/No)
- Do you know about estate planning basics? (Yes/No)
- Have you discussed your wishes with family? (Yes/No)
- Do you understand your employer benefits related to this? (Yes/No)
```

### Step 2: System Calculates Readiness Score
```typescript
// Simple formula
const totalQuestions = 10;
const yesAnswers = assessment.filter(a => a.answer === 'yes').length;
const readinessScore = Math.round((yesAnswers / totalQuestions) * 100);

// Result: 0-100% score
// 0-25% = "Just Starting"
// 26-50% = "Making Progress"
// 51-75% = "Nearly There"
// 76-100% = "Well Prepared"
```

### Step 3: System Assigns Modules Based on Gaps
```typescript
// CRITICAL: Only assign modules for what they DON'T have

const moduleAssignmentRules = {
  'wills-and-trusts': {
    assignIf: (assessment) => 
      assessment['has-will'] === 'no' || 
      assessment['has-trust'] === 'no',
    priority: 1
  },
  'beneficiary-designation': {
    assignIf: (assessment) => 
      assessment['assigned-beneficiaries'] === 'no',
    priority: 2
  },
  'power-of-attorney': {
    assignIf: (assessment) => 
      assessment['has-poa'] === 'no',
    priority: 3
  },
  'end-of-life-preferences': {
    assignIf: (assessment) => 
      assessment['documented-preferences'] === 'no',
    priority: 4
  },
  'digital-legacy': {
    assignIf: (assessment) => 
      assessment['organized-digital'] === 'no',
    priority: 5
  },
  'emergency-contacts': {
    assignIf: (assessment) => 
      assessment['emergency-contacts'] === 'no',
    priority: 6
  },
  'family-communication': {
    assignIf: (assessment) => 
      assessment['discussed-with-family'] === 'no',
    priority: 7
  },
  'employer-benefits': {
    assignIf: (assessment) => 
      assessment['understands-benefits'] === 'no',
    priority: 8
  }
};

// Example: Employee answers "no" to 6 questions
// Result: They get 6 modules assigned (not all 8)
```

### Step 4: Create Learning Path with Prerequisites
```typescript
// Some modules should be completed in order
const prerequisites = {
  'advanced-estate-planning': ['wills-and-trusts'],
  'trust-funding': ['wills-and-trusts'],
  'digital-asset-protection': ['digital-legacy']
};

// Module is "locked" until prerequisite is completed
```

---

## 3. DATABASE SCHEMA

### Tables Needed

```sql
-- Assessment questions
CREATE TABLE assessment_questions (
  id SERIAL PRIMARY KEY,
  question_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'has-will'
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  help_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee assessment answers
CREATE TABLE employee_assessments (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES assessment_questions(id),
  answer VARCHAR(10) NOT NULL CHECK (answer IN ('yes', 'no', 'unsure')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, question_id)
);

-- Enable RLS
ALTER TABLE employee_assessments ENABLE ROW LEVEL SECURITY;

-- RLS: Employees only see their own
CREATE POLICY employee_assessments_isolation ON employee_assessments
  FOR ALL
  TO authenticated_user
  USING (employee_id = auth.employee_id());

-- Learning modules (master list)
CREATE TABLE learning_modules (
  id SERIAL PRIMARY KEY,
  module_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'wills-and-trusts'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_minutes INTEGER NOT NULL,
  video_url TEXT,
  content_markdown TEXT, -- Educational content
  reflection_prompts JSONB, -- ["What did you learn?", "What will you do next?"]
  module_order INTEGER NOT NULL,
  is_core BOOLEAN DEFAULT true, -- Core vs optional
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module prerequisites
CREATE TABLE module_prerequisites (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
  prerequisite_module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
  UNIQUE(module_id, prerequisite_module_id)
);

-- Employee learning path (dynamically assigned)
CREATE TABLE employee_learning_paths (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  status VARCHAR(20) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'locked')),
  UNIQUE(employee_id, module_id)
);

-- Enable RLS
ALTER TABLE employee_learning_paths ENABLE ROW LEVEL SECURITY;

-- RLS: Employees only see their own path
CREATE POLICY employee_learning_paths_isolation ON employee_learning_paths
  FOR ALL
  TO authenticated_user
  USING (employee_id = auth.employee_id());

-- Employee notes/reflections on modules
CREATE TABLE employee_notes (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_notes ENABLE ROW LEVEL SECURITY;

-- RLS: Employees only see their own notes
CREATE POLICY employee_notes_isolation ON employee_notes
  FOR ALL
  TO authenticated_user
  USING (employee_id = auth.employee_id());
```

---

## 4. CORE FUNCTIONS

### Function: Assign Modules from Assessment

```sql
CREATE OR REPLACE FUNCTION assign_modules_from_assessment(
  p_employee_id INTEGER
) RETURNS VOID AS $$
DECLARE
  v_assessment_answers JSONB;
  v_module RECORD;
BEGIN
  -- Get all assessment answers as JSON
  SELECT jsonb_object_agg(
    aq.question_key, 
    ea.answer
  ) INTO v_assessment_answers
  FROM employee_assessments ea
  JOIN assessment_questions aq ON ea.question_id = aq.id
  WHERE ea.employee_id = p_employee_id;

  -- Delete existing learning path (fresh start)
  DELETE FROM employee_learning_paths 
  WHERE employee_id = p_employee_id;

  -- Assign modules based on "no" answers
  -- Module: Wills & Trusts
  IF (v_assessment_answers->>'has-will' = 'no' OR v_assessment_answers->>'has-trust' = 'no') THEN
    INSERT INTO employee_learning_paths (employee_id, module_id, status)
    SELECT p_employee_id, id, 'not-started'
    FROM learning_modules WHERE module_key = 'wills-and-trusts';
  END IF;

  -- Module: Beneficiary Designation
  IF v_assessment_answers->>'assigned-beneficiaries' = 'no' THEN
    INSERT INTO employee_learning_paths (employee_id, module_id, status)
    SELECT p_employee_id, id, 'not-started'
    FROM learning_modules WHERE module_key = 'beneficiary-designation';
  END IF;

  -- Module: Power of Attorney
  IF v_assessment_answers->>'has-poa' = 'no' THEN
    INSERT INTO employee_learning_paths (employee_id, module_id, status)
    SELECT p_employee_id, id, 'not-started'
    FROM learning_modules WHERE module_key = 'power-of-attorney';
  END IF;

  -- Module: End-of-Life Preferences
  IF v_assessment_answers->>'documented-preferences' = 'no' THEN
    INSERT INTO employee_learning_paths (employee_id, module_id, status)
    SELECT p_employee_id, id, 'not-started'
    FROM learning_modules WHERE module_key = 'end-of-life-preferences';
  END IF;

  -- Module: Digital Legacy
  IF v_assessment_answers->>'organized-digital' = 'no' THEN
    INSERT INTO employee_learning_paths (employee_id, module_id, status)
    SELECT p_employee_id, id, 'not-started'
    FROM learning_modules WHERE module_key = 'digital-legacy';
  END IF;

  -- Module: Emergency Contacts
  IF v_assessment_answers->>'emergency-contacts' = 'no' THEN
    INSERT INTO employee_learning_paths (employee_id, module_id, status)
    SELECT p_employee_id, id, 'not-started'
    FROM learning_modules WHERE module_key = 'emergency-contacts';
  END IF;

  -- Module: Family Communication
  IF v_assessment_answers->>'discussed-with-family' = 'no' THEN
    INSERT INTO employee_learning_paths (employee_id, module_id, status)
    SELECT p_employee_id, id, 'not-started'
    FROM learning_modules WHERE module_key = 'family-communication';
  END IF;

  -- Module: Employer Benefits
  IF v_assessment_answers->>'understands-benefits' = 'no' THEN
    INSERT INTO employee_learning_paths (employee_id, module_id, status)
    SELECT p_employee_id, id, 'not-started'
    FROM learning_modules WHERE module_key = 'employer-benefits';
  END IF;

  -- Mark modules with unmet prerequisites as 'locked'
  UPDATE employee_learning_paths elp
  SET status = 'locked'
  FROM module_prerequisites mp
  WHERE elp.employee_id = p_employee_id
    AND elp.module_id = mp.module_id
    AND NOT EXISTS (
      SELECT 1 
      FROM employee_learning_paths elp2
      WHERE elp2.employee_id = p_employee_id
        AND elp2.module_id = mp.prerequisite_module_id
        AND elp2.status = 'completed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Function: Calculate Readiness Score

```sql
CREATE OR REPLACE FUNCTION calculate_readiness_score(
  p_employee_id INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_total_questions INTEGER;
  v_yes_answers INTEGER;
  v_score INTEGER;
BEGIN
  -- Count total questions
  SELECT COUNT(*) INTO v_total_questions
  FROM assessment_questions;

  -- Count "yes" answers
  SELECT COUNT(*) INTO v_yes_answers
  FROM employee_assessments
  WHERE employee_id = p_employee_id
    AND answer = 'yes';

  -- Calculate percentage
  IF v_total_questions > 0 THEN
    v_score := ROUND((v_yes_answers::NUMERIC / v_total_questions) * 100);
  ELSE
    v_score := 0;
  END IF;

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Function: Get Employee Dashboard Data

```sql
CREATE OR REPLACE FUNCTION get_employee_dashboard(
  p_employee_id INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'readiness_score', calculate_readiness_score(p_employee_id),
    'total_modules', COUNT(*),
    'completed_modules', COUNT(*) FILTER (WHERE status = 'completed'),
    'in_progress_modules', COUNT(*) FILTER (WHERE status = 'in-progress'),
    'not_started_modules', COUNT(*) FILTER (WHERE status = 'not-started'),
    'locked_modules', COUNT(*) FILTER (WHERE status = 'locked'),
    'total_time_spent_minutes', COALESCE(SUM(time_spent_minutes), 0),
    'modules', jsonb_agg(
      jsonb_build_object(
        'id', lm.id,
        'title', lm.title,
        'description', lm.description,
        'estimated_minutes', lm.estimated_minutes,
        'status', elp.status,
        'progress_percentage', elp.progress_percentage,
        'time_spent_minutes', elp.time_spent_minutes,
        'module_order', lm.module_order,
        'is_locked', (elp.status = 'locked'),
        'has_prerequisites', EXISTS(
          SELECT 1 FROM module_prerequisites mp 
          WHERE mp.module_id = lm.id
        )
      ) ORDER BY lm.module_order
    )
  ) INTO v_result
  FROM employee_learning_paths elp
  JOIN learning_modules lm ON elp.module_id = lm.id
  WHERE elp.employee_id = p_employee_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. GITHUB COPILOT PROMPTS

### Prompt 1: Create Assessment Submission Handler
```
Create a TypeScript Express endpoint POST /api/employee/assessment/submit that:
1. Accepts an array of assessment answers with question_id and answer
2. Validates the employee is authenticated (req.session.employeeId)
3. Saves answers to employee_assessments table (upsert on conflict)
4. Calls the assign_modules_from_assessment() PostgreSQL function
5. Calculates readiness score using calculate_readiness_score()
6. Returns JSON with readiness_score, modules_assigned count, and success message
7. Uses proper error handling with try-catch
8. Returns 401 if not authenticated, 500 on database errors
```

### Prompt 2: Build ModuleCard Component
```
Create a React TypeScript component ModuleCard that displays a learning module with:
- Props: module object (id, title, description, estimated_minutes, status, progress_percentage, time_spent_minutes, is_locked, has_prerequisites), onClick handler
- Visual states:
  * Locked: grayed out, lock icon, cursor-not-allowed, shows prerequisite message
  * Not started: white background, clickable, clock icon with estimated time
  * In progress: blue accent, progress bar showing percentage, animated icon
  * Completed: green background, checkmark icon, shows time invested
- Hover effects on clickable cards (shadow, border color change)
- Tailwind CSS for styling
- TypeScript interfaces for props
```

### Prompt 3: Create Progress Tracking Function
```
Create a TypeScript function trackModuleProgress that:
1. Accepts moduleId, currentTimeInSeconds, totalDurationInSeconds
2. Calculates progress_percentage (currentTime / totalDuration * 100)
3. Determines status: "in-progress" if < 95%, "completed" if >= 95%
4. Calls PUT /api/employee/modules/:moduleId/progress with:
   - progress_percentage
   - time_spent_minutes (converted from seconds)
   - status
5. Returns the response data
6. Uses axios for HTTP requests
7. Handles errors with console.error and returns null on failure
```

### Prompt 4: Build Readiness Score Display
```
Create a React component ReadinessScoreCard that:
- Displays a circular progress ring showing readiness score 0-100%
- Uses SVG for the circular progress (strokeDasharray/strokeDashoffset)
- Shows score as large number in center with "% Ready" label
- Color codes the ring:
  * 0-25% = Red (#EF4444)
  * 26-50% = Orange (#F97316)
  * 51-75% = Yellow (#EAB308)
  * 76-100% = Green (#10B981)
- Animates the ring on mount using CSS transitions
- Shows status text below: "Just Starting", "Making Progress", "Nearly There", "Well Prepared"
- TypeScript with interface for props (score: number)
```

---

## 6. KEY PRINCIPLES

### **Privacy First**
- HR can see "John completed 4/6 modules" but NOT "John doesn't have a will"
- Assessment answers are private to employee
- Notes/reflections are private to employee

### **Dynamic, Not Static**
- NO hardcoded checklist for all employees
- Path is generated from assessment
- Modules assigned only for gaps, not everything

### **Education, Not Execution**
- We teach ABOUT wills, we don't create wills
- No document uploads
- No legal/financial advice
- Focus on awareness and preparation

---

## 7. WHAT SUCCESS LOOKS LIKE

**Employee Experience:**
1. Takes 10-question assessment (2 minutes)
2. Sees readiness score and personalized learning path
3. Completes modules one by one (6 hours total over 2-4 weeks)
4. Writes reflections on learnings
5. Exports progress as PDF
6. Feels prepared, not overwhelmed

**HR Experience:**
1. Sees organization-level engagement metrics
2. Sees individual employee progress (not content)
3. Can send reminders to employees who haven't started
4. Reports to leadership on program adoption

---

## FINAL NOTES FOR GITHUB COPILOT

When building this system, always remember:

✅ **DO:**
- Assign modules based on assessment gaps
- Track progress with percentage + time
- Use RLS for data isolation
- Show locked modules with prerequisites
- Focus on education and awareness
- Export progress for portability

❌ **DON'T:**
- Store documents or PII
- Give legal/financial advice
- Show assessment answers to HR
- Assume all employees get all modules
- Make it feel like homework or tasks
- Require completion to "pass"

This is **Duolingo for legacy planning**, not Asana for legal tasks.

**Start with:** Assessment → Path Generation → Dashboard Display → Module Detail → Progress Tracking

**End with:** A system that makes employees feel prepared, not judged.
