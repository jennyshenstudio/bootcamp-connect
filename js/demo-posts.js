// Bootcamp Connect prototype: sample feed posts (specs/05-feed.md).
// Plain script (shared globals); load order is set in prototype.html.
// Posts from the sample members in demo-data.js. Not real people or projects.

const POST_TYPES = {
  work: { label: 'Project', plural: 'Projects', icon: 'i-briefcase', cls: 'bg-appleBlue/10 text-blueText' },
  resource: { label: 'Resource', plural: 'Resources', icon: 'i-book', cls: 'bg-appleGreen/15 text-greenText' },
  personal: { label: 'Personal project', plural: 'Personal', icon: 'i-spark', cls: 'bg-applePurple/15 text-purpleText' },
  support: { label: 'Support', plural: 'Support', icon: 'i-help', cls: 'bg-appleOrange/15 text-orangeText' },
  community: { label: 'Community', plural: 'Community', icon: 'i-megaphone', cls: 'bg-fill text-label-2' },
};

const PAY_TYPES = {
  Paid: { label: 'Paid (fixed fee)', short: 'Paid', goal: 'Paid work' },
  Unpaid: { label: 'Unpaid / volunteer', short: 'Unpaid · portfolio', goal: 'Passion project' },
  Equity: { label: 'Equity / co-founder', short: 'Equity', goal: 'Co-founder' },
};

