// Bootcamp Connect: declarative event handlers without inline JavaScript (D027).
// Plain script (shared globals); load order is set in index.html. Loads first.
//
// Markup uses data-on-<event> attributes instead of onclick="…" and friends, so the page can run
// under a Content Security Policy that blocks inline script:
//
//   <button data-on-click="switchTab('feed')">            calls window.switchTab('feed')
//   <form data-on-submit="addComment(event, 'p1')">       `event` is the DOM event
//   <input data-on-change="handlePhoto(this)">            `this` is the element with the attribute
//   <button data-on-click="event.stopPropagation(); removeSkill(2)">
//
// Supported: calls to global functions, or to methods on `this` / `event`, separated by `;`.
// Arguments can be 'strings', numbers, true, false, null, or paths such as this.files[0] or
// this.dataset.skill. Nothing else is evaluated: there is no eval() or new Function().
// Handlers run from the element outwards, like inline handlers, and event.stopPropagation()
// stops outer data-on-* handlers.

const ACTION_EVENTS = ['click', 'submit', 'change', 'input', 'keydown'];

const actionCache = new Map();

// Parse "fn('a', 1); event.stopPropagation()" into [{ path: ['fn'], args: [...] }, …]
function parseActions(src) {
  if (actionCache.has(src)) return actionCache.get(src);
  let i = 0;
  const fail = msg => { throw new SyntaxError('data-on: ' + msg + ' at ' + i + ' in "' + src + '"'); };
  const ws = () => { while (i < src.length && /\s/.test(src[i])) i++; };
  const ident = () => {
    const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i));
    if (!m) fail('expected a name');
    i += m[0].length;
    return m[0];
  };
  const path = () => {
    const parts = [ident()];
    for (;;) {
      if (src[i] === '.') { i++; parts.push(ident()); }
      else if (src[i] === '[') {
        i++; ws();
        const m = /^\d+/.exec(src.slice(i));
        if (!m) fail('expected an index');
        i += m[0].length; ws();
        if (src[i] !== ']') fail('expected ]');
        i++; parts.push(Number(m[0]));
      } else return parts;
    }
  };
  const string = () => {
    const quote = src[i++];
    let out = '';
    while (i < src.length && src[i] !== quote) {
      if (src[i] === '\\') i++;
      out += src[i++];
    }
    if (src[i] !== quote) fail('unclosed string');
    i++;
    return { value: out };
  };
  const arg = () => {
    ws();
    const c = src[i];
    if (c === "'" || c === '"') return string();
    const num = /^-?\d+(\.\d+)?/.exec(src.slice(i));
    if (num) { i += num[0].length; return { value: Number(num[0]) }; }
    const p = path();
    if (p.length === 1 && p[0] in { true: 1, false: 1, null: 1 }) return { value: { true: true, false: false, null: null }[p[0]] };
    if (p[0] !== 'this' && p[0] !== 'event') fail('arguments must be literals, this or event');
    return { ref: p };
  };
  const statements = [];
  for (;;) {
    ws();
    if (i >= src.length) break;
    const callee = path();
    ws();
    if (src[i] !== '(') fail('expected (');
    i++; ws();
    const args = [];
    if (src[i] !== ')') {
      for (;;) {
        args.push(arg()); ws();
        if (src[i] === ',') { i++; continue; }
        if (src[i] === ')') break;
        fail('expected , or )');
      }
    }
    i++; ws();
    statements.push({ path: callee, args });
    if (src[i] === ';') i++;
    else if (i < src.length) fail('expected ;');
  }
  actionCache.set(src, statements);
  return statements;
}

function resolveActionPath(parts, el, event) {
  let obj = parts[0] === 'this' ? el : parts[0] === 'event' ? event : window[parts[0]];
  for (let k = 1; k < parts.length && obj != null; k++) obj = obj[parts[k]];
  return obj;
}

function runActions(src, el, event) {
  for (const { path, args } of parseActions(src)) {
    const values = args.map(a => ('ref' in a ? resolveActionPath(a.ref, el, event) : a.value));
    const owner = path.length > 1 ? resolveActionPath(path.slice(0, -1), el, event) : window;
    const fn = owner && owner[path[path.length - 1]];
    if (typeof fn !== 'function') throw new TypeError('data-on: ' + path.join('.') + ' is not a function');
    fn.apply(owner === window ? undefined : owner, values);
  }
}

ACTION_EVENTS.forEach(type => {
  const attr = 'data-on-' + type;
  const selector = '[' + attr + ']';
  document.addEventListener(type, event => {
    let el = event.target instanceof Element ? event.target.closest(selector) : null;
    while (el) {
      runActions(el.getAttribute(attr), el, event);
      if (event.cancelBubble) break; // the handler called event.stopPropagation()
      el = el.parentElement && el.parentElement.closest(selector);
    }
  });
});

// Small helpers used from markup in place of inline statements
function focusField(id) { const el = document.getElementById(id); if (el) el.focus(); }
