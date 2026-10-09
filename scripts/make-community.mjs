// Writes js/demo-members.js: the made-up demo community (specs/10-networking.md, D038).
// Run `npm run make:community` after changing this script. Never edit the output by hand.
//
// About 100 members: Cohort 12 (the current cohort: the 8 hand-written members in
// js/demo-data.js, 16 generated members and the signed-in member) and alumni from Cohorts 9 to 11
// (25 each). Everyone is made up: names, companies, schools and projects. A fixed seed means the
// same community every time.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// An optional path writes somewhere else (the tests use it to check the file is up to date)
const OUT = process.argv[2] || join(dirname(dirname(fileURLToPath(import.meta.url))), 'js', 'demo-members.js');

// ----- Seeded random numbers (mulberry32), so every run gives the same community -----
let seed = 20261009;
function rand() {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
const pick = a => a[Math.floor(rand() * a.length)];
const chance = p => rand() < p;
const between = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
function pickSome(a, n) {
  const pool = [...a], out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  return out;
}
const ym = (y, m) => y + '-' + String(m).padStart(2, '0');
function addMonths(s, n) { const [y, m] = s.split('-').map(Number); const t = y * 12 + (m - 1) + n; return ym(Math.floor(t / 12), t % 12 + 1); }

// ----- Pools -----
const FIRST = ['Amara', 'Ben', 'Chloe', 'Daniel', 'Ella', 'Farah', 'George', 'Hamza', 'Isla', 'Jack', 'Kiran', 'Leah', 'Mohammed', 'Niamh', 'Oliver', 'Precious', 'Rhys', 'Sophie', 'Tariq', 'Uma', 'Vikram', 'Wren', 'Yusuf', 'Zara', 'Aled', 'Bethan', 'Callum', 'Deborah', 'Emeka', 'Fiona', 'Grace', 'Harvey', 'Imogen', 'Jamal', 'Katie', 'Liam', 'Megan', 'Nathan', 'Olivia', 'Patrick', 'Ruby', 'Samuel', 'Tamsin', 'Usman', 'Victoria', 'William', 'Yasmin', 'Zain', 'Adebayo', 'Bronwen', 'Connor', 'Divya', 'Eilidh', 'Femi', 'Gemma', 'Hollie', 'Ibrahim', 'Joanna', 'Kwame', 'Lucy', 'Malik', 'Nadia', 'Owen', 'Poppy', 'Rosa', 'Sanjay', 'Thomas', 'Shona', 'Afua', 'Euan', 'Mei', 'Rory', 'Anjali', 'Declan', 'Kemi', 'Lewis', 'Maisie', 'Nikhil', 'Orla', 'Reece'];
const LAST = ['Adeyemi', 'Ahmed', 'Bennett', 'Campbell', 'Chen', 'Clarke', 'Davies', 'Desai', 'Edwards', 'Evans', 'Fletcher', 'Gallagher', 'Hughes', 'Hussain', 'Iqbal', 'Jones', 'Kaur', 'Khan', 'Lloyd', 'MacDonald', 'Mensah', 'Mitchell', 'Morgan', 'Murphy', 'Nwosu', 'O\'Brien', 'Okoro', 'Patel', 'Price', 'Quinn', 'Rahman', 'Reid', 'Roberts', 'Robertson', 'Shah', 'Sharma', 'Singh', 'Stewart', 'Taylor', 'Thomas', 'Turner', 'Walker', 'Watson', 'Williams', 'Wilson', 'Wong', 'Wright', 'Yeboah', 'Young', 'Zhang', 'Boateng', 'Doherty', 'Fraser', 'Kowalski', 'Novak', 'Ali', 'Pereira', 'Sato', 'Lewis', 'Begum'];
const CITIES = ['London', 'London', 'London', 'London', 'Manchester', 'Manchester', 'Birmingham', 'Birmingham', 'Leeds', 'Bristol', 'Glasgow', 'Edinburgh', 'Cardiff', 'Liverpool', 'Newcastle', 'Sheffield', 'Nottingham', 'Brighton', 'Belfast', 'Leicester', 'Cambridge', 'Oxford', 'Swansea', 'Aberdeen'];
const COLORS = [['#0A84FF', '#30D158'], ['#5E5CE6', '#BF5AF2'], ['#FF9F0A', '#FF375F'], ['#30D158', '#64D2FF'], ['#BF5AF2', '#FF375F'], ['#64D2FF', '#5E5CE6'], ['#FF9F0A', '#FFD60A'], ['#30D158', '#0A84FF'], ['#FF375F', '#FF9F0A'], ['#5E5CE6', '#64D2FF']];
const SCHOOLS = ['University of Ashworth', 'Northgate University', 'Kingsbridge College', 'Ravensmoor University', 'Fenwick Metropolitan University', 'St Aldric\'s College', 'University of Westmere', 'Highbury Vale College', 'Caledon University', 'Penrose Institute of Technology'];
const COURSES = {
  'Software Developer': ['BSc Computer Science', 'BSc Mathematics', 'BSc Physics', 'BA Graphic Design', 'BSc Biology', 'BA Music Technology', 'BEng Civil Engineering', 'HND Computing', 'BA English Literature'],
  'Business Developer': ['BA Business Management', 'BSc Economics', 'BA Marketing', 'BA History', 'BSc Psychology', 'BA Hospitality Management', 'BSc Accounting and Finance', 'BA Politics', 'BSc Pharmacy'],
};

// Previous careers. Companies are made up, and shared between members on purpose, so
// "worked at the same company" suggestions happen.
const CAREERS = {
  'Software Developer': [
    { job: 'Secondary School Teacher', short: 'teacher', companies: ['Oakfield Academy', 'Riverside High School'], desc: 'Taught maths to 11 to 16 year olds and built the department\'s homework tracker in Google Sheets.', story: 'Years of teaching showed me how much time schools lose to clunky software.' },
    { job: 'Staff Nurse', short: 'nurse', companies: ['Harbourside NHS Trust', 'Moorfield Community Health'], desc: 'Worked on a busy surgical ward; led the move from paper handover sheets to a shared spreadsheet.', story: 'Nursing taught me to stay calm when systems fail, and to want better ones.' },
    { job: 'Café Manager', short: 'café manager', companies: ['Grindhouse Coffee', 'The Daily Grind'], desc: 'Ran a team of 9; set up online ordering and cut queue times at lunch.', story: 'Running a café, I spent more time fighting the till software than making coffee.' },
    { job: 'Graphic Designer', short: 'designer', companies: ['Northlight Studio', 'Brightside Creative'], desc: 'Brand and web design for 30+ small businesses.', story: 'I designed websites for years before deciding I wanted to build them too.' },
    { job: 'Laboratory Technician', short: 'lab technician', companies: ['Genfield Labs', 'Moorfield Community Health'], desc: 'Ran sample testing and wrote Python scripts to clean up results data.', story: 'Writing small Python scripts in the lab was the best part of my week.' },
    { job: 'Assistant Accountant', short: 'accountant', companies: ['Tillwise Accounting', 'Ledgerline'], desc: 'Month-end reporting for 40 clients; automated reconciliations with Excel macros.', story: 'I automated so much of my accounting job that coding became the job.' },
    { job: 'Sound Engineer', short: 'sound engineer', companies: ['Echo Room Studios', 'Brightside Creative'], desc: 'Recorded and mixed for bands and podcasts; built the studio\'s booking spreadsheet.', story: 'Sound engineering is debugging with your ears. Code felt familiar straight away.' },
    { job: 'Logistics Coordinator', short: 'logistics', companies: ['Swiftline Freight', 'Hartley Distribution'], desc: 'Planned daily routes for 25 vans and cut fuel costs by 12%.', story: 'Planning van routes by hand made me want to build the tools instead.' },
    { job: 'Customer Support Lead', short: 'support lead', companies: ['Brightpay', 'Hartley Distribution'], desc: 'Led a team of 6 handling 300 tickets a week; wrote the help centre articles.', story: 'After 4 years answering support tickets, I wanted to fix the bugs myself.' },
    { job: 'Civil Engineer', short: 'civil engineer', companies: ['Arden Structures', 'Swiftline Freight'], desc: 'Designed drainage for housing developments; modelled loads in spreadsheets.', story: 'Engineering taught me to plan before building. Software lets me ship faster.' },
    { job: 'Junior Data Analyst', short: 'data analyst', companies: ['Brightpay', 'Ledgerline'], desc: 'Built weekly sales dashboards and SQL reports for the finance team.', story: 'Writing SQL reports got me curious about the apps behind the data.' },
  ],
  'Business Developer': [
    { job: 'Store Manager', short: 'retail manager', companies: ['Hartley & Co', 'Meadow Market'], desc: 'Ran a store with 22 staff and £3m yearly sales; top of the region for customer scores.', story: 'Ten years in retail taught me what customers actually pay for.' },
    { job: 'Recruitment Consultant', short: 'recruiter', companies: ['Talentbridge', 'Northstar People'], desc: 'Placed 60+ people a year in tech and finance roles.', story: 'As a recruiter I met hundreds of founders, and wanted to be on their side of the table.' },
    { job: 'Marketing Executive', short: 'marketer', companies: ['Brightside Creative', 'Kestrel Media'], desc: 'Ran email and social campaigns; grew the newsletter from 4,000 to 25,000 readers.', story: 'I ran marketing for other people\'s products for years. Now I want to shape the product.' },
    { job: 'Event Manager', short: 'event manager', companies: ['Gather Events', 'Kestrel Media'], desc: 'Planned conferences of up to 2,000 people, from budget to suppliers.', story: 'Running events is project management under pressure. It turns out startups are similar.' },
    { job: 'Restaurant Manager', short: 'hospitality manager', companies: ['The Copper Kettle', 'Meadow Market'], desc: 'Grew covers by 30% and halved no-shows with a deposit system.', story: 'I ran restaurants for years and know how small businesses really buy software.' },
    { job: 'Charity Fundraiser', short: 'fundraiser', companies: ['Brighter Futures Trust', 'Northstar People'], desc: 'Raised £400,000 from trusts and companies; ran the corporate partners scheme.', story: 'Fundraising is sales with a mission. I want to bring that to a startup.' },
    { job: 'Financial Adviser', short: 'financial adviser', companies: ['Tillwise Accounting', 'Ledgerline'], desc: 'Advised 120 clients on pensions and savings.', story: 'Years of explaining money to people made me want to build simpler money tools.' },
    { job: 'Sales Representative', short: 'sales', companies: ['Brightpay', 'Talentbridge'], desc: 'Sold payment terminals to small shops; 140% of target two years running.', story: 'I sold software door to door. Now I want to help build something worth selling.' },
    { job: 'Community Pharmacist', short: 'pharmacist', companies: ['Moorfield Community Health', 'Hartley & Co'], desc: 'Ran a busy community pharmacy and its delivery service.', story: 'Running a pharmacy showed me how much healthcare still runs on paper.' },
    { job: 'Owner, personal training studio', short: 'studio owner', companies: ['Fit Forge Studio'], desc: 'Ran my own studio with 3 trainers and 150 members.', story: 'Running my own studio taught me the basics of business the hard way.' },
    { job: 'Estate Agent', short: 'estate agent', companies: ['Keystone Lettings', 'Hartley & Co'], desc: 'Managed 80 rental properties and their landlords.', story: 'Lettings is full of paperwork that software should handle.' },
  ],
};

// What each person focuses on in the app's terms: skills from the profile's suggestion lists
const FOCUS = {
  'Software Developer': [
    { name: 'Full-stack developer', skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'REST APIs', 'Git', 'Next.js'] },
    { name: 'Frontend developer', skills: ['React', 'TypeScript', 'UI/UX', 'Next.js', 'Git', 'Accessibility'] },
    { name: 'Backend developer', skills: ['Node.js', 'Python', 'SQL', 'REST APIs', 'AWS', 'Git'] },
    { name: 'Data and AI developer', skills: ['Python', 'SQL', 'Data analysis', 'AWS', 'REST APIs'] },
    { name: 'Mobile developer', skills: ['React Native', 'TypeScript', 'UI/UX', 'Swift', 'Git'] },
  ],
  'Business Developer': [
    { name: 'Growth and marketing', skills: ['Growth marketing', 'Copywriting', 'Market research', 'Customer discovery'] },
    { name: 'Sales and partnerships', skills: ['Sales', 'Partnerships', 'Pitch decks', 'Customer discovery'] },
    { name: 'Product and research', skills: ['Product management', 'Customer discovery', 'Market research', 'UX research'] },
    { name: 'Finance and pricing', skills: ['Financial modelling', 'Pitch decks', 'Fundraising', 'Market research'] },
    { name: 'Operations', skills: ['Operations', 'Partnerships', 'Sales', 'Product management'] },
  ],
};
const LEARN = {
  'Software Developer': ['Customer discovery', 'Pitch decks', 'Product management', 'AWS', 'Python', 'React', 'Stripe', 'Figma', 'Growth marketing'],
  'Business Developer': ['SQL', 'Figma', 'Python', 'Product management', 'Financial modelling', 'Growth marketing', 'UX research', 'React'],
};
const INDUSTRIES = ['AI', 'Fintech', 'Health', 'Edtech', 'Climate', 'Consumer', 'B2B SaaS', 'Marketplaces'];
const INDUSTRY_WORDS = { AI: 'AI', Fintech: 'fintech', Health: 'health tech', Edtech: 'edtech', Climate: 'climate tech', Consumer: 'consumer apps', 'B2B SaaS': 'B2B software', Marketplaces: 'marketplaces' };

