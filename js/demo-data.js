// Bootcamp Connect prototype: sample members and conversations (specs/04-connections-messages.md)
// Plain script (shared globals); load order is set in index.html.

// ---------- Demo community: connections, profiles, group chats (specs/04-connections-messages.md) ----------
// Sample members for the prototype. Not real people.
const DEMO_PEOPLE = [
  {
    id: 'elena', first: 'Elena', last: 'Rostova', colors: ['#5E5CE6', '#BF5AF2'], connected: true,
    track: 'Business Developer', headline: 'Ex-fintech analyst · market validation & growth strategy',
    location: 'London, UK', setting: 'Remote', available: '2026-11-01',
    cohort: 12, stage: 'Exploring an idea', currently: 'Building the financial model for Freelancer Finance',
    education: [{ school: 'University of Westmere', course: 'BSc Economics', start: '2015', end: '2018' }],
    about: 'Four years as an analyst at a payments startup, now switching to the founder side. I validate markets fast: customer interviews, pricing tests, and a financial model before a single line of code. Looking for a technical co-founder who likes shipping small and learning from real users.',
    experience: [
      { title: 'Business Developer Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Running customer discovery for two cohort projects; built the pricing model for Freelancer Finance.' },
      { title: 'Financial Analyst', company: 'Tillwise Accounting', start: '2022-03', end: '2026-05', desc: 'Owned the unit-economics model for small business payments; cut customer acquisition cost 22% by reworking the referral scheme.' },
    ],
    skills: ['Financial modelling', 'Market research', 'Pitch decks', 'Outbound sales', 'Fundraising', 'Pricing'],
    work: [
      { title: "Freelancer Finance pricing model", link: "freelancerfinance.example/pricing", code: "", problem: "Freelancers wouldn't say what they'd pay for a tax planner.", role: "Ran the pricing research and built the revenue model.", did: "Tested 3 price tiers with 40 freelancers and modelled revenue for each one.", result: "18% said they would pay for the Pro tier. The team chose a £9 a month plan.", change: "", summary: "Tested 3 price tiers with 40 freelancers; 18% would pay for Pro.", facts: {"role": "Led", "team": "4 to 6", "length": "1 to 3 months", "reached": "Prototype"}, skills: ["Pricing", "Financial modelling", "Market research"], builtWith: ["Excel", "Typeform", "Claude"], teammates: [{"id": "sarah", "confirmed": true}], industry: "Fintech" },
      { title: "Pricing study for a meal-kit start-up", link: "", code: "", problem: "A meal-kit start-up was losing money on every box.", role: "Built the unit economics model with Tom.", did: "Worked out the cost of each box and tested 3 box sizes with customers.", result: "New pricing made every box profitable. The founders adopted it.", change: "", summary: "Unit economics and pricing that made every box profitable.", facts: {"role": "Contributed", "team": "2 to 3", "length": "Under a month", "reached": "Earning money"}, skills: ["Pricing", "Financial modelling", "Market research"], builtWith: ["Excel"], teammates: [{"id": "tom", "confirmed": true}], industry: "Consumer" },
    ],
    goals: ['Co-founder'], hours: '20–40', idea: 'Open to both', industries: ['Fintech', 'AI'],
    learn: ['SQL', 'Product management'], openTo: ['Equity', 'Paid'], connections: 14,
    endorsements: { 'Financial modelling': 4, 'Market research': 3, 'Pitch decks': 2 },
    verified: [{ title: 'Pricing study for a meal-kit startup', role: 'Business Dev', with: ['tom'], end: '2026-08', rating: 4.9, endorsed: ['Pricing', 'Market research'] }],
  },
  {
    id: 'sarah', first: 'Sarah', last: 'Jenkins', colors: ['#FF9F0A', '#FF375F'], connected: true,
    track: 'Business Developer', headline: 'Building an AI tax and savings planner for freelancers',
    location: 'Manchester, UK', setting: 'Hybrid', available: '2026-10-15',
    cohort: 12, stage: 'Running a business (under a year)', currently: 'Growing the Freelancer Finance waitlist',
    education: [{ school: 'Northgate University', course: 'BA Marketing', start: '2014', end: '2017' }],
    about: 'Freelance marketer for six years, which is how I learned the hard way that Self Assessment is terrifying. Now building the tool I wish I had. 62 people on the waitlist and counting.',
    experience: [
      { title: 'Founder', company: 'Freelancer Finance (pre-launch)', start: '2026-07', current: true, desc: 'Validated the idea with 25 interviews; grew the waitlist to 62 through Reddit and LinkedIn posts.' },
      { title: 'Freelance Growth Marketer', company: 'Self-employed', start: '2020-01', end: '2026-06', desc: 'Ran paid acquisition for 14 online brands; average 3.1x return on ad spend.' },
    ],
    skills: ['Growth marketing', 'Customer discovery', 'Copywriting', 'Product management', 'Pitch decks'],
    work: [
      { title: "Freelancer Finance waitlist", link: "freelancerfinance.example", code: "", problem: "Freelancers dread working out their tax bill, but would they sign up for help?", role: "Founder. I ran the interviews and the waitlist.", did: "Ran 25 interviews, wrote the landing page and set up a referral loop.", result: "62 sign-ups in 5 weeks with no ad spend.", change: "", summary: "Validated the idea with 25 interviews and grew a 62-person waitlist.", facts: {"role": "Led", "team": "4 to 6", "length": "1 to 3 months", "reached": "Prototype"}, skills: ["Customer discovery", "Copywriting", "Growth marketing"], builtWith: ["Carrd", "Mailchimp", "ChatGPT"], teammates: [{"id": "elena", "confirmed": true}, {"id": "marcus", "confirmed": true}], industry: "Fintech" },
    ],
    goals: ['Co-founder', 'Hiring teammates'], hours: '40+', idea: 'I have an idea', industries: ['Fintech', 'AI'],
    learn: ['SQL', 'Financial modelling'], openTo: ['Equity'], connections: 21,
    endorsements: { 'Growth marketing': 5, 'Copywriting': 3 },
    verified: [],
  },
  {
    id: 'marcus', first: 'Marcus', last: 'Johnson', colors: ['#0A84FF', '#30D158'], connected: true,
    track: 'Software Developer', headline: 'Full-stack developer · ex-Army logistics · loves clean APIs',
    location: 'Birmingham, UK', setting: 'Hybrid', available: '2026-10-20',
    cohort: 12, stage: 'Learning (in bootcamp)', currently: 'Building auth and payments for Freelancer Finance',
    education: [{ school: 'Kingsbridge College', course: 'HND Computing', start: '2015', end: '2017' }],
    about: 'Eight years running logistics in the British Army taught me to keep systems boring and reliable. Now I build them in TypeScript. Happy to pair, review code, or take on paid side projects.',
    experience: [
      { title: 'Software Engineering Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Building auth and payments for Freelancer Finance in Next.js and Supabase.' },
      { title: 'Logistics Officer', company: 'British Army', start: '2017-05', end: '2025-12', desc: 'Planned supply for a 600-person unit; built an Access tool that replaced a 40-tab spreadsheet.' },
    ],
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    work: [
      { title: "Freelancer Finance sign-in and billing", link: "freelancerfinance.example", code: "github.com/example/freelancer-finance", problem: "The MVP needed secure accounts and subscriptions before anyone could use it.", role: "Built the backend: sign-in, data security and payments.", did: "Set up Supabase sign-in, row-level security on every table, and Stripe subscriptions with webhooks.", result: "Live for 10 waitlist testers. No security issues found in the review.", change: "", summary: "Sign-in, row-level security and Stripe billing for the MVP.", facts: {"role": "Contributed", "team": "4 to 6", "length": "1 to 3 months", "reached": "Live"}, skills: ["TypeScript", "Node.js", "PostgreSQL"], builtWith: ["Next.js", "Supabase", "Stripe", "Claude Code"], teammates: [{"id": "sarah", "confirmed": true}], industry: "Fintech" },
      { title: "Convoy Planner", link: "convoyplanner.example", code: "github.com/example/convoy-planner", problem: "Small delivery firms plan van routes and loads on paper.", role: "Built it on my own, from design to launch.", did: "Built a route and load planner with a map view and printable driver sheets.", result: "Used every day by 2 local delivery companies.", change: "", summary: "Route and load planner used daily by 2 delivery firms.", facts: {"role": "Led", "team": "Just me", "length": "3 to 6 months", "reached": "Live"}, skills: ["TypeScript", "React", "Node.js"], builtWith: ["React", "Node.js", "Mapbox"], teammates: [], industry: "Marketplaces" },
    ],
    goals: ['Paid work', 'Passion project'], hours: '10–20', idea: 'I want to join an idea', industries: ['Fintech', 'Marketplaces'],
    learn: ['Stripe', 'AWS'], openTo: ['Paid', 'Unpaid'], connections: 18,
    endorsements: { 'TypeScript': 4, 'React': 3, 'Node.js': 3, 'PostgreSQL': 2 },
    verified: [{ title: 'Cohort 12 attendance tracker', role: 'Software Dev', with: ['tom', 'aisha'], end: '2026-08', rating: 5, endorsed: ['React', 'Node.js', 'PostgreSQL'] }],
  },
  {
    id: 'priya', first: 'Priya', last: 'Raman', colors: ['#30D158', '#64D2FF'], connected: true,
    track: 'Software Developer', headline: 'ML engineer in training · former pharmacy technician',
    location: 'Leeds, UK', setting: 'Remote', available: '2026-11-15',
    cohort: 12, stage: 'Learning (in bootcamp)', currently: 'Training a refill-prediction model',
    education: [{ school: 'University of Ashworth', course: 'BSc Biology', start: '2016', end: '2019' }],
    about: 'Five years behind a pharmacy counter showed me how many people miss refills. I am learning ML to fix that. I like Python, small models that run cheaply, and talking to patients before building anything.',
    experience: [
      { title: 'Software Engineering Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Prototyping a refill-prediction model on public claims data.' },
      { title: 'Pharmacy Technician', company: 'Moorfield Community Health', start: '2020-02', end: '2026-05', desc: 'Handled 200+ prescriptions a day; set up the text-reminder system the pharmacy still uses.' },
    ],
    skills: ['Python', 'PyTorch', 'FastAPI', 'SQL', 'Data analysis', 'User interviews'],
    work: [
      { title: "RefillRadar", link: "", code: "github.com/example/refillradar", problem: "Many patients run out of their repeat prescriptions before they reorder.", role: "Built the prediction model and the API.", did: "Trained a small model on public data to predict who is likely to miss a repeat prescription, and served it with FastAPI.", result: "0.81 AUC on a public dataset. Diego and I are now testing it with 1 pharmacy.", change: "", summary: "Predicts which patients may miss a repeat prescription (0.81 AUC).", facts: {"role": "Led", "team": "2 to 3", "length": "3 to 6 months", "reached": "Prototype"}, skills: ["Python", "Data analysis", "SQL"], builtWith: ["Python", "PyTorch", "FastAPI"], teammates: [{"id": "diego", "confirmed": true}], industry: "Health" },
    ],
    goals: ['Co-founder'], hours: '20–40', idea: 'I have an idea', industries: ['Health', 'AI'],
    learn: ['React', 'Customer discovery'], openTo: ['Equity', 'Unpaid'], connections: 9,
    endorsements: { 'Python': 4, 'Data analysis': 3, 'SQL': 2 },
    verified: [{ title: 'Pharmacy refill survey analysis', role: 'Software Dev', with: ['diego'], end: '2026-09', rating: 4.8, endorsed: ['Python', 'Data analysis'] }],
  },
  {
    id: 'diego', first: 'Diego', last: 'Hernández', colors: ['#FF9F0A', '#FFD60A'], connected: true,
    track: 'Business Developer', headline: 'Ex-restaurant manager · operations and sales for marketplaces',
    location: 'Bristol, UK', setting: 'In person', available: '2026-10-10',
    cohort: 12, stage: 'Running a business (under a year)', currently: 'Signing pilot restaurants for TableTurn',
    education: [{ school: 'Highbury Vale College', course: 'BA Hospitality Management', start: '2012', end: '2015' }],
    about: 'Ran two busy restaurants for seven years. I know how independent restaurants buy software, and how they don\'t. Building a booking marketplace with three restaurants already lined up for a pilot.',
    experience: [
      { title: 'Business Developer Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Signed three pilot restaurants for a table-booking marketplace.' },
      { title: 'General Manager', company: 'Casa Brava', start: '2019-04', end: '2026-05', desc: 'Grew revenue 35% in two years; cut no-shows in half with a deposit system.' },
    ],
    skills: ['Operations', 'Sales', 'Customer discovery', 'Partnerships', 'Spanish'],
    work: [
      { title: "TableTurn pilot", link: "tableturn.example", code: "", problem: "Independent restaurants lose money when people don't turn up.", role: "Business lead. I signed the restaurants and planned the pilot.", did: "Interviewed 15 restaurant owners and signed 3 for a pilot of a booking page with a refundable deposit.", result: "3 restaurants signed. The pilot starts once the booking page is built.", change: "", summary: "Signed 3 restaurants to pilot booking deposits.", facts: {"role": "Led", "team": "Just me", "length": "1 to 3 months", "reached": "Idea"}, skills: ["Sales", "Partnerships", "Customer discovery"], builtWith: ["Google Sheets", "Canva"], teammates: [], industry: "Marketplaces" },
    ],
    goals: ['Co-founder', 'Paid work'], hours: '40+', idea: 'I have an idea', industries: ['Marketplaces', 'Consumer'],
    learn: ['SQL', 'Product management'], openTo: ['Paid', 'Equity'], connections: 11,
    endorsements: { 'Operations': 4, 'Sales': 3, 'Customer discovery': 2 },
    verified: [{ title: 'Pharmacy refill survey analysis', role: 'Business Dev', with: ['priya'], end: '2026-09', rating: 4.9, endorsed: ['Customer discovery', 'Operations'] }],
  },
  {
    id: 'aisha', first: 'Aisha', last: 'Bello', colors: ['#BF5AF2', '#FF375F'], connected: false,
    track: 'Software Developer', headline: 'Mobile developer · React Native and Swift · design-minded',
    location: 'London, UK', setting: 'Remote', available: '2026-12-01',
    cohort: 12, stage: 'Junior (under 2 years)', currently: 'Organising Demo Day for Cohort 12',
    education: [{ school: 'Ravensmoor University', course: 'BA Graphic Design', start: '2016', end: '2019' }],
    about: 'I build mobile apps that feel native. Previously a graphic designer, so I care a lot about the details. Organising Demo Day for Cohort 12.',
    experience: [
      { title: 'Software Engineering Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Demo Day organiser; building a study-planner app in React Native.' },
      { title: 'Graphic Designer', company: 'Northlight Studio', start: '2019-09', end: '2026-04', desc: 'Brand and app design for 30+ clients.' },
    ],
    skills: ['React Native', 'Swift', 'Figma', 'TypeScript', 'UI design'],
    work: [
      { title: "StudySprint", link: "studysprint.example", code: "github.com/example/studysprint", problem: "Students start revising, then lose focus within minutes.", role: "Built it on my own, from design to launch.", did: "Designed and built a study timer app with streaks and a calm home screen.", result: "1,200 testers on TestFlight.", change: "", summary: "Study timer with streaks; 1,200 testers on TestFlight.", facts: {"role": "Led", "team": "Just me", "length": "3 to 6 months", "reached": "Live"}, skills: ["React Native", "UI design", "Figma"], builtWith: ["React Native", "Expo", "Figma"], teammates: [], industry: "Edtech" },
    ],
    goals: ['Passion project', 'Paid work'], hours: '10–20', idea: 'Open to both', industries: ['Edtech', 'Health'],
    learn: ['Node.js', 'Pitch decks'], openTo: ['Paid', 'Unpaid'], connections: 6,
    endorsements: { 'UI design': 4, 'Figma': 3, 'React Native': 2 },
    verified: [{ title: 'Cohort 12 attendance tracker', role: 'Software Dev', with: ['marcus', 'tom'], end: '2026-08', rating: 4.9, endorsed: ['React Native', 'UI design'] }],
  },
  {
    id: 'tom', first: 'Tom', last: 'Nguyen', colors: ['#64D2FF', '#5E5CE6'], connected: false,
    track: 'Business Developer', headline: 'Former teacher · product and UX research for edtech',
    location: 'Edinburgh, UK', setting: 'Hybrid', available: '2026-11-01',
    cohort: 12, stage: 'Exploring an idea', currently: 'Interviewing teachers about feedback tools',
    education: [{ school: 'Caledon University', course: 'BSc Mathematics', start: '2013', end: '2017' }],
    about: 'Taught secondary school maths for nine years. Now moving into product: I run user research, write specs, and keep teams focused on what students actually need.',
    experience: [
      { title: 'Business Developer Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Cohort community lead; running interviews with 30 teachers about grading tools.' },
      { title: 'Maths Teacher', company: 'Oakfield Academy', start: '2017-08', end: '2026-05', desc: 'Built a peer-tutoring programme that raised pass rates 14%.' },
    ],
    skills: ['UX research', 'Product management', 'Roadmapping', 'Public speaking'],
    work: [
      { title: "GradeLoop research", link: "", code: "", problem: "Teachers spend evenings marking, but nobody knew which part hurt most.", role: "Ran the research on my own.", did: "Interviewed 30 teachers and mapped where their time goes.", result: "Found that writing feedback, not marking, is the main pain. Two prototype ideas are next.", change: "", summary: "30 teacher interviews: feedback time, not marking, is the pain.", facts: {"role": "Led", "team": "Just me", "length": "1 to 3 months", "reached": "Idea"}, skills: ["UX research", "Product management"], builtWith: ["Notion", "Dovetail"], teammates: [], industry: "Edtech" },
    ],
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
    location: 'Brighton, UK', setting: 'Remote', available: '2026-10-25',
    cohort: 12, stage: 'Junior (under 2 years)', currently: 'Building a shared component library for the cohort',
    education: [{ school: 'Penrose Institute of Technology', course: 'BSc Computer Science', start: '2020', end: '2023' }],
    about: 'I build accessible, fast interfaces and the design systems behind them. Most excited about climate tools that help people make better everyday choices.',
    experience: [
      { title: 'Software Engineering Fellow', company: 'Bootcamp Connect Cohort 12', start: '2026-06', current: true, desc: 'Building a shared component library for cohort projects.' },
      { title: 'Junior Frontend Developer', company: 'Greenline Energy', start: '2024-01', end: '2026-05', desc: 'Rebuilt the customer dashboard; Lighthouse accessibility score from 64 to 98.' },
    ],
    skills: ['TypeScript', 'React', 'Tailwind CSS', 'Accessibility', 'Figma'],
    work: [
      { title: "Footprint", link: "", code: "github.com/example/footprint", problem: "Online shoppers can't see the carbon cost of delivery options.", role: "Built the browser extension on my own.", did: "Built an extension that shows an estimated carbon cost next to each delivery option at checkout.", result: "Version 0.3 is ready. Looking for a partner to launch it.", change: "", summary: "Browser extension showing the carbon cost of delivery options.", facts: {"role": "Led", "team": "Just me", "length": "1 to 3 months", "reached": "Prototype"}, skills: ["TypeScript", "React", "Accessibility"], builtWith: ["TypeScript", "React", "Chrome extensions"], teammates: [], industry: "Climate" },
    ],
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
      { from: 'sarah', day: 'Yesterday', time: '4:15 PM', text: 'Customer call notes: 4 of 5 freelancers said working out their tax bill is their #1 stress.' },
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
      { from: 'priya', day: 'Monday', time: '8:31 PM', text: 'Not yet. I know the manager of an independent pharmacy in Leeds. I\'ll ask this week.' },
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
