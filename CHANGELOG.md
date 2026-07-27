# Changelog

All notable changes to this theme are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **CI.** This was the one repository with no checks at all. It cannot prove the theme *works* —
  only the engine rendering a real site can do that, and fetching the engine here would invert the
  dependency the four-repo split exists to keep pointing one way. What it does prove: `theme.toml`
  parses and names directories that exist, every locale catalogue parses, block tags balance in all
  30 templates, and `sass/main.scss` compiles under grass — the same compiler the engine uses, so a
  green run means the engine will compile it too. Each of those would otherwise first appear as a
  broken site at deploy time.

### Security

- Actions pinned to commit SHAs rather than release tags, and the checkout no longer keeps its
  token. A tag is a movable pointer; `@v4` meant whatever that repository decided `v4` was at the
  moment the workflow ran.
- The release workflow re-hashes the archive after download and fails if it differs from the
  attested digest, so the bytes published are provably the bytes signed.

### Added

- **`twitter` and `signal` icons.** `twitter` answers to `x` as well and draws the X mark — a theme
  that only knew the new name would silently fall back to the generic link glyph for every site
  written before the rename. Signal is a speech bubble drawn in this set's own stroke style rather
  than a reproduction of the trademark, which reads correctly in a row of social icons and is
  honest about not being the official mark.

### Changed

- **The side panel is now the blog's, not every page's.** "Recently updated" and "Trending tags" are
  about the writing, so they appear on the blog, on posts, and on the archive/tag/category pages —
  and no longer on the front page, the projects list, or a standalone page. A standalone page keeps
  its table of contents and loses only the blog widgets.
- **The front page no longer lists the newest posts.** The blog is one click away in the sidebar and
  is where posts belong; repeating three of them made the front page go stale on its own and gave a
  reader two places to find the same thing. The engine still offers `recent` to any theme that wants
  it — this one declines.
- **An empty panel now collapses its column.** The panel is a block a template fills, so a page that
  fills it with nothing still emitted the element, and the grid reserved 15rem for it regardless —
  a dead gutter reads as something that failed to load. `:has()` on element children rather than
  `:empty`, which whitespace between tags defeats. Browsers without `:has()` fall back to the old
  reserved gutter rather than breaking.

### Added

- **The 404 page gained a prominent "Take me home" button**, and an optional cancellable countdown
  rendered only when the site sets `not_found_redirect_after`. The redirect runs from the page
  rather than a header or `<meta refresh>`, so the **status code stays 404** — a redirect that
  changed it would hide broken links and read as a lie about what is there. No script means no
  redirect, which is the correct failure: the button is still there.
- `.link-button`, for an action that sits inside a sentence and must read as a link. A `button`
  element rather than an anchor, because it goes nowhere — an anchor with no destination is a lie
  to a screen reader and `href="#"` is a lie to everyone.
- **`page.button`** is rendered under the content on home, standalone and post pages — the theme
  half of the engine's new front-matter field. A page asks for a call to action and the theme
  decides what a button looks like, which is the only arrangement available given that raw HTML in
  markdown is stripped.

### Changed

- `.resume-contact-button` is now **`.cta-button`**, named for what it does rather than where it
  first appeared, because a site's own pages now reach for it too.

- **Résumé layout rebuilt** against `jglovier/resume-template`, the reference it now follows: a
  centred avatar and name, a rule under the headline carrying the contact details on the same line,
  an executive summary, an optional "Get in touch" button, and entries of title / details / copy.
  Its *typography* is deliberately not ported — that theme loads Open Sans and Lora from a webfont
  host, and this one committed to the system stack, so the proportions come across and the network
  requests do not. Section rules are drawn with `--border` rather than the reference's fixed grey,
  so the page works in both modes.

### Added

- **Résumé sections**: recognition, associations, outside interests, and elsewhere-links, in
  addition to experience, education, projects and skills. Every one is optional and renders nothing
  when the site has no data for it.
- **schema.org `Person` microdata** on the résumé — `jobTitle`, `worksFor`, `alumniOf`, `award`,
  `memberOf`, `email`, `image`. It costs nothing at render time and is the difference between a
  search engine reading the page as a person with roles and reading it as a page with words on it.
- **Résumé print rules**: the page tightens on paper, the avatar and both buttons are dropped, and
  the details line turns italic — colour is the first thing a printer takes away, so the line under
  each title must stay distinguishable without depending on grey.
