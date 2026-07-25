// Appearance toggle, mobile sidebar, and back-to-top.
//
// Chirpy drives the first two through Bootstrap components — a Dropdown for the mode menu and its
// own sidebar script — which costs Bootstrap's JS bundle plus Popper. Neither is needed: the toggle
// is a three-state cycle and the sidebar is one attribute.
//
// Reading the stored mode happens inline in <head>, before first paint, so a reader who chose dark
// never sees a white flash. This file only handles interaction afterwards.

(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'mode';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---------------------------------------------------------------- appearance

  /** Cycles system → light → dark → system, so a reader can always get back to following the OS. */
  function nextMode(current) {
    if (!current) return 'light';
    if (current === 'light') return 'dark';
    return null;
  }

  function writeMode(mode) {
    if (mode) {
      root.dataset.mode = mode;
      localStorage.setItem(STORAGE_KEY, mode);
    } else {
      delete root.dataset.mode;
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /** Whether the mode we are moving to paints darker than the one we are leaving. */
  function resolves(mode) {
    if (mode) return mode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Swaps the appearance, revealing the new theme as a circle growing from the click.
   *
   * The radius has to reach the furthest corner of the viewport from wherever the pointer was,
   * or the circle stops short and leaves a ring of the old theme behind.
   */
  function switchMode(event) {
    var current = root.dataset.mode || null;
    var target = nextMode(current);

    var animated =
      typeof document.startViewTransition === 'function' && !reducedMotion.matches;

    if (!animated) {
      writeMode(target);
      syncComments(target);
      return;
    }

    var x = event.clientX;
    var y = event.clientY;

    // Keyboard activation reports no coordinates, so fall back to the button itself.
    if (!x && !y) {
      var box = event.currentTarget.getBoundingClientRect();
      x = box.left + box.width / 2;
      y = box.top + box.height / 2;
    }

    var radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    root.style.setProperty('--theme-x', x + 'px');
    root.style.setProperty('--theme-y', y + 'px');
    root.style.setProperty('--theme-radius', radius + 'px');
    root.dataset.themeAnim = resolves(target) === 'dark' ? 'to-dark' : 'to-light';

    var transition = document.startViewTransition(function () {
      writeMode(target);
    });

    transition.finished.finally(function () {
      delete root.dataset.themeAnim;
      syncComments(target);
    });
  }

  /**
   * Tells an embedded comment thread which appearance to use.
   *
   * giscus renders in an iframe, so it cannot see the page's own theme change. Without this the
   * comments stay light on a dark page — the one part of the site that would ignore the toggle.
   */
  function syncComments(mode) {
    var frame = document.querySelector('iframe.giscus-frame');
    if (!frame) return;

    frame.contentWindow.postMessage(
      { giscus: { setConfig: { theme: resolves(mode) === 'dark' ? 'dark' : 'light' } } },
      'https://giscus.app'
    );
  }

  var toggle = document.getElementById('mode-toggle');
  if (toggle) {
    toggle.addEventListener('click', switchMode);
  }

  // ---------------------------------------------------------------- sidebar

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

  // ---------------------------------------------------------------- copy link

  // One button that works for every destination, rather than a row of per-network share links —
  // those are outbound trackers wearing an icon.
  document.querySelectorAll('[data-share]').forEach(function (button) {
    button.addEventListener('click', function () {
      var url = button.dataset.share;
      var done = function () {
        var original = button.textContent;
        button.textContent = 'Copied';
        setTimeout(function () {
          button.textContent = original;
        }, 1600);
      };

      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(done, function () {});
      }
    });
  });

  // ---------------------------------------------------------------- back to top

  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    var SHOW_AFTER = 320;

    var onScroll = function () {
      backToTop.classList.toggle('show', window.scrollY > SHOW_AFTER);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    });
  }
})();
