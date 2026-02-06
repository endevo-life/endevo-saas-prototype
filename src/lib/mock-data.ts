// Mock data for demo purposes - No real backend

export type UserRole = 'super_admin' | 'hr_admin' | 'employee';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  status: 'active' | 'suspended' | 'trial';
  subscriptionTier: 'basic' | 'professional' | 'enterprise';
  employeeCount: number;
  employeeLimit: number;
  createdAt: string;
}

export interface Employee {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'hr_admin';
  status: 'active' | 'inactive';
  onboardedAt: string | null;
  lastLoginAt: string | null;
  progressPercentage: number;
  assessmentScore: number | null;
  department: string;
  jobTitle: string;
  hireDate: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  slug: string;
  moduleOrder: number;
  estimatedHours: number;
  isRequired: boolean;
  thumbnailUrl?: string;
  status: 'published' | 'draft';
  category: string;
  estimatedTime: string;
  lessonsCount: number;
  competency: string;
  isActive?: boolean;
}

export interface EmployeeProgress {
  employeeId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
  completedAt: string | null;
  lastAccessedAt: string | null;
  completedModules: string[];
  currentModules: string[];
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@endevo.com',
    firstName: 'Sarah',
    lastName: 'Admin',
    role: 'super_admin',
  },
  {
    id: 'hr-1',
    email: 'hr@techcorp.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'hr_admin',
    organizationId: 'org-1',
  },
  {
    id: 'hr-2',
    email: 'hr@innovate.com',
    firstName: 'Lisa',
    lastName: 'Johnson',
    role: 'hr_admin',
    organizationId: 'org-2',
  },
  {
    id: 'emp-1',
    email: 'jane.doe@techcorp.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'employee',
    organizationId: 'org-1',
  },
  {
    id: 'emp-2',
    email: 'bob.wilson@techcorp.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: 'employee',
    organizationId: 'org-1',
  },
  {
    id: 'emp-4',
    email: 'new.employee@techcorp.com',
    firstName: 'Alex',
    lastName: 'Johnson',
    role: 'employee',
    organizationId: 'org-1',
  },
];

// Mock Organizations
export const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'TechCorp Solutions',
    slug: 'techcorp',
    status: 'active',
    subscriptionTier: 'professional',
    employeeCount: 45,
    employeeLimit: 100,
    createdAt: '2025-11-15T10:00:00Z',
  },
  {
    id: 'org-2',
    name: 'Innovate Labs',
    slug: 'innovate',
    status: 'active',
    subscriptionTier: 'basic',
    employeeCount: 28,
    employeeLimit: 50,
    createdAt: '2025-12-01T14:30:00Z',
  },
  {
    id: 'org-3',
    name: 'Global Finance Inc',
    slug: 'globalfinance',
    status: 'trial',
    subscriptionTier: 'enterprise',
    employeeCount: 120,
    employeeLimit: 250,
    createdAt: '2026-01-10T09:15:00Z',
  },
];

// Mock Employees
export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    organizationId: 'org-1',
    email: 'jane.doe@techcorp.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'employee',
    status: 'active',
    onboardedAt: '2025-12-10T10:00:00Z',
    lastLoginAt: '2026-02-03T15:30:00Z',
    progressPercentage: 75,
    assessmentScore: 8,
    department: 'Engineering',
    jobTitle: 'Senior Software Engineer',
    hireDate: '2024-06-15',
  },
  {
    id: 'emp-2',
    organizationId: 'org-1',
    email: 'bob.wilson@techcorp.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: 'employee',
    status: 'active',
    onboardedAt: '2025-12-12T11:30:00Z',
    lastLoginAt: '2026-02-02T09:20:00Z',
    progressPercentage: 45,
    assessmentScore: 6,
    department: 'Marketing',
    jobTitle: 'Marketing Manager',
    hireDate: '2023-03-20',
  },
  {
    id: 'emp-3',
    organizationId: 'org-1',
    email: 'sarah.lee@techcorp.com',
    firstName: 'Sarah',
    lastName: 'Lee',
    role: 'employee',
    status: 'active',
    onboardedAt: '2025-12-15T14:00:00Z',
    lastLoginAt: '2026-01-28T16:45:00Z',
    progressPercentage: 20,
    assessmentScore: null,
    department: 'Sales',
    jobTitle: 'Sales Representative',
    hireDate: '2025-01-10',
  },
  {
    id: 'emp-4',
    organizationId: 'org-1',
    email: 'new.employee@techcorp.com',
    firstName: 'Alex',
    lastName: 'Johnson',
    role: 'employee',
    status: 'active',
    onboardedAt: '2026-02-06T08:00:00Z',
    lastLoginAt: null, // First time login
    progressPercentage: 0,
    assessmentScore: null, // Hasn't taken assessment yet
    department: 'Operations',
    jobTitle: 'Operations Coordinator',
    hireDate: '2026-02-01',
  },
];

