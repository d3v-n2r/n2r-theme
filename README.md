# n2r-theme

The default theme for [n2r-engine](https://github.com/d3v-n2r/n2r-engine): minijinja templates,
SCSS, and a little vanilla JavaScript. It targets full feature parity with the
[Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) Jekyll theme — sidebar layout, dark and
light modes, table of contents, search, categories and tags, comments, diagrams, math, and PWA
support — plus **portfolio** and **gallery** sections that Chirpy does not have.

> **Status: pre-alpha.** The theme renders a complete blog — posts, index, categories, tags,
> series, gallery, feed — with light and dark modes. Table of contents, search, comments, related
> posts, archives, PWA, mermaid, and maths are still to come.

The accent is `#6E3272`, a deep plum. Dark mode lightens it to `#c491cf` rather than reusing it,
since the same plum that reads as a confident link on near-white fails contrast on near-black.

**No Bootstrap, no webfonts, no JavaScript framework.** Chirpy tree-shakes Bootstrap down to a
flex-utility subset, about six responsive grid rules, and three JS components; writing that slice
directly is less code than shipping the framework, and it drops Popper too. Fonts are system stacks,
so nothing downloads and nothing shifts on load. The only script is a few dozen lines for the
appearance toggle and the mobile sidebar.

## Layout

```
theme.toml              manifest: name, version, min_engine_version, directory map
templates/              base.html plus one template per page kind
templates/partials/     sidebar, topbar, footer, shared macros
sass/                   styles, compiled by the engine at build time
assets/js/theme.js      appearance toggle and mobile sidebar
locales/                UI strings, one file per language
```

This maps Chirpy's `_layouts`, `_includes`, `_sass`, `_javascript`, and `_data/locales` onto the
engine's conventions. Chirpy composes its layout from front-matter include lists because Liquid has
no template inheritance; minijinja does, so `base.html` exposes `content`, `panel`, and `tail`
blocks and child templates override them directly.

## Usage

Place the theme at `themes/n2r-theme/` inside a site and name it in the site's `config.toml`.
Any template a site puts in its own `templates/` directory shadows the theme's copy of that
template, so customizing one page never means forking the theme.

## Credit and license

The design and feature surface are ported from Chirpy by Cotes Chung, MIT licensed. This is a port
to a different engine, not a fork: the templates are rewritten from Liquid to minijinja and the
styles are adapted rather than copied wholesale.

MIT — see [LICENSE](LICENSE), which retains the original copyright. Release notes are in
[CHANGELOG.md](CHANGELOG.md).
