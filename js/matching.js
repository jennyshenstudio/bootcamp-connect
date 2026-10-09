// Bootcamp Connect prototype: matching v2 (specs/06-matching.md) and people suggestions (specs/10-networking.md).
// Plain script (shared globals); load order is set in index.html.
//
// Three questions, each with plain-language reasons:
//   projectFit(post, member)  how well a project fits a member (hard filters + weighted fit)
//   suggestionFor(id)         who to suggest connecting with, and why (spec 10)
//   suggestTeam(post)         a balanced team for a project owner (CATME-style)

const HOURS_VALUE = { 'Under 10': 0, '10–20': 1, '20–40': 2, '40+': 3 };
const lower = a => (a || []).map(s => s.toLowerCase());
const overlap = (a, b) => { const B = lower(b); return (a || []).filter(x => B.includes(x.toLowerCase())); };
const shortTrack = t => t === 'Business Developer' ? 'Business Dev' : 'Software Dev';
const sumValues = o => Object.values(o || {}).reduce((x, y) => x + y, 0);

// One shape for the signed-in member and the sample members
function memberView(id) {
  if (id === 'me') {
    const acc = currentAccount() || {};
    const p = acc.profile || {};
    return {
      id: 'me', first: acc.first || 'You', track: acc.track || '',
      cohort: p.cohort || CURRENT_COHORT, experience: p.experience || [], education: p.education || [],
      skills: (p.skills || []).map(britishSkill), learn: (p.learn || []).map(britishSkill), openTo: p.openTo || [],
      hours: p.hours || '', setting: p.setting || '', industries: p.industries || [],
      goals: (p.goals || []).map(g => g === 'Paid gig' ? 'Paid work' : g),
      verified: (demo && demo.verified) || [], endorsements: (demo && demo.endorsements) || {},
      connections: demo ? Object.values(demo.connected).filter(Boolean).length : 0,
      profileDone: !!p.headline,
    };
  }
  return { ...person(id), profileDone: true };
}
const memberTrack = id => memberView(id).track;

// ----- Project → member -----
// Weights (sum to 100): skill fit 45, growth fit 10, commitment 15, industry 10, goal 10, fairness 10
function projectFit(post, m) {
  const blockers = [];
  const role = post.roles.find(r => r.track === m.track);
  if (!role) blockers.push('Looking for ' + post.roles.map(r => shortTrack(r.track)).join(' and ') + ' only');
  if (m.openTo.length && !m.openTo.includes(post.pay.type)) blockers.push("You're not open to " + PAY_TYPES[post.pay.type].label.toLowerCase() + ' work');
  if (m.hours && HOURS_VALUE[post.hours] > HOURS_VALUE[m.hours]) blockers.push('Needs ' + post.hours + ' hrs/week; you have ' + m.hours);
  if (post.setting === 'In person' && m.setting === 'Remote') blockers.push('In person only; you prefer remote');

  const needed = role ? role.skills : post.roles.flatMap(r => r.skills);
  const has = overlap(needed, m.skills);
  const learn = overlap(needed, m.learn).filter(s => !has.includes(s));
  const skill = needed.length ? has.length / needed.length : 0;
  const growth = needed.length ? learn.length / needed.length : 0;
  const hourDiff = m.hours ? Math.abs(HOURS_VALUE[post.hours] - HOURS_VALUE[m.hours]) : 1;
  const commit = hourDiff === 0 ? 1 : hourDiff === 1 ? 0.5 : 0;
  const interest = m.industries.includes(post.industry) ? 1 : 0;
  const goal = m.goals.includes(PAY_TYPES[post.pay.type].goal) ? 1 : 0;
  const applicants = projectApplicants(post);
  const fairness = 1 - Math.min(applicants, 5) / 5;
  const raw = 45 * Math.min(1, skill + growth * 0.5) + 10 * Math.min(1, growth * 2) + 15 * commit + 10 * interest + 10 * goal + 10 * fairness;

  const reasons = [];
  if (has.length) reasons.push((skill >= 0.4 ? 'Strong skill match: ' : 'You have ') + has.join(', '));
  else if (role) reasons.push("You don't list any of the skills needed yet");
  if (learn.length) reasons.push("You'd practise " + learn.join(', ') + ', which you want to learn');
  if (commit === 1) reasons.push('Fits your weekly hours');
  if (interest) reasons.push('In ' + post.industry + ', an industry you follow');
  if (goal) reasons.push('Matches your goal: ' + PAY_TYPES[post.pay.type].goal.toLowerCase());
  if (applicants <= 1) reasons.push(applicants ? 'Only 1 applicant so far' : 'No applicants yet');
  if (!m.profileDone) reasons.push('Finish your profile for sharper matches');
  const score = Math.round(blockers.length ? Math.min(raw, 40) : raw);
  return { score, blocked: blockers.length > 0, blockers, reasons, role, has, learn };
}