- Locale strings for every résumé heading, so a translation can move them.

- **M3** — covers and listing thumbnails carry `srcset`, intrinsic dimensions and the engine's inline
  placeholder, so a card holds its colour from first paint and nothing moves when the picture
  arrives. `og:image:width` and `og:image:height` are finally emitted too — they were deliberately
  left out until the cover was measured, because a scraper crops to those and a guess is worse than
  silence. A `.cover.no-bg` variant drops the frame for a logo or a transparent PNG.
- **M3** — content images open full size over the page, in a native `<dialog>` reusing the pattern
  from the contents popup. No lightbox library. The engine puts a real link in the markup, so with
  script off the image still opens, just in its own page.
- **M3** — captions: an image followed by emphasis on the next line, Chirpy's convention, which
  needs no markup of its own and no engine involvement.
- **M3** — **a table of contents below 1200px, where there was none at all.** The side panel only
  exists above `xl`, so every phone, every tablet and any laptop window that was not near-maximised
  had no contents list — and lost trending tags and recently-updated with it. There is now an inline
  trigger with the article, a sticky bar that takes over once that scrolls away and names the
  section being read, and a native `<dialog>` holding the list. The dialog is native because focus
  trapping, Escape and making the rest of the page inert all come from the element rather than from
  script. No library: the headings were already server-rendered.
- **M3** — search fits a phone. The field is collapsed behind a magnifier below `lg` and expands
  over the whole top bar, because a 7rem input open at all times left room for the input and nothing
  else — no hamburger, no page title. Cancel is the way back; Escape only ever worked for readers
  with a keyboard. Results now take over the page rather than being wedged between the top bar and
  the article, which used to push the page down on every keystroke.
- **M3** — trending tags reachable on a phone at all, as starting points inside the search results.
  The panel that normally carries them is the thing being replaced there.
- **M3** — search results show the date and tags the index has always carried and the results threw
  away, and say "Searching…" while the index is being fetched — the lazy fetch is right, but it puts
  the wait at the one moment a reader is watching for a response.
- **M3** — the post footer finished: a linked byline where the post is the site author's own, an
  "edit this page" link, a glyph on the tags row pairing it with the categories row above, and
  placeholders at both ends of the previous/next control so it keeps its shape at the ends of the
  archive. Those two are labelled Older and Newer rather than Previous and Next, since in a
  reverse-chronological list the *previous* post in time is the one *after* this in the listing.
- **M3** — post listings became scannable. Each card now carries the page's summary, the cover image
  where there is one, and a thumbtack on a pinned post — the engine has sorted on `pin` all along
  and nothing said so, which made a two-year-old post at the top read as a broken sort. Related
  posts gained the summary too, since a title alone does not distinguish five posts on one subject.
- **M3** — a numbered paginator. With two arrows alone, the only way to reach page five of a tag
  listing was to visit four other pages first. Long sequences collapse around the current page with
  the first and last always offered, and the numbers give way to the arrows on a narrow screen.
- **M3** — an optional "edit this page" link, the exact word count behind the reading-time estimate,
  and per-page `toc` and `comments` switches honoured where they were previously read and dropped.
- **M3** — a header bar on every fenced code block, naming the language, or the file where the
  author wrote one on the fence. Drawn from the attributes the engine stamps, with `::before` and no
  wrapper element, so it needs no JavaScript: a reader with scripting off still sees which language
  they are looking at.
- **M3** — a copy button on code blocks, using the same feedback the copy-link button already had
  and the same fallback without a secure context. It sits in a wrapper the script adds, which is
  what keeps it still while wide code scrolls sideways underneath — anything positioned inside the
  `<pre>` travels with the content. Its label names the language, so a screen reader hears "copy
  Rust code" rather than the same three words beside every block on the page.
- **M3** — task-list styling. The bullet goes, since the checkbox already says what it would, and
  `accent-color` puts the palette on a native control — no icon substitution, unlike Chirpy.
- **M3** — dates are reformatted to the reader's locale from the `datetime` attribute every `<time>`
  already carried, with the full date on hover, using native `Intl` and no date library. The
  server-rendered text stays as the no-JavaScript fallback, and nothing is rewritten when the
  reader's locale matches the page's.
