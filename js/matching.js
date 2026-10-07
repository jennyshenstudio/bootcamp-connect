// Bootcamp Connect prototype: matching (specs/04-connections-messages.md)
// Plain script (shared globals); load order is set in prototype.html.

// Simple fit score: complementary track, shared industries and goals, similar weekly hours
function matchFor(p) {
  const me = currentAccount() || {};
  const mp = me.profile || {};
  let score = 54;
  const reasons = [];
  if (me.track && p.track !== me.track) {
    score += 20;
    reasons.push(p.track === 'Business Developer' ? 'Business skills that complement your development skills' : 'Development skills that complement your business skills');
  } else {
    score += 6;
    reasons.push('Same track: a good peer for side projects and pairing');
  }
  const industries = (mp.industries || []).filter(i => p.industries.includes(i));
  if (industries.length) { score += Math.min(industries.length * 6, 12); reasons.push('Shared interest in ' + industries.join(' and ')); }
  const goals = (mp.goals || []).map(g => g === 'Paid gig' ? 'Paid work' : g).filter(g => p.goals.includes(g));
  if (goals.includes('Co-founder')) { score += 10; reasons.push('Both looking for a co-founder'); }
  else if (goals.length) { score += 6; reasons.push('Both open to ' + goals[0].toLowerCase()); }
  const hourDiff = mp.hours ? Math.abs(HOURS.indexOf(mp.hours) - HOURS.indexOf(p.hours)) : null;
  if (hourDiff === 0) { score += 6; reasons.push('Same weekly commitment (' + p.hours + ' hrs)'); }
  else if (hourDiff === 1) score += 3;
  if (!mp.headline) reasons.push('Finish your profile for sharper matches');
  return { score: Math.min(score, 98), reasons };
}
