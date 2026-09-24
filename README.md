<div align="center">

# Adam Nordling — Portfolio

[![CI/CD Pipeline](https://github.com/adamnordling/adamnordling.github.io/actions/workflows/pipeline.yml/badge.svg)](https://github.com/adamnordling/adamnordling.github.io/actions/workflows/pipeline.yml)
[![Lighthouse 100/100](https://img.shields.io/badge/Lighthouse-100%2F100-success?style=flat&logo=lighthouse)](https://adamnordling.se/)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-StrictTypeChecked-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
  <a href="https://adamnordling.se/"><b>Explore Live Portfolio ↗</b></a>
</p>

Production-grade, zero-runtime personal portfolio and application hub. Engineered for high performance, strict type
safety, zero layout shifts, and accessibility compliance. Built to showcase academic research in Software Technology and
production-level fullstack systems.


</div>

---

## Repository Structure

```text
.
|-- .github/workflows/   # CI/CD automation pipelines
|-- public/              # Static assets, manifests, and favicons
|-- src/
|   |-- styles/          # Layered component and architecture styles
|   `-- ts/
|       |-- core/        # Theme, internationalization, clock, and keyboard engines
|       |-- data/        # Bilingual course and skill schema dictionaries
|       |-- features/    # Canvas background, modals, filters, and gestures
|       |-- services/    # Cached GitHub REST API integrations
|       `-- utils/       # DOM queries and sanitization helpers
|-- index.html           # Optimized single-page document entry
|-- package.json         # Development dependencies and validation scripts
|-- tsconfig.json        # Strict TypeScript compiler configuration
`-- vite.config.ts       # Bundler configuration and asset inlining plugins
```

## Architectural Principles

- Zero Client Framework Overhead: Built entirely with vanilla TypeScript compiled directly to modern ECMAScript modules,
  eliminating virtual DOM diffing, runtime framework weights, and hydration delays.
- Audited Performance Standards: Structured to enforce perfect 100/100 metrics across Performance, Accessibility, Best
  Practices, and SEO under Lighthouse CI.
- Modern CSS Cascade Architecture: Employs CSS Cascade Layers (@layer reset, base, components, utilities) to enforce
  deterministic specificity and modularity without CSS preprocessors.
- Hardened Client-Side Privacy: Implements zero third-party telemetry, tracking scripts, or analytics cookies. Contact
  links leverage memory-stored obfuscated byte arrays to prevent crawler harvesting.
- Edge Delivery: Distributed via Cloudflare Pages global CDN with Level 2 Content Security Policy headers, Brotli
  compression, and immutable caching for static assets.

---

## Tech Stack

- Language: TypeScript (Strict mode enabled, noImplicitAny, strictNullChecks)
- Build Tool: Vite
- Stylesheet: Native CSS3 with CSS Cascade Layers and Custom Properties
- Runtime/Target: ECMAScript 2022 (ESNext)
- Code Quality: ESLint (typescript-eslint strict type checked), Prettier
- Continuous Integration: GitHub Actions with automated linting, typechecking, bundling, and Lighthouse CI assertions

---

## Development and Verification

### Prerequisites

- Node.js (Version 20 LTS or higher recommended)
- npm (Version 10 or higher)

### Setup

```bash
# Clone the repository
git clone https://github.com/adamnordling/portfolio.git

# Navigate into project directory
cd portfolio

# Install pinned development dependencies
npm install
```

## Local Development

```bash
# Start local development server with hot module replacement
npm run dev

# Preview the production build locally
npm run preview
```

## Quality Assurance and Build Verification

```bash
# Run type checking, linting, and formatting verification
npm run validate

# Automatically fix linting and formatting issues
npm run fix

# Compile production bundle to /dist
npm run build
```

language - more languages?

Projects > hover the project to see a 10 sec video?

copy as markdown or view (dropout window): https://i.imgur.com/DvnI8Re.png