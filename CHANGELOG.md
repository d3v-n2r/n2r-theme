# Changelog

All notable changes to this theme are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
- **M0** — `theme.toml` manifest (name, version, license, `min_engine_version`, directory map) and
  the directory layout that maps Chirpy's `_layouts`/`_includes`/`_sass`/`_javascript`/`_data` onto
  `templates/{layouts,partials}`, `sass/`, `assets/{js,img}`, and `locales/`.
- MIT license retaining Cotes Chung's copyright for the ported design.

- Release workflow, dormant until the first `v*` tag: packages the theme, attests SLSA build
  provenance, and publishes a GitHub release. Verify a release with
  `gh attestation verify n2r-theme.tar.gz --repo d3v-n2r/n2r-theme`.

### Security

- `main` is protected against force-pushes and deletion, and requires signed commits.

### Changed

- **M3** — **Bootstrap is not used.** Chirpy tree-shakes it down to a flex-utility subset, roughly
  six responsive grid rules, and three JS components; writing that slice directly is less code than
  shipping the framework, and it removes the breakpoint conflict Chirpy fights throughout its SCSS
  — Chirpy's `lg` is 850px where Bootstrap's is 992px. Chirpy's own breakpoints are kept.
- **M3** — Chirpy fills its layout from front-matter include lists (`panel_includes`,
  `tail_includes`, `script_includes`) because Liquid has no template inheritance. minijinja does, so
  those are real `{% block %}`s instead.
- **M3** — system font stacks rather than Chirpy's bundled Source Sans Pro and Lato: nothing
  downloads, so there is no layout shift and no font request leaves the reader's machine.

Still to port for full Chirpy parity: table of contents, search, comment embeds, related posts, the
archives page, PWA, mermaid and maths, and Chirpy's `refactor-content` HTML post-processing (which
belongs in the engine, not a template). The portfolio section and social cards are also outstanding.

[Unreleased]: https://github.com/d3v-n2r/n2r-theme
