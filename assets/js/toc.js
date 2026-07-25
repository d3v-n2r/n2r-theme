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

  var toc = document.getElementById('toc');
  if (!toc || !('IntersectionObserver' in window)) return;

  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  if (links.length === 0) return;

  var byId = {};
  var headings = [];

  links.forEach(function (link) {
    var id = decodeURIComponent(link.getAttribute('href').slice(1));
    var heading = document.getElementById(id);
    if (heading) {
      byId[id] = link;
      headings.push(heading);
    }
  });

  if (headings.length === 0) return;

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
    if (active) {
      active.setAttribute('data-active', 'true');
    }
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
})();
