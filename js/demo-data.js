// Bootcamp Connect prototype: sample members and conversations (specs/04-connections-messages.md)
// Plain script (shared globals); load order is set in prototype.html.

// ---------- Demo community: connections, profiles, group chats (specs/04-connections-messages.md) ----------
// Sample members for the prototype. Not real people.
const DEMO_PEOPLE = [
  {
    id: 'elena', first: 'Elena', last: 'Rostova', colors: ['#5E5CE6', '#BF5AF2'], connected: true,
    track: 'Business Developer', headline: 'Ex-fintech analyst · market validation & growth strategy',
    location: 'Berlin, Germany', setting: 'Remote', available: '2026-11-01',
    about: 'Four years as an analyst at a payments startup, now switching to the founder side. I validate markets fast: customer interviews, pricing tests, and a financial model before a single line of code. Looking for a technical co-founder who likes shipping small and learning from real users.',
    experience: [
      { title: 'Business Developer Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Running customer discovery for two cohort projects; built the pricing model for Freelancer Finance.' },
      { title: 'Financial Analyst', company: 'Paylane', start: '2022-03', end: '2026-05', desc: 'Owned the unit-economics model for SMB payments; cut customer acquisition cost 22% by reworking the referral program.' },
    ],
    skills: ['Financial modeling', 'Market research', 'Pitch decks', 'Outbound sales', 'Fundraising', 'Pricing'],
    projects: [{ title: 'Freelancer Finance pricing model', role: 'Business lead', desc: 'Three-tier pricing tested with 40 freelancers; 18% said they would pay for the Pro tier.' }],
    goals: ['Co-founder'], hours: '20–40', idea: 'Open to both', industries: ['Fintech', 'AI'],
    learn: ['SQL', 'Product management'], openTo: ['Equity', 'Paid'], connections: 14,
    endorsements: { 'Financial modeling': 4, 'Market research': 3, 'Pitch decks': 2 },
    verified: [{ title: 'Pricing study for a meal-kit startup', role: 'Business Dev', with: ['tom'], end: '2026-08', rating: 4.9, endorsed: ['Pricing', 'Market research'] }],
  },
  {
    id: 'sarah', first: 'Sarah', last: 'Jenkins', colors: ['#FF9F0A', '#FF375F'], connected: true,
    track: 'Business Developer', headline: 'Building an AI tax and savings planner for freelancers',
    location: 'Chicago, IL', setting: 'Hybrid', available: '2026-10-15',
    about: 'Freelance marketer for six years, which is how I learned the hard way that quarterly taxes are terrifying. Now building the tool I wish I had. 62 people on the waitlist and counting.',
    experience: [
      { title: 'Founder', company: 'Freelancer Finance (pre-launch)', start: '2026-07', current: true, desc: 'Validated the idea with 25 interviews; grew the waitlist to 62 through Reddit and LinkedIn posts.' },
      { title: 'Freelance Growth Marketer', company: 'Self-employed', start: '2020-01', end: '2026-06', desc: 'Ran paid acquisition for 14 DTC brands; average 3.1x return on ad spend.' },
    ],
    skills: ['Growth marketing', 'Customer discovery', 'Copywriting', 'Product management', 'Pitch decks'],
    projects: [{ title: 'Freelancer Finance waitlist', role: 'Founder', desc: 'Landing page and referral loop that reached 62 signups in five weeks with no ad spend.' }],
    goals: ['Co-founder', 'Hiring teammates'], hours: '40+', idea: 'I have an idea', industries: ['Fintech', 'AI'],
    learn: ['SQL', 'Financial modeling'], openTo: ['Equity'], connections: 21,
    endorsements: { 'Growth marketing': 5, 'Copywriting': 3 },
    verified: [],
  },
  {
    id: 'marcus', first: 'Marcus', last: 'Johnson', colors: ['#0A84FF', '#30D158'], connected: true,
    track: 'Software Developer', headline: 'Full-stack developer · ex-Army logistics · loves clean APIs',
    location: 'Atlanta, GA', setting: 'Hybrid', available: '2026-10-20',
    about: 'Eight years running logistics in the Army taught me to keep systems boring and reliable. Now I build them in TypeScript. Happy to pair, review code, or take on paid side projects.',
    experience: [
      { title: 'Software Engineering Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Building auth and payments for Freelancer Finance in Next.js and Supabase.' },
      { title: 'Logistics Officer', company: 'U.S. Army', start: '2017-05', end: '2025-12', desc: 'Planned supply for a 600-person unit; built an Access tool that replaced a 40-tab spreadsheet.' },
    ],
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    projects: [
      { title: 'Freelancer Finance auth + billing', role: 'Backend', desc: 'Supabase auth, row-level security, and Stripe webhooks.' },
      { title: 'Convoy Planner', role: 'Solo', desc: 'Route and load planner for small fleets; used by two local delivery companies.' },
    ],
    goals: ['Paid work', 'Passion project'], hours: '10–20', idea: 'I want to join an idea', industries: ['Fintech', 'Marketplaces'],
    learn: ['Stripe', 'AWS'], openTo: ['Paid', 'Unpaid'], connections: 18,
    endorsements: { 'TypeScript': 4, 'React': 3, 'Node.js': 3, 'PostgreSQL': 2 },
    verified: [{ title: 'Cohort 12 attendance tracker', role: 'Software Dev', with: ['tom', 'aisha'], end: '2026-08', rating: 5, endorsed: ['React', 'Node.js', 'PostgreSQL'] }],
  },
  {
    id: 'priya', first: 'Priya', last: 'Raman', colors: ['#30D158', '#64D2FF'], connected: true,
    track: 'Software Developer', headline: 'ML engineer in training · former pharmacy technician',
    location: 'Austin, TX', setting: 'Remote', available: '2026-11-15',
    about: 'Five years behind a pharmacy counter showed me how many people miss refills. I am learning ML to fix that. I like Python, small models that run cheaply, and talking to patients before building anything.',
    experience: [
      { title: 'Software Engineering Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Prototyping a refill-prediction model on public claims data.' },
      { title: 'Pharmacy Technician', company: 'Independent pharmacy, Austin', start: '2020-02', end: '2026-05', desc: 'Handled 200+ prescriptions a day; set up the text-reminder system the pharmacy still uses.' },
    ],
    skills: ['Python', 'PyTorch', 'FastAPI', 'SQL', 'Data analysis', 'User interviews'],
    projects: [{ title: 'RefillRadar', role: 'ML + backend', desc: 'Predicts which patients are likely to miss a refill; 0.81 AUC on a public dataset.' }],
    goals: ['Co-founder'], hours: '20–40', idea: 'I have an idea', industries: ['Health', 'AI'],
    learn: ['React', 'Customer discovery'], openTo: ['Equity', 'Unpaid'], connections: 9,
    endorsements: { 'Python': 4, 'Data analysis': 3, 'SQL': 2 },
    verified: [{ title: 'Pharmacy refill survey analysis', role: 'Software Dev', with: ['diego'], end: '2026-09', rating: 4.8, endorsed: ['Python', 'Data analysis'] }],
  },
  {
    id: 'diego', first: 'Diego', last: 'Hernández', colors: ['#FF9F0A', '#FFD60A'], connected: true,
    track: 'Business Developer', headline: 'Ex-restaurant manager · operations and sales for marketplaces',
    location: 'Miami, FL', setting: 'In person', available: '2026-10-10',
    about: 'Ran two busy restaurants for seven years. I know how independent restaurants buy software, and how they don\'t. Building a booking marketplace with three restaurants already lined up for a pilot.',
    experience: [
      { title: 'Business Developer Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Signed three pilot restaurants for a table-booking marketplace.' },
      { title: 'General Manager', company: 'Casa Brava', start: '2019-04', end: '2026-05', desc: 'Grew revenue 35% in two years; cut no-shows in half with a deposit system.' },
    ],
    skills: ['Operations', 'Sales', 'Customer discovery', 'Partnerships', 'Spanish'],
    projects: [{ title: 'TableTurn pilot', role: 'Business lead', desc: 'Booking and deposit tool for independent restaurants; three pilots signed.' }],
    goals: ['Co-founder', 'Paid work'], hours: '40+', idea: 'I have an idea', industries: ['Marketplaces', 'Consumer'],
    learn: ['SQL', 'Product management'], openTo: ['Paid', 'Equity'], connections: 11,
    endorsements: { 'Operations': 4, 'Sales': 3, 'Customer discovery': 2 },
    verified: [{ title: 'Pharmacy refill survey analysis', role: 'Business Dev', with: ['priya'], end: '2026-09', rating: 4.9, endorsed: ['Customer discovery', 'Operations'] }],
  },
  {
    id: 'aisha', first: 'Aisha', last: 'Bello', colors: ['#BF5AF2', '#FF375F'], connected: false,
    track: 'Software Developer', headline: 'Mobile developer · React Native and Swift · design-minded',
    location: 'London, UK', setting: 'Remote', available: '2026-12-01',
    about: 'I build mobile apps that feel native. Previously a graphic designer, so I care a lot about the details. Organising Demo Day for Cohort 12.',
    experience: [
      { title: 'Software Engineering Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Demo Day organiser; building a study-planner app in React Native.' },
      { title: 'Graphic Designer', company: 'Northlight Studio', start: '2019-09', end: '2026-04', desc: 'Brand and app design for 30+ clients.' },
    ],
    skills: ['React Native', 'Swift', 'Figma', 'TypeScript', 'UI design'],
    projects: [{ title: 'StudySprint', role: 'Solo', desc: 'Pomodoro study planner with streaks; 1,200 TestFlight users.' }],
    goals: ['Passion project', 'Paid work'], hours: '10–20', idea: 'Open to both', industries: ['Edtech', 'Health'],
    learn: ['Node.js', 'Pitch decks'], openTo: ['Paid', 'Unpaid'], connections: 6,
    endorsements: { 'UI design': 4, 'Figma': 3, 'React Native': 2 },
    verified: [{ title: 'Cohort 12 attendance tracker', role: 'Software Dev', with: ['marcus', 'tom'], end: '2026-08', rating: 4.9, endorsed: ['React Native', 'UI design'] }],
  },
  {
    id: 'tom', first: 'Tom', last: 'Nguyen', colors: ['#64D2FF', '#5E5CE6'], connected: false,
    track: 'Business Developer', headline: 'Former teacher · product and UX research for edtech',
    location: 'Seattle, WA', setting: 'Hybrid', available: '2026-11-01',
    about: 'Taught high-school maths for nine years. Now moving into product: I run user research, write specs, and keep teams focused on what students actually need.',
    experience: [
      { title: 'Business Developer Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Cohort community lead; running interviews with 30 teachers about grading tools.' },
      { title: 'Maths Teacher', company: 'Lakeside High School', start: '2017-08', end: '2026-06', desc: 'Built a peer-tutoring program that raised pass rates 14%.' },
    ],
    skills: ['UX research', 'Product management', 'Roadmapping', 'Public speaking'],
    projects: [{ title: 'GradeLoop research', role: 'Researcher', desc: 'Interviewed 30 teachers; found feedback time, not grading, is the main pain point.' }],
    goals: ['Co-founder'], hours: '20–40', idea: 'I want to join an idea', industries: ['Edtech'],
    learn: ['Figma', 'SQL'], openTo: ['Unpaid', 'Equity'], connections: 4,
    endorsements: { 'UX research': 5, 'Product management': 3 },
    verified: [
      { title: 'Cohort 12 attendance tracker', role: 'Business Dev', with: ['marcus', 'aisha'], end: '2026-08', rating: 4.8, endorsed: ['UX research', 'Product management'] },
      { title: 'Pricing study for a meal-kit startup', role: 'Business Dev', with: ['elena'], end: '2026-08', rating: 4.7, endorsed: ['UX research'] },
    ],
  },
  {
    id: 'hannah', first: 'Hannah', last: 'Kim', colors: ['#30D158', '#0A84FF'], connected: false,
    track: 'Software Developer', headline: 'Frontend engineer · design systems · climate tech',
    location: 'Toronto, Canada', setting: 'Remote', available: '2026-10-25',
    about: 'I build accessible, fast interfaces and the design systems behind them. Most excited about climate tools that help people make better everyday choices.',
    experience: [
      { title: 'Software Engineering Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Building a shared component library for cohort projects.' },
      { title: 'Junior Frontend Developer', company: 'Greenline Energy', start: '2024-01', end: '2026-05', desc: 'Rebuilt the customer dashboard; Lighthouse accessibility score from 64 to 98.' },
    ],
    skills: ['TypeScript', 'React', 'Tailwind CSS', 'Accessibility', 'Figma'],
    projects: [{ title: 'Footprint', role: 'Frontend', desc: 'Browser extension that shows the carbon cost of online orders.' }],
    goals: ['Paid work', 'Passion project'], hours: '10–20', idea: 'Open to both', industries: ['Climate', 'Consumer'],
    learn: ['Node.js', 'Growth marketing'], openTo: ['Paid', 'Unpaid'], connections: 3,
    endorsements: { 'Accessibility': 3, 'React': 2 },
    verified: [],
  },
];

