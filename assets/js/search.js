// Site search.
//
// The engine writes an inverted index at build time — a table of terms, each listing the documents
// containing it and how often — so this ranks results with BM25 rather than filtering a list of
// pages by substring. No server, and it works on any static host.
//
// The index is fetched on the first keystroke rather than at page load: most visits never search,
// and there is no reason to make all of them pay for it.

(function () {
  'use strict';

  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var hits = document.getElementById('search-hits');
  var summary = document.getElementById('search-summary');

  if (!input || !results || !hits || !summary) return;

  // BM25's usual constants. k1 controls how fast repeated terms stop helping; b controls how much
  // a long document is discounted for its length.
  var K1 = 1.2;
  var B = 0.75;
  var MAX_HITS = 12;

  var index = null;
  var loading = null;

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

  function tokenize(text) {
    return text
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter(function (word) {
        return word.length >= 2;
      });
  }

  /**
   * Every indexed term matching a query term.
   *
   * A query term matches itself and anything it prefixes, so `run` finds `running` and `runtime`
   * without the engine needing a stemmer — which would need a per-language dictionary to do
   * properly, for a gain this approximates well.
   */
  function expand(postings, term) {
    var matches = [];
    for (var indexed in postings) {
      if (indexed === term || indexed.indexOf(term) === 0) {
        matches.push(indexed);
      }
    }
    return matches;
  }

  /** Ranks documents against a query, best first. */
  function rank(query) {
    var terms = tokenize(query);
    if (terms.length === 0) return [];

    var documents = index.documents;
    var total = documents.length;
    var scores = new Map();

    terms.forEach(function (term) {
      var expanded = expand(index.postings, term);

      expanded.forEach(function (indexed) {
        var postings = index.postings[indexed];

        // Rare terms say more about a document than common ones, which is what idf measures.
        var idf = Math.log(1 + (total - postings.length + 0.5) / (postings.length + 0.5));

        // A prefix match is weaker evidence than the whole word, and more so the more the term had
        // to grow to match.
        var precision = term.length / indexed.length;

        postings.forEach(function (posting) {
          var document = documents[posting[0]];
          var frequency = posting[1];
          var normalized =
            frequency /
            (frequency + K1 * (1 - B + (B * document.length) / index.average_length));

          var score = idf * normalized * (K1 + 1) * precision;
          scores.set(posting[0], (scores.get(posting[0]) || 0) + score);
        });
      });
    });

    return Array.from(scores.entries())
      .sort(function (a, b) {
        return b[1] - a[1];
      })
      .slice(0, MAX_HITS)
      .map(function (entry) {
        return documents[entry[0]];
      });
  }

  function render(found) {
    hits.replaceChildren();

    found.forEach(function (document_) {
      var link = document.createElement('a');
      link.className = 'card';
      link.href = document_.url;

      var title = document.createElement('span');
      title.className = 'card-title';
      title.textContent = document_.title;

      var body = document.createElement('span');
      body.className = 'card-summary';
      // textContent, not innerHTML: the excerpt comes from the index and is never markup.
      body.textContent = document_.excerpt;

      link.append(title, body);
      hits.append(link);
    });
  }

  function search(query) {
    if (query.length === 0) {
      results.hidden = true;
      hits.replaceChildren();
      return;
    }

    load()
      .then(function () {
        var found = rank(query);

        results.hidden = false;
        summary.textContent =
          found.length === 0
            ? 'No matches for “' + query + '”'
            : found.length + (found.length === 1 ? ' match' : ' matches');

        render(found);
      })
      .catch(function () {
        results.hidden = false;
        summary.textContent = 'Search is unavailable right now.';
        hits.replaceChildren();
      });
  }

  // Typing is bursty; waiting for a pause avoids ranking the whole index on every keystroke.
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
