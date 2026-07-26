// Table-of-contents scroll spy.
//
// The list itself is rendered at build time from headings the engine already knows, so unlike
// Chirpy — which ships tocbot and builds the list in the browser — the only thing left for script
// is marking which entry you are currently reading.
//
// The observer's rootMargin creates a band near the top of the viewport: a heading counts as
// current once it passes 80px from the top, and stops counting once the viewport has scrolled 70%
// past it. Without that, every heading on screen would match at once.

(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) return;

  // Both copies of the list are marked, not just the panel's: the popup is the only one a reader
  // below 1200px ever sees, and an unmarked list there would lose the "you are here" the panel has.
  var lists = Array.prototype.slice.call(document.querySelectorAll('nav.toc'));
  if (lists.length === 0) return;

  var links = [];
  lists.forEach(function (list) {
    links = links.concat(Array.prototype.slice.call(list.querySelectorAll('a[href^="#"]')));
  });
  if (links.length === 0) return;

  // One heading id can have a link in each list, so this maps to all of them.
  var byId = {};
  var headings = [];

  links.forEach(function (link) {
    var id = decodeURIComponent(link.getAttribute('href').slice(1));
    var heading = document.getElementById(id);
    if (!heading) return;

    if (!byId[id]) {
      byId[id] = [];
      headings.push(heading);
    }
    byId[id].push(link);
  });

  if (headings.length === 0) return;

  var barLabel = document.getElementById('toc-bar-label');
  var visible = new Set();

  function mark() {
    if (visible.size === 0) return;

    // Several headings can be in the band at once; the highest on screen is the one being read.
    var current = Array.from(visible).sort(function (a, b) {
      return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
    })[0];

    links.forEach(function (link) {
      link.removeAttribute('data-active');
    });

    var active = byId[current.id];
    if (!active) return;

    active.forEach(function (link) {
      link.setAttribute('data-active', 'true');
    });

    // The sticky bar names the section rather than repeating "On this page", which is the whole
    // reason for it taking up a line: it answers where you are, not just what exists.
    if (barLabel) barLabel.textContent = active[0].textContent;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visible.add(entry.target);
        } else {
          visible.delete(entry.target);
        }
      });
      mark();
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  );

  headings.forEach(function (heading) {
    observer.observe(heading);
  });

  // ---------------------------------------------------------------- the popup

  var popup = document.getElementById('toc-popup');
  var bar = document.getElementById('toc-bar');
  var solo = document.getElementById('toc-solo-trigger');
  if (!popup || typeof popup.showModal !== 'function') return;

  var root = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var CLOSE_MS = 180;

  function open() {
    popup.showModal();
    // A modal dialog makes the page inert but does not stop it scrolling underneath, which on a
    // phone means the article slides around behind the sheet as you drag over it.
    root.dataset.tocOpen = '';
  }

  function close() {
    if (reducedMotion.matches) {
      popup.close();
      return;
    }
    // Timed rather than waiting for `animationend`: if the animation is ever removed, an event that
    // never fires would leave the dialog open forever.
    popup.dataset.closing = '';
    setTimeout(function () {
      delete popup.dataset.closing;
      popup.close();
    }, CLOSE_MS);
  }

  popup.addEventListener('close', function () {
    delete root.dataset.tocOpen;
  });

  // Escape fires `cancel`, which would close without the animation; route it through the same path.
  popup.addEventListener('cancel', function (event) {
    if (reducedMotion.matches) return;
    event.preventDefault();
    close();
  });

  // A native dialog's backdrop is part of the dialog element, so a click that lands on the element
  // itself rather than on anything inside it is a click on the backdrop.
  popup.addEventListener('click', function (event) {
    if (event.target === popup) close();
  });

  // Following an entry is the point of the list; leaving the sheet open over the destination is not.
  popup.addEventListener('click', function (event) {
    if (event.target.closest('a[href^="#"]')) close();
  });

  document.querySelectorAll('.toc-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', open);
  });

  // The sticky bar appears only once the inline trigger has scrolled away, so it costs a phone no
  // vertical space while the reader is still at the top of the article — where the inline one is.
  if (bar && solo) {
    new IntersectionObserver(
      function (entries) {
        bar.hidden = entries[0].isIntersecting;
      },
      { threshold: 0 }
    ).observe(solo);
  }
})();
