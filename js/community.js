// Bootcamp Connect prototype: per-account demo state and shared helpers
// Plain script (shared globals); load order is set in prototype.html.

let demo = null;              // per-user demo state, saved in this browser
let openChatId = null;
let peopleFilter = 'all';
const typing = {};
const replyTimers = {};
let sheetReturnFocus = null;

const person = id => DEMO_PEOPLE.find(p => p.id === id);
const fullName = p => p.first + ' ' + p.last;
const demoKey = () => 'bc_demo:' + load(SESSION_KEY, '');
const currentAccount = () => getAccounts()[load(SESSION_KEY, '')] || null;

function loadDemo() {
  demo = load(demoKey(), null) || {
    connected: Object.fromEntries(DEMO_PEOPLE.map(p => [p.id, p.connected])),
    requested: {}, sent: {}, created: [], replyIdx: {},
    unread: Object.fromEntries(DEMO_CHATS.map(c => [c.id, c.unread])),
  };
}
function saveDemo() { save(demoKey(), demo); }

function personAvatar(p, cls) {
  return '<div class="avatar ' + cls + '" style="background:linear-gradient(135deg,' + p.colors[0] + ',' + p.colors[1] + ')" aria-hidden="true">' + esc(initials(p.first, p.last)) + '</div>';
}
function chatAvatar(chat, cls) {
  if (chat.type === 'dm') return personAvatar(person(chat.members[0]), cls);
  return '<div class="avatar ' + cls + '" style="background:linear-gradient(135deg,' + chat.colors[0] + ',' + chat.colors[1] + ')" aria-hidden="true"><svg class="icon !w-1/2 !h-1/2"><use href="#i-users"/></svg></div>';
}
function trackBadge(track) {
  const biz = track === 'Business Developer';
  return '<span class="px-2.5 py-0.5 rounded-full text-footnote font-semibold ' + (biz ? 'bg-applePurple/15 text-purpleText' : 'bg-appleBlue/10 text-blueText') + '">' + (biz ? 'Business Dev' : 'Software Dev') + '</span>';
}
