// Bootcamp Connect prototype: matching v2 (specs/06-matching.md) and people suggestions (specs/10-networking.md).
// Plain script (shared globals); load order is set in index.html.
//
// Three questions, each with plain-language reasons:
//   projectFit(post, member)  how well an opportunity fits a member (hard filters + weighted fit)
//   suggestionFor(id)         who to suggest connecting with, and why (spec 10)
//   suggestTeam(post)         members an opportunity's poster could invite

const lower = a => (a || []).map(s => s.toLowerCase());
const overlap = (a, b) => { const B = lower(b); return (a || []).filter(x => B.includes(x.toLowerCase())); };
const shortTrack = t => t === 'Business Developer' ? 'Business Dev' : 'Software Dev';
const sumValues = o => Object.values(o || {}).reduce((x, y) => x + y, 0);

// One shape for the signed-in member and the sample members
function memberView(id) {
  if (id === 'me') {
    const acc = currentAccount() || {};
    const p = profileOf(acc);
    return {
      id: 'me', first: acc.first || 'You', track: acc.track || '',
      cohort: p.cohort || CURRENT_COHORT, experience: p.experience || [], education: p.education || [],
      skills: p.skills || [], learn: p.learn || [], openTo: p.openTo || [],
      hours: p.hours || '', setting: p.setting || '', industries: p.industries || [],
      goals: p.goals || [], stage: p.stage || '', work: p.work || [],
      verified: (demo && demo.verified) || [], endorsements: (demo && demo.endorsements) || {},
      connections: demo ? Object.values(demo.connected).filter(Boolean).length : 0,
      profileDone: !!p.headline,
    };
  }
  return { ...person(id), profileDone: true };
}
const memberTrack = id => memberView(id).track;

// ----- Opportunity → member (spec 12, D040) -----
// Opportunities have no skills field, so skills count when the opportunity's text mentions them.
// Weights (sum to 100): skills mentioned 40, skills you want to learn 15, goal 15, workplace 15, fairness 15.
// The score only sets the order; members never see it.
const opportunityText = post => [post.title, post.body].concat(post.responsibilities || [], post.requirements || [], post.niceToHave || []).join(' ').toLowerCase();
// Whole words only, so "Git" doesn't match "digital" (skills can contain . + # and spaces)
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const mentions = (text, skill) => new RegExp('(^|[^a-z0-9])' + escapeRe(skill.toLowerCase()) + '($|[^a-z0-9])').test(text);
// Equity was a pay type before D040; members open to it are open to unpaid opportunities
const openToPay = (m, type) => !m.openTo.length || m.openTo.includes(type) || (type === 'Unpaid' && m.openTo.includes('Equity'));

function projectFit(post, m) {
  const blockers = [];
  if (m.track && post.lookingFor !== m.track) blockers.push('For ' + post.lookingFor + 's only');
  if (!openToPay(m, post.pay.type)) blockers.push("You're not open to " + PAY_TYPES[post.pay.type].label.toLowerCase() + ' work');
  if (post.workplace === 'In person' && m.setting === 'Remote') blockers.push('In person only; you prefer remote');

  const text = opportunityText(post);
  const has = (m.skills || []).filter(s => mentions(text, s));
  const learn = (m.learn || []).filter(s => mentions(text, s) && !has.includes(s));
  const goal = m.goals.includes(PAY_TYPES[post.pay.type].goal) ? 1 : 0;
  const place = post.workplace === 'Remote' || !m.setting || m.setting === post.workplace ? 1 : 0;
  const applicants = projectApplicants(post);
  const fairness = 1 - Math.min(applicants, 5) / 5;
  const raw = 40 * Math.min(1, has.length / 3) + 15 * Math.min(1, learn.length) + 15 * goal + 15 * place + 15 * fairness;

  const reasons = [];
  if (has.length) reasons.push('Uses ' + has.join(', ') + ', which you know');
  if (learn.length) reasons.push("You'd practise " + learn.join(', ') + ', which you want to learn');
  if (goal) reasons.push('Matches your goal: ' + PAY_TYPES[post.pay.type].goal.toLowerCase());
  if (applicants <= 1) reasons.push(applicants ? 'Only 1 applicant so far' : 'No applicants yet');
  const score = Math.round(blockers.length ? Math.min(raw, 40) : raw);
  return { score, blocked: blockers.length > 0, blockers, reasons, has, learn };
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

// ----- Members to invite to an opportunity -----
// Up to 3 members on the pathway it's looking for, best fit first, until someone on that pathway joins.
function suggestTeam(post) {
  const team = projectTeam(post);
  if (team.some(id => id !== post.author && memberTrack(id) === post.lookingFor)) return [];
  const taken = new Set(team.concat(projectApplicantList(post).map(a => a.id)));
  return DEMO_PEOPLE
    .filter(p => p.track === post.lookingFor && !taken.has(p.id))
    .map(p => ({ person: p, fit: projectFit(post, memberView(p.id)) }))
    .filter(c => !c.fit.blocked)
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, 3);
}