// Work to show (spec 11). Each is a short case study; facts describe the level.
const WORK = {
  'Software Developer': [
    { title: 'SplitHouse', industry: 'Consumer', problem: 'Students in shared houses lose track of who owes what for bills.', did: 'Built a web app with sign-in, bill splitting and monthly reminders.', result: 'Live, used by 140 students in 6 weeks.', skills: ['React', 'TypeScript', 'SQL'], built: ['React', 'Supabase', 'Vercel'], reached: 'Live' },
    { title: 'ClinicQueue', industry: 'Health', problem: 'A GP surgery\'s phone line is jammed at 8am with appointment calls.', did: 'Built a callback queue so patients get a text when it\'s their turn.', result: 'Prototype tested with 1 surgery; calls at 8am down by a third in the trial week.', skills: ['Node.js', 'REST APIs', 'SQL'], built: ['Node.js', 'Twilio', 'PostgreSQL'], reached: 'Prototype' },
    { title: 'Kitbag', industry: 'Consumer', problem: 'Grassroots football clubs track kit and subs on paper.', did: 'Built a mobile app for coaches to log kit, subs and match availability.', result: 'Live on TestFlight with 3 clubs and 60 players.', skills: ['React Native', 'TypeScript'], built: ['React Native', 'Expo', 'Firebase'], reached: 'Live' },
    { title: 'Rota Builder', industry: 'B2B SaaS', problem: 'Small cafés build staff rotas in group chats.', did: 'Designed the database and built drag-and-drop rotas with clash warnings.', result: 'Used by 2 cafés every week; saves the manager about 2 hours a week.', skills: ['React', 'Node.js', 'SQL'], built: ['Next.js', 'Prisma', 'PostgreSQL'], reached: 'Live' },
    { title: 'Grant Finder', industry: 'AI', problem: 'Small charities miss funding because grants are spread across hundreds of sites.', did: 'Built a search tool that matches a charity\'s aims to open grants, using an AI model to read the criteria.', result: 'Prototype tested with 5 charities; each found at least 2 grants they didn\'t know about.', skills: ['Python', 'REST APIs', 'Data analysis'], built: ['Python', 'FastAPI', 'Claude API'], reached: 'Prototype' },
    { title: 'Bus Buddy', industry: 'Consumer', problem: 'Bus times on the council\'s site are hard to read on a phone.', did: 'Built a fast, accessible bus times site using open transport data.', result: 'Live, 400 visits a week, Lighthouse accessibility score 100.', skills: ['TypeScript', 'Accessibility', 'REST APIs'], built: ['Svelte', 'Open data API', 'Netlify'], reached: 'Live' },
    { title: 'Energy Snap', industry: 'Climate', problem: 'Households can\'t tell which appliances use the most electricity.', did: 'Built a dashboard that reads smart meter exports and flags the biggest users.', result: 'Prototype with 12 households; 9 changed at least one habit.', skills: ['Python', 'Data analysis', 'React'], built: ['Python', 'pandas', 'React'], reached: 'Prototype' },
    { title: 'Stocktake', industry: 'B2B SaaS', problem: 'A local shop counts stock by hand every Sunday.', did: 'Built barcode scanning in the browser and a simple stock report.', result: 'Live in 1 shop; Sunday stocktake down from 4 hours to 1.', skills: ['TypeScript', 'Node.js', 'SQL'], built: ['Vue', 'Node.js', 'SQLite'], reached: 'Earning money' },
    { title: 'Revision Cards', industry: 'Edtech', problem: 'GCSE students lose their paper revision cards.', did: 'Built a spaced-repetition app with offline support.', result: 'Live with 250 students at 2 schools.', skills: ['React', 'TypeScript', 'UI/UX'], built: ['React', 'IndexedDB', 'Claude Code'], reached: 'Live' },
    { title: 'Volunteer Hub', industry: 'Consumer', problem: 'A food bank coordinates 80 volunteers through one WhatsApp group.', did: 'Built shift sign-ups with reminders and a simple admin page.', result: 'Live; no-show rate down from 20% to 8%.', skills: ['Node.js', 'REST APIs', 'SQL'], built: ['Express', 'PostgreSQL', 'Cursor'], reached: 'Live' },
    { title: 'Payslip Checker', industry: 'Fintech', problem: 'Hourly workers can\'t easily check if their payslip is right.', did: 'Built a tool that reads a payslip photo and checks the hours and holiday pay.', result: 'Prototype tested with 20 workers; found errors on 3 payslips.', skills: ['Python', 'REST APIs'], built: ['Python', 'Claude API', 'Flask'], reached: 'Prototype' },
    { title: 'Allotment Planner', industry: 'Climate', problem: 'New allotment holders don\'t know what to plant when.', did: 'Built a planting calendar based on local frost dates.', result: 'Idea tested with an allotment society; 30 people signed up to try it.', skills: ['React', 'UI/UX'], built: ['React', 'Figma', 'Lovable'], reached: 'Idea' },
  ],
  'Business Developer': [
    { title: 'Café loyalty pilot', industry: 'Consumer', problem: 'Independent cafés lose regulars to chains with loyalty apps.', did: 'Interviewed 18 café owners, designed a shared loyalty card and ran a 6-week pilot.', result: '4 cafés joined; repeat visits up 15% during the pilot.', skills: ['Customer discovery', 'Partnerships', 'Market research'], built: ['Google Forms', 'Canva'], reached: 'Prototype' },
    { title: 'Tutoring marketplace research', industry: 'Edtech', problem: 'Parents struggle to find affordable, checked tutors.', did: 'Ran 25 parent interviews and a landing page test with 3 price points.', result: '310 sign-ups; parents chose the £25 an hour option most.', skills: ['Customer discovery', 'Market research', 'Copywriting'], built: ['Carrd', 'Typeform'], reached: 'Idea' },
    { title: 'B2B outreach for a payroll tool', industry: 'B2B SaaS', problem: 'A start-up\'s payroll tool had a product but no customers.', did: 'Built the target list, wrote the email sequence and ran 40 discovery calls.', result: '6 paying customers in 2 months, worth £1,800 a month.', skills: ['Sales', 'Copywriting', 'Customer discovery'], built: ['HubSpot', 'LinkedIn Sales Navigator'], reached: 'Earning money' },
    { title: 'Pricing model for a meal-kit start-up', industry: 'Consumer', problem: 'A meal-kit start-up was losing money on every box.', did: 'Built the unit economics model and tested 3 box sizes with customers.', result: 'New pricing made each box profitable; adopted by the founders.', skills: ['Financial modelling', 'Market research'], built: ['Excel', 'Claude'], reached: 'Earning money' },
    { title: 'Pitch deck for a climate start-up', industry: 'Climate', problem: 'Founders of a heat pump installer needed to raise their first round.', did: 'Rewrote the deck around customer evidence and built the financial forecast.', result: 'Raised £150,000 from 2 angel investors.', skills: ['Pitch decks', 'Fundraising', 'Financial modelling'], built: ['Google Slides', 'Excel'], reached: 'Earning money' },
    { title: 'Community launch for a fitness app', industry: 'Health', problem: 'A new fitness app had no users outside the founders\' friends.', did: 'Planned the launch, ran Instagram content and partnered with 5 gyms.', result: '1,200 downloads in the first month.', skills: ['Growth marketing', 'Partnerships', 'Copywriting'], built: ['Instagram', 'Mailchimp', 'ChatGPT'], reached: 'Live' },
    { title: 'Pharmacy delivery operations', industry: 'Health', problem: 'A pharmacy\'s delivery drivers had no planned routes.', did: 'Mapped the process, set up route planning and wrote the driver checklist.', result: 'Deliveries per driver up from 18 to 26 a day.', skills: ['Operations', 'Product management'], built: ['Google Sheets', 'Routific'], reached: 'Live' },
    { title: 'Landlord compliance checklist', industry: 'B2B SaaS', problem: 'Small landlords miss safety certificate deadlines.', did: 'Researched the rules, interviewed 12 landlords and specified a reminder product.', result: 'Spec and clickable prototype; 40 landlords on the waitlist.', skills: ['Product management', 'Customer discovery', 'Market research'], built: ['Figma', 'Notion'], reached: 'Prototype' },
    { title: 'Corporate volunteering scheme', industry: 'Consumer', problem: 'A charity had no way to involve local companies.', did: 'Designed the scheme, pitched it to 20 companies and signed the first partners.', result: '7 companies signed up, bringing 90 volunteers.', skills: ['Partnerships', 'Sales', 'Pitch decks'], built: ['Canva', 'Google Sheets'], reached: 'Live' },
    { title: 'Market sizing for a pet insurance idea', industry: 'Fintech', problem: 'A founder wanted to know if pet insurance for older dogs was worth building.', did: 'Sized the market from public data and surveyed 150 dog owners.', result: 'Report showed a £40m gap; the founder used it to apply to an accelerator.', skills: ['Market research', 'Financial modelling'], built: ['Excel', 'SurveyMonkey', 'Perplexity'], reached: 'Idea' },
    { title: 'Wholesale deals for a snack brand', industry: 'Marketplaces', problem: 'A small snack brand sold only online.', did: 'Pitched 30 independent shops and negotiated wholesale terms.', result: 'Stocked in 11 shops; wholesale now 25% of sales.', skills: ['Sales', 'Partnerships', 'Operations'], built: ['Faire', 'Google Sheets'], reached: 'Earning money' },
  ],
};
const TEAM_SIZES = ['Just me', '2 to 3', '4 to 6'];
const LENGTHS = ['Under a month', '1 to 3 months', '3 to 6 months', 'Over 6 months'];

