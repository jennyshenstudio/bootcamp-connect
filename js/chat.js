// Bootcamp Connect prototype: messages: conversation list, threads, replies
// Plain script (shared globals); load order is set in prototype.html.

// ----- Messages -----
function allChats() {
  const extra = demo.created
    .filter(pid => !DEMO_CHATS.some(c => c.id === 'd-' + pid))
    .map(pid => ({ id: 'd-' + pid, type: 'dm', members: [pid], unread: 0, rank: 0, messages: [] }));
  return DEMO_CHATS.concat(extra);
}
const chatMessages = chat => chat.messages.concat(demo.sent[chat.id] || []);
const chatTitle = chat => chat.type === 'group' ? chat.name : fullName(person(chat.members[0]));
function chatSortKey(chat) {
  const msgs = chatMessages(chat);
  const last = msgs[msgs.length - 1];
  return last && last.ts ? last.ts : chat.rank;
}
function fmtTime(d) { return d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }); }

function renderChatList() {
  if (!demo) return;
  const q = ($('chat-search').value || '').trim().toLowerCase();
  const chats = allChats()
    .filter(c => !q || chatTitle(c).toLowerCase().includes(q) || c.members.some(id => fullName(person(id)).toLowerCase().includes(q)))
    .sort((a, b) => chatSortKey(b) - chatSortKey(a));
  $('chat-list').innerHTML = chats.length ? chats.map(c => {
    const msgs = chatMessages(c);
    const last = msgs[msgs.length - 1];
    const unread = demo.unread[c.id] || 0;
    const who = !last ? '' : last.from === 'me' ? 'You: ' : c.type === 'group' ? person(last.from).first + ': ' : '';
    const when = !last ? '' : last.day === 'Today' ? last.time : last.day;
    return '<li><button type="button" onclick="openChat(\'' + c.id + '\')" class="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-2xl text-left transition ease-apple ' +
      (openChatId === c.id ? 'bg-[var(--glass-pill)] shadow-[inset_0_1px_0_var(--glass-highlight)]' : 'hover:bg-fill') + '"' + (openChatId === c.id ? ' aria-current="true"' : '') + '>' +
      chatAvatar(c, 'w-12 h-12 text-subhead') +
      '<span class="min-w-0 flex-1">' +
        '<span class="flex items-baseline justify-between gap-2"><span class="font-semibold text-subhead truncate">' + esc(chatTitle(c)) + '</span><span class="text-caption text-label-2 shrink-0">' + esc(when) + '</span></span>' +
        '<span class="flex items-center gap-2"><span class="text-footnote line-clamp-2 flex-1 ' + (unread ? 'text-label' : 'text-label-2') + '">' + (last ? esc(who + last.text) : 'No messages yet') + '</span>' +
        (unread ? '<span class="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-appleBlue text-white text-caption2 font-semibold flex items-center justify-center tabular-nums" aria-label="' + unread + ' unread">' + unread + '</span>' : '') +
        '</span>' +
      '</span></button></li>';
  }).join('') : '<li class="px-3 py-6 text-center text-subhead text-label-2">No conversations match "' + esc(q) + '".</li>';
}

function updateBadge() {
  const total = demo ? Object.values(demo.unread).reduce((a, b) => a + b, 0) : 0;
  document.querySelectorAll('[data-badge]').forEach(b => { b.textContent = total; b.hidden = !total; });
}

function goToChat(id) { switchTab('chat'); openChat(id); }

function openChat(id) {
  openChatId = id;
  demo.unread[id] = 0;
  saveDemo();
  $('chat-shell').classList.add('thread-open');
  $('chat-thread-pane').classList.remove('hidden');
  renderChatList();
  renderThread();
  updateBadge();
  if (window.matchMedia('(min-width: 768px)').matches) $('composer-input').focus();
}

function closeThread() {
  $('chat-shell').classList.remove('thread-open');
  openChatId = null;
  renderChatList();
}

function ensureChatSelection() {
  if (!demo) return;
  if (!openChatId && window.matchMedia('(min-width: 768px)').matches) {
    const first = allChats().sort((a, b) => chatSortKey(b) - chatSortKey(a))[0];
    if (first) openChat(first.id);
  }
}