// Mock Learning Modules
export const mockModules: LearningModule[] = [
  {
    id: 'module-1',
    title: 'Understanding Your Legacy',
    description: 'Learn why legacy planning matters and how to start your journey',
    slug: 'understanding-legacy',
    moduleOrder: 1,
    estimatedHours: 0.5,
    isRequired: true,
    status: 'published',
    category: 'Foundation',
    estimatedTime: '30 minutes',
    lessonsCount: 5,
    competency: 'Legacy Planning Basics',
  },
  {
    id: 'module-2',
    title: 'Important Documents & Information',
    description: 'Identify and organize the documents your loved ones will need',
    slug: 'important-documents',
    moduleOrder: 2,
    estimatedHours: 1.0,
    isRequired: true,
    status: 'published',
    category: 'Documentation',
    estimatedTime: '1 hour',
    lessonsCount: 8,
    competency: 'Document Organization',
  },
  {
    id: 'module-3',
    title: 'Digital Assets & Online Accounts',
    description: 'Learn how to manage and pass on your digital legacy',
    slug: 'digital-assets',
    moduleOrder: 3,
    estimatedHours: 0.75,
    isRequired: true,
    status: 'published',
    category: 'Digital',
    estimatedTime: '45 minutes',
    lessonsCount: 6,
    competency: 'Digital Asset Management',
  },
  {
    id: 'module-4',
    title: 'Financial Accounts & Assets',
    description: 'Organize information about your financial accounts',
    slug: 'financial-accounts',
    moduleOrder: 4,
    estimatedHours: 1.0,
    isRequired: true,
    status: 'published',
    category: 'Financial',
    estimatedTime: '1 hour',
    lessonsCount: 7,
    competency: 'Financial Planning',
  },
  {
    id: 'module-5',
    title: 'Healthcare Directives',
    description: 'Understand advance directives and healthcare wishes',
    slug: 'healthcare-directives',
    moduleOrder: 5,
    estimatedHours: 0.75,
    isRequired: false,
    status: 'published',
    category: 'Healthcare',
    estimatedTime: '45 minutes',
    lessonsCount: 5,
    competency: 'Healthcare Planning',
  },
  {
    id: 'module-6',
    title: 'Communicating Your Wishes',
    description: 'Have the conversations that matter with your loved ones',
    slug: 'communicating-wishes',
    moduleOrder: 6,
    estimatedHours: 0.5,
    isRequired: false,
    status: 'published',
    category: 'Communication',
    estimatedTime: '30 minutes',
    lessonsCount: 4,
    competency: 'Family Communication',
  },
];

// Mock Employee Progress
export const mockProgress: EmployeeProgress[] = [
  {
    employeeId: 'emp-1',
    moduleId: 'module-1',
    status: 'completed',
    progressPercentage: 100,
    completedAt: '2025-12-12T10:00:00Z',
    lastAccessedAt: '2025-12-12T10:00:00Z',
    completedModules: ['module-1'],
    currentModules: [],
  },
  {
    employeeId: 'emp-1',
    moduleId: 'module-2',
    status: 'completed',
    progressPercentage: 100,
    completedAt: '2025-12-18T14:30:00Z',
    lastAccessedAt: '2025-12-18T14:30:00Z',
    completedModules: ['module-1', 'module-2'],
    currentModules: [],
  },
  {
    employeeId: 'emp-1',
    moduleId: 'module-3',
    status: 'completed',
    progressPercentage: 100,
    completedAt: '2026-01-05T16:20:00Z',
    lastAccessedAt: '2026-01-05T16:20:00Z',
    completedModules: ['module-1', 'module-2', 'module-3'],
    currentModules: [],
  },
  {
    employeeId: 'emp-1',
    moduleId: 'module-4',
    status: 'in_progress',
    progressPercentage: 60,
    completedAt: null,
    lastAccessedAt: '2026-02-03T15:30:00Z',
    completedModules: ['module-1', 'module-2', 'module-3'],
    currentModules: ['module-4'],
  },
  // Bob Wilson's Progress (emp-2) - 45% complete
  {
    employeeId: 'emp-2',
    moduleId: 'module-1',
    status: 'completed',
    progressPercentage: 100,
    completedAt: '2025-12-14T11:00:00Z',
    lastAccessedAt: '2025-12-14T11:00:00Z',
    completedModules: ['module-1'],
    currentModules: [],
  },
  {
    employeeId: 'emp-2',
    moduleId: 'module-2',
    status: 'completed',
    progressPercentage: 100,
    completedAt: '2025-12-20T15:45:00Z',
    lastAccessedAt: '2025-12-20T15:45:00Z',
    completedModules: ['module-1', 'module-2'],
    currentModules: [],
  },
  {
    employeeId: 'emp-2',
    moduleId: 'module-3',
    status: 'in_progress',
    progressPercentage: 40,
    completedAt: null,
    lastAccessedAt: '2026-02-02T09:20:00Z',
    completedModules: ['module-1', 'module-2'],
    currentModules: ['module-3'],
  },
];