const CURRENTLY = {
  'Software Developer': ['Building a budgeting app for students', 'Learning testing with Playwright', 'Adding payments to my side project', 'Rebuilding my portfolio in Next.js', 'Pairing on a food bank volunteer app', 'Training a small model to sort support tickets', 'Making my bus times site work offline'],
  'Business Developer': ['Interviewing café owners about loyalty schemes', 'Writing a pitch deck for Demo Day', 'Testing prices for a tutoring idea', 'Looking for a developer for a landlord tool', 'Planning a launch for a fitness app', 'Building a financial model for a climate start-up', 'Signing pilot shops for a snack brand'],
};

// Bootcamp cohorts: start and end month
const COHORTS = { 9: ['2025-06', '2025-09'], 10: ['2025-10', '2026-01'], 11: ['2026-02', '2026-05'], 12: ['2026-06', null] };

// The 8 hand-written members in js/demo-data.js (all Cohort 12), so they join the connection graph
const HANDWRITTEN = {
  elena: { track: 'Business Developer', companies: ['Tillwise Accounting'] },
  sarah: { track: 'Business Developer', companies: [] },
  marcus: { track: 'Software Developer', companies: [] },
  priya: { track: 'Software Developer', companies: ['Moorfield Community Health'] },
  diego: { track: 'Business Developer', companies: [] },
  aisha: { track: 'Software Developer', companies: ['Northlight Studio'] },
  tom: { track: 'Business Developer', companies: ['Oakfield Academy'] },
  hannah: { track: 'Software Developer', companies: [] },
};

