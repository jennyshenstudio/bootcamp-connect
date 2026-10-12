// Bootcamp Connect prototype: sample feed posts (specs/05-feed.md).
// Plain script (shared globals); load order is set in index.html.
// Posts from the sample members in demo-data.js. Not real people or projects.
// Opportunities (type 'work') follow specs/12-opportunities.md and updates specs/13-updates.md.

const POST_TYPES = {
  work: { label: 'Opportunity', plural: 'Opportunities', icon: 'i-briefcase', cls: 'bg-appleBlue/10 text-blueText' },
  update: { label: 'Update', plural: 'Updates', icon: 'i-megaphone', cls: 'bg-applePurple/15 text-purpleText' },
  support: { label: 'Support', plural: 'Support', icon: 'i-help', cls: 'bg-appleOrange/15 text-orangeText' },
  resource: { label: 'Resource', plural: 'Resources', icon: 'i-book', cls: 'bg-appleGreen/15 text-greenText' },
};

// Updates (specs/13-updates.md): professional announcements about a career or a project
const UPDATE_LABELS = ['Career', 'Project'];

// Opportunities (specs/12-opportunities.md): fees are fixed and in pounds (D002, D040).
const COMMITMENTS = ['Part-time', 'Full-time', 'Contract'];
const WORKPLACES = ['In person', 'Hybrid', 'Remote'];

const PAY_TYPES = {
  Paid: { label: 'Paid (fixed fee)', short: 'Paid', goal: 'Paid work' },
  Unpaid: { label: 'Unpaid / volunteer', short: 'Unpaid · portfolio', goal: 'Passion project' },
  Equity: { label: 'Equity / co-founder', short: 'Equity', goal: 'Co-founder' },
};