- **M3** — the copy-link button says what happened. The clipboard API is absent without a secure
  context, which is the LAN-preview case an author hits before any reader does; there is now a
  selection-based fallback that works there, and a failure message where nothing at all was said
  before.
- **M3** — the `<head>`. Canonical link, Open Graph properties, Twitter card and JSON-LD structured
  data, on every page rather than only on posts. Until now a link shared anywhere unfurled bare: no
  title beyond the tab text, no description, no image. Posts declare `article` with published and
  modified times, their categories as sections and their tags; everything else declares `website`.
  The large card is only claimed when an image actually resolves, since claiming it without one
  downgrades the whole card rather than degrading gracefully.
- **M3** — a favicon set: an SVG monogram of a shell prompt, drawn as two strokes rather than set in
  a typeface so it needs no font to render, plus the PNG and ICO sizes for everything that does not
  read SVG icons, and an Apple touch icon. Browsers request `/favicon.ico` whether or not a page
  declares one, so having none cost a 404 on every navigation.
- **M3** — `404.html`, extending the base template like any other page, with every asset path
  absolute: a host serves the same file for `/a/` and `/a/b/c/`, and a relative path would resolve
  differently at each depth.
- **M3** — `robots.txt`, whose `Sitemap:` line is the only way a crawler finds the sitemap short of
  someone submitting it by hand.
- **M3** — `{% block head %}` as the last element of the head, so a site can add one meta tag by
  overriding a block instead of forking the theme's most-edited file.
- **M3** — `rel="prev"` and `rel="next"` on paginated listings, and a page number in the title and
  description of each, so numbered pages stop describing themselves identically.
- **M3** — per-page descriptions on the pages that had none: standalone pages, projects, the
  gallery, the archive, series, and both taxonomy levels. All of them previously advertised the
  site-wide sentence.
- **M3** — the theme renders. Page skeleton, sidebar, topbar, footer, post page, paginated index,
  category and tag listings, series pages, and the gallery, all as minijinja templates.
- **M3** — the palette: accent `#6E3272`, a deep plum, with a full light and dark token set. Dark
  mode lightens the accent to `#c491cf` rather than reusing it, because the same plum that reads as
  a confident link on near-white fails contrast on a near-black ground.
- **M3** — appearance toggle cycling system → light → dark → system, persisted to `localStorage`.
  The stored choice is applied inline in `<head>` before first paint, so choosing dark does not cost
  a white flash on every navigation.
- **M3** — syntax highlighting styles keyed to the scope classes the engine emits, so the palette
  lives here rather than as inline colour in the HTML.
- **M3** — responsive gallery grid consuming the engine's `srcset` variants, inline blur
  placeholders, and EXIF captions.
- **M3** — JetBrains Mono, self-hosted as latin-subset WOFF2 in three faces, about 65 KB in total.
  Not the Nerd Font build: that carries roughly ten thousand terminal icon glyphs and runs to
  several megabytes, none of which a browser can use.
- **M3** — motion. The appearance toggle reveals the new theme as a circle growing from the click,
  using the View Transitions API, with an instant swap where the API is missing or the reader has
  asked for reduced motion. Card hover wash, avatar scale, back-to-top, and a footnote flash on
  `:target`.
- **M3** — table of contents, rendered at build time from the headings the engine reports. The only
  script is a scroll spy marking the current entry; Chirpy ships tocbot to build the list in the
  browser, which is unnecessary when the engine already knows the headings.
- **M3** — related posts, an archive grouped by year, and site search. Search filters a static
  index the engine writes, fetched on the first keystroke rather than on page load, so visits that
  never search pay nothing for it.
- **M3** — site-supplied avatar with a monogram fallback.
- **M0** — `theme.toml` manifest (name, version, license, `min_engine_version`, directory map) and
  the directory layout that maps Chirpy's `_layouts`/`_includes`/`_sass`/`_javascript`/`_data` onto
  `templates/{layouts,partials}`, `sass/`, `assets/{js,img}`, and `locales/`.
- MIT license retaining Cotes Chung's copyright for the ported design.

- Release workflow, dormant until the first `v*` tag: packages the theme, attests SLSA build
  provenance, and publishes a GitHub release. Verify a release with
  `gh attestation verify n2r-theme.tar.gz --repo d3v-n2r/n2r-theme`.

### Fixed

