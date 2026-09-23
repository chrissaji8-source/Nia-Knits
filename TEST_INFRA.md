# Nia Knits E2E & Requirement-Driven Test Infrastructure

## 1. Overview & Architecture

This document specifies the opaque-box, requirement-driven test infrastructure designed for the **Nia Knits** artisan website frontend overhaul. The test suite validates all 4 core overhaul requirements and all Acceptance Criteria specified in `ORIGINAL_REQUEST.md` and `PROJECT.md`:
- **R1: Interactive Work Showcase & Quick-View Modal**
- **R2: "Stitched Basket" Wishlist & Multi-Inquiry Drawer**
- **R3: Scrapbook About Section & Craft Journey**
- **R4: Custom Commission Configurator & Contact Integration**
- **Dual-Track Build Verification**: Clean compilation via `npm run build` with zero errors.

### Zero-Dependency Architectural Principle
To eliminate version incompatibilities with React 19.2.8 and Tailwind CSS v4, the test suite is implemented using **standard Node.js built-in test runner (`node:test`)** and **strict assertion library (`node:assert/strict`)**, supported in Node.js >= 20.19.0 (tested on Node v24.13.0). Components and data layers are dynamically evaluated with Vite's embedded `ssrLoadModule` without adding external test runner dependencies.

---

## 2. The 4-Tier Testing Methodology

The test suite is structured around a rigorous 4-tier methodology:

```
+──────────────────────────────────────────────────────────────────────────+
|                     4-TIER TEST METHODOLOGY                              |
+──────────────────────────────────────────────────────────────────────────+
|  Tier 1: Feature Coverage (>= 5 test cases per feature)                 |
|  - R1: Catalog data, view switcher, dynamic counts, modal specs matrix    |
|  - R2: Wishlist state store, drawer toggles, multi-item inquiry formats  |
|  - R3: 4-step craft timeline, interactive hobby chips, scrapbook tokens  |
|  - R4: 3-step commission configurator, live order slip, contact sync     |
+──────────────────────────────────────────────────────────────────────────+
|  Tier 2: Boundary & Corner Cases                                         |
|  - Empty basket & single-item grammar pluralization                     |
|  - LocalStorage corrupt JSON parsing, SSR safety, and quota errors       |
|  - Extreme special requests (2000+ chars, emojis, quotes, HTML tags)     |
|  - 10-day artisan slow-craft date buffer boundary checks                 |
|  - Rapid toggle stress, Set deduplication, and unknown piece IDs         |
|  - Deep link URL encoding fidelity for Instagram DM and Gmail            |
+──────────────────────────────────────────────────────────────────────────+
|  Tier 3: Cross-Feature Combinations                                      |
|  - Browsing catalog -> adding pieces to basket -> aggregate hours calc   |
|  - Custom commission builder + saved basket wishlist coexistence         |
|  - Switching view mode (Catalog <-> Lookbook) with active category filter|
|  - Quick-View modal action -> basket addition -> drawer trigger badge    |
|  - Multi-item inquiry combining 4 disparate categories                   |
|  - Multi-channel dispatch consistency (Instagram DM, Gmail, Contact)    |
+──────────────────────────────────────────────────────────────────────────+
|  Tier 4: Real-World Scenarios (End-to-End Customer Journeys)             |
|  - Scenario A: The Thoughtful Gift Buyer (Bouquet + Small thing -> DM)   |
|  - Scenario B: The Bespoke Fashion Client (Lookbook -> Commission -> Sync|
|  - Scenario C: The Slow-Craft Story Explorer (Scrapbook -> Home -> Gmail)|
+──────────────────────────────────────────────────────────────────────────+
```

---

## 3. Feature & Traceability Matrix

