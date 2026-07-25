// Site search.
//
// The engine writes a static JSON index at build time, so this needs no server and works on any
// host. The index is fetched on first keystroke rather than on page load — most visits never search,
// and there is no reason to make every one of them pay for it.
//
// Matching is a plain substring scan. For a personal site that is both sufficient and predictable;
// a ranked index would be more machinery than the corpus justifies.

(function () {
  'use strict';

  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var hits = document.getElementById('search-hits');
  var summary = document.getElementById('search-summary');

  if (!input || !results || !hits || !summary) return;

  var index = null;
  var loading = null;
  var MAX_HITS = 12;

  function load() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;

    loading = fetch('/search-index.json')
      .then(function (response) {
        if (!response.ok) throw new Error('search index unavailable');
        return response.json();
      })
      .then(function (data) {
        index = data;
        return index;
      });

    return loading;
  }

  /** Every term must appear somewhere in the entry, so extra words narrow rather than widen. */
  function matches(entry, terms) {
    var haystack = (
      entry.title +
      ' ' +
      entry.text +
      ' ' +
      entry.tags.join(' ') +
      ' ' +
      entry.categories.join(' ')
    ).toLowerCase();

    return terms.every(function (term) {
      return haystack.indexOf(term) !== -1;
    });
  }

  /** A window of body text around the first match, so a hit shows why it matched. */
  function snippet(text, term) {
    var at = text.toLowerCase().indexOf(term);
    if (at === -1) return text.slice(0, 140);

    var start = Math.max(0, at - 50);
    var end = Math.min(text.length, at + 110);
    return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
  }

  function render(entries, terms) {
    hits.replaceChildren();

    entries.forEach(function (entry) {
      var link = document.createElement('a');
      link.className = 'card';
      link.href = entry.url;

      var title = document.createElement('span');
      title.className = 'card-title';
      title.textContent = entry.title;

      var body = document.createElement('span');
      body.className = 'card-summary';
      // textContent, not innerHTML: the snippet comes from the index and is never markup.
      body.textContent = snippet(entry.text, terms[0]);

      link.append(title, body);
      hits.append(link);
    });
  }

  function search(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);

    if (terms.length === 0) {
      results.hidden = true;
      hits.replaceChildren();
      return;
    }

    load()
      .then(function (entries) {
        var found = entries.filter(function (entry) {
          return matches(entry, terms);
        });

        results.hidden = false;
        summary.textContent =
          found.length === 0
            ? 'No matches for “' + query + '”'
            : found.length + (found.length === 1 ? ' match' : ' matches');

        render(found.slice(0, MAX_HITS), terms);
      })
      .catch(function () {
        results.hidden = false;
        summary.textContent = 'Search is unavailable right now.';
        hits.replaceChildren();
      });
  }

  // Typing is bursty; waiting for a pause avoids filtering the whole index on every keystroke.
  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    var query = input.value.trim();
    timer = setTimeout(function () {
      search(query);
    }, 120);
  });

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      input.value = '';
      search('');
      input.blur();
    }
  });
})();