// ----- People suggestions (spec 10, D038) -----
// Points (sum to 100): mutual connections 30 (5 or more gets full points), same cohort 15, same
// company 10, same school 5, other track 10, they have skills you want to learn 10, you have skills
// they want to learn 10, fewer than 8 connections 10. Goals and stage don't count, so newer members
// aren't pushed down. The score only sets the order; members see the reasons, never the number.
const companiesOf = m => (m.experience || []).map(e => e.company).filter(c => c && c !== 'Self-employed' && !c.startsWith('Bootcamp Connect Cohort'));
const schoolsOf = m => (m.education || []).map(e => e.school).filter(Boolean);
const mutualConnections = id => (DEMO_LINKS[id] || []).filter(x => demo && demo.connected[x]);

function suggestionFor(id) {
  const me = memberView('me'), them = memberView(id);
  const mutual = mutualConnections(id);
  const cohort = me.cohort === them.cohort;
  const company = overlap(companiesOf(me), companiesOf(them))[0];
  const school = overlap(schoolsOf(me), schoolsOf(them))[0];
  const otherTrack = !!me.track && them.track !== me.track;
  const theyTeach = overlap(me.learn, them.skills);
  const iTeach = overlap(them.learn, me.skills);
  const newer = them.connections < 8;
  const score = 30 * Math.min(mutual.length, 5) / 5 + (cohort ? 15 : 0) + (company ? 10 : 0) + (school ? 5 : 0) +
    (otherTrack ? 10 : 0) + (theyTeach.length ? 10 : 0) + (iTeach.length ? 10 : 0) + (newer ? 10 : 0);

  const reasons = [];
  if (mutual.length) reasons.push(mutual.length + ' mutual connection' + (mutual.length > 1 ? 's' : ''));
  if (cohort) reasons.push('Both in Cohort ' + them.cohort);
  if (company) reasons.push('Both worked at ' + company);
  if (school) reasons.push('Both studied at ' + school);
  if (theyTeach.length) reasons.push('Can help you learn ' + theyTeach.join(', '));
  if (iTeach.length) reasons.push('You can help them with ' + iTeach.join(', '));
  if (otherTrack) reasons.push(them.track === 'Business Developer' ? 'Business skills that complement your development skills' : 'Development skills that complement your business skills');
  if (newer) reasons.push('Newer to the community');
  return { score: Math.round(score), reasons, mutual };
}

// ----- Team suggestions for a project owner (CATME-style) -----
// Fill open role slots, scarcest role first, so no slot is left with a weak fit (max-min).
function suggestTeam(post) {
  const team = projectTeam(post);
  const taken = new Set(team.concat(projectApplicantList(post).map(a => a.id)));
  const slots = [];
  post.roles.forEach(r => {
    const filled = team.filter(id => id !== post.author && memberTrack(id) === r.track).length;
    for (let i = filled; i < r.count; i++) slots.push(r);
  });
  const options = slots.map(r => ({
    role: r,
    candidates: DEMO_PEOPLE
      .filter(p => p.track === r.track && !taken.has(p.id))
      .map(p => ({ person: p, fit: projectFit(post, memberView(p.id)) }))
      .filter(c => !c.fit.blocked)
      .sort((a, b) => b.fit.score - a.fit.score),
  })).sort((a, b) => a.candidates.length - b.candidates.length);
  const used = new Set();
  const picks = [];
  options.forEach(o => {
    const c = o.candidates.find(c => !used.has(c.person.id));
    if (c) { used.add(c.person.id); picks.push({ role: o.role, person: c.person, fit: c.fit }); }
  });
  return picks;
}