const DEMO_POSTS = [
  {
    id: 'p-finance', type: 'work', author: 'sarah', rank: 40, time: 'Mon',
    title: 'Freelancer Finance: AI tax and savings planner (MVP)',
    body: 'Validated with 25 freelancer interviews and a 62-person waitlist. Building the MVP: income tracking and a quarterly tax estimate. Team is set and we are three weeks in.',
    roles: [{ track: 'Software Developer', count: 2, skills: ['Next.js', 'TypeScript', 'React', 'PostgreSQL'] }, { track: 'Business Developer', count: 1, skills: ['Financial modeling', 'Pitch decks'] }],
    hours: '20–40', weeks: 10, setting: 'Remote', pay: { type: 'Equity' }, industry: 'Fintech',
    deliverable: 'Working MVP: income tracking + quarterly tax estimate, tested with 10 waitlist users',
    status: 'in-progress', team: ['sarah', 'elena', 'marcus', 'me'], applicants: 7, chatId: 'g-finance', started: '2026-09',
    likes: 24, comments: [
      { from: 'priya', time: 'Mon', text: 'Love this. Quarterly taxes were my biggest headache as a contractor.' },
    ],
  },
  {
    id: 'p-tableturn', type: 'work', author: 'diego', rank: 39, time: '2h',
    title: 'TableTurn: booking page + deposit checkout for 3 pilot restaurants',
    body: 'Three independent restaurants in Miami have agreed to pilot a simple booking page with a refundable deposit to cut no-shows. I handle the restaurants; I need a developer to build it.',
    roles: [{ track: 'Software Developer', count: 1, skills: ['React', 'Node.js', 'PostgreSQL', 'Stripe'] }],
    hours: '10–20', weeks: 6, setting: 'Remote', pay: { type: 'Paid', amount: 1200 }, industry: 'Marketplaces',
    deliverable: 'Booking page and deposit checkout live for 3 restaurants',
    status: 'open', team: ['diego'], applicants: 2,
    attachments: [{ id: 'a-tt1', kind: 'image', name: 'tableturn-mockup.png', src: mockBrowser({ url: 'tableturn.app/casa-brava', accent: '#FF9500', heading: 'Book a table', rows: [['Fri 7:00 PM · 2 guests', 'Available'], ['Fri 7:30 PM · 4 guests', '$20 deposit'], ['Sat 8:00 PM · 2 guests', 'Waitlist']] }) }],
    likes: 11, comments: [{ from: 'marcus', time: '1h', text: 'Stripe deposits with refunds are a fun problem. Sending an application.' }],
  },
  {
    id: 'p-community-demo', type: 'community', author: 'aisha', rank: 38, time: '3h',
    title: 'Demo Day sign-ups close Friday',
    body: 'Teams need at least one Dev and one Biz member. Each team gets 5 minutes plus 3 minutes of questions. Hiring partners from 12 companies are coming 🎉',
    attachments: [{ id: 'a-dd', kind: 'image', name: 'demo-day.png', src: mockPoster({ title: 'Demo Day · Cohort 12', subtitle: 'Friday 6pm · sign-ups close Friday noon', from: '#5E5CE6', to: '#FF375F', emoji: '🚀' }) }],
    likes: 31, comments: [
      { from: 'tom', time: '2h', text: 'Practice run on Wednesday at 5pm for anyone who wants feedback.' },
      { from: 'diego', time: '1h', text: 'Will there be pizza again? Asking for the whole Biz track.' },
    ],
  },
  {
    id: 'p-refill', type: 'work', author: 'priya', rank: 37, time: '5h',
    title: 'RefillRadar: pharmacist dashboard prototype',
    body: 'My refill-prediction model works on public data. Next step is a tiny dashboard a pharmacist can use for one week, plus someone to run the pilot conversation with the pharmacy.',
    roles: [{ track: 'Software Developer', count: 1, skills: ['React', 'TypeScript', 'Data visualisation'] }, { track: 'Business Developer', count: 1, skills: ['Customer discovery', 'Partnerships'] }],
    hours: 'Under 10', weeks: 4, setting: 'Remote', pay: { type: 'Unpaid' }, industry: 'Health',
    deliverable: 'Dashboard prototype used by one pharmacy for a week, with written feedback',
    status: 'open', team: ['priya'], applicants: 1,
    attachments: [{ id: 'a-int', kind: 'doc', name: 'Pharmacy interview notes.pdf', mime: 'application/pdf', size: 39244, src: DEMO_FILES.interviews }],
    likes: 17, comments: [],
  },
  {
    id: 'p-rls', type: 'resource', author: 'marcus', rank: 36, time: '6h', kind: 'Link',
    title: 'Row-level security in Supabase, explained simply',
    body: 'This is the guide that finally made RLS click for me. Pair it with the policy examples section and you can secure a multi-user app in an afternoon.',
    tags: ['Supabase', 'PostgreSQL', 'Security'],
    attachments: [{ id: 'a-rls', kind: 'link', url: 'https://supabase.com/docs/guides/database/postgres/row-level-security', title: 'Row Level Security · Supabase Docs' }],
    likes: 19, saves: 12, comments: [{ from: 'hannah', time: '4h', text: 'Saving this. The policy examples are gold.' }],
  },
  {
    id: 'p-pricing-help', type: 'support', author: 'diego', rank: 35, time: '8h',
    title: 'How should I price a pilot for restaurants?',
    body: 'My three pilot restaurants want to try TableTurn first. Free for 6 weeks, or a small fee from day one so they take it seriously? Would love input from anyone who has run a pilot.',
    solved: false,
    likes: 6, comments: [
      { from: 'elena', time: '7h', text: 'Charge something small (even $49) and credit it back if they convert. Free pilots rarely get used.' },
      { from: 'sarah', time: '6h', text: 'Agree with Elena. Also agree the success metric up front: no-shows down by X%.' },
    ],
  },
  {
    id: 'p-footprint', type: 'personal', author: 'hannah', rank: 34, time: 'Yesterday', feedback: true,
    title: 'Footprint v0.3: carbon badges on checkout pages',
    body: 'Side project update: the extension now shows an estimated carbon cost next to the checkout button. Looking for feedback on the badge design and wording before I publish it.',
    attachments: [
      { id: 'a-fp1', kind: 'image', name: 'footprint-checkout.png', src: mockBrowser({ url: 'shop.example/checkout', accent: '#34C759', heading: 'Checkout', rows: [['Standard delivery · 3–5 days', '≈ 0.4 kg CO₂'], ['Express delivery · 1 day', '≈ 2.1 kg CO₂'], ['Pick up in store', '≈ 0.1 kg CO₂']] }) },
      { id: 'a-fp2', kind: 'image', name: 'footprint-popup.png', src: mockPoster({ title: 'Footprint', subtitle: 'You saved 3.2 kg CO₂ this month', from: '#30D158', to: '#0A84FF', emoji: '🌱' }) },
    ],
    likes: 22, comments: [{ from: 'aisha', time: 'Yesterday', text: 'Love it! Maybe add a tiny "why?" link next to the number?' }],
  },
  {
    id: 'p-gradeloop', type: 'work', author: 'tom', rank: 33, time: 'Yesterday',
    title: 'GradeLoop: 3-week research sprint on teacher feedback',
    body: 'Thirty teacher interviews say feedback time, not grading, is the pain. I want to test two prototype concepts with 8 teachers. Great portfolio project for anyone into UX research or prototyping.',
    roles: [{ track: 'Business Developer', count: 1, skills: ['UX research', 'User interviews'] }, { track: 'Software Developer', count: 1, skills: ['Figma', 'React'] }],
    hours: '10–20', weeks: 3, setting: 'Hybrid', pay: { type: 'Unpaid' }, industry: 'Edtech',
    deliverable: 'Two clickable prototypes tested with 8 teachers + a findings report',
    status: 'open', team: ['tom'], applicants: 0,
    likes: 9, comments: [],
  },
  {
    id: 'p-unit-econ', type: 'resource', author: 'elena', rank: 32, time: 'Yesterday', kind: 'Doc',
    title: 'Unit economics template for your Demo Day pitch',
    body: 'One-page template I use with founders: CAC, LTV, payback, churn, with example numbers. Fill in your own before Demo Day; investors always ask.',
    tags: ['Pitch decks', 'Financial modeling'],
    attachments: [{ id: 'a-ue', kind: 'doc', name: 'Unit economics template.pdf', mime: 'application/pdf', size: 57477, src: DEMO_FILES.unitEcon }],
    likes: 28, saves: 21, comments: [{ from: 'tom', time: 'Yesterday', text: 'This is exactly what I needed for the GradeLoop pitch. Thank you!' }],
  },
  {
    id: 'p-fastapi', type: 'support', author: 'priya', rank: 31, time: 'Tue',
    title: 'FastAPI auth: JWT or session cookies for a small web app?',
    body: 'Building the RefillRadar API. It is only used by our own web dashboard. JWTs everywhere online, but cookies seem simpler. What would you pick?',
    solved: true,
    likes: 8, comments: [
      { from: 'marcus', time: 'Tue', text: 'For a first-party web app, HTTP-only session cookies. Simpler and safer against XSS than JWTs in localStorage.' },
      { from: 'hannah', time: 'Tue', text: '+1, and set SameSite=Lax.' },
      { from: 'priya', time: 'Tue', text: 'Went with cookies, working great. Marking solved, thanks both!' },
    ],
  },
  {
    id: 'p-footprint-landing', type: 'work', author: 'hannah', rank: 30, time: 'Tue',
    title: 'Landing page copy and launch plan for Footprint',
    body: 'Footprint is almost ready to publish. I need a Business Dev partner to write the landing page and plan a small launch (Product Hunt + two climate newsletters).',
    roles: [{ track: 'Business Developer', count: 1, skills: ['Copywriting', 'Growth marketing'] }],
    hours: 'Under 10', weeks: 2, setting: 'Remote', pay: { type: 'Paid', amount: 400 }, industry: 'Climate',
    deliverable: 'Published landing page + launch checklist executed',
    status: 'open', team: ['hannah'], applicants: 1,
    likes: 7, comments: [],
  },
  {
    id: 'p-studysprint', type: 'personal', author: 'aisha', rank: 29, time: 'Mon', feedback: false,
    title: 'StudySprint redesign is live on TestFlight',
    body: 'New home screen with streaks and a calmer timer. 1,200 testers so far. Thanks to everyone who gave feedback on the first version!',
    attachments: [
      { id: 'a-ss1', kind: 'image', name: 'studysprint-home.png', src: mockPhone({ accent: '#AF52DE', title: 'Today', items: ['Biology · 25 min', 'Algebra · 25 min', 'Essay draft · 50 min'] }) },
      { id: 'a-ss2', kind: 'image', name: 'studysprint-streak.png', src: mockPhone({ accent: '#FF9500', title: 'Streak', items: ['🔥 12 days', 'Best: 18 days', 'This week: 6h 40m'] }) },
    ],
    likes: 34, comments: [{ from: 'marcus', time: 'Mon', text: 'The streak screen is so clean.' }],
  },
  {
    id: 'p-welcome', type: 'community', author: 'tom', rank: 28, time: 'Mon',
    title: 'Welcome to everyone who joined this week 👋',
    body: 'Introduce yourself in the comments: your track, what you did before the bootcamp, and one thing you want to build. Office hours with mentors are every Thursday at 4pm.',
    likes: 15, comments: [
      { from: 'hannah', time: 'Mon', text: 'Hi! Software Dev, ex-energy company frontend dev, want to build climate tools 🌱' },
      { from: 'diego', time: 'Mon', text: 'Business Dev, ran restaurants for 7 years, building a booking marketplace.' },
    ],
  },
  {
    id: 'p-yc-library', type: 'resource', author: 'sarah', rank: 27, time: 'Sun', kind: 'Link',
    title: 'Free startup library worth bookmarking',
    body: 'Short essays and videos on finding co-founders, talking to users, and pricing. I rewatch the "How to talk to users" talk before every interview round.',
    tags: ['Customer discovery', 'Fundraising'],
    attachments: [{ id: 'a-yc', kind: 'link', url: 'https://www.ycombinator.com/library', title: 'Startup Library · Y Combinator' }],
    likes: 12, saves: 9, comments: [],
  },
];