// ----- Build members -----
const usedNames = new Set();
function newName() {
  for (;;) {
    const first = pick(FIRST), last = pick(LAST);
    if (!usedNames.has(first) || chance(0.1)) {
      const key = first + ' ' + last;
      if (!usedNames.has(key)) { usedNames.add(key); usedNames.add(first); return { first, last }; }
    }
  }
}
const slug = s => s.toLowerCase().normalize('NFD').replace(/[^a-z]+/g, '');

function stageFor(track, cohort, years, career) {
  if (track === 'Software Developer') {
    if (cohort === 12) return chance(0.85) ? 'Learning (in bootcamp)' : 'Junior (under 2 years)';
    if (['data analyst', 'designer', 'civil engineer'].includes(career.short) && chance(0.5)) return 'Mid-level (2 to 5 years)';
    return chance(0.85) ? 'Junior (under 2 years)' : 'Mid-level (2 to 5 years)';
  }
  if (career.short === 'studio owner') return 'Running a business (1 to 3 years)';
  if (cohort === 12) return chance(0.75) ? 'Exploring an idea' : 'Running a business (under a year)';
  if (years >= 8 && chance(0.5)) return 'Experienced (3 years or more)';
  return pick(['Exploring an idea', 'Running a business (under a year)', 'Running a business (under a year)', 'Running a business (1 to 3 years)']);
}