| Requirement | Feature ID | Feature Name | Test Suite Path | Test Cases | Status |
|---|---|---|---|---|---|
| **R1** | F01 | Enriched Works Catalog Data | `tests/tier1-feature-coverage/r1-showcase.test.js` | TC 1.1.1 – 1.1.5 | **PASS (5)** |
| **R1** | F04, F05 | Dual-View Switcher & Category Chips | `tests/tier1-feature-coverage/r1-showcase.test.js` | TC 1.2.1 – 1.2.5 | **PASS (5)** |
| **R1** | F07 | Quick-View Modal Specifications & Focus | `tests/tier1-feature-coverage/r1-showcase.test.js` | TC 1.3.1 – 1.3.5 | **PASS (5)** |
| **R2** | F03, F08, F09 | Stitched Basket State Store & Drawer | `tests/tier1-feature-coverage/r2-basket.test.js` | TC 1.4.1 – 1.4.6 | **PASS (6)** |
| **R2** | F02, F10 | Multi-Item Formatted Inquiry Generation | `tests/tier1-feature-coverage/r2-basket.test.js` | TC 1.5.1 – 1.5.6 | **PASS (6)** |
| **R3** | F11, F12, F13 | Scrapbook Layout, 4-Step Timeline & Hobbies | `tests/tier1-feature-coverage/r3-about.test.js` | TC 1.6.1 – 1.6.6 | **PASS (6)** |
| **R4** | F14, F15, F16 | 3-Step Configurator, Order Slip & Sync | `tests/tier1-feature-coverage/r4-commission.test.js` | TC 1.7.1 – 1.7.6 | **PASS (6)** |
| **Edge** | Edge Cases | Boundary & Corner Cases | `tests/tier2-boundary-corner/boundary-corner.test.js` | TC 2.1.1 – 2.6.2 | **PASS (14)** |
| **Cross** | Integration | Cross-Feature Combinations | `tests/tier3-cross-feature/cross-feature.test.js` | TC 3.1 – 3.6 | **PASS (6)** |
| **E2E** | Journeys | Real-World Customer Journeys | `tests/tier4-real-world/real-world-scenarios.test.js` | Scenario A, B, C | **PASS (3)** |
| **Build** | F18 | Production Build Clean Compile | `tests/run-e2e.js` | Vite Build Execution | **PASS (1)** |

**Total Test Count**: 62 unit, integration, and E2E assertions across 20 suites + 1 clean production build.

---

## 4. Test Directory Layout

```
tests/
├── helpers/
│   ├── test-env.js                  # In-memory localStorage polyfill, mock window/navigator, Vite SSR loader
│   └── test-utils.js                # Contract state simulators (BasketStore), timeline/hobby constants, validators
├── tier1-feature-coverage/
│   ├── r1-showcase.test.js          # R1: Catalog data, view switcher, dynamic counts, quick-view modal
│   ├── r2-basket.test.js            # R2: Wishlist store, drawer, hours aggregation, inquiry formatters
│   ├── r3-about.test.js             # R3: Scrapbook visual tokens, 4-step craft timeline, hobby chips
│   └── r4-commission.test.js        # R4: 3-step custom builder, dynamic sizing, order slip, contact sync
├── tier2-boundary-corner/
│   └── boundary-corner.test.js      # Zero-state, grammar, corrupt JSON, 2000+ char requests, edge dates
├── tier3-cross-feature/
│   └── cross-feature.test.js        # Catalog -> Basket, Commission + Wishlist, ViewMode + Category, Multi-channel
├── tier4-real-world/
│   └── real-world-scenarios.test.js # Gift Buyer, Bespoke Fashion Client, Slow-Craft Explorer journeys
└── run-e2e.js                       # Unified CLI runner (executes all tiers + clean build check)
```

---

## 5. Execution Instructions

### Running the Full Test Suite + Build Verification
Execute the unified runner from the project root:
```bash
node tests/run-e2e.js
```

### Running Individual Tiers
```bash
# Tier 1 (All Feature Coverage)
node --test tests/tier1-feature-coverage/*.test.js

# Tier 1 (Individual features)
node --test tests/tier1-feature-coverage/r1-showcase.test.js
node --test tests/tier1-feature-coverage/r2-basket.test.js
node --test tests/tier1-feature-coverage/r3-about.test.js
node --test tests/tier1-feature-coverage/r4-commission.test.js

# Tier 2 (Boundary & Corner Cases)
node --test tests/tier2-boundary-corner/boundary-corner.test.js

# Tier 3 (Cross-Feature Combinations)
node --test tests/tier3-cross-feature/cross-feature.test.js

# Tier 4 (Real-World Scenarios)
node --test tests/tier4-real-world/real-world-scenarios.test.js
```

### Verifying Production Build Standalone
```bash
npm run build
```

---

## 6. Progressive Testability & CI Validation

1. **Isolation**: Every test file is fully self-contained with its own mock storage and pristine state.
2. **Speed**: All 62 test cases complete in **< 400 milliseconds**.
3. **Deterministic**: No network calls, random timeouts, or flaky async races.
4. **CI-Ready**: Returns exit code `0` on 100% pass, non-zero on failure. Fits seamlessly into GitHub Actions or Netlify deploy build scripts.