function renderThread() {
  const chat = allChats().find(c => c.id === openChatId);
  if (!chat) return;
  const isGroup = chat.type === 'group';
  const p = isGroup ? null : person(chat.members[0]);
  const subtitle = isGroup
    ? (chat.members.length <= 3 ? chat.members.map(id => person(id).first).join(', ') + ' & you' : (chat.members.length + 1) + ' members')
    : p.headline;
  $('thread-header').innerHTML =
    '<button type="button" class="md:hidden btn btn-plain !min-h-[44px] !px-2" onclick="closeThread()" aria-label="Back to conversations"><svg class="icon w-6 h-6"><use href="#i-back"/></svg></button>' +
    '<button type="button" class="flex items-center gap-3 min-w-0 flex-1 text-left rounded-xl py-2" onclick="' + (isGroup ? 'openMembers(\'' + chat.id + '\')' : 'openPerson(\'' + p.id + '\')') + '">' +
      chatAvatar(chat, 'w-10 h-10 text-subhead') +
      '<span class="min-w-0"><span class="block font-semibold text-body truncate">' + esc(chatTitle(chat)) + '</span><span class="block text-footnote text-label-2 truncate">' + esc(subtitle) + '</span></span>' +
    '</button>' +
    '<button type="button" class="btn btn-gray !min-h-0 !w-9 !h-9 !p-0 shrink-0" onclick="' + (isGroup ? 'openMembers(\'' + chat.id + '\')' : 'openPerson(\'' + p.id + '\')') + '" aria-label="' + (isGroup ? 'Group members' : 'View profile') + '"><svg class="icon w-5 h-5"><use href="#' + (isGroup ? 'i-users' : 'i-person') + '"/></svg></button>';

  const msgs = chatMessages(chat);
  let html = '', lastDay = null;
  msgs.forEach((m, i) => {
    if (m.day !== lastDay) {
      html += '<p class="text-center text-caption text-label-2 font-semibold my-3">' + esc(m.day) + '</p>';
      lastDay = m.day;
    }
    const prev = msgs[i - 1], next = msgs[i + 1];
    const firstOfRun = !prev || prev.from !== m.from || prev.day !== m.day;
    const lastOfRun = !next || next.from !== m.from || next.day !== m.day;
    const gap = firstOfRun && i ? ' mt-3' : ' mt-0.5';
    const text = esc(m.text);
    if (m.from === 'me') {
      html += '<div class="flex flex-col items-end' + gap + '"><div class="bubble bubble-me">' + text + '</div>' +
        (lastOfRun ? '<span class="text-caption2 text-label-3 mt-1 mr-1">' + esc(m.time) + '</span>' : '') + '</div>';
    } else {
      const sender = person(m.from);
      html += '<div class="flex items-end gap-2' + gap + '">' +
        '<div class="w-7 shrink-0">' + (lastOfRun ? '<button type="button" class="tap rounded-full" onclick="openPerson(\'' + sender.id + '\')" aria-label="View ' + esc(fullName(sender)) + '">' + personAvatar(sender, 'w-7 h-7 text-caption2') + '</button>' : '') + '</div>' +
        '<div class="flex flex-col items-start max-w-[78%] min-w-0">' +
          (isGroup && firstOfRun ? '<span class="text-caption text-label-2 ml-3 mb-0.5">' + esc(sender.first) + '</span>' : '') +
          '<div class="bubble bubble-them">' + text + '</div>' +
          (lastOfRun ? '<span class="text-caption2 text-label-3 mt-1 ml-3">' + esc(m.time) + '</span>' : '') +
        '</div></div>';
    }
  });
  if (typing[chat.id]) {
    const t = person(typing[chat.id]);
    html += '<div class="flex items-end gap-2 mt-3"><div class="w-7 shrink-0">' + personAvatar(t, 'w-7 h-7 text-caption2') + '</div>' +
      '<div class="bubble bubble-them typing" aria-label="' + esc(t.first) + ' is typing"><span></span><span></span><span></span></div></div>';
  }
  const body = $('thread-body');
  body.innerHTML = html || '<p class="text-center text-subhead text-label-2 mt-10">Say hello to ' + esc(p ? p.first : 'the group') + ' 👋</p>';
  body.scrollTop = body.scrollHeight;
}