function makeWork(track, focus, n) {
  const fit = WORK[track].filter(w => w.skills.some(s => focus.skills.includes(s)));
  return pickSome(fit.length >= n ? fit : WORK[track], n).map(w => {
    const team = pick(TEAM_SIZES);
    const role = team === 'Just me' ? 'Led' : pick(['Led', 'Led', 'Contributed', 'Supported']);
    return {
      title: w.title,
      link: chance(0.8) ? slug(w.title) + '.example' : '',
      code: track === 'Software Developer' && chance(0.85) ? 'github.com/example/' + slug(w.title) : '',
      problem: w.problem, role: roleLine(track, role, team), did: w.did, result: w.result,
      facts: { role, team, length: pick(LENGTHS.slice(0, w.reached === 'Earning money' ? 4 : 3)), reached: w.reached },
      skills: w.skills, builtWith: w.built, teammates: [], industry: w.industry,
    };
  });
}
function roleLine(track, role, team) {
  if (team === 'Just me') return track === 'Software Developer' ? 'Built it on my own, from design to launch.' : 'Ran it on my own, from research to results.';
  if (role === 'Led') return track === 'Software Developer' ? 'Led the build and made the main technical decisions.' : 'Led the project and the conversations with customers.';
  if (role === 'Contributed') return track === 'Software Developer' ? 'Built the main features with one other developer.' : 'Ran the research and wrote up what we learned.';
  return track === 'Software Developer' ? 'Fixed bugs and built smaller features with the team.' : 'Helped with research and customer calls.';
}