// Fallback replies (used when Claude isn't available, e.g. a local copy): fit any conversation
const DEMO_REPLIES = {
  elena: ['Love that. Let\'s talk it through on Thursday?', 'Good thinking. I\'ll add it to my notes for the model.', 'Agreed! Want me to sanity-check the numbers?'],
  sarah: ['Yes! That\'s exactly what we heard in the interviews.', 'Love it 🙌 Let\'s bring it to standup.', 'Great, can you share more details?'],
  marcus: ['Sounds good to me 👍', 'Happy to help. Want to pair on it this week?', 'Nice, I\'ll take a look tonight.'],
  priya: ['Great idea! Let\'s keep the first version tiny.', 'I\'m in. Want to set up a quick call?', 'Love it. I can bring data to back that up.'],
  diego: ['Count me in!', 'Let\'s do it. I\'ll bring the business side.', 'Love the energy 🙌'],
  aisha: ['Nice! Let\'s chat at the mixer.', 'Love that. I can help with the design side.', 'Sounds great, send me the details.'],
  tom: ['Great question! Let\'s dig into it together.', 'Love this. Want to grab 20 minutes this week?', 'Count me in.'],
  hannah: ['Sounds great!', 'I can help with the UI for that.', 'Love it. Let\'s make it accessible from day one.'],
};

