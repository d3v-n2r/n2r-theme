# Changelog

All notable changes to this theme are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **M0** — `theme.toml` manifest (name, version, license, `min_engine_version`, directory map) and
  the directory layout that maps Chirpy's `_layouts`/`_includes`/`_sass`/`_javascript`/`_data` onto
  `templates/{layouts,partials}`, `sass/`, `assets/{js,img}`, and `locales/`.
- MIT license retaining Cotes Chung's copyright for the ported design.

- Release workflow, dormant until the first `v*` tag: packages the theme, attests SLSA build
  provenance, and publishes a GitHub release. Verify a release with
  `gh attestation verify n2r-theme.tar.gz --repo d3v-n2r/n2r-theme`.

### Security

- `main` is protected against force-pushes and deletion, and requires signed commits.

The templates, styles, and scripts themselves are ported at M3.

[Unreleased]: https://github.com/d3v-n2r/n2r-theme