function makeMember(cohort, track) {
  const { first, last } = newName();
  const focus = pick(FOCUS[track]);
  const career = pick(CAREERS[track]);
  const company = pick(career.companies);
  const years = between(2, 11);
  const [bStart, bEnd] = COHORTS[cohort];
  const careerEnd = addMonths(bStart, -between(1, 4));
  const careerStart = addMonths(careerEnd, -years * 12 - between(0, 6));
  const work = makeWork(track, focus, cohort === 12 ? between(1, 2) : between(2, 3));
  // Skills used in work are added to the member's skills (spec 11), up to the profile's limit of 10
  const skills = [...new Set([...pickSome(focus.skills, between(3, 5)), ...work.flatMap(w => w.skills)])].slice(0, 10);
  const learn = pickSome(LEARN[track].filter(s => !skills.includes(s)), between(1, 3));
  const city = pick(CITIES);
  const fellow = track === 'Software Developer' ? 'Software Engineering Fellow' : 'Business Developer Fellow';

  const experience = [];
  if (cohort !== 12) {
    // Alumni: what they did after the bootcamp
    const after = track === 'Software Developer'
      ? pick([['Junior Developer', pick(['Brightpay', 'Kestrel Media', 'Ledgerline', 'Swiftline Freight', 'Penny Lane Software'])], ['Freelance Web Developer', 'Self-employed'], ['Graduate Software Engineer', pick(['Arden Structures', 'Harbourside NHS Trust', 'Talentbridge'])]])
      : pick([['Founder', work[0].title], ['Business Development Executive', pick(['Brightpay', 'Kestrel Media', 'Gather Events', 'Penny Lane Software'])], ['Freelance Growth Consultant', 'Self-employed'], ['Product Associate', pick(['Ledgerline', 'Talentbridge', 'Penny Lane Software'])]]);
    experience.push({ title: after[0], company: after[1], start: addMonths(bEnd, between(1, 2)), current: true, desc: after[0] === 'Founder' ? 'Building ' + work[0].title + ' full time. ' + work[0].result : 'Working on ' + focus.name.toLowerCase().replace(/ developer$/, '') + ' for a small team.' });
  }
  experience.push({ title: fellow, company: 'Bootcamp Connect Cohort ' + cohort, start: bStart, ...(bEnd ? { end: bEnd } : { current: true }), desc: 'Worked on ' + work[0].title + ' with the cohort.' });
  experience.push({ title: career.job, company, start: careerStart, end: careerEnd, desc: career.desc });

  const eduEnd = Number(careerStart.slice(0, 4));
  const education = [{ school: pick(SCHOOLS), course: pick(COURSES[track]), start: String(eduEnd - 3), end: String(eduEnd) }];

  const goalsPool = track === 'Software Developer' ? ['Paid work', 'Passion project', 'Co-founder'] : ['Co-founder', 'Paid work', 'Hiring teammates', 'Passion project'];
  const endorsements = {};
  if (cohort !== 12) skills.slice(0, between(1, 3)).forEach(s => { endorsements[s] = between(1, 5); });

  return {
    id: slug(first) + '-' + slug(last), first, last, colors: pick(COLORS), connected: false,
    track, cohort, stage: stageFor(track, cohort, years, career),
    headline: focus.name + ' · ex-' + career.short + (chance(0.5) ? ' · ' + INDUSTRY_WORDS[pick(work).industry] : ''),
    currently: chance(0.7) ? pick(CURRENTLY[track]) : '',
    location: city + ', UK', setting: pick(['Remote', 'Hybrid', 'Hybrid', 'In person']),
    available: pick(['2026-10-15', '2026-11-01', '2026-11-15', '2026-12-01', '2027-01-04']),
    about: career.story + ' ' + (cohort === 12 ? 'Now in Cohort 12, ' : 'Since Cohort ' + cohort + ', ') + pick(['I\'ve been building things people actually use.', 'I want to work on small projects with real users.', 'I\'m looking for people to build with across both tracks.', 'I care about shipping small and learning fast.']),
    experience, education, skills, learn,
    work,
    goals: pickSome(goalsPool, between(1, 2)), hours: pick(['Under 10', '10–20', '10–20', '20–40', '40+']),
    idea: pick(['I have an idea', 'I want to join an idea', 'Open to both']),
    industries: [...new Set([work[0].industry, ...pickSome(INDUSTRIES, between(0, 2))])],
    openTo: pickSome(['Paid', 'Unpaid', 'Equity'], between(1, 3)),
    endorsements, verified: [],
  };
}

