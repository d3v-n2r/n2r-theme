// Appearance toggle and mobile sidebar.
//
// Chirpy drives both through Bootstrap components — a Dropdown for the mode menu and its own
// sidebar script — which costs Bootstrap's JS bundle plus Popper. Neither is needed: the mode
// toggle is a three-state cycle and the sidebar is one attribute.
//
// Reading the stored mode happens inline in <head>, before first paint, so a reader who chose dark
// never sees a white flash. This file only handles interaction afterwards.

(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'mode';

  /** Cycles system → light → dark → system, so a reader can always get back to following the OS. */
  function nextMode(current) {
    if (!current) return 'light';
    if (current === 'light') return 'dark';
    return null;
  }

  function applyMode(mode) {
    if (mode) {
      root.dataset.mode = mode;
      localStorage.setItem(STORAGE_KEY, mode);
    } else {
      delete root.dataset.mode;
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  var toggle = document.getElementById('mode-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      applyMode(nextMode(root.dataset.mode || null));
    });
  }

  var trigger = document.getElementById('sidebar-trigger');
  var mask = document.getElementById('mask');

  function setSidebar(open) {
    if (open) {
      root.dataset.sidebar = 'open';
    } else {
      delete root.dataset.sidebar;
    }
    if (trigger) {
      trigger.setAttribute('aria-expanded', String(open));
    }
  }

  if (trigger) {
    trigger.addEventListener('click', function () {
      setSidebar(root.dataset.sidebar !== 'open');
    });
  }

  if (mask) {
    mask.addEventListener('click', function () {
      setSidebar(false);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && root.dataset.sidebar === 'open') {
      setSidebar(false);
      if (trigger) trigger.focus();
    }
  });
})();
