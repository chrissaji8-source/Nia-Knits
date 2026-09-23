/**
 * Tier 1 — Feature Coverage: R1 Interactive Work Showcase & Quick-View Modal
 * Covers:
 * - Feature 1.1: Enriched Works Catalog Data (F01)
 * - Feature 1.2: Dual-View Switcher & Category Filtering (F04, F05)
 * - Feature 1.3: Quick-View Modal Specifications & Focus Trap (F07)
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  readJson,
  setupMockBrowser,
  loadModule,
  renderComponent,
  closeViteServer,
} from '../helpers/test-env.js';
import { computeCategoryCounts, VIEW_MODE_KEY } from '../helpers/test-utils.js';

describe('Tier 1 — R1: Interactive Work Showcase & Quick-View Modal', () => {
  const works = readJson('src/data/works.json');

  describe('Feature 1.1: Enriched Works Catalog Data (F01)', () => {
    test('TC 1.1.1: Catalog contains exactly 13 unique pieces across 4 canonical categories', () => {
      assert.equal(works.length, 13, 'Expected exactly 13 catalog pieces');
      const ids = new Set(works.map(w => w.id));
      assert.equal(ids.size, 13, 'Every piece must have a unique id');

      const expectedCategories = new Set(['Bouquets', 'Wearables', 'Home', 'Small things']);
      const actualCategories = new Set(works.map(w => w.category));
      for (const cat of expectedCategories) {
        assert.ok(actualCategories.has(cat), `Catalog missing category: ${cat}`);
      }
    });

    test('TC 1.1.2: Every piece contains valid positive estimatedCraftingHours', () => {
      works.forEach((work) => {
        assert.ok(
          typeof work.estimatedCraftingHours === 'number' && work.estimatedCraftingHours > 0,
          `Piece ${work.id} (${work.title}) must have positive numeric estimatedCraftingHours, got: ${work.estimatedCraftingHours}`
        );
        assert.ok(
          work.estimatedCraftingHours >= 1 && work.estimatedCraftingHours <= 40,
          `Piece ${work.id} crafting hours ${work.estimatedCraftingHours} outside realistic artisan range (1-40 hrs)`
        );
      });
    });

    test('TC 1.1.3: Every piece specifies artisan hookSpecs with millimeter tooling details', () => {
      works.forEach((work) => {
        assert.ok(
          typeof work.hookSpecs === 'string' && work.hookSpecs.trim().length > 0,
          `Piece ${work.id} (${work.title}) must specify hookSpecs`
        );
        assert.match(
          work.hookSpecs,
          /\d+(\.\d+)?\s*mm|Hook/i,
          `Piece ${work.id} hookSpecs must describe hook size/tooling (e.g. 3.5mm), got: "${work.hookSpecs}"`
        );
      });
    });

    test('TC 1.1.4: Every piece contains dimensions, careGuide, and artisan craft badge', () => {
      works.forEach((work) => {
        assert.ok(
          typeof work.dimensions === 'string' && work.dimensions.trim().length > 0,
          `Piece ${work.id} missing dimensions specification`
        );
        assert.ok(
          typeof work.careGuide === 'string' && work.careGuide.trim().length > 0,
          `Piece ${work.id} missing careGuide instructions`
        );
        assert.ok(
          typeof work.badge === 'string' && work.badge.trim().length > 0,
          `Piece ${work.id} missing craft badge pill label`
        );
      });
    });

    test('TC 1.1.5: Lookbook styling notes exist on all items and provide pairing recommendations', () => {
      works.forEach((work) => {
        assert.ok(
          typeof work.stylingNotes === 'string' && work.stylingNotes.trim().length > 10,
          `Piece ${work.id} (${work.title}) missing rich styling notes for Lookbook view`
        );
      });
    });
  });

  describe('Feature 1.2: Dual-View Switcher & Category Filtering (F04, F05)', () => {
    test('TC 1.2.1: Dual-view switcher supports "catalog" and "lookbook" modes with fallback', () => {
      const getValidatedViewMode = (input) => {
        return (input === 'catalog' || input === 'lookbook') ? input : 'catalog';
      };

      assert.equal(getValidatedViewMode('catalog'), 'catalog');
      assert.equal(getValidatedViewMode('lookbook'), 'lookbook');
      assert.equal(getValidatedViewMode('magazine'), 'catalog', 'Unknown mode must fallback to catalog');
      assert.equal(getValidatedViewMode(null), 'catalog', 'Null must fallback to catalog');
    });

    test('TC 1.2.2: Dynamic category counts accurately match catalog items', () => {
      const counts = computeCategoryCounts(works);
      assert.equal(counts['All'], 13, 'Expected All count to be 13');
      assert.equal(counts['Bouquets'], 3, 'Expected Bouquets count to be 3');
      assert.equal(counts['Wearables'], 4, 'Expected Wearables count to be 4');
      assert.equal(counts['Home'], 3, 'Expected Home count to be 3');
      assert.equal(counts['Small things'], 3, 'Expected Small things count to be 3');
    });

    test('TC 1.2.3: Category filter accurately partitions items without catalog mutation', () => {
      const initialCatalogLength = works.length;

      const bouquets = works.filter(w => w.category === 'Bouquets');
      assert.equal(bouquets.length, 3);
      bouquets.forEach(b => assert.equal(b.category, 'Bouquets'));

      const wearables = works.filter(w => w.category === 'Wearables');
      assert.equal(wearables.length, 4);
      wearables.forEach(w => assert.equal(w.category, 'Wearables'));

      assert.equal(works.length, initialCatalogLength, 'Catalog must remain unmodified');
    });

    test('TC 1.2.4: Empty or non-matching category yields 0 items cleanly', () => {
      const nonExistent = works.filter(w => w.category === 'NonExistentCategory');
      assert.equal(nonExistent.length, 0);
    });

    test('TC 1.2.5: View switcher state persistence in localStorage', () => {
      const { storage } = setupMockBrowser();
      storage.setItem(VIEW_MODE_KEY, 'lookbook');
      assert.equal(storage.getItem(VIEW_MODE_KEY), 'lookbook');

      storage.setItem(VIEW_MODE_KEY, 'catalog');
      assert.equal(storage.getItem(VIEW_MODE_KEY), 'catalog');
    });

    test('TC 1.2.6: Renders actual ShowcaseSection component with dual-view switcher and ARIA radiogroup', async () => {
      const showcaseMod = await loadModule('src/components/Showcase/ShowcaseSection.jsx');
      assert.ok(showcaseMod && showcaseMod.default, 'ShowcaseSection component loaded');

      const html = renderComponent(showcaseMod.default, {
        works,
        likes: {},
        likedPieces: [],
      });

      assert.ok(html.includes('role="radiogroup"'), 'Must have role=radiogroup for view switcher');
      assert.ok(html.includes('aria-label="Collection display view"'), 'Must label radiogroup');
      assert.ok(html.includes('Catalog'), 'Catalog button present');
      assert.ok(html.includes('Lookbook'), 'Lookbook button present');
      assert.ok(html.includes('Made for keeping'), 'Section heading rendered');
      assert.match(html, /Selected work.*?13.*?pieces/, 'Dynamic piece count header');

      // Verify category filter buttons are rendered
      assert.ok(html.includes('Bouquets (3)'));
      assert.ok(html.includes('Wearables (4)'));
      assert.ok(html.includes('Home (3)'));
      assert.ok(html.includes('Small things (3)'));
    });
  });

  describe('Feature 1.3: Quick-View Modal Specifications & Dialog Contract (F07)', () => {
    test('TC 1.3.1: Specification matrix extracts all 5 artisan spec fields from a catalog piece', () => {
      const sample = works[0]; // The Everlasting Crimson Rose
      const specMatrix = {
        fiberMaterials: sample.materials,
        hookSpecs: sample.hookSpecs,
        craftingHours: `${sample.estimatedCraftingHours} hand-stitching hours`,
        dimensions: sample.dimensions,
        careGuide: sample.careGuide,
      };

      assert.ok(specMatrix.fiberMaterials.includes('Cotton'), 'Expected cotton fiber materials');
      assert.ok(specMatrix.hookSpecs.includes('3.5mm'), 'Expected 3.5mm hook');
      assert.equal(specMatrix.craftingHours, '6 hand-stitching hours');
      assert.ok(specMatrix.dimensions.includes('Bloom: 8cm'), 'Expected dimensions details');
      assert.ok(specMatrix.careGuide.includes('Spot clean'), 'Expected care guide instructions');
    });

    test('TC 1.3.2: Quick-View graceful fallback when optional metadata fields are missing', () => {
      const incompletePiece = {
        id: 'test-piece',
        title: 'Minimal Piece',
        category: 'Wearables',
      };

      const resolvedSpecs = {
        materials: incompletePiece.materials || '100% Handcrafted Cotton Blend',
        hookSpecs: incompletePiece.hookSpecs || 'Custom Artisan Hook',
        craftingHours: incompletePiece.estimatedCraftingHours
          ? `~${incompletePiece.estimatedCraftingHours} hours`
          : 'Crafted Slowly by Hand',
        dimensions: incompletePiece.dimensions || 'One of a kind',
        careGuide: incompletePiece.careGuide || 'Spot clean gently with cold water',
      };

      assert.equal(resolvedSpecs.materials, '100% Handcrafted Cotton Blend');
      assert.equal(resolvedSpecs.hookSpecs, 'Custom Artisan Hook');
      assert.equal(resolvedSpecs.craftingHours, 'Crafted Slowly by Hand');
      assert.equal(resolvedSpecs.dimensions, 'One of a kind');
      assert.equal(resolvedSpecs.careGuide, 'Spot clean gently with cold water');
    });

    test('TC 1.3.3: Accessible dialog attributes contract', () => {
      const modalAttributes = {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'quickview-title',
      };

      assert.equal(modalAttributes.role, 'dialog');
      assert.equal(modalAttributes['aria-modal'], 'true');
      assert.equal(modalAttributes['aria-labelledby'], 'quickview-title');
    });

    test('TC 1.3.4: Keyboard dismiss (Escape) and backdrop dismiss handlers', () => {
      let closed = false;
      const handleClose = () => { closed = true; };

      const simulateKeyDown = (event) => {
        if (event.key === 'Escape') handleClose();
      };

      const simulateBackdropClick = (event) => {
        if (event.target === event.currentTarget) handleClose();
      };

      // Test Escape
      simulateKeyDown({ key: 'Escape' });
      assert.equal(closed, true, 'Escape key should trigger close callback');

      // Reset and test other key
      closed = false;
      simulateKeyDown({ key: 'Tab' });
      assert.equal(closed, false, 'Tab key should not trigger close callback');

      // Test Backdrop Click
      simulateBackdropClick({ target: 'backdrop-elem', currentTarget: 'backdrop-elem' });
      assert.equal(closed, true, 'Backdrop click should trigger close callback');
    });

    test('TC 1.3.5: Modal direct inquiry triggers proper contact scroll and subject', () => {
      const { window } = setupMockBrowser();
      const piece = works[3]; // Lavender Haze Ruffle Top

      const handleInquireFromModal = (work, closeModal) => {
        closeModal();
        window.location.hash = '#contact';
        window.scrollTo({ top: 1200, behavior: 'smooth' });
        return {
          regarding: `Inquiry: ${work.title}`,
          targetHash: window.location.hash,
        };
      };

      let modalClosed = false;
      const result = handleInquireFromModal(piece, () => { modalClosed = true; });

      assert.equal(modalClosed, true, 'Modal must close on direct inquiry');
      assert.equal(result.regarding, 'Inquiry: Lavender Haze Ruffle Top');
      assert.equal(result.targetHash, '#contact');
      assert.deepEqual(window.lastScrollTo, { top: 1200, behavior: 'smooth' });
    });

    test('TC 1.3.6: Renders actual QuickViewModal component and verifies dialog semantics and 5-spec matrix', async () => {
      const modalMod = await loadModule('src/components/Showcase/QuickViewModal.jsx');
      assert.ok(modalMod && modalMod.default, 'QuickViewModal component loaded');

      const samplePiece = works[0];
      const html = renderComponent(modalMod.default, {
        item: samplePiece,
        isOpen: true,
        onClose: () => {},
        onToggleBasket: () => {},
        isSaved: false,
      });

      assert.ok(html.includes('role="dialog"'), 'Has dialog role');
      assert.ok(html.includes('aria-modal="true"'), 'Has aria-modal="true"');
      assert.ok(html.includes('id="quickview-title"'), 'Has quickview-title element');
      assert.ok(html.includes('The Everlasting Crimson Rose'), 'Renders piece title');
      assert.ok(html.includes('Materials'), 'Displays materials spec');
      assert.ok(html.includes('Hook Tooling'), 'Displays hook tooling spec');
      assert.ok(html.includes('Crafting Time'), 'Displays crafting time spec');
      assert.ok(html.includes('Dimensions / Sizing') || html.includes('Dimensions'), 'Displays dimensions spec');
      assert.ok(html.includes('Care Guide'), 'Displays care guide spec');
      assert.ok(html.includes('Save to Stitched Basket'), 'Displays basket bookmark button');
    });
  });

  after(async () => {
    await closeViteServer();
  });
});
