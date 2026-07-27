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

  // The strings this script writes onto the page, handed over as attributes by the template — a
  // `.js` file is copied verbatim, so a literal inside one is in whatever language it was written.
  var settings = (document.currentScript && document.currentScript.dataset) || {};

  /** One of those strings, or a plain English fallback. */
  function text(name, fallback) {
    return settings[name] || fallback;
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var toggle = document.getElementById('mode-toggle');

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
    announceMode(mode);
  }

  /**
   * Says which of the three appearances the toggle is now in.
   *
   * One static label on a three-state control tells a screen-reader user nothing: they press it,
   * something changes for everyone else, and they hear the same sentence they heard before.
   */
  function announceMode(mode) {
    if (!toggle) return;
    var label = toggle.dataset['label' + (mode ? mode[0].toUpperCase() + mode.slice(1) : 'System')];
    if (label) toggle.setAttribute('aria-label', label);
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

    var theme = resolves(mode) === 'dark' ? 'dark' : 'light';

    // A frame that has not finished loading has no listener yet, so a message posted to it is
    // dropped and the comments keep the appearance they started in. Before it is ready the only
    // thing that works is rewriting the URL it is loading.
    if (frame.classList.contains('giscus-frame--loading')) {
      frame.src = frame.src.replace(/([?&]theme=)[^&]*/, '$1' + theme);
      return;
    }

    frame.contentWindow.postMessage(
      { giscus: { setConfig: { theme: theme } } },
      'https://giscus.app'
    );
  }

  if (toggle) {
    toggle.addEventListener('click', switchMode);
    // The stored choice was applied before first paint, so the label starts out of step with it.
    announceMode(root.dataset.mode || null);
  }

  // A reader following the system gets the whole page re-themed at sunset by CSS alone. The comment
  // iframe cannot see that media query change, so it has to be told.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!root.dataset.mode) syncComments(null);
  });

  // ---------------------------------------------------------------- dates

  // Every <time> already carries a machine-readable `datetime`, and until now nothing read it: the
  // rendered text was one locale's conventions for every reader. Native Intl handles this in a
  // dozen lines — no date library.
  (function localiseDates() {
    var pageLang = (root.lang || 'en').toLowerCase();
    var readerLang = (navigator.language || pageLang).toLowerCase();

    // Nothing to gain from reformatting into the conventions the page was already written in.
    if (readerLang === pageLang) return;

    var medium;
    var full;
    try {
      medium = new Intl.DateTimeFormat(navigator.language, { dateStyle: 'medium' });
      full = new Intl.DateTimeFormat(navigator.language, { dateStyle: 'full' });
    } catch (error) {
      return;
    }

    document.querySelectorAll('time[datetime]').forEach(function (element) {
      var parts = element.getAttribute('datetime').slice(0, 10).split('-');
      if (parts.length !== 3) return;

      // Built from the parts in local time rather than parsed from the string. `new Date()` reads a
      // bare `YYYY-MM-DD` as midnight UTC, which is the previous day everywhere west of it — so a
      // post published on the 25th would be shown to a New York reader as the 24th.
      var date = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      if (isNaN(date)) return;

      element.textContent = medium.format(date);
      element.title = full.format(date);
    });
  })();

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

  // ---------------------------------------------------------------- search bar

  // Which parts of the top bar are showing is top-bar state, so it lives here beside the sidebar
  // toggle rather than in the script that does the ranking.

  var searchTrigger = document.getElementById('search-trigger');
  var searchCancel = document.getElementById('search-cancel');
  var searchInput = document.getElementById('search-input');

  function setSearch(open) {
    if (open) {
      root.dataset.search = 'open';
    } else {
      delete root.dataset.search;
    }
    if (searchTrigger) {
      searchTrigger.setAttribute('aria-expanded', String(open));
    }
  }

  if (searchTrigger && searchInput) {
    searchTrigger.addEventListener('click', function () {
      setSearch(true);
      searchInput.focus();
      // An empty query with the field expanded shows the starting points rather than a blank
      // screen; search.js decides that, and an input event is how it hears about the change.
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  if (searchCancel && searchInput) {
    searchCancel.addEventListener('click', function () {
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      setSearch(false);
      searchInput.blur();
    });
  }

  if (searchInput) {
    // Escape is the keyboard's cancel button. search.js clears the query on the same key; this only
    // puts the top bar back, so neither script needs to know what the other does.
    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setSearch(false);
    });
  }

  // ---------------------------------------------------------------- copy link

  /**
   * Copies through a hidden textarea and `execCommand`.
   *
   * Deprecated, and the only thing that works without a secure context. The textarea is positioned
   * off-screen rather than hidden, because a `display: none` element cannot hold a selection.
   */
  function legacyCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.left = '-9999px';
    document.body.appendChild(field);

    var copied = false;
    try {
      field.select();
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    }

    document.body.removeChild(field);
    return copied;
  }

  // One button that works for every destination, rather than a row of per-network share links —
  // those are outbound trackers wearing an icon.
  document.querySelectorAll('[data-share]').forEach(function (button) {
    var original = button.textContent;
    var restoring = null;

    /** Says what happened, then goes back to the label it had. */
    function report(message) {
      button.textContent = message;
      clearTimeout(restoring);
      restoring = setTimeout(function () {
        button.textContent = original;
      }, 1600);
    }

    button.addEventListener('click', function () {
      // The clipboard API needs a secure context, so it is simply absent over plain http — which is
      // the LAN-preview case an author hits before any reader does. The old selection-based copy
      // still works there, and either way the button now says what happened instead of appearing
      // to do nothing.
      if (!navigator.clipboard) {
        report(
        legacyCopy(button.dataset.share)
          ? text('copied', 'Copied')
          : text('copyFailed', 'Copy failed')
      );
        return;
      }

      navigator.clipboard.writeText(button.dataset.share).then(
        function () {
          report(text('copied', 'Copied'));
        },
        function () {
          report(text('copyFailed', 'Copy failed'));
        }
      );
    });
  });

  // ---------------------------------------------------------------- copy code

  // The two glyphs live here rather than in `icons.html` because there is no template to put them
  // in: code blocks come out of markdown, so the button that copies them has to be created at
  // runtime over markup the engine generated.
  var CLIPBOARD_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="9" y="9" width="12" height="12" rx="2" />' +
    '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>';

  var CHECK_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="m4 12.5 5.5 5.5L20 7" /></svg>';

  document.querySelectorAll('pre > code').forEach(function (code) {
    var pre = code.parentNode;

    // The wrapper is what keeps the button still while the code scrolls sideways underneath it.
    // Anything positioned inside the <pre> is inside its scroll container and travels with the
    // content.
    var wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.innerHTML = CLIPBOARD_ICON;

    // The label names the language where there is one, so a screen reader hears "copy Rust code"
    // rather than the same three words beside every block on the page.
    var what = code.dataset.file || code.dataset.lang;
    button.setAttribute('aria-label', what ? 'Copy ' + what + ' code' : 'Copy code');

    var restoring = null;
    function settle(succeeded) {
      button.innerHTML = succeeded ? CHECK_ICON : CLIPBOARD_ICON;
      if (succeeded) {
        button.dataset.copied = '';
      } else {
        delete button.dataset.copied;
      }

      clearTimeout(restoring);
      restoring = setTimeout(function () {
        button.innerHTML = CLIPBOARD_ICON;
        delete button.dataset.copied;
      }, 2000);
    }

    button.addEventListener('click', function () {
      // `innerText` rather than `textContent`: the highlighter wraps every token in a span, and
      // textContent would run them together without the line breaks that make the code code.
      var text = code.innerText;

      if (!navigator.clipboard) {
        settle(legacyCopy(text));
        return;
      }

      navigator.clipboard.writeText(text).then(
        function () {
          settle(true);
        },
        function () {
          settle(false);
        }
      );
    });

    wrapper.appendChild(button);
  });

  // ---------------------------------------------------------------- image popup

  // The engine wraps each content image in an anchor to its full-size copy, so this degrades to an
  // ordinary link when script is off — the image still opens, just in a new page rather than over
  // this one. That is why the anchor is in the markup rather than being added here.
  var imagePopup = document.getElementById('image-popup');

  if (imagePopup && typeof imagePopup.showModal === 'function') {
    var popupImage = imagePopup.querySelector('img');

    document.querySelectorAll('a.img-popup').forEach(function (link) {
      link.addEventListener('click', function (event) {
        // Modified clicks are the reader asking for a new tab or a download, which is the link's
        // ordinary behaviour and not ours to intercept.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

        event.preventDefault();
        popupImage.src = link.getAttribute('href');
        // The image inside the link already describes the picture; naming it twice would have a
        // screen reader read the same sentence on open.
        popupImage.alt = link.querySelector('img')
          ? link.querySelector('img').getAttribute('alt') || ''
          : '';
        imagePopup.showModal();
        root.dataset.popupOpen = '';
      });
    });

    imagePopup.addEventListener('close', function () {
      delete root.dataset.popupOpen;
      // Dropped so a large image is not held in memory for the rest of the visit.
      popupImage.removeAttribute('src');
    });

    // Anywhere outside the picture closes it, which is what a full-screen overlay implies. The
    // image is the only child, so a click that lands on the dialog itself is a click on the ground
    // around it.
    imagePopup.addEventListener('click', function (event) {
      if (event.target !== popupImage) imagePopup.close();
    });
  }

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

  // ------------------------------------------------------------------ video embeds
  //
  // The page ships a button, not a player. Nothing third-party is requested until a reader presses
  // it — not the iframe and not a thumbnail, because YouTube's thumbnails come from i.ytimg.com and
  // identify the reader exactly as well as the player does.
  //
  // The player URL is on the element rather than built here, so the engine — which validated the
  // identifier — decides what gets loaded, and this only decides when.
  document.querySelectorAll('.embed-video').forEach(function (embed) {
    var button = embed.querySelector('.embed-play');
    var player = embed.getAttribute('data-player');
    if (!button || !player) {
      return;
    }

    button.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.src = player + (player.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1';
      frame.title = 'Embedded video';
      frame.loading = 'lazy';
      frame.allow = 'accelerometer; encrypted-media; picture-in-picture; fullscreen';
      // The embed is someone else's document: deny it the ambient authority of this origin.
      frame.referrerPolicy = 'no-referrer';
      frame.setAttribute('allowfullscreen', '');
      embed.replaceChildren(frame);
      embed.classList.add('playing');
    });
  });
})();
