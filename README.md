# n2r-theme

The default theme for [n2r-engine](https://github.com/d3v-n2r/n2r-engine): minijinja templates,
SCSS, and a little vanilla JavaScript. It targets full feature parity with the
[Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) Jekyll theme — sidebar layout, dark and
light modes, table of contents, search, categories and tags, comments, diagrams, math, and PWA
support — plus **portfolio** and **gallery** sections that Chirpy does not have.

> **Status: pre-alpha (ported at M3).** The manifest and directory layout are in place; the
> templates and styles are not yet.

## Layout

```
theme.toml              manifest: name, version, min_engine_version, directory map
templates/layouts/      page-level templates
templates/partials/     reusable fragments
sass/                   styles, compiled by the engine at build time
assets/js/              browser behaviour
assets/img/             theme images
locales/                UI strings, one file per language
```

This maps Chirpy's `_layouts`, `_includes`, `_sass`, `_javascript`, and `_data/locales` onto the
engine's conventions.

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