const DEMO_POSTS = [
  {
    id: 'p-finance', type: 'work', author: 'sarah', rank: 40, time: 'Mon',
    title: 'Freelancer Finance: AI tax and savings planner (MVP)',
    body: 'Validated with 25 freelancer interviews and a 62-person waitlist. Building the MVP: income tracking and a running tax estimate. Team is set and we are three weeks in.',
    lookingFor: 'Software Developer', pay: { type: 'Unpaid' }, commitment: 'Part-time', workplace: 'Remote',
    start: '2026-09-14', end: '2026-11-20',
    responsibilities: ['Build income tracking and the running tax estimate in Next.js', 'Test each release with 10 people from the waitlist', 'Join a weekly planning call with the team'],
    requirements: ["You've built a web app with React or Next.js", "You've worked with a database such as PostgreSQL"],
    niceToHave: ['You know how UK Self Assessment works'],
    status: 'in-progress', team: ['sarah', 'elena', 'marcus', 'me'], applicants: 7, chatId: 'g-finance', started: '2026-09',
    likes: 24, comments: [
      { from: 'priya', time: 'Mon', text: 'Love this. Self Assessment was my biggest headache as a contractor.' },
    ],
  },
  {
    id: 'p-tableturn', type: 'work', author: 'diego', rank: 39, time: '2h',
    title: 'TableTurn: booking page + deposit checkout for 3 pilot restaurants',
    body: 'Three independent restaurants in Bristol have agreed to pilot a simple booking page with a refundable deposit to cut no-shows. I handle the restaurants; I need a developer to build it.',
    lookingFor: 'Software Developer', pay: { type: 'Paid', amount: 950 }, commitment: 'Part-time', workplace: 'Hybrid', town: 'Bristol',
    start: '2026-11-02', end: '2026-12-14',
    responsibilities: ['Build the booking page and the deposit checkout', "Set it up for each restaurant's tables and opening hours", 'Join a weekly call with me and the restaurant owners'],
    requirements: ["You've built and launched a web app with React and Node.js"],
    niceToHave: ["You've taken online payments with Stripe"],
    status: 'open', team: ['diego'], applicants: 2,
    attachments: [{ id: 'a-tt1', kind: 'image', name: 'tableturn-mockup.png', src: mockBrowser({ url: 'tableturn.app/casa-brava', accent: '#FF9500', heading: 'Book a table', rows: [['Fri 7:00pm · 2 guests', 'Available'], ['Fri 7:30pm · 4 guests', '£20 deposit'], ['Sat 8:00pm · 2 guests', 'Waitlist']] }) }],
    likes: 11, comments: [{ from: 'marcus', time: '1h', text: 'Stripe deposits with refunds are a fun problem. Sending an application.' }],
  },
  {
    id: 'u-elena-client', type: 'update', label: 'Career', author: 'elena', rank: 38, time: '3h',
    body: "Some news: I've signed my first consulting client, a small fintech in London. Over the next 8 weeks I'll help them test pricing with 50 customers.\n\nThe unit economics template I shared here was the first thing they asked to see. Thank you to everyone here who gave me practice pitches.",
    likes: 31, comments: [
      { from: 'sarah', time: '2h', text: 'Congratulations, Elena! Well deserved.' },
      { from: 'diego', time: '1h', text: 'Brilliant news. Pricing tests are exactly where you shine.' },
    ],
  },
  {
    id: 'p-refill', type: 'work', author: 'priya', rank: 37, time: '5h',
    title: 'RefillRadar: pharmacist dashboard prototype',
    body: 'My refill-prediction model works on public data. Next step is a tiny dashboard a pharmacist can use for one week, plus someone to run the pilot conversation with the pharmacy.',
    lookingFor: 'Software Developer', pay: { type: 'Unpaid' }, commitment: 'Part-time', workplace: 'Remote',
    start: '2026-11-09', end: '2026-12-04',
    responsibilities: ['Build a small dashboard in React that shows predicted refills', 'Make it simple enough for a pharmacist to use for one week', 'Collect written feedback from the pharmacy'],
    requirements: ["You've built a React app with TypeScript"],
    niceToHave: ["You've made charts or other data visualisation"],
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
      { from: 'elena', time: '7h', text: 'Charge something small (even £39) and credit it back if they convert. Free pilots rarely get used.' },
      { from: 'sarah', time: '6h', text: 'Agree with Elena. Also agree the success metric up front: no-shows down by X%.' },
    ],
  },
  {
    id: 'p-footprint', type: 'update', label: 'Project', author: 'hannah', rank: 34, time: 'Yesterday',
    body: 'Footprint v0.3 is out: the browser extension now shows an estimated carbon cost next to the checkout button, so you can pick the lower-carbon delivery option. Publishing to the Chrome Web Store next week.',
    attachments: [
      { id: 'a-fp1', kind: 'image', name: 'footprint-checkout.png', src: mockBrowser({ url: 'shop.example/checkout', accent: '#34C759', heading: 'Checkout', rows: [['Standard delivery · 3–5 days', '≈ 0.4 kg CO₂'], ['Express delivery · 1 day', '≈ 2.1 kg CO₂'], ['Pick up in store', '≈ 0.1 kg CO₂']] }) },
      { id: 'a-fp2', kind: 'image', name: 'footprint-popup.png', src: mockPoster({ title: 'Footprint', subtitle: 'You saved 3.2 kg CO₂ this month', from: '#30D158', to: '#0A84FF', emoji: '🌱' }) },
    ],
    likes: 22, comments: [{ from: 'aisha', time: 'Yesterday', text: 'Love this! Can\'t wait to try it.' }],
  },
  {
    id: 'p-gradeloop', type: 'work', author: 'tom', rank: 33, time: 'Yesterday',
    title: 'GradeLoop: 3-week research sprint on teacher feedback',
    body: 'Thirty teacher interviews say feedback time, not grading, is the pain. I want to test two prototype concepts with 8 teachers. Great portfolio project for anyone into UX research or prototyping.',
    lookingFor: 'Business Developer', pay: { type: 'Unpaid' }, commitment: 'Part-time', workplace: 'Hybrid', town: 'Manchester',
    start: '2026-11-02', end: '2026-11-20',
    responsibilities: ['Plan and run interviews with 8 teachers', 'Test two prototype concepts with them', 'Write up what we learned in a short findings report'],
    requirements: ["You've run user interviews or customer research"],
    niceToHave: ["You've worked in or with schools"],
    status: 'open', team: ['tom'], applicants: 0,
    likes: 9, comments: [],
  },
  {
    id: 'p-unit-econ', type: 'resource', author: 'elena', rank: 32, time: 'Yesterday', kind: 'Doc',
    title: 'Unit economics template for your Demo Day pitch',
    body: 'One-page template I use with founders: CAC, LTV, payback, churn, with example numbers. Fill in your own before Demo Day; investors always ask.',
    tags: ['Pitch decks', 'Financial modelling'],
    attachments: [{ id: 'a-ue', kind: 'doc', name: 'Unit economics template.pdf', mime: 'application/pdf', size: 57492, src: DEMO_FILES.unitEcon }],
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
    lookingFor: 'Business Developer', pay: { type: 'Paid', amount: 300 }, commitment: 'Contract', workplace: 'Remote',
    start: '2026-11-16', end: '2026-11-27',
    responsibilities: ['Write the landing page copy', 'Plan a small launch on Product Hunt and two climate newsletters', 'Run the launch checklist on the day'],
    requirements: ["You've written copy for a product or a landing page"],
    niceToHave: ["You've launched something on Product Hunt"],
    status: 'open', team: ['hannah'], applicants: 1,
    likes: 7, comments: [],
  },
  {
    id: 'p-studysprint', type: 'update', label: 'Project', author: 'aisha', rank: 29, time: 'Mon',
    body: "StudySprint's redesign is live on TestFlight: a new home screen with streaks and a calmer timer. 1,200 testers so far. Thanks to everyone who tried the first version!",
    attachments: [
      { id: 'a-ss1', kind: 'image', name: 'studysprint-home.png', src: mockPhone({ accent: '#AF52DE', title: 'Today', items: ['Biology · 25 min', 'Algebra · 25 min', 'Essay draft · 50 min'] }) },
      { id: 'a-ss2', kind: 'image', name: 'studysprint-streak.png', src: mockPhone({ accent: '#FF9500', title: 'Streak', items: ['🔥 12 days', 'Best: 18 days', 'This week: 6h 40m'] }) },
    ],
    likes: 34, comments: [{ from: 'marcus', time: 'Mon', text: 'The streak screen is so clean.' }],
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