const members = [];
for (const cohort of [12, 11, 10, 9]) {
  const count = cohort === 12 ? 16 : 25;
  for (let i = 0; i < count; i++) members.push(makeMember(cohort, i % 2 ? 'Business Developer' : 'Software Developer'));
}

// ----- Connections between members -----
const nodes = [
  ...Object.entries(HANDWRITTEN).map(([id, h]) => ({ id, cohort: 12, track: h.track, companies: h.companies })),
  ...members.map(m => ({ id: m.id, cohort: m.cohort, track: m.track, companies: m.experience.map(e => e.company) })),
];
const links = Object.fromEntries(nodes.map(n => [n.id, []]));
for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
  const a = nodes[i], b = nodes[j];
  const gap = Math.abs(a.cohort - b.cohort);
  let p = gap === 0 ? 0.32 : gap === 1 ? 0.07 : 0.025;
  if (a.companies.some(c => c !== 'Self-employed' && b.companies.includes(c))) p += 0.25;
  if (chance(p)) { links[a.id].push(b.id); links[b.id].push(a.id); }
}

// Teammates on work: an alumni piece of work sometimes has a teammate from the same cohort
// on the other track, who has confirmed it
for (const m of members) for (const w of m.work) {
  if (w.facts.team === 'Just me' || !chance(0.45)) continue;
  const mates = members.filter(o => o.cohort === m.cohort && o.track !== m.track && links[m.id].includes(o.id));
  if (mates.length) w.teammates = [{ id: pick(mates).id, confirmed: true }];
}

