# ENDevo MVP - Complete Technical Specification
## B2B SaaS Platform for Employee Legacy Readiness

**Version:** 1.0  
**Date:** February 4, 2026  
**Document Purpose:** Full UI/UX and technical specification for GitHub Copilot implementation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Design System](#design-system)
3. [Database Schema](#database-schema)
4. [Application Structure](#application-structure)
5. [Screen Specifications](#screen-specifications)
6. [Component Library](#component-library)
7. [API Endpoints](#api-endpoints)
8. [Implementation Guidelines](#implementation-guidelines)

---

## 1. Project Overview

### 1.1 Product Definition

ENDevo is a B2B SaaS platform that provides **employee legacy readiness education** through HR benefit programs.

**Core Focus:**
- Education-first approach (NOT document storage)
- Privacy-by-design architecture
- Progress tracking without content visibility
- Multi-tenant SaaS with logical tenant isolation

**What ENDevo IS:**
- Self-paced learning management system
- Guided checklist-based progress tracker
- HR dashboard for aggregate metrics
- Risk assessment tool

**What ENDevo IS NOT:**
- Document storage system (no uploads)
- Legal/financial/medical advice platform
- Grief counseling service
- Executor/estate management tool

### 1.2 User Roles

```
┌─────────────────┐
│  Super Admin    │ → ENDevo platform administrator
│  (ENDevo Team)  │    Manages all organizations
└─────────────────┘

┌─────────────────┐
│   HR Admin      │ → Organization administrator
│  (Employer)     │    Views aggregate metrics only
└─────────────────┘

┌─────────────────┐
│   Employee      │ → End user
│  (Learner)      │    Owns their learning journey
└─────────────────┘
```

### 1.3 MVP Success Criteria

**Goal:** Validate that companies will offer this as a benefit and employees will engage.

**Success Metrics:**
- 3 paying customers (25-100 employees each)
- 60%+ enrollment rate per organization
- 30%+ completion rate within 90 days
- HR satisfaction score 8/10+

**MVP Scope (8-week timeline):**
- ✅ Authentication & organization management
- ✅ Peace of Mind Assessment (10 questions)
- ✅ 4-6 learning modules (video + text)
- ✅ Progress tracking (employee + HR views)
- ✅ Email notifications
- ✅ PDF export (progress summary)
- ❌ Document upload (post-MVP)
- ❌ AI chatbot (post-MVP)
- ❌ Mobile app (post-MVP)

---

## 2. Design System

### 2.1 Color Palette

```css
/* Primary Colors */
--color-primary-600: #2563EB;    /* Main brand blue */
--color-primary-500: #3B82F6;    /* Hover states */
--color-primary-50:  #EFF6FF;    /* Light backgrounds */

/* Secondary Colors */
--color-orange-500: #F97316;     /* CTAs, progress */
--color-orange-100: #FFEDD5;     /* Progress backgrounds */

/* Neutrals */
--color-gray-900: #111827;       /* Primary text */
--color-gray-700: #374151;       /* Secondary text */
--color-gray-600: #4B5563;       /* Tertiary text */
--color-gray-500: #6B7280;       /* Disabled text */
--color-gray-400: #9CA3AF;       /* Borders, dividers */
--color-gray-300: #D1D5DB;       /* Input borders */
--color-gray-200: #E5E7EB;       /* Subtle borders */
--color-gray-100: #F3F4F6;       /* Page backgrounds */
--color-gray-50:  #F9FAFB;       /* Card backgrounds */
--color-white:    #FFFFFF;       /* Pure white */

/* Status Colors */
--color-success-600: #059669;    /* Success text */
--color-success-500: #10B981;    /* Success primary */
--color-success-50:  #ECFDF5;    /* Success background */

--color-warning-600: #D97706;    /* Warning text */
--color-warning-500: #F59E0B;    /* Warning primary */
--color-warning-50:  #FFFBEB;    /* Warning background */

--color-error-600: #DC2626;      /* Error text */
--color-error-500: #EF4444;      /* Error primary */
--color-error-50:  #FEF2F2;      /* Error background */
```

### 2.2 Typography

```css
/* Font Family */
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 
               'Segoe UI', Roboto, sans-serif;

/* Font Sizes */
--text-xs:   12px;  /* Captions, badges */
--text-sm:   14px;  /* Secondary text, labels */
--text-base: 16px;  /* Body text (default) */
--text-lg:   18px;  /* Important body text */
--text-xl:   20px;  /* Subheadings */
--text-2xl:  24px;  /* Section headers */
--text-3xl:  32px;  /* Page titles */
--text-4xl:  36px;  /* Hero text */
--text-5xl:  48px;  /* Display text (stats) */

/* Font Weights */
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;

/* Line Heights */
--leading-tight:  1.2;   /* Headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Long-form content */
```

### 2.3 Spacing Scale

```css
--spacing-0:   0px;
--spacing-1:   4px;
--spacing-2:   8px;
--spacing-3:   12px;
--spacing-4:   16px;
--spacing-5:   20px;
--spacing-6:   24px;
--spacing-8:   32px;
--spacing-10:  40px;
--spacing-12:  48px;
--spacing-16:  64px;
--spacing-20:  80px;
--spacing-24:  96px;
```

### 2.4 Border Radius

```css
--radius-none: 0px;
--radius-sm:   4px;   /* Small elements */
--radius-md:   8px;   /* Buttons, inputs */
--radius-lg:   12px;  /* Cards */
--radius-xl:   16px;  /* Large cards */
--radius-2xl:  24px;  /* Modals */
--radius-full: 9999px; /* Pills, avatars */
```

### 2.5 Shadows

```css
--shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1), 
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1), 
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### 2.6 Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm:  640px;   /* Tablets */
--breakpoint-md:  768px;   /* Small laptops */
--breakpoint-lg:  1024px;  /* Desktops */
--breakpoint-xl:  1280px;  /* Large desktops */
--breakpoint-2xl: 1536px;  /* Extra large */
```

---

## 3. Database Schema

### 3.1 PostgreSQL Schema with Row-Level Security

```sql
-- ============================================
-- CORE TABLES
-- ============================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#2563EB',
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'suspended', 'trial')),
    subscription_tier VARCHAR(20) DEFAULT 'basic',
    employee_limit INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL 
        REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    employee_identifier VARCHAR(50),
    role VARCHAR(20) DEFAULT 'employee' 
        CHECK (role IN ('employee', 'hr_admin')),
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'left_company')),
    onboarded_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

CREATE INDEX idx_employees_org_id ON employees(organization_id);
CREATE INDEX idx_employees_email ON employees(email);

CREATE TABLE learning_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    module_order INTEGER NOT NULL,
    estimated_hours DECIMAL(3, 1) DEFAULT 0.5,
    is_required BOOLEAN DEFAULT false,
    content_type VARCHAR(50) DEFAULT 'video_text',
    thumbnail_url TEXT,
    video_url TEXT,
    content_text TEXT,
    status VARCHAR(20) DEFAULT 'published' 
        CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE module_prerequisites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL 
        REFERENCES learning_modules(id) ON DELETE CASCADE,
    prerequisite_module_id UUID NOT NULL 
        REFERENCES learning_modules(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module_id, prerequisite_module_id)
);

CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    question_type VARCHAR(50) DEFAULT 'single_choice',
    options JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMPLOYEE DATA (RLS PROTECTED)
-- ============================================

CREATE TABLE employee_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL 
        REFERENCES employees(id) ON DELETE CASCADE,
    assessment_data JSONB NOT NULL,
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 10),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employee_learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL 
        REFERENCES employees(id) ON DELETE CASCADE,
    module_id UUID NOT NULL 
        REFERENCES learning_modules(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'assigned' 
        CHECK (status IN ('assigned', 'in_progress', 'completed', 'skipped')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    progress_percentage INTEGER DEFAULT 0 
        CHECK (progress_percentage BETWEEN 0 AND 100),
    time_spent_minutes INTEGER DEFAULT 0,
    UNIQUE(employee_id, module_id)
);

CREATE INDEX idx_learning_path_employee 
    ON employee_learning_paths(employee_id);
CREATE INDEX idx_learning_path_status 
    ON employee_learning_paths(employee_id, status);

CREATE TABLE employee_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL 
        REFERENCES employees(id) ON DELETE CASCADE,
    module_id UUID REFERENCES learning_modules(id) ON DELETE SET NULL,
    note_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW-LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE employee_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY employee_own_assessment ON employee_assessments
    FOR ALL TO authenticated
    USING (employee_id = current_setting('app.current_employee_id')::UUID);

CREATE POLICY employee_own_learning_path ON employee_learning_paths
    FOR ALL TO authenticated
    USING (employee_id = current_setting('app.current_employee_id')::UUID);

CREATE POLICY employee_own_notes ON employee_notes
    FOR ALL TO authenticated
    USING (employee_id = current_setting('app.current_employee_id')::UUID);

-- ============================================
-- HR VIEWS (AGGREGATED DATA ONLY)
-- ============================================

CREATE VIEW hr_employee_progress AS
SELECT 
    e.id AS employee_id,
    e.organization_id,
    e.employee_identifier,
    e.first_name,
    e.onboarded_at,
    e.last_login_at,
    CASE 
        WHEN COUNT(elp.id) = 0 THEN 'not_started'
        WHEN COUNT(CASE WHEN elp.status = 'completed' END) = COUNT(elp.id) 
            THEN 'completed'
        ELSE 'in_progress'
    END AS overall_status,
    COUNT(elp.id) AS total_modules_assigned,
    COUNT(CASE WHEN elp.status = 'completed' END) AS modules_completed,
    COALESCE(
        ROUND((COUNT(CASE WHEN elp.status = 'completed' END)::DECIMAL / 
               NULLIF(COUNT(elp.id), 0)) * 100), 0
    ) AS progress_percentage,
    SUM(COALESCE(elp.time_spent_minutes, 0)) AS total_time_spent_minutes,
    MAX(elp.completed_at) AS last_activity_date
FROM employees e
LEFT JOIN employee_learning_paths elp ON e.id = elp.employee_id
WHERE e.role = 'employee' AND e.status = 'active'
GROUP BY e.id, e.organization_id, e.employee_identifier, 
         e.first_name, e.onboarded_at, e.last_login_at;

CREATE VIEW hr_organization_metrics AS
SELECT 
    o.id AS organization_id,
    o.name AS organization_name,
    COUNT(DISTINCT e.id) AS total_employees,
    COUNT(DISTINCT CASE WHEN e.onboarded_at IS NOT NULL 
        THEN e.id END) AS enrolled_employees,
    ROUND((COUNT(DISTINCT CASE WHEN e.onboarded_at IS NOT NULL 
        THEN e.id END)::DECIMAL / NULLIF(COUNT(DISTINCT e.id), 0)) * 100, 1
    ) AS enrollment_percentage,
    ROUND(AVG((SELECT SUM(time_spent_minutes) 
        FROM employee_learning_paths WHERE employee_id = e.id)) / 60.0, 1
    ) AS avg_hours_per_employee
FROM organizations o
LEFT JOIN employees e ON o.id = e.organization_id 
    AND e.role = 'employee' AND e.status = 'active'
GROUP BY o.id, o.name;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION assign_modules_from_assessment(
    p_employee_id UUID,
    p_assessment_data JSONB
) RETURNS VOID AS $$
BEGIN
    DELETE FROM employee_learning_paths WHERE employee_id = p_employee_id;
    
    -- Assign base modules (everyone gets these)
    INSERT INTO employee_learning_paths (employee_id, module_id, assigned_at)
    SELECT p_employee_id, id, NOW()
    FROM learning_modules
    WHERE is_required = true AND status = 'published';
    
    -- Conditional assignments based on assessment
    IF (p_assessment_data->>'has_will')::BOOLEAN = false THEN
        INSERT INTO employee_learning_paths (employee_id, module_id)
        SELECT p_employee_id, id
        FROM learning_modules
        WHERE slug = 'module-2a-create-first-will';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_readiness_score(
    p_employee_id UUID
) RETURNS INTEGER AS $$
DECLARE
    v_total_modules INTEGER;
    v_completed_modules INTEGER;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN status = 'completed' THEN 1 END)
    INTO v_total_modules, v_completed_modules
    FROM employee_learning_paths
    WHERE employee_id = p_employee_id;
    
    IF v_total_modules = 0 THEN RETURN 0; END IF;
    
    RETURN ROUND((v_completed_modules::DECIMAL / v_total_modules) * 10);
END;
$$ LANGUAGE plpgsql;
```

---

## 4. Application Structure

### 4.1 Technology Stack

**Frontend:**
- React 19
- TypeScript
- TailwindCSS
- React Router v7
- Axios for API calls
- Chart.js for data visualization

**Backend:**
- Node.js 22
- Express.js
- PostgreSQL 16
- AWS Cognito (Authentication)
- AWS S3 + CloudFront (Video CDN)

**Infrastructure:**
- AWS Lambda (Serverless functions)
- AWS RDS (PostgreSQL database)
- AWS API Gateway
- AWS CloudFront (CDN)
- Vercel (Frontend hosting)

### 4.2 File Structure

```
endevo-mvp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   └── Avatar.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── PrivacyBanner.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── employee/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── ModuleCard.tsx
│   │   │   │   ├── ProgressRing.tsx
│   │   │   │   └── LearningPath.tsx
│   │   │   ├── hr/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── MetricsCard.tsx
│   │   │   │   ├── EngagementChart.tsx
│   │   │   │   └── DemographicsChart.tsx
│   │   │   └── assessment/
│   │   │       ├── AssessmentForm.tsx
│   │   │       ├── QuestionCard.tsx
│   │   │       └── ResultsSummary.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── EmployeeDashboard.tsx
│   │   │   ├── HRDashboard.tsx
│   │   │   ├── Assessment.tsx
│   │   │   ├── ModuleDetail.tsx
│   │   │   └── NotFound.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useEmployee.ts
│   │   │   ├── useModules.ts
│   │   │   └── useOrganization.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── modules.ts
│   │   │   └── analytics.ts
│   │   ├── types/
│   │   │   ├── employee.ts
│   │   │   ├── module.ts
│   │   │   ├── organization.ts
│   │   │   └── assessment.ts
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── employees.ts
│   │   │   ├── modules.ts
│   │   │   ├── assessments.ts
│   │   │   └── organizations.ts
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
└── database/
    ├── migrations/
    ├── seeds/
    └── schema.sql
```

---

## 5. Screen Specifications

### 5.1 Login Screen

**File:** `frontend/src/pages/Login.tsx`

**Layout:**
```
┌─────────────────────────────────────────────┐
│          Centered Container (450px)         │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │       LOGO SECTION (bg: blue-600)     │ │
│  │                                       │ │
│  │          ENDevo                       │ │
│  │   Legacy Readiness for Employees     │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │       LOGIN FORM (bg: white)          │ │
│  │                                       │ │
│  │   Welcome Back                        │ │
│  │   Sign in to continue your journey    │ │
│  │                                       │ │
│  │   Email Address                       │ │
│  │   [____________________________]      │ │
│  │                                       │ │
│  │   Password                            │ │
│  │   [____________________________]      │ │
│  │                                       │ │
│  │   □ Remember me    Forgot password?   │ │
│  │                                       │ │
│  │   [    Sign In (btn-primary)    ]    │ │
│  │                                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │   PRIVACY FOOTER (bg: gray-50)        │ │
│  │   🔒 Enterprise-grade security        │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Component Hierarchy:**
```tsx
<LoginPage>
  <LoginCard>
    <LogoSection />
    <LoginForm>
      <Input label="Email Address" type="email" />
      <Input label="Password" type="password" />
      <FormOptions>
        <Checkbox label="Remember me" />
        <Link>Forgot password?</Link>
      </FormOptions>
      <Button variant="primary" fullWidth>Sign In</Button>
    </LoginForm>
    <PrivacyFooter />
  </LoginCard>
</LoginPage>
```

**Key Interactions:**
- Form validation on blur
- Show password toggle
- Enter key submits form
- Route to employee or HR dashboard based on role

---

### 5.2 Employee Dashboard

**File:** `frontend/src/pages/EmployeeDashboard.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ HEADER (sticky, bg: white, shadow: sm)                  │
│ [Logo] [Org Badge]              [Avatar] [Name] [Menu] │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ PRIVACY BANNER (bg: blue-50)                            │
│ 🔒 Your privacy is protected...                         │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                     MAIN CONTENT                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  👋 Welcome back, [First Name]                  │   │
│  │  You're making great progress...                │   │
│  │                                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐           │   │
│  │  │ Progress Ring│  │ Time Invested│           │   │
│  │  │     4/10     │  │   2.5 hrs    │           │   │
│  │  └──────────────┘  └──────────────┘           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Your Personalized Learning Path                │   │
│  │                                                  │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │ ✅ Module 1: Basics                      │  │   │
│  │  │    Completed Jan 20, 2026                │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  │                                                  │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │ 🔄 Module 2: Wills & Trusts (60%)       │  │   │
│  │  │    [Progress Bar]                        │  │   │
│  │  │    [Continue Learning →]                 │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  │                                                  │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │ 🔒 Module 3: Digital Legacy (Locked)    │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [📥 Export Progress] [📧 Share]                       │
└─────────────────────────────────────────────────────────┘
```

**Component Hierarchy:**
```tsx
<EmployeeDashboard>
  <Header role="employee" />
  <PrivacyBanner type="employee" />
  <HeroSection>
    <WelcomeMessage firstName={user.firstName} />
    <MetricsGrid>
      <ProgressRing score={4} total={10} />
      <TimeInvestedCard hours={2.5} totalHours={6} />
    </MetricsGrid>
  </HeroSection>
  <LearningPathSection>
    <SectionTitle>Your Personalized Learning Path</SectionTitle>
    <ModulesList>
      {modules.map(module => (
        <ModuleCard 
          key={module.id}
          module={module}
          status={module.status}
        />
      ))}
    </ModulesList>
  </LearningPathSection>
  <FooterActions>
    <Button variant="outline" icon="download">Export Progress</Button>
    <Button variant="outline" icon="mail">Share</Button>
  </FooterActions>
</EmployeeDashboard>
```

**State Management:**
```typescript
interface DashboardState {
  employee: {
    id: string;
    firstName: string;
    readinessScore: number;
    hoursInvested: number;
  };
  modules: Module[];
  loading: boolean;
  error: string | null;
}
```

---

### 5.3 HR Dashboard

**File:** `frontend/src/pages/HRDashboard.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ HEADER (bg: white)                                       │
│ [Logo] [HR Admin Badge]        [Settings] [Avatar]     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ PRIVACY BANNER (bg: blue-50)                            │
│ 🔒 Privacy-first: You see metrics only, not content    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐   │
│  │  ENDevo Dashboard                               │   │
│  │  Acme Corporation                               │   │
│  │                                   [Download ▼]  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   68%    │  │   35%    │  │ 4.2 hrs  │            │
│  │Enrollment│  │Completed │  │Avg Time  │            │
│  │34 of 50  │  │12 emps   │  │per emp   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Engagement Trends (Last 30 Days)               │   │
│  │  [Bar Chart: Week 1, 2, 3, 4]                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Demographics Breakdown                         │   │
│  │  Age 25-35:  45% [========            ]        │   │
│  │  Age 36-50:  72% [==============      ]        │   │
│  │  Age 51+:    83% [================    ]        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [View Roster] [Send Reminder] [Schedule Report]      │
└─────────────────────────────────────────────────────────┘
```

**Component Hierarchy:**
```tsx
<HRDashboard>
  <Header role="hr_admin" />
  <PrivacyBanner type="hr" />
  <PageHeader>
    <Title>ENDevo Dashboard</Title>
    <Subtitle>{organization.name}</Subtitle>
    <Actions>
      <Button variant="outline">Download Report</Button>
    </Actions>
  </PageHeader>
  <MetricsGrid>
    <StatCard 
      value="68%" 
      label="Enrollment" 
      sublabel="34 of 50 employees"
      color="primary"
    />
    <StatCard 
      value="35%" 
      label="Completed" 
      sublabel="12 employees"
      color="success"
    />
    <StatCard 
      value="4.2 hrs" 
      label="Avg Time" 
      sublabel="per employee"
      color="warning"
    />
  </MetricsGrid>
  <EngagementChart data={weeklyEngagement} />
  <DemographicsSection data={demographics} />
  <FooterActions>
    <Button variant="primary">View Employee Roster</Button>
    <Button variant="outline">Send Reminder</Button>
    <Button variant="outline">Schedule Report</Button>
  </FooterActions>
</HRDashboard>
```

---

### 5.4 Peace of Mind Assessment

**File:** `frontend/src/pages/Assessment.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                    HEADER (sticky)                       │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Your Peace of Mind Assessment                  │   │
│  │  ───────────────────────────────────────────── │   │
│  │  Question 3 of 10                               │   │
│  │  [=========>                              ]     │   │
│  │                                                  │   │
│  │  Do you have a will or trust in place?         │   │
│  │                                                  │   │
│  │  ○ Yes, reviewed in last 12 months              │   │
│  │  ○ Yes, but not reviewed recently               │   │
│  │  ○ No, but I know I need one                    │   │
│  │  ● No, and I'm not sure where to start          │   │
│  │                                                  │   │
│  │  [← Back]                          [Next →]    │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🔒 Privacy Note: Your answers are private      │   │
│  │     HR only sees if you completed this          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Component Hierarchy:**
```tsx
<AssessmentPage>
  <Header minimal />
  <AssessmentContainer>
    <ProgressHeader>
      <Title>Your Peace of Mind Assessment</Title>
      <ProgressIndicator current={3} total={10} />
    </ProgressHeader>
    <QuestionCard>
      <QuestionText>{currentQuestion.text}</QuestionText>
      <AnswerOptions>
        {currentQuestion.options.map(option => (
          <RadioOption 
            key={option.id}
            value={option.value}
            selected={answer === option.value}
            onChange={handleAnswerChange}
          >
            {option.label}
          </RadioOption>
        ))}
      </AnswerOptions>
    </QuestionCard>
    <Navigation>
      <Button 
        variant="outline" 
        onClick={handleBack}
        disabled={currentQuestion === 0}
      >
        ← Back
      </Button>
      <Button 
        variant="primary" 
        onClick={handleNext}
        disabled={!answer}
      >
        Next →
      </Button>
    </Navigation>
    <PrivacyNote>
      🔒 Your answers are private. HR only sees completion status.
    </PrivacyNote>
  </AssessmentContainer>
</AssessmentPage>
```

---

### 5.5 Module Detail Screen

**File:** `frontend/src/pages/ModuleDetail.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Module 2: Wills & Trusts Basics                        │
│  Lesson 3 of 5: When to Review Your Will                │
│  ───────────────────────────────────────────────────── │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐   │
│  │         VIDEO PLAYER (16:9 ratio)               │   │
│  │                                                  │   │
│  │              [▶ Play/Pause]                     │   │
│  │         [================================]       │   │
│  │         00:45                         04:32     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Key Takeaways:                                 │   │
│  │  • Review your will every 3-5 years             │   │
│  │  • Major life events = immediate review needed  │   │
│  │  • Marriage, divorce, children, property        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Reflection Question:                           │   │
│  │  When did you last review your plan?            │   │
│  │                                                  │   │
│  │  [_______________________________________]      │   │
│  │  [_______________________________________]      │   │
│  │  [_______________________________________]      │   │
│  │                                                  │   │
│  │  🔒 Your notes are private                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [✓ Mark as Complete]        [Skip for Now]           │
└─────────────────────────────────────────────────────────┘
```

**Component Hierarchy:**
```tsx
<ModuleDetailPage>
  <ModuleHeader>
    <Breadcrumb>
      <Link to="/dashboard">Dashboard</Link>
      <Separator />
      <span>{module.title}</span>
    </Breadcrumb>
    <Title>{lesson.title}</Title>
    <Subtitle>Lesson {lessonNumber} of {totalLessons}</Subtitle>
  </ModuleHeader>
  <VideoPlayer 
    url={lesson.videoUrl}
    onProgress={handleProgress}
    onComplete={handleVideoComplete}
  />
  <ContentSection>
    <KeyTakeaways items={lesson.takeaways} />
    <ReflectionPrompt>
      <Label>Reflection Question:</Label>
      <Text>{lesson.reflectionPrompt}</Text>
      <TextArea 
        value={note}
        onChange={setNote}
        placeholder="Your private notes..."
      />
      <PrivacyNote>🔒 Your notes are private</PrivacyNote>
    </ReflectionPrompt>
  </ContentSection>
  <Actions>
    <Button 
      variant="primary" 
      onClick={handleComplete}
    >
      ✓ Mark as Complete
    </Button>
    <Button 
      variant="outline" 
      onClick={handleSkip}
    >
      Skip for Now
    </Button>
  </Actions>
</ModuleDetailPage>
```

---

## 6. Component Library

### 6.1 Button Component

**File:** `frontend/src/components/common/Button.tsx`

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}

// Usage Examples:
<Button variant="primary" size="lg">Sign In</Button>
<Button variant="outline" icon={<Download />}>Export</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

**Styles:**
```css
/* Primary */
.btn-primary {
  background: var(--color-primary-600);
  color: white;
  hover: var(--color-primary-500);
}

/* Outline */
.btn-outline {
  background: white;
  border: 1px solid var(--color-gray-300);
  color: var(--color-gray-700);
  hover: var(--color-gray-50);
}

/* Sizes */
.btn-sm { padding: 8px 16px; font-size: 14px; }
.btn-md { padding: 12px 24px; font-size: 16px; }
.btn-lg { padding: 16px 32px; font-size: 18px; }
```

---

### 6.2 ModuleCard Component

**File:** `frontend/src/components/employee/ModuleCard.tsx`

```typescript
interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    status: 'completed' | 'in_progress' | 'locked';
    progress?: number;
    completedDate?: string;
    unlockCondition?: string;
  };
  onClick?: () => void;
}

// Rendering Logic:
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle />;
    case 'in_progress': return <RefreshIcon />;
    case 'locked': return <LockIcon />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'border-success-500';
    case 'in_progress': return 'border-warning-500';
    case 'locked': return 'border-gray-300';
  }
};
```

---

### 6.3 ProgressRing Component

**File:** `frontend/src/components/employee/ProgressRing.tsx`

```typescript
interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
}

// SVG Calculation:
const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;
const offset = circumference - (progress / 100) * circumference;

// Usage:
<ProgressRing 
  progress={40} 
  size={120} 
  strokeWidth={8}
  color="var(--color-primary-600)"
/>
```

---

### 6.4 PrivacyBanner Component

**File:** `frontend/src/components/layout/PrivacyBanner.tsx`

```typescript
interface PrivacyBannerProps {
  type: 'employee' | 'hr';
}

const MESSAGES = {
  employee: {
    icon: '🔒',
    text: 'Your privacy is protected. HR sees your progress status, not your content.',
    link: { text: 'Learn more', href: '/privacy' }
  },
  hr: {
    icon: '🔒',
    text: 'Privacy-first design: You see aggregated metrics only, never individual content.',
    link: { text: 'Learn more about our privacy commitment', href: '/privacy-hr' }
  }
};
```

---

## 7. API Endpoints

### 7.1 Authentication

```typescript
POST /api/auth/login
Body: { email: string; password: string }
Response: { 
  token: string; 
  user: { 
    id: string; 
    role: 'employee' | 'hr_admin'; 
    organizationId: string;
  } 
}

POST /api/auth/logout
Headers: { Authorization: 'Bearer {token}' }
Response: { success: boolean }

GET /api/auth/me
Headers: { Authorization: 'Bearer {token}' }
Response: { 
  id: string;
  email: string;
  firstName: string;
  role: string;
  organization: { id: string; name: string; }
}
```

### 7.2 Employee Endpoints

```typescript
GET /api/employee/dashboard
Headers: { Authorization: 'Bearer {token}' }
Response: {
  employee: {
    id: string;
    firstName: string;
    readinessScore: number;
    hoursInvested: number;
  };
  modules: Module[];
}

GET /api/employee/modules
Response: Module[]

GET /api/employee/modules/:id
Response: ModuleDetail

POST /api/employee/modules/:id/complete
Body: { timeSpentMinutes: number; note?: string }
Response: { success: boolean; updatedProgress: number }

POST /api/employee/assessment
Body: { answers: AssessmentAnswer[] }
Response: { 
  riskScore: number; 
  assignedModules: string[];
}

GET /api/employee/export-progress
Response: PDF file download
```

### 7.3 HR Admin Endpoints

```typescript
GET /api/hr/dashboard
Headers: { Authorization: 'Bearer {token}' }
Response: {
  metrics: {
    enrollmentPercentage: number;
    completionPercentage: number;
    avgHoursPerEmployee: number;
    totalEmployees: number;
    enrolledEmployees: number;
  };
  demographics: DemographicData[];
  weeklyEngagement: number[];
}

GET /api/hr/employees
Response: {
  employees: Array<{
    id: string;
    employeeIdentifier: string;
    firstName: string;
    status: string;
    progressPercentage: number;
    lastActivityDate: string;
  }>
}

POST /api/hr/send-reminder
Body: { employeeIds: string[]; message: string }
Response: { success: boolean; sentCount: number }
```

---

## 8. Implementation Guidelines

### 8.1 Development Workflow

**Step 1: Database Setup (Week 1)**
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE endevo_mvp;

# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

**Step 2: Backend Development (Weeks 1-3)**
```bash
# Setup Express server
npm init -y
npm install express pg aws-sdk bcrypt jsonwebtoken

# Create API routes following REST conventions
# Implement RLS policies for data isolation
# Set up AWS Cognito for authentication
```

**Step 3: Frontend Development (Weeks 2-6)**
```bash
# Create React app with TypeScript
npx create-react-app endevo-frontend --template typescript

# Install dependencies
npm install react-router-dom axios chart.js tailwindcss

# Build components following atomic design
# Implement state management with Context API
```

**Step 4: Integration & Testing (Weeks 5-7)**
- Connect frontend to backend APIs
- Implement error handling and loading states
- Test multi-tenant isolation
- User acceptance testing with pilot customers

**Step 5: Deployment (Week 8)**
- Deploy backend to AWS Lambda
- Deploy frontend to Vercel
- Configure CloudFront CDN
- Set up monitoring and logging

### 8.2 Privacy & Security Requirements

**CRITICAL: Privacy Rules**

1. **Database Level:**
   - Row-Level Security MUST be enabled on all employee data tables
   - HR queries MUST only access aggregated views
   - Never expose individual assessment answers to HR

2. **API Level:**
   - Validate user roles on every request
   - Employees can only access their own data
   - HR admins can only access org-level metrics

3. **UI Level:**
   - Display privacy badges on every screen
   - Make it visually obvious who can see what
   - Show data export options for employees

**Data Portability:**
```typescript
// Employee must be able to export their data
GET /api/employee/export
Response: {
  employee: { ... },
  assessmentAnswers: [ ... ],
  moduleProgress: [ ... ],
  notes: [ ... ]
}
```

### 8.3 Performance Optimization

**Frontend:**
- Lazy load module videos
- Cache dashboard data for 5 minutes
- Debounce search/filter inputs
- Use React.memo for expensive components

**Backend:**
- Index frequently queried columns
- Use materialized views for HR dashboards
- Implement pagination (20 items per page)
- Cache organization metrics (1 hour TTL)

**CDN:**
- Serve all videos through CloudFront
- Use signed URLs for video access
- Compress images and assets

### 8.4 Accessibility (WCAG 2.1 AA)

**Requirements:**
- All interactive elements keyboard accessible
- Color contrast ratio minimum 4.5:1
- Form inputs have associated labels
- ARIA labels on icon buttons
- Focus indicators visible
- Skip navigation links

**Testing:**
```bash
# Install accessibility testing tools
npm install --save-dev @axe-core/react eslint-plugin-jsx-a11y

# Run automated tests
npm run test:a11y
```

### 8.5 Mobile Responsiveness

**Breakpoint Strategy:**
```css
/* Mobile First */
.container { 
  padding: 16px; 
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container { 
    padding: 32px; 
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container { 
    padding: 48px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

**Touch Targets:**
- Minimum 44x44px for all clickable elements
- Increase spacing on mobile
- Use larger font sizes (18px minimum)

### 8.6 Error Handling

**User-Facing Errors:**
```typescript
// Show friendly error messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: "We're having trouble connecting. Please check your internet.",
  AUTH_FAILED: "Invalid email or password. Please try again.",
  MODULE_LOCKED: "Complete the previous module to unlock this one.",
  ASSESSMENT_INCOMPLETE: "Please answer all questions to continue."
};

// Log technical errors for debugging
console.error('[API Error]', { 
  endpoint, 
  statusCode, 
  message, 
  timestamp 
});
```

**Graceful Degradation:**
- If video fails to load, show transcript
- If charts fail, show table view
- If export fails, show copy-paste option

---

## 9. Testing Checklist

### 9.1 Unit Tests
- [ ] All React components render correctly
- [ ] Form validation works as expected
- [ ] Helper functions return correct values
- [ ] API services handle errors properly

### 9.2 Integration Tests
- [ ] Login flow works end-to-end
- [ ] Assessment saves and assigns modules correctly
- [ ] Module completion updates dashboard
- [ ] HR dashboard shows correct metrics

### 9.3 Privacy Tests
- [ ] Employee cannot see other employees' data
- [ ] HR cannot see individual assessment answers
- [ ] HR cannot see individual module progress (only status)
- [ ] Data export contains only employee's own data

### 9.4 Multi-Tenant Tests
- [ ] Organization A cannot see Organization B's data
- [ ] Subdomain routing works correctly
- [ ] White-label branding applies per tenant

### 9.5 Performance Tests
- [ ] Dashboard loads in < 2 seconds
- [ ] Video starts playing in < 3 seconds
- [ ] HR dashboard handles 1000+ employees
- [ ] API responses < 500ms

---

## 10. Launch Preparation

### 10.1 Pre-Launch Checklist

**Technical:**
- [ ] SSL certificates configured
- [ ] Database backups automated
- [ ] Error logging configured (Sentry/DataDog)
- [ ] Analytics tracking implemented (Google Analytics)
- [ ] Email service configured (SendGrid/AWS SES)

**Content:**
- [ ] 4-6 modules filmed and uploaded
- [ ] Assessment questions finalized
- [ ] Email templates created
- [ ] Privacy policy published
- [ ] Terms of service published

**Business:**
- [ ] 3 pilot customers identified
- [ ] Pricing confirmed ($3k/org + $25/employee)
- [ ] Support process defined
- [ ] Feedback collection method ready

### 10.2 Post-Launch Monitoring

**Week 1:**
- Daily check of error logs
- Monitor enrollment rates
- Collect user feedback via surveys
- Track module completion rates

**Week 2-4:**
- Weekly analytics review
- HR admin satisfaction surveys
- Employee engagement metrics
- Bug fixes and quick wins

**Month 2:**
- Quarterly business review prep
- Feature prioritization for V2
- Expansion planning

---

## 11. Next Steps for GitHub Copilot

### 11.1 Suggested Implementation Order

1. **Setup Project Structure**
   ```bash
   # Create folders as specified in Section 4.2
   # Initialize Git repository
   # Setup ESLint, Prettier, TypeScript configs
   ```

2. **Build Design System**
   ```bash
   # Implement colors, typography, spacing (Section 2)
   # Create Button, Card, Input components (Section 6)
   # Setup TailwindCSS configuration
   ```

3. **Database First**
   ```bash
   # Implement schema from Section 3
   # Create migrations
   # Setup RLS policies
   # Seed initial data
   ```

4. **Core Authentication**
   ```bash
   # Build Login screen (Section 5.1)
   # Implement JWT authentication
   # Create protected routes
   ```

5. **Employee Experience**
   ```bash
   # Build Employee Dashboard (Section 5.2)
   # Create Assessment flow (Section 5.4)
   # Build Module Detail screen (Section 5.5)
   ```

6. **HR Experience**
   ```bash
   # Build HR Dashboard (Section 5.3)
   # Implement charts and metrics
   # Create employee roster view
   ```

7. **Polish & Deploy**
   ```bash
   # Error handling
   # Loading states
   # Responsive design
   # Deploy to production
   ```

### 11.2 GitHub Copilot Prompts

**For Component Generation:**
```
Create a React TypeScript component for <ComponentName> 
following the specifications in Section X.X of ENDevo_MVP_Specification.md.
Use TailwindCSS for styling and include proper TypeScript interfaces.
```

**For API Endpoint Generation:**
```
Create an Express.js endpoint for <EndpointName> 
following the API specification in Section 7 of ENDevo_MVP_Specification.md.
Include proper error handling and authentication middleware.
```

**For Database Queries:**
```
Create a PostgreSQL query to <QueryPurpose> 
following the schema in Section 3 of ENDevo_MVP_Specification.md.
Ensure Row-Level Security policies are respected.
```

---

## 12. Contact & Support

**Technical Questions:**
- GitHub Issues: [repository URL]
- Slack Channel: #endevo-dev

**Product Questions:**
- Product Owner: Brooke
- Founder: Niki Weiss

**Architecture Decisions:**
- Solution Architect: Nermeen Nasim
- AWS Specialist: [Consultant name]

---

**Document Version:** 1.0  
**Last Updated:** February 4, 2026  
**Prepared By:** Nermeen Nasim, Technical Advisor  
**Approved By:** Niki Weiss, Founder & CEO

---

## Appendix A: Quick Reference

### Color Variables
Copy-paste ready CSS variables for immediate use.

### Component Checklist
Complete list of all components to build.

### API Quick Reference
All endpoints with request/response examples.

### Database ER Diagram
Visual representation of table relationships.

---

*This document is a living specification. Update it as requirements evolve.*
