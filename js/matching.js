// Bootcamp Connect prototype: matching v2 (specs/06-matching.md).
// Plain script (shared globals); load order is set in prototype.html.
//
// Three questions, each with plain-language reasons:
//   projectFit(post, member)  how well a project fits a member (hard filters + weighted fit)
//   personFit(id)             how well two people fit each other, scored in both directions
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
      skills: p.skills || [], learn: p.learn || [], openTo: p.openTo || [],
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

// ----- Person ↔ person (reciprocal) -----
// How much `b` offers `a`, 0–100
function oneWayFit(a, b) {
  const complement = a.track && b.track && a.track !== b.track ? 1 : 0.35;
  const teach = a.learn.length ? overlap(a.learn, b.skills).length / a.learn.length : 0;
  const goals = overlap(a.goals, b.goals).length ? 1 : 0;
  const hd = a.hours && b.hours ? Math.abs(HOURS_VALUE[a.hours] - HOURS_VALUE[b.hours]) : 1;
  const hours = hd === 0 ? 1 : hd === 1 ? 0.5 : 0;
  const industry = overlap(a.industries, b.industries).length ? 1 : 0;
  const reliability = Math.min(1, (b.verified.length * 2 + sumValues(b.endorsements) / 3) / 6);
  return 30 * complement + 25 * teach + 15 * goals + 10 * hours + 10 * industry + 10 * reliability;
}

function personFit(id) {
  const me = memberView('me'), them = memberView(id);
  const forMe = oneWayFit(me, them), forThem = oneWayFit(them, me);
  const mutual = Math.sqrt(forMe * forThem);          // high only when both sides benefit
  const boost = them.connections < 8 ? 4 : 0;          // fairness: surface members with fewer connections
  const score = Math.min(98, Math.round(30 + 0.7 * mutual + boost));

  const reasons = [];
  if (me.track && them.track !== me.track) reasons.push(them.track === 'Business Developer' ? 'Business skills that complement your development skills' : 'Development skills that complement your business skills');
  else reasons.push('Same track: a good peer for pairing and side projects');
  const theyTeach = overlap(me.learn, them.skills);
  if (theyTeach.length) reasons.push('Can help you learn ' + theyTeach.join(', '));
  const iTeach = overlap(them.learn, me.skills);
  if (iTeach.length) reasons.push('You can help them with ' + iTeach.join(', ') + ', which they want to learn');
  const goals = overlap(me.goals, them.goals);
  if (goals.includes('Co-founder')) reasons.push('Both looking for a co-founder');
  else if (goals.length) reasons.push('Both open to ' + goals[0].toLowerCase());
  if (me.hours && me.hours === them.hours) reasons.push('Same weekly commitment (' + them.hours + ' hrs)');
  const industries = overlap(me.industries, them.industries);
  if (industries.length) reasons.push('Shared interest in ' + industries.join(' and '));
  if (them.verified.length) reasons.push('Completed ' + them.verified.length + ' project' + (them.verified.length > 1 ? 's' : '') + ' · ' + sumValues(them.endorsements) + ' skill endorsements');
  if (boost) reasons.push('Newer to the community, with fewer connections so far');
  if (!me.profileDone) reasons.push('Finish your profile for sharper matches');
  return { score, reasons, forMe: Math.round(forMe), forThem: Math.round(forThem) };
}

// Used by the Matchmaker People view
function matchFor(p) { return personFit(p.id); }

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