// Verified experience (spec 07) for alumni who worked with a teammate
for (const m of members) for (const w of m.work) for (const t of w.teammates) {
  m.verified.push({ title: w.title, role: m.track === 'Software Developer' ? 'Software Dev' : 'Business Dev', with: [t.id], end: addMonths(COHORTS[m.cohort][0], 3), rating: Number((4.5 + rand() * 0.5).toFixed(1)), endorsed: w.skills.slice(0, 2) });
}

// Two connection requests waiting for a new demo account (spec 10)
const alumni = members.filter(m => m.cohort !== 12);
const invites = [
  { from: alumni.find(m => m.track === 'Business Developer').id, note: 'Hi! I was in an earlier cohort and saw we\'re into similar things. Happy to share what I learned on my Demo Day project.' },
  { from: members.find(m => m.cohort === 12 && m.track === 'Software Developer').id, note: 'Hey, we\'re in the same cohort. Want to pair on something for Demo Day?' },
];

const out = '// Generated by scripts/make-community.mjs (`npm run make:community`). Do not edit by hand.\n' +
  '// Made-up demo community (specs/10-networking.md): not real people, companies or schools.\n' +
  '// Plain script (shared globals); loads after js/demo-data.js.\n\n' +
  'DEMO_PEOPLE.push(\n' + members.map(m => ' ' + JSON.stringify(m)).join(',\n') + '\n);\n\n' +
  '// Who is connected to whom, between sample members\n' +
  'const DEMO_LINKS = ' + JSON.stringify(links) + ';\n\n' +
  '// Connection requests waiting for a new demo account\n' +
  'const DEMO_INVITES = ' + JSON.stringify(invites, null, 1) + ';\n\n' +
  'DEMO_PEOPLE.forEach(p => {\n' +
  '  p.connections = DEMO_LINKS[p.id].length;\n' +
  '  // Until the profile shows work to show (spec 11), list it as projects\n' +
  '  if (!p.projects) p.projects = p.work.map(w => ({ title: w.title, role: w.facts.role, desc: w.result }));\n' +
  '});\n';
writeFileSync(OUT, out);
console.log('Wrote', OUT, 'with', members.length, 'generated members');