const DEMO_CHATS = [
  {
    id: 'g-finance', type: 'group', name: 'Freelancer Finance MVP', colors: ['#0A84FF', '#30D158'], members: ['sarah', 'elena', 'marcus'], unread: 2, rank: 5,
    messages: [
      { from: 'sarah', day: 'Monday', time: '9:02 AM', text: 'Morning team! The waitlist just passed 62 signups 🎉' },
      { from: 'elena', day: 'Monday', time: '9:05 AM', text: '38% of those came from the r/freelance post. That channel is worth doubling down on.' },
      { from: 'me', day: 'Monday', time: '9:20 AM', text: 'Nice! I pushed the Supabase schema last night: users, income_streams, tax_buckets. Can you sanity-check the tax bucket fields?' },
      { from: 'marcus', day: 'Monday', time: '9:41 AM', text: 'Looks good. I\'d add a currency column to income_streams now, before we have real data.' },
      { from: 'sarah', day: 'Yesterday', time: '4:15 PM', text: 'Customer call notes: 4 of 5 freelancers said quarterly tax estimates are their #1 stress.' },
      { from: 'elena', day: 'Yesterday', time: '4:22 PM', text: 'That\'s our headline. I\'ll rework slide 3 of the deck around it.' },
      { from: 'me', day: 'Yesterday', time: '4:30 PM', text: 'Agreed. I can have a rough quarterly-estimate screen by Friday.' },
      { from: 'marcus', day: 'Today', time: '10:12 AM', text: 'PR is up for the auth flow, ready for review whenever 🙏' },
      { from: 'sarah', day: 'Today', time: '10:40 AM', text: 'Standup at 6pm? I\'ll share the updated pitch deck.' },
    ],
  },
  {
    id: 'g-cohort', type: 'group', name: 'Cohort 12 · Dev × Biz Mixer', colors: ['#BF5AF2', '#FF9F0A'], members: ['tom', 'diego', 'hannah', 'aisha', 'priya', 'marcus', 'elena'], unread: 4, rank: 4,
    messages: [
      { from: 'tom', day: 'Yesterday', time: '11:00 AM', text: 'Welcome to everyone who joined this week 👋 This chat is for finding project partners across tracks.' },
      { from: 'diego', day: 'Yesterday', time: '11:14 AM', text: 'Business Dev here. Looking for a developer to build a booking marketplace for independent restaurants. Three restaurants are already lined up for a pilot.' },
      { from: 'hannah', day: 'Yesterday', time: '11:30 AM', text: 'Frontend and design systems person. Happy to help with UI for anything climate-related 🌱' },
      { from: 'aisha', day: 'Today', time: '8:45 AM', text: 'Reminder: Demo Day sign-ups close Friday. Teams need at least one Dev and one Biz member.' },
      { from: 'priya', day: 'Today', time: '9:10 AM', text: 'Anyone up for a 30-minute pairing session on FastAPI auth this afternoon?' },
      { from: 'marcus', day: 'Today', time: '9:12 AM', text: 'I\'m in. 3pm works.' },
      { from: 'diego', day: 'Today', time: '9:30 AM', text: 'Also: free pizza at the Thursday mixer 🍕' },
    ],
  },
  {
    id: 'g-health', type: 'group', name: 'Health Tech Builders', colors: ['#30D158', '#64D2FF'], members: ['priya', 'aisha'], unread: 0, rank: 1,
    messages: [
      { from: 'priya', day: 'Monday', time: '7:50 PM', text: 'Sharing my notes from 12 pharmacy interviews: missed refills are the biggest gap, not reminders.' },
      { from: 'aisha', day: 'Monday', time: '8:05 PM', text: 'That changes the product. Refill prediction plus a one-tap reorder?' },
      { from: 'me', day: 'Monday', time: '8:20 PM', text: 'I can prototype the reorder flow. Do we have a pharmacy to test with?' },
      { from: 'priya', day: 'Monday', time: '8:31 PM', text: 'Not yet. I know the manager of an independent pharmacy in Austin. I\'ll ask this week.' },
    ],
  },
  {
    id: 'd-elena', type: 'dm', members: ['elena'], unread: 1, rank: 3,
    messages: [
      { from: 'elena', day: 'Monday', time: '10:30 AM', text: 'Hey! Saw your profile. Loved your project submission for the AI finance app.' },
      { from: 'me', day: 'Monday', time: '10:36 AM', text: 'Thanks Elena! Your market validation experience is exactly what this needs.' },
      { from: 'elena', day: 'Monday', time: '10:42 AM', text: 'Let\'s review the API spec together. Does Thursday work?' },
      { from: 'elena', day: 'Today', time: '11:05 AM', text: 'Also sent you my draft financial model. Curious what you think 📊' },
    ],
  },
  {
    id: 'd-marcus', type: 'dm', members: ['marcus'], unread: 0, rank: 2,
    messages: [
      { from: 'marcus', day: 'Yesterday', time: '6:10 PM', text: 'Thanks for the review on my PR. The useEffect cleanup tip fixed the memory leak.' },
      { from: 'me', day: 'Yesterday', time: '6:15 PM', text: 'Anytime! Want to pair on the Stripe webhook next week?' },
      { from: 'marcus', day: 'Yesterday', time: '6:18 PM', text: 'Yes please. Tuesday 7pm?' },
    ],
  },
];
