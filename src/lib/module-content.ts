/**
 * Shared module/domain content for the member journey.
 *
 * Extracted from the module detail page so the Path screen's slide-in
 * milestone panel and the full module page render from one source of truth.
 * Sample videos (Google Drive) and worksheets are illustrative for the
 * prototype.
 */

export interface Resource {
  kind: 'typeform' | 'tool' | 'podcast' | 'video' | 'pdf' | 'quiz';
  label: string;
  url: string;
  hint?: string;
}

export interface Lesson {
  id: string;
  number: string;
  title: string;
  type: 'video' | 'reading' | 'action' | 'explore';
  duration: string;
  driveId?: string;
  /** Legacy single-link field — kept for backward compat with other domains. */
  externalUrl?: string;
  /** Richer multi-link field — preferred for new lessons. */
  resources?: Resource[];
  takeaways: string[];
}

export interface DomainContent {
  number: string;
  label: string;
  description: string;
  totalLessons: number;
  startedLessons: number;
  xpPerLesson: number;
  lessons: Lesson[];
}

export const DOMAINS: Record<string, DomainContent> = {
  legal: {
    number: '01',
    label: 'LEGAL',
    description: 'The language of estate, executor, beneficiary, will. The documents that protect those you love.',
    totalLessons: 5,
    startedLessons: 1,
    xpPerLesson: 80,
    lessons: [
      {
        id: 'legal-language',
        number: '01.01',
        title: 'Learn the Legal Language & Documents Needed',
        type: 'video',
        duration: '12 min',
        driveId: '1a6XM150jNTMHil0xNrOZJzxOadPIq4s6',
        resources: [
          {
            kind: 'quiz',
            label: 'Legal Baseline Quiz (Map your URL)',
            url: '#',
            hint: 'Template slot for legal quiz link',
          },
        ],
        takeaways: [
          'The four documents every adult should have',
          'How "executor", "trustee", and "beneficiary" differ',
          'When state law overrides intent — and how to prevent it',
        ],
      },
      {
        id: 'legal-goal-setting',
        number: '01.02',
        title: 'Action Item #1 · Project Goal Setting',
        type: 'action',
        duration: '8 min',
        driveId: '1_B3bBOZhEdRtAnLmIjgCNMQcoVyIpDy3',
        resources: [
          {
            kind: 'typeform',
            label: 'Open the goal-setting form',
            url: 'https://jbigogmrgex.typeform.com/to/WfLmFB8k',
            hint: 'Private to you · 5 minutes',
          },
          {
            kind: 'pdf',
            label: 'Executor One-Page Brief Template (Map your PDF URL)',
            url: '#',
            hint: 'Template slot for deliverable handout',
          },
        ],
        takeaways: [
          'Define what "ready" looks like for you',
          'Identify the one fear holding you back',
          'Set a 30-day legal milestone',
        ],
      },
      {
        id: 'legal-team',
        number: '01.03',
        title: 'Action Item #2 · Assign Roles for Your Legacy Team',
        type: 'action',
        duration: '10 min',
        driveId: '1ksCg6c0n_idjwtFUZf6w2CgdFZFS1Sj5',
        resources: [
          {
            kind: 'typeform',
            label: 'Map your legacy team',
            url: 'https://jbigogmrgex.typeform.com/to/pIgpXkq6',
            hint: 'Private to you · 6 minutes',
          },
        ],
        takeaways: [
          'Choose your executor (and a backup)',
          'Identify your healthcare proxy',
          'Document the people who matter — and how they connect',
        ],
      },
      {
        id: 'legal-will',
        number: '01.04',
        title: 'Action Item #3 · Plan Your Will',
        type: 'action',
        duration: '15 min',
        driveId: '1jcKfaFZUgBYH6Akhb3w4cDITO8NtcL9o',
        resources: [
          {
            kind: 'tool',
            label: 'Trust & Will',
            url: 'https://trustandwill.com/?g_adtype=search&g_network=g&g_campaign=Trust+%26+Will+%7C+Branded+%7C+BOFU&g_campaignid=1973518268&g_keyword=trust%20and%20will&g_keywordid=kwd-25464110&g_adid=576972079673&g_adgroupid=129320420621&g_acctid=740-480-2447&utm_adgroup={adgroup}&utm_medium=cpc&utm_source=google&utm_term=trust%20and%20will&utm_campaign=trustandwill_bofu&hsa_acc=7404802447&hsa_cam=1973518268&hsa_grp=129320420621&hsa_ad=576972079673&hsa_src=g&hsa_tgt=kwd-25464110&hsa_kw=trust%20and%20will&hsa_mt=e&hsa_net=adwords&hsa_ver=3&gad_source=1&gad_campaignid=1973518268&gbraid=0AAAAADCPKc7xYeSrWdecKeOm3X_2rz8ci&gclid=CjwKCAjwmNLHBhA4EiwA3ts3mZMWTWppxKNaAwgufURHYFW99GTfxzcSeq75h8BBzBdWEbxe2Lkp4RoCcDoQAvD_BwE',
            hint: 'Attorney-supported, paid · ~$159',
          },
          {
            kind: 'tool',
            label: 'FreeWill',
            url: 'https://www.freewill.com/',
            hint: 'Free, self-guided · simple estates',
          },
        ],
        takeaways: [
          'DIY vs attorney-drafted — when each makes sense',
          'The three things even a simple will must include',
          'How to keep it current after life changes',
        ],
      },
      {
        id: 'legal-explore',
        number: '01.05',
        title: 'Explore · Stories & Resources',
        type: 'explore',
        duration: '20 min',
        driveId: '1xWSX8cJ0ZwfO-A-q1eJEjva977LHDD_r',
        resources: [
          {
            kind: 'video',
            label: 'Dying to Meet Joel',
            url: 'https://drive.google.com/file/d/1xWSX8cJ0ZwfO-A-q1eJEjva977LHDD_r/view',
            hint: 'Short film · loss & legacy',
          },
          {
            kind: 'podcast',
            label: 'Unclaimed Assets When You Die · Michael Zwick',
            url: 'https://youtu.be/lspuELMp6Pw',
            hint: 'Podcast · 28 min',
          },
          {
            kind: 'podcast',
            label: 'How to DIY Your Will or Trust · Cody Barbo',
            url: 'https://youtu.be/2YYbmQMHheQ',
            hint: 'Podcast · 32 min',
          },
        ],
        takeaways: [
          'Real stories from people who navigated loss without paperwork',
          'How unclaimed assets become a quiet inheritance problem',
          'When DIY tools fit — and when they don\'t',
        ],
      },
    ],
  },
  financial: {
    number: '02',
    label: 'FINANCIAL',
    description: 'Accounts, beneficiaries, recurring obligations. The financial map your loved ones will need.',
    totalLessons: 6,
    startedLessons: 0,
    xpPerLesson: 80,
    lessons: [
      {
        id: 'fin-welcome',
        number: '02.01',
        title: 'Welcome to MFP — Your Financial Foundation',
        type: 'video',
        duration: '6 min',
        driveId: '1DXtkIe6nhzxrHx5DgBn_kIxv07kK8c0L',
        takeaways: [
          'Why financial readiness sits beside legal — not under it',
          'The 12 accounts most adults forget to document',
          'How to begin without disclosing balances',
        ],
      },
      {
        id: 'fin-framework',
        number: '02.02',
        title: 'The Framework',
        type: 'video',
        duration: '9 min',
        driveId: '12dacJt6zS4g3te9iwZSDHZNUmvkLU5oC',
        takeaways: [
          'The four-domain readiness framework',
          'How to map dependencies across domains',
          'Where your weakest link likely lives',
        ],
      },
    ],
  },
  digital: {
    number: '03',
    label: 'DIGITAL',
    description: 'Logins, devices, photos, social presence. The identity that lives only online — until it doesn\'t.',
    totalLessons: 6,
    startedLessons: 0,
    xpPerLesson: 80,
    lessons: [
      {
        id: 'digital-scenarios',
        number: '03.01',
        title: 'Three-Scenario Approach',
        type: 'video',
        duration: '8 min',
        driveId: '1EljMxGatCdW6BmUP9OS53UYmHeSw_dVr',
        takeaways: [
          '"If I died tomorrow" — what becomes urgent',
          '"If I had a terminal diagnosis" — what changes',
          '"If I needed long-term care" — what others would need',
        ],
      },
    ],
  },
  physical: {
    number: '04',
    label: 'PHYSICAL',
    description: 'Belongings, ceremony preferences, the physical space of your life. Dignity in the details.',
    totalLessons: 5,
    startedLessons: 0,
    xpPerLesson: 80,
    lessons: [
      {
        id: 'physical-options',
        number: '04.01',
        title: 'Learn · Physical Options',
        type: 'video',
        duration: '14 min',
        driveId: '1ZORoacIa-qqajLTgl0Az93wcqwYszCWX',
        takeaways: [
          'The full menu of options most people never see',
          'How preferences differ from instructions — and why both matter',
          'Where your decisions intersect with your loved ones\' grief',
        ],
      },
      {
        id: 'physical-action-1',
        number: '04.02',
        title: 'Action Item #1 · Choose Your Direction',
        type: 'action',
        duration: '8 min',
        driveId: '1xfQyTejFhihbApOKYgfSiaNbBAnS6Hgh',
        takeaways: [
          'Decide between the major care pathways',
          'Capture the "why" behind your choice — for those who survive you',
          'Write the one sentence that orients everything else',
        ],
      },
      {
        id: 'physical-action-2',
        number: '04.03',
        title: 'Action Item #2 · Five Wishes',
        type: 'action',
        duration: '12 min',
        driveId: '1S1z3navV1I5A17WPiCOnkdNWHM-2HElf',
        resources: [
          {
            kind: 'tool',
            label: 'Five Wishes',
            url: 'https://www.fivewishes.org/',
            hint: 'Legally valid in 46 states · ~$5',
          },
        ],
        takeaways: [
          'The one document that covers medical, personal, and spiritual',
          'Why "Five Wishes" reads like a letter — not a contract',
          'How to keep it current and accessible to your proxy',
        ],
      },
      {
        id: 'physical-action-3',
        number: '04.04',
        title: 'Action Item #3 · Ceremony & Disposition',
        type: 'action',
        duration: '10 min',
        driveId: '1pjE-AWDNemWfwUmphK6prTytZItjAhMv',
        takeaways: [
          'Articulate ceremony preferences without prescribing every detail',
          'Disposition options: traditional, cremation, terramation, donation',
          'How to leave room for the living to grieve their way',
        ],
      },
      {
        id: 'physical-explore',
        number: '04.05',
        title: 'Explore · Stories & Resources',
        type: 'explore',
        duration: '40 min',
        driveId: '1cd2AlwA_XvtiiZ3hDDS5NPaZ8d_v3BBs',
        resources: [
          {
            kind: 'video',
            label: 'Dying to Meet Marianne Matzo, PhD',
            url: 'https://drive.google.com/file/d/1cd2AlwA_XvtiiZ3hDDS5NPaZ8d_v3BBs/view',
            hint: 'Conversation · 22 min',
          },
          {
            kind: 'podcast',
            label: 'Stoke Doctor\'s Urgent Plea · Michael Madison, MD',
            url: 'https://www.youtube.com/watch?v=4fG5Tk5bZQg',
            hint: 'Why advance care plans matter',
          },
          {
            kind: 'podcast',
            label: 'Terramation: Human Composting · Brienna Smith',
            url: 'https://www.youtube.com/watch?v=R23N3_n-erU',
            hint: 'Transforming death into life',
          },
          {
            kind: 'podcast',
            label: 'The Shocking Future of Funerals · Joél Simone Maldonado',
            url: 'https://www.youtube.com/watch?v=0_06KPrVnlg',
            hint: 'Embalming expert · industry shift',
          },
        ],
        takeaways: [
          'Hear from a palliative-care educator about what most people miss',
          'The case for advance care planning — from a stroke physician',
          'How disposition options are evolving beyond what most know',
        ],
      },
    ],
  },
  build: {
    number: '01',
    label: 'BUILD MY PROJECT',
    description: 'Set the foundation. One video, one form. Pre-fills the six domains ahead.',
    totalLessons: 6,
    startedLessons: 0,
    xpPerLesson: 100,
    lessons: [
      {
        id: 'build-develop-project',
        number: '01.01',
        title: 'Learn How to Develop a Project',
        type: 'video',
        duration: '10 min',
        driveId: '1F-hrxq1g73ud6LeU1-GG8W6tU7XxGjza',
        resources: [
          {
            kind: 'video',
            label: 'Meet Jesse',
            url: 'https://drive.google.com/file/d/1y1WBf5DfY7KhO0FTndx1qrY8Yi6AvJQI/view?usp=drive_link',
            hint: 'Welcome context video',
          },
        ],
        takeaways: [
          'Understand the MFP project flow from setup to deliverables',
          'Frame your personal objective and urgency',
          'Commit to a practical completion cadence',
        ],
      },
      {
        id: 'build-avoidance-quiz',
        number: '01.02',
        title: 'Action Item · Step 1 · Avoidance Quiz',
        type: 'action',
        duration: '8 min',
        resources: [
          {
            kind: 'pdf',
            label: 'Avoidance Quiz worksheet (PDF)',
            url: 'https://drive.google.com/file/d/1mZVYEkh3-ga-ZQuU46Ay8UOdtrC4kQTg/view?usp=drive_link',
            hint: 'Download and complete',
          },
          {
            kind: 'quiz',
            label: 'Submit Avoidance Quiz',
            url: 'https://jbigogmrgex.typeform.com/to/Xtwvoh3h',
            hint: 'Typeform',
          },
        ],
        takeaways: [
          'Identify avoidance patterns that delay planning',
          'Convert awareness into one immediate action',
          'Set a simple commitment for the next 48 hours',
        ],
      },
      {
        id: 'build-klt-map',
        number: '01.03',
        title: 'Action Item · Step 2 · Name Know/Love/Trust People',
        type: 'action',
        duration: '10 min',
        resources: [
          {
            kind: 'pdf',
            label: 'Know/Love/Trust map (fillable PDF)',
            url: 'https://drive.google.com/file/d/1dXahhseXeDBcre0irBdVjdrRzD39zrjM/view?usp=drive_link',
            hint: 'Fillable template',
          },
          {
            kind: 'typeform',
            label: 'Submit stakeholder map',
            url: 'https://jbigogmrgex.typeform.com/to/pv2EOXnU',
            hint: 'Typeform',
          },
        ],
        takeaways: [
          'Map primary support stakeholders by role',
          'Clarify who to notify first and why',
          'Create role clarity before crisis pressure',
        ],
      },
      {
        id: 'build-emergency-cards',
        number: '01.04',
        title: 'Action Item · Step 3 · Emergency Contact Cards',
        type: 'action',
        duration: '12 min',
        resources: [
          {
            kind: 'pdf',
            label: 'Emergency Contact Cards (worksheet)',
            url: 'https://drive.google.com/file/d/1QChmwWIePAXby7i6LUSlUtxb8pTpzTVj/view?usp=drive_link',
            hint: 'Printable template',
          },
          {
            kind: 'pdf',
            label: 'Emergency Contact Cards (hosted PDF)',
            url: 'https://storage.googleapis.com/msgsndr/f5ehsbHfdFg2UsHEIb49/media/68efd2f7629b05492d0eca17.pdf',
            hint: 'Direct file',
          },
          {
            kind: 'typeform',
            label: 'Submit emergency contact details',
            url: 'https://jbigogmrgex.typeform.com/to/Icu5Lobp',
            hint: 'Typeform',
          },
        ],
        takeaways: [
          'Create actionable emergency contacts',
          'Ensure key people have reachable details',
          'Reduce response delays in urgent moments',
        ],
      },
      {
        id: 'build-mfp-framework',
        number: '01.05',
        title: 'Action Item · Step 4 · Review MFP Framework',
        type: 'reading',
        duration: '10 min',
        resources: [
          {
            kind: 'pdf',
            label: 'Review MFP Framework (Drive)',
            url: 'https://drive.google.com/file/d/1E4qMJHTp0AF3sQyNcAN4K8P9LUMEeoZi/view?usp=drive_link',
            hint: 'Primary reference',
          },
          {
            kind: 'pdf',
            label: 'MFP Framework (hosted PDF)',
            url: 'https://storage.googleapis.com/msgsndr/f5ehsbHfdFg2UsHEIb49/media/6945c9099a634f41952702a2.pdf',
            hint: 'Direct file',
          },
        ],
        takeaways: [
          'Align your project milestones to the MFP model',
          'Connect legal tasks to cross-domain outcomes',
          'Define what success looks like for this quarter',
        ],
      },
      {
        id: 'build-launch-checklist',
        number: '01.06',
        title: 'Project Launch Checklist',
        type: 'action',
        duration: '6 min',
        takeaways: [
          'Confirm stakeholder map is complete',
          'Confirm password and phone readiness',
          'Confirm Crucial Doc Box location and access',
        ],
      },
    ],
  },
};