function sendMessage(e) {
  e.preventDefault();
  const input = $('composer-input');
  const text = input.value.trim();
  const chat = allChats().find(c => c.id === openChatId);
  if (!text || !chat) return;
  (demo.sent[chat.id] = demo.sent[chat.id] || []).push({ from: 'me', day: 'Today', time: fmtTime(new Date()), ts: Date.now(), text });
  saveDemo();
  input.value = '';
  autoGrow(input);
  renderThread();
  renderChatList();
  scheduleReply(chat);
}

// Demo: someone in the conversation replies after a moment.
// On the published page Claude writes the reply in that member's voice; otherwise a fallback line is used.
async function generateReply(chat, from) {
  const sample = await getSample();
  if (!sample) return null;
  const p = person(from);
  const me = currentAccount() || {};
  const history = chatMessages(chat).slice(-10).map(m =>
    (m.from === 'me' ? (me.first || 'Member') : person(m.from).first) + ': ' + m.text).join('\n');
  const prompt =
    'You are role-playing ' + fullName(p) + ', a sample member of Bootcamp Connect, a networking app where coding-bootcamp ' +
    'students on the Software Developer and Business Developer tracks find project partners. This is a product demo.\n\n' +
    'Your profile: ' + p.headline + '. ' + p.about + ' Skills: ' + p.skills.join(', ') + '. Looking for: ' + p.goals.join(', ') + '.\n\n' +
    (chat.type === 'group' ? 'Group chat "' + chat.name + '".' : 'Direct message with ' + (me.first || 'a member') + '.') +
    ' Recent messages, oldest first:\n' + history + '\n\n' +
    'Write ' + p.first + '\'s next message replying to the latest one. One or two short sentences, friendly chat tone, ' +
    'at most one emoji. Reply with the message text only: no name prefix, no quotes, no links.';
  try {
    const { text } = await sample(prompt, { modelTier: 'quick', cache: false });
    return text.trim().replace(new RegExp('^' + p.first + ':\\s*'), '').replace(/^["“]|["”]$/g, '').trim().slice(0, 400) || null;
  } catch { return null; }
}

function scheduleReply(chat) {
  clearTimeout(replyTimers[chat.id]);
  const candidates = chat.members.filter(id => chat.type === 'dm' || demo.connected[id]);
  const from = candidates[Math.floor(Math.random() * candidates.length)] || chat.members[0];
  replyTimers[chat.id] = setTimeout(async () => {
    typing[chat.id] = from;
    if (openChatId === chat.id) renderThread();
    const [generated] = await Promise.all([generateReply(chat, from), new Promise(r => setTimeout(r, 1500))]);
    delete typing[chat.id];
    let text = generated;
    if (!text) {
      const replies = DEMO_REPLIES[from];
      const n = demo.replyIdx[from] || 0;
      demo.replyIdx[from] = n + 1;
      text = replies[n % replies.length];
    }
    (demo.sent[chat.id] = demo.sent[chat.id] || []).push({ from, day: 'Today', time: fmtTime(new Date()), ts: Date.now(), text });
    if (openChatId !== chat.id || $('tab-chat').classList.contains('hidden')) demo.unread[chat.id] = (demo.unread[chat.id] || 0) + 1;
    saveDemo();
    if (openChatId === chat.id) renderThread();
    renderChatList();
    updateBadge();
  }, 900);
}

function messagePerson(id) {
  if (!allChats().some(c => c.id === 'd-' + id)) { demo.created.push(id); saveDemo(); }
  closeSheet();
  goToChat('d-' + id);
}

function onComposerKey(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('thread-composer').requestSubmit(); }
}
function autoGrow(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 128) + 'px'; }

function initDemo() {
  loadDemo();
  openChatId = null;
  $('chat-shell').classList.remove('thread-open');
  renderPeople();
  renderChatList();
  updateBadge();
}
