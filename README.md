# ENDevo SaaS Prototype - UI Demo

Employee Legacy Readiness Platform - Demo UI with role-based dashboards

## 🚀 Project Overview

This is a **Next.js** based UI demonstration for ENDevo, a B2B SaaS platform that provides employee legacy readiness education through HR benefit programs. This demo showcases three distinct user experiences with mock data:

- **ENDevo Super Admin Dashboard** - Platform administration
- **HR Admin Dashboard** - Organization-level employee management  
- **Employee Dashboard** - Personal learning journey with roadmap

## 📋 Features

### ✅ Current Implementation (UI Demo)
- Mock authentication with role-based routing
- Three complete dashboard views (Super Admin, HR, Employee)
- **Interactive employee roadmap with progress tracking**
- **Detailed module learning pages with video player placeholder**
- **Lesson-by-lesson navigation with completion tracking**
- **Reflection notes and private note-taking**
- Learning modules with status indicators
- Organization and employee analytics
- **PDF/Text export functionality:**
  - Export overall progress summary
  - Export individual module summaries
  - Completion certificates after each module
- **Comprehensive progress summary page**
- Responsive design with Tailwind CSS
- Clean, professional ENDevo brand styling

### 🔜 Not Implemented (Future)
- Real backend API integration
- Database connectivity
- Actual authentication/authorization
- Payment processing
- Email notifications
- Document management

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **Mock Data**: In-memory TypeScript objects

## 📦 Installation & Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Demo Login

Use these credentials to explore different roles:

### Super Admin
- **Email**: admin@endevo.com
- **Access**: Platform-wide administration, all organizations

### HR Admin
- **Email**: hr@techcorp.com
- **Access**: TechCorp organization, employee analytics

### Employee
- **Email**: jane.doe@techcorp.com
- **Access**: Personal learning dashboard and roadmap

Simply click on any role card on the home page to login.

## 🗂️ Project Structure

```
src/
├── app/
│   ├── admin/dashboard/           # Super Admin dashboard
│   ├── hr/dashboard/              # HR Admin dashboard
│   ├── employee/
│   │   ├── dashboard/             # Employee dashboard with roadmap
│   │   ├── modules/[moduleId]/    # Individual module detail pages
│   │   └── progress/              # Comprehensive progress summary
│   ├── layout.tsx                 # Root layout with AuthProvider
│   └── page.tsx                   # Login page
├── components/
│   └── DashboardLayout.tsx        # Shared dashboard layout
├── contexts/
│   └── AuthContext.tsx            # Authentication context
└── lib/
    └── mock-data.ts               # Mock data for demo
```

## 🎨 Design System

Following ENDevo MVP Specification:

### Colors
- **Primary**: Blue (#2563EB)
- **Secondary**: Orange (#F97316)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Inter (system fonts fallback)
- **Scale**: Tailwind default scale

## 📸 Screenshots Reference

The employee dashboard roadmap design is based on screenshots in `/docs`:
- `employee_dashboard_mockup_ui.png`
- `empolyee_dashboard_roadmap_*.png`

## 🔄 Development Workflow

### ENDevo Super Admin → Organization → Employee

1. **Super Admin** views all organizations and platform metrics
2. Click "View" on an organization to see details
3. **HR Admin** manages employees and views aggregate progress
4. **Employee** follows their personalized learning roadmap
5. **Employee** clicks "Start" or "Continue" on any module to begin learning
6. **Module Detail Page** shows video content, key takeaways, and reflection prompts
7. **After Completion** - Export module summary or save as PDF
8. **Progress Summary** - View complete overview and export full report

## 📝 Mock Data

All data is stored in `src/lib/mock-data.ts`:
- 3 organizations (TechCorp, Innovate Labs, Global Finance)
- 3 employees with varying progress levels
- 6 learning modules
- Progress tracking data

## 🚀 Next Steps

To convert this to a production app:

1. **Backend Integration**
   - Set up API routes or external backend
   - Implement database (PostgreSQL recommended)
   - Add real authentication (NextAuth.js, Clerk, etc.)

2. **Features**
   - Video/content hosting
   - PDF export functionality
   - Email notifications
   - Payment integration (Stripe)

3. **Deployment**
   - Deploy to Vercel, Netlify, or AWS
   - Set up environment variables
   - Configure CI/CD pipeline

## 📄 Documentation

See `/docs` folder for:
- `ENDevo_MVP_Specification.md` - Complete technical spec
- `ENDevo_Complete_Architecture_Project_Plan.xlsx` - Project plan
- Screenshots and mockups

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

**Built with ❤️ using Next.js and Tailwind CSS**

