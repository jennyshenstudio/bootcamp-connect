// Bootcamp Connect: SVG icon sprite (SF Symbols-style outlines). Moved out of index.html (D027).
// Plain script; loads before the other modules so <svg><use href="#i-…"/></svg> resolves.
// To add an icon, add a <symbol id="i-name" viewBox="0 0 24 24"> here and use it as #i-name.

(function insertIconSprite() {
  const symbols = [
    '<symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13.2 2.5 5 13.6h6.2L10.6 21.5l8.4-11.3h-6.3z" fill="currentColor" stroke="none"/></symbol>',
    '<symbol id="i-feed" viewBox="0 0 24 24"><rect x="3.5" y="4" width="17" height="16" rx="3.5"/><path d="M7.5 9h9M7.5 12.5h9M7.5 16h5"/></symbol>',
    '<symbol id="i-match" viewBox="0 0 24 24"><path d="M10 3.5 11.8 8.2 16.5 10l-4.7 1.8L10 16.5l-1.8-4.7L3.5 10l4.7-1.8z"/><path d="M17.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/></symbol>',
    '<symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6.5L6 20.5V17h0a2 2 0 0 1-2-2z"/></symbol>',
    '<symbol id="i-person" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.75"/><path d="M4.75 20c1.1-3.6 3.9-5.5 7.25-5.5s6.15 1.9 7.25 5.5"/></symbol>',
    '<symbol id="i-laptop" viewBox="0 0 24 24"><rect x="4.5" y="5" width="15" height="10.5" rx="1.75"/><path d="M2.5 18.5h19"/></symbol>',
    '<symbol id="i-briefcase" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2.75"/><path d="M8.75 7V5.75C8.75 4.78 9.53 4 10.5 4h3c.97 0 1.75.78 1.75 1.75V7M3 12.5h18"/></symbol>',
    '<symbol id="i-doc" viewBox="0 0 24 24"><path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8z"/><path d="M14 3v5h5M9 13h6M9 16.5h4"/></symbol>',
    '<symbol id="i-hand" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16.25v.25"/></symbol>',
    '<symbol id="i-up" viewBox="0 0 24 24"><path d="M12 19.5V5M5.75 11 12 4.75 18.25 11"/></symbol>',
    '<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>',
    '<symbol id="i-chevron" viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6"/></symbol>',
    '<symbol id="i-book" viewBox="0 0 24 24"><path d="M4.5 5.5A1.5 1.5 0 0 1 6 4h5.25v15H6a1.5 1.5 0 0 0-1.5 1.5zM19.5 5.5A1.5 1.5 0 0 0 18 4h-5.25v15H18a1.5 1.5 0 0 1 1.5 1.5z"/></symbol>',
    '<symbol id="i-spark" viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></symbol>',
    '<symbol id="i-help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2.1-2.4 3.7M12 17.2v.3"/></symbol>',
    '<symbol id="i-megaphone" viewBox="0 0 24 24"><path d="M4 10v4a1 1 0 0 0 1 1h2l6 4V5L7 9H5a1 1 0 0 0-1 1zM16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/></symbol>',
    '<symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></symbol>',
    '<symbol id="i-bookmark" viewBox="0 0 24 24"><path d="M6.5 4h11v16.5L12 16.6l-5.5 3.9z"/></symbol>',
    '<symbol id="i-link" viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/></symbol>',
    '<symbol id="i-photo" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.75"/><path d="M20.5 15.5l-4.5-4.5-8 8"/></symbol>',
    '<symbol id="i-back" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></symbol>',
    '<symbol id="i-close" viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></symbol>',
    '<symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>',
    '<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></symbol>',
    '<symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.8-3 3-4.6 5.5-4.6s4.7 1.6 5.5 4.6"/><circle cx="17" cy="9" r="2.6"/><path d="M15.9 14.3c2.2.1 3.9 1.7 4.6 4.7"/></symbol>',
  ];
  document.body.insertAdjacentHTML('afterbegin',
    '<svg width="0" height="0" class="absolute" aria-hidden="true" id="icon-sprite">' + symbols.join('') + '</svg>');
})();