- **M3** — the search results region rendered on every page. `#search-results` sets `display` at id
  specificity, which defeats the UA rule behind the `hidden` attribute, so the element was displayed
  all along — invisible only because it had nothing in it. Adding the trending-tag hints gave it
  content, and it appeared at the top of every page.
- **M3** — **static assets were cached and never revalidated.** The service worker served `/assets/`
  cache-first under a name that only changes once a year, so the first `main.css` a browser saw was
  the one it kept until January — every rebuilt stylesheet and script after that was invisible, both
  to readers after a deploy and to the author on every local reload. Assets are now served from the
  cache and refreshed behind it, so the copy on disk always reaches the browser by the next load.

### Security

- **M3** — **the theme no longer states a licence on the site's behalf.** Every post carried "This
  post is licensed under CC BY 4.0", hardcoded, on any site that installed the theme. That is not a
  harmless default: it is a false statement about someone else's legal position, printed under their
  own name on every page they publish. The terms now come from `[license]` in the site's config, and
  nothing is claimed when it is absent.
- **M3** — turning the PWA off now unregisters the service worker and clears its caches. A worker
  installed in a reader's browser outlives every deploy that follows and keeps serving its own
  cache; nothing in a later build can reach it, because turning the feature off also stops the
  engine writing `/sw.js`. The way out therefore has to ship *before* anyone needs it, and until now
  it did not exist at all. A new worker also claims live tabs mid-session, so the page reloads once
  when that happens rather than serving one build's HTML against another's assets — but only when a
  worker was already in control, so a first visit does not load twice.
- **M3** — the head interpolates content-derived strings into places that are not ordinary HTML
  text. Attribute values stay autoescaped; the JSON-LD block goes through `tojson`, which escapes
  the characters that would let a page title close the `<script>` early; and image URLs go through
  the engine's `absolute` filter, which escapes for an attribute rather than being marked safe by
  the template. The rule this batch follows: engine-built URLs may be marked safe, anything that
  came out of front matter may not.
- `main` is protected against force-pushes and deletion, and requires signed commits.

### Changed

- **M3** — a listing entry is an `<article>` with its link inside the heading, where it used to be
  an `<a>` wrapped around everything. The wrapping version announced each entry to a screen reader
  as one link labelled with the title, the date, every category and the summary run together, and
  left the page with no headings to navigate between — which is how a reader moves through a list
  like this. The anchor is stretched over the card in CSS, so a pointer still gets the whole card.
- **M3** — the comment embed is built from script rather than written as a `<script src>` tag, so
  its theme is the one the reader chose here rather than the one their operating system is set to.
  giscus reads `data-theme` once as it loads, and a static tag could only say
  `preferred_color_scheme` — which meant the appearance mismatched precisely for readers who had
  expressed a preference. The toggle also now reaches a frame that has not finished loading, by
  rewriting its URL rather than posting a message nothing is listening for, and a reader following
  the system gets their comments re-themed at sunset along with the rest of the page.
- **M3** — the search index path comes from a `data-index` attribute on the script tag instead of
  being hardcoded, so where it lives is the template's business.
- **M3** — **Bootstrap is not used.** Chirpy tree-shakes it down to a flex-utility subset, roughly
  six responsive grid rules, and three JS components; writing that slice directly is less code than
  shipping the framework, and it removes the breakpoint conflict Chirpy fights throughout its SCSS
  — Chirpy's `lg` is 850px where Bootstrap's is 992px. Chirpy's own breakpoints are kept.
- **M3** — Chirpy fills its layout from front-matter include lists (`panel_includes`,
  `tail_includes`, `script_includes`) because Liquid has no template inheritance. minijinja does, so
  those are real `{% block %}`s instead.
- **M3** — system font stacks rather than Chirpy's bundled Source Sans Pro and Lato: nothing
  downloads, so there is no layout shift and no font request leaves the reader's machine.

Parity against Chirpy was audited in full on 2026-07-25; the findings and the batches that close
them are recorded outside this repo. Still outstanding, largest first: the mobile layout, which has
no table of contents at all below 1200px; post listings, which show no summary, no preview image and
no pinned indicator, and paginate without numbered page links; code blocks, which have neither a
filename label nor a copy button; config-driven navigation and breadcrumbs; wiring the engine's
image pipeline to post covers rather than only to the gallery; and the locale catalogue, every
string being hardcoded English today.

[Unreleased]: https://github.com/d3v-n2r/n2r-theme
