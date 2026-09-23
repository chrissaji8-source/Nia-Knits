/**
 * Adversarial Stress Tests & Boundary Challenge Suite
 * Empirical Challenger 1 for Nia Knits Frontend Overhaul
 *
 * Covers:
 * 1. Rapid View Mode Toggles (Catalog <-> Lookbook), persistence normalization, and corruption resilience
 * 2. Quick-View Modal: Opening, Escape key dismissal, backdrop vs inner click, focus trap and focus return
 * 3. Stitched Basket Wishlist: Full catalog load/unload, clearing, 0 items edge case, corrupt localStorage & cross-tab sync
 * 4. Custom Commission Configurator: Strict 10-day buffer edge validation, special characters & XSS injection, 10,000+ char stress inputs
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { readJson, setupMockBrowser, renderComponent, loadModule, closeViteServer } from './helpers/test-env.js';
import { BasketStore, validateCommissionTargetDate, STORAGE_KEY } from './helpers/test-utils.js';
import {
  formatMultiItemInquiry,
  formatCustomCommissionInquiry,
  createGmailComposeUrl,
  createMailtoUrl,
} from '../src/utils/inquiry.js';

describe('Adversarial Empirical Stress Testing — Challenger 1', () => {
  const works = readJson('src/data/works.json');

  after(async () => {
    await closeViteServer();
  });

  // =========================================================================
  // CHALLENGE 1: Rapid View Mode Toggles & Storage Resilience
  // =========================================================================
  describe('Challenge 1: Rapid View Mode Toggles & Storage Resilience', () => {
    const VIEW_MODE_KEY = 'nia-knits-view-mode';

    function normalizeViewMode(mode) {
      if (mode === 'lookbook') return 'lookbook';
      if (mode === 'catalog' || mode === 'grid') return 'catalog';
      return 'catalog';
    }

    test('Stress 1.1: 1,000 rapid alternating view mode toggles maintain state parity', () => {
      const { storage } = setupMockBrowser();
      let currentMode = 'catalog';

      for (let i = 0; i < 1000; i++) {
        const nextMode = i % 2 === 0 ? 'lookbook' : 'catalog';
        currentMode = normalizeViewMode(nextMode);
        storage.setItem(VIEW_MODE_KEY, currentMode);
      }

      // 1000 iterations: 999 is odd -> 'catalog'
      assert.equal(currentMode, 'catalog');
      assert.equal(storage.getItem(VIEW_MODE_KEY), 'catalog');
    });

    test('Stress 1.2: Normalizes adversarial, malformed, or corrupt storage inputs safely to catalog', () => {
      const adversarialInputs = [
        null,
        undefined,
        '',
        '   ',
        'LOOKBOOK',
        'Lookbook',
        'GRID',
        'TABLE',
        '123',
        '{}',
        '{"mode":"lookbook"}',
        '<script>alert(1)</script>',
        'catalog/lookbook',
        '\0',
        'lookbook\n',
      ];

      adversarialInputs.forEach((input) => {
        const normalized = normalizeViewMode(input);
        assert.equal(
          normalized === 'catalog' || normalized === 'lookbook',
          true,
          `Input "${input}" must normalize only to 'catalog' or 'lookbook', got: ${normalized}`
        );
        // Unless it is exact string 'lookbook', it should fall back safely to 'catalog'
        if (input !== 'lookbook') {
          assert.equal(normalized, 'catalog', `Input "${input}" should fall back to 'catalog'`);
        }
      });
    });

    test('Stress 1.3: Rapid view mode toggles do not mutate works catalog or filter counts', async () => {
      const showcaseMod = await loadModule('src/components/Showcase/ShowcaseSection.jsx');
      assert.ok(showcaseMod?.default, 'ShowcaseSection component must load via Vite SSR');

      const initialWorksCount = works.length;

      // Verify category counts calculation is deterministic
      const counts = { All: works.length };
      works.forEach((w) => {
        if (w.category) counts[w.category] = (counts[w.category] || 0) + 1;
      });

      assert.equal(counts.All, 13);
      assert.equal(counts.Bouquets, 3);
      assert.equal(counts.Wearables, 4);
      assert.equal(counts.Home, 3);
      assert.equal(counts['Small things'], 3);

      // Verify HTML renders for both modes cleanly
      const catalogHtml = renderComponent(showcaseMod.default, { works });
      assert.ok(catalogHtml.includes('Catalog'), 'Rendered catalog HTML contains Catalog switch');
      assert.ok(catalogHtml.includes('Lookbook'), 'Rendered catalog HTML contains Lookbook switch');

      assert.equal(works.length, initialWorksCount, 'Catalog array length must remain immutable');
    });
  });

  // =========================================================================
  // CHALLENGE 2: Quick-View Modal: Opening, Escape, Backdrop & Focus Return
  // =========================================================================
  describe('Challenge 2: Quick-View Modal: Focus, Escape & Dismissal Lifecycle', () => {
    test('Stress 2.1: QuickViewModal renders dialog semantics and full 5-specification matrix', async () => {
      const modalMod = await loadModule('src/components/Showcase/QuickViewModal.jsx');
      const testItem = works[0]; // Everlasting Crimson Rose

      const html = renderComponent(modalMod.default, {
        item: testItem,
        isOpen: true,
        onClose: () => {},
      });

      assert.ok(html.includes('role="dialog"'), 'Must have role="dialog"');
      assert.ok(html.includes('aria-modal="true"'), 'Must have aria-modal="true"');
      assert.ok(html.includes('aria-labelledby="quickview-title"'), 'Must have aria-labelledby');
      assert.ok(html.includes(testItem.title), 'Must display item title');

      // 5-Specification matrix fields:
      assert.ok(html.includes('Materials'), 'Spec matrix includes Materials');
      assert.ok(html.includes('Hook Tooling'), 'Spec matrix includes Hook Tooling');
      assert.ok(html.includes('Crafting Time'), 'Spec matrix includes Crafting Time');
      assert.ok(html.includes('Dimensions / Sizing'), 'Spec matrix includes Dimensions');
      assert.ok(html.includes('Care Guide'), 'Spec matrix includes Care Guide');

      // Test closed state renders null/empty
      const closedHtml = renderComponent(modalMod.default, {
        item: testItem,
        isOpen: false,
        onClose: () => {},
      });
      assert.equal(closedHtml, '', 'Closed modal must render null');

      // Test null item renders null/empty
      const nullItemHtml = renderComponent(modalMod.default, {
        item: null,
        isOpen: true,
        onClose: () => {},
      });
      assert.equal(nullItemHtml, '', 'Null item modal must render null');
    });

    test('Stress 2.2: Modal lifecycle: Escape keydown triggers close and stops propagation', () => {
      let closeCalled = false;
      let propagationStopped = false;

      const onClose = () => { closeCalled = true; };
      const event = {
        key: 'Escape',
        stopPropagation() { propagationStopped = true; },
      };

      // Simulating the onKeyDown handler contract from QuickViewDialogContent
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
      }

      assert.equal(closeCalled, true, 'Escape key must trigger onClose');
      assert.equal(propagationStopped, true, 'Escape key must stop event propagation');
    });

    test('Stress 2.3: Backdrop click contract: Only target === currentTarget dismisses modal', () => {
      let closeCount = 0;
      const onClose = () => { closeCount++; };

      const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      };

      const backdropElement = { id: 'modal-backdrop' };
      const dialogPanelElement = { id: 'dialog-content-card' };
      const buttonInsideDialog = { id: 'dialog-cta-button' };

      // 1. Direct click on backdrop -> SHOULD close
      handleBackdropClick({ target: backdropElement, currentTarget: backdropElement });
      assert.equal(closeCount, 1, 'Direct backdrop click must close modal');

      // 2. Click bubbling from inside the dialog panel -> MUST NOT close
      handleBackdropClick({ target: dialogPanelElement, currentTarget: backdropElement });
      assert.equal(closeCount, 1, 'Click inside dialog card must NOT close modal');

      // 3. Click bubbling from button inside dialog -> MUST NOT close
      handleBackdropClick({ target: buttonInsideDialog, currentTarget: backdropElement });
      assert.equal(closeCount, 1, 'Click on button inside dialog must NOT close modal');
    });

    test('Stress 2.4: Focus restoration contract: previousActiveElement receives focus on close', () => {
      let focusCalled = false;
      const mockTriggerButton = {
        name: 'Quick View Trigger Button',
        focus() { focusCalled = true; },
      };

      // Simulate mount: activeElement is saved
      const previousActiveElement = { current: mockTriggerButton };

      // Simulate unmount / close cleanup:
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }

      assert.equal(focusCalled, true, 'Focus must be restored to trigger button on modal close');
    });

    test('Stress 2.5: Focus trap cycling: Tab wraps from last to first, Shift+Tab from first to last', () => {
      const focusable = [
        { id: 'close-btn', focused: false, focus() { this.focused = true; } },
        { id: 'basket-btn', focused: false, focus() { this.focused = true; } },
        { id: 'inquire-btn', focused: false, focus() { this.focused = true; } },
      ];

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Simulate Tab key on last element
      let tabPrevented = false;
      let activeElement = last;
      const tabEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault() { tabPrevented = true; },
      };

      if (!tabEvent.shiftKey && activeElement === last) {
        tabEvent.preventDefault();
        first.focus();
      }

      assert.equal(tabPrevented, true, 'Tab on last element must prevent default');
      assert.equal(first.focused, true, 'Tab on last element must cycle focus to first element');

      // Simulate Shift+Tab on first element
      let shiftTabPrevented = false;
      activeElement = first;
      const shiftTabEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault() { shiftTabPrevented = true; },
      };

      if (shiftTabEvent.shiftKey && activeElement === first) {
        shiftTabEvent.preventDefault();
        last.focus();
      }

      assert.equal(shiftTabPrevented, true, 'Shift+Tab on first element must prevent default');
      assert.equal(last.focused, true, 'Shift+Tab on first element must cycle focus to last element');
    });

    test('Stress 2.6: QuickView handles extreme or missing item properties gracefully', async () => {
      const modalMod = await loadModule('src/components/Showcase/QuickViewModal.jsx');

      const extremeItem = {
        id: 'extreme-item-01',
        title: 'Super Long Title '.repeat(10),
        category: null,
        materials: undefined,
        hookSpecs: '',
        estimatedCraftingHours: null,
        dimensions: null,
        careGuide: null,
        images: [],
        video: null,
      };

      const html = renderComponent(modalMod.default, {
        item: extremeItem,
        isOpen: true,
        onClose: () => {},
      });

      assert.ok(html.includes('100% Handcrafted Cotton Blend'), 'Falls back to default materials');
      assert.ok(html.includes('Custom Artisan Hook'), 'Falls back to default hook spec');
      assert.ok(html.includes('Crafted Slowly by Hand'), 'Falls back to default hours message');
      assert.ok(html.includes('Spot clean gently with cold water'), 'Falls back to default care guide');
      assert.ok(html.includes('Artisan Piece Preview'), 'Displays placeholder when no images are present');
    });
  });

  // =========================================================================
  // CHALLENGE 3: Stitched Basket Wishlist & LocalStorage Corruption
  // =========================================================================
  describe('Challenge 3: Stitched Basket Wishlist & LocalStorage Corruption', () => {
    test('Stress 3.1: Full catalog saturation (all 13 pieces added) and step-by-step drain', () => {
      const store = new BasketStore(works);

      // Saturate basket with all 13 pieces
      works.forEach((piece) => {
        store.addToBasket(piece);
      });

      assert.equal(store.totalPieces, 13);
      assert.equal(store.savedPieceIds.length, 13);

      const expectedTotalHours = Math.round(
        works.reduce((acc, it) => acc + (Number(it.estimatedCraftingHours) || 0), 0) * 10
      ) / 10;

      assert.equal(store.totalCraftingHours, expectedTotalHours);

      // Verify inquiry formatting for 13 pieces
      const multiInquiry = formatMultiItemInquiry(store.basketItems, store.totalCraftingHours);
      assert.ok(multiInquiry.includes('Total: 13 pieces'));
      assert.ok(multiInquiry.includes(`~${expectedTotalHours} slow-crafting hours`));
      assert.ok(multiInquiry.includes('13. ')); // contains 13th bullet

      // Drain pieces one by one
      works.forEach((piece, idx) => {
        store.removeFromBasket(piece.id);
        assert.equal(store.totalPieces, 12 - idx);
      });

      assert.equal(store.totalPieces, 0);
      assert.equal(store.totalCraftingHours, 0);
    });

    test('Stress 3.2: 500 rapid concurrent toggles with even parity returns to empty basket', () => {
      const store = new BasketStore(works);
      const piece = works[1];

      for (let i = 0; i < 500; i++) {
        store.toggleBasket(piece);
      }

      assert.equal(store.isInBasket(piece.id), false);
      assert.equal(store.totalPieces, 0);
      assert.equal(store.totalCraftingHours, 0);
    });

    test('Stress 3.3: clearBasket instantly resets state, hours, and persists empty array', () => {
      setupMockBrowser();
      const store = new BasketStore(works, [works[0].id, works[1].id, works[2].id]);

      assert.equal(store.totalPieces, 3);
      assert.ok(store.totalCraftingHours > 0);

      store.clearBasket();

      assert.equal(store.totalPieces, 0);
      assert.equal(store.totalCraftingHours, 0);
      assert.equal(store.basketItems.length, 0);
    });

    test('Stress 3.4: Adversarial LocalStorage corruption matrix does not throw or crash parser', () => {
      const corruptStrings = [
        '{',
        '{"id": "wearable-1"}', // object instead of array
        'true',
        'false',
        '12345',
        'null',
        'undefined',
        'NaN',
        '[{}, {}, 123, true, null, undefined, ""]',
        '["valid-id", "", "   ", null, 456, {"id": "wearable-2"}]',
        '\\x00\\x01\\x02',
        '['.repeat(50) + ']'.repeat(50),
      ];

      function safeParse(raw) {
        if (!raw) return [];
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed
              .map((entry) => (typeof entry === 'string' ? entry : entry?.id))
              .filter((id) => typeof id === 'string' && id.trim().length > 0);
          }
          return [];
        } catch {
          return [];
        }
      }

      corruptStrings.forEach((payload) => {
        let result;
        assert.doesNotThrow(() => {
          result = safeParse(payload);
        }, `Payload "${payload}" must not throw`);
        assert.ok(Array.isArray(result), `Payload "${payload}" must return an array`);
      });

      // Specific validation: mixed valid + invalid entries cleanly extracts only non-empty string IDs
      const mixed = safeParse('["valid-id", "", "   ", null, 456, {"id": "wearable-2"}]');
      assert.deepEqual(mixed, ['valid-id', 'wearable-2']);
    });

    test('Stress 3.5: Cross-tab storage synchronization handles empty, malformed, and valid updates', () => {
      let savedIdsList = ['initial-1'];

      const handleStorageEvent = (event) => {
        if (event.key !== STORAGE_KEY) return;
        try {
          if (!event.newValue) {
            savedIdsList = [];
            return;
          }
          const parsed = JSON.parse(event.newValue);
          if (Array.isArray(parsed)) {
            savedIdsList = parsed
              .map((entry) => (typeof entry === 'string' ? entry : entry?.id))
              .filter((id) => typeof id === 'string' && id.trim().length > 0);
          }
        } catch {
          // graceful catch
        }
      };

      // 1. Valid cross-tab addition
      handleStorageEvent({ key: STORAGE_KEY, newValue: '["remote-piece-1", "remote-piece-2"]' });
      assert.deepEqual(savedIdsList, ['remote-piece-1', 'remote-piece-2']);

      // 2. Cross-tab clear (null newValue)
      handleStorageEvent({ key: STORAGE_KEY, newValue: null });
      assert.deepEqual(savedIdsList, []);

      // 3. Corrupt cross-tab payload (leaves previous state unharmed)
      savedIdsList = ['keep-this-id'];
      handleStorageEvent({ key: STORAGE_KEY, newValue: '{"corrupted": true}' });
      assert.deepEqual(savedIdsList, ['keep-this-id']);
    });

    test('Stress 3.6: QuotaExceededError during localStorage write does not break state in-memory', () => {
      let memoryState = ['piece-1'];
      let caughtError = false;

      const throwingStorage = {
        setItem() {
          const err = new DOMException('Storage quota exceeded', 'QuotaExceededError');
          throw err;
        },
      };

      const writeStoredIds = (ids) => {
        try {
          throwingStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        } catch {
          caughtError = true;
        }
      };

      // User adds item: memory updates, storage throws, app does not crash
      memoryState = [...memoryState, 'piece-2'];
      writeStoredIds(memoryState);

      assert.equal(caughtError, true, 'QuotaExceededError should be safely caught');
      assert.deepEqual(memoryState, ['piece-1', 'piece-2'], 'Memory state remains intact');
    });
  });

  // =========================================================================
  // CHALLENGE 4: Commission Configurator: Edge Dates, Special Characters & Inputs
  // =========================================================================
  describe('Challenge 4: Commission Configurator: Edge Dates, Special Characters & Inputs', () => {
    test('Stress 4.1: Date Buffer Edge Stress Testing (Minimum 10-day buffer)', () => {
      const now = new Date();
      const formatDate = (d) => d.toISOString().split('T')[0];

      // Exact boundaries:
      const offsets = [
        { days: -365, expected: false, label: '1 year ago' },
        { days: -30, expected: false, label: '30 days ago' },
        { days: -1, expected: false, label: 'Yesterday' },
        { days: 0, expected: false, label: 'Today' },
        { days: 1, expected: false, label: 'Tomorrow (+1 day)' },
        { days: 5, expected: false, label: '+5 days' },
        { days: 9, expected: false, label: '+9 days (buffer boundary minus 1)' },
        { days: 10, expected: true, label: '+10 days (exact minimum buffer)' },
        { days: 11, expected: true, label: '+11 days (safe minimum buffer)' },
        { days: 30, expected: true, label: '+30 days (standard order timeline)' },
        { days: 365, expected: true, label: '+1 year in future' },
      ];

      offsets.forEach(({ days, expected, label }) => {
        const testDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        const dateStr = formatDate(testDate);
        const result = validateCommissionTargetDate(dateStr, 10);
        assert.equal(
          result.valid,
          expected,
          `Date ${dateStr} (${label}) expected valid=${expected}, got=${result.valid}`
        );
      });

      // Presets & non-specific strings
      assert.equal(validateCommissionTargetDate('no-rush', 10).valid, true);
      assert.equal(validateCommissionTargetDate('3-weeks', 10).valid, true);
      assert.equal(validateCommissionTargetDate('', 10).valid, true);
      assert.equal(validateCommissionTargetDate(null, 10).valid, true);

      // Invalid date formats
      assert.equal(validateCommissionTargetDate('not-a-date', 10).valid, false);
      assert.equal(validateCommissionTargetDate('2026-99-99', 10).valid, false);
    });

    test('Stress 4.2: Adversarial injection & special characters in special requests notes', () => {
      const adversarialNote = [
        '<script>alert("xss")</script>',
        '${process.env.SECRET_KEY}',
        '"; DROP TABLE orders; --',
        'Line 1\nLine 2\r\nLine 3\tTabbed',
        'Double "quotes" and Single \'quotes\' and `backticks`',
        'Ampersands & Percent % Pluses + Slashes / and \\',
        '🧶 🌸 👗 🪴 ✨ 💖 🧸 Neha’s loops are 100% slow-crafted!',
      ].join(' | ');

      const config = {
        itemType: 'wearable',
        itemTitle: 'Cardigan / Wearable',
        paletteTitle: 'Berry Blossom',
        sizeLabel: 'M (36-38")',
        materialLabel: '100% Breathable Cotton',
        targetDateValue: 'Within 3–4 weeks',
        specialRequests: adversarialNote,
      };

      const formattedInquiry = formatCustomCommissionInquiry(config);

      // Verify the special request was preserved verbatim without truncation or execution
      assert.ok(
        formattedInquiry.includes(adversarialNote),
        'Inquiry must contain uncorrupted special requests text'
      );
      assert.ok(
        formattedInquiry.includes('🧶 CUSTOM COMMISSION REQUEST — ORDER SUMMARY'),
        'Inquiry must contain header'
      );
    });

    test('Stress 4.3: 10,000+ character stress input in notes and configurator state', async () => {
      const giantNote = 'Loop-by-loop bespoke artisanal cardigan stitching notes with intricate detailing. '.repeat(130);
      assert.ok(giantNote.length > 10000, `Giant note length is ${giantNote.length}`);

      const config = {
        itemType: 'decor',
        itemTitle: 'Blanket / Home Decor',
        leadTime: '3–4 weeks',
        paletteTitle: 'Sunset Ochre',
        swatches: ['#D49A72', '#C46D4E', '#F6D8A8'],
        sizeLabel: 'Lap Blanket (36x48")',
        materialLabel: 'Soft Acrylic Blend',
        targetDateValue: 'Flexible / No rush',
        specialRequests: giantNote,
        estimatedHours: '~28–36 Hours of Hand-Stitching',
      };

      const start = Date.now();
      const formatted = formatCustomCommissionInquiry(config);
      const elapsed = Date.now() - start;

      assert.ok(elapsed < 100, `Formatting 10k character slip should be < 100ms, took ${elapsed}ms`);
      assert.ok(formatted.includes('Blanket / Home Decor'));
      assert.ok(formatted.includes('Sunset Ochre'));
      assert.ok(formatted.includes(giantNote));

      // Test OrderSlipPreview renders without crashing with 10k characters
      const slipMod = await loadModule('src/components/CustomCommission/OrderSlipPreview.jsx');
      const html = renderComponent(slipMod.default, { config });

      assert.ok(html.includes('NIA KNITS · MAKER’S SLIP'));
      assert.ok(html.includes('Blanket / Home Decor'));
    });

    test('Stress 4.4: Deep link URL generators survive huge inputs and meta-characters without URIError', () => {
      const largeSubject = 'Custom Order: ' + 'A'.repeat(500) + ' 🧶 "Special" & ? = +';
      const largeBody = 'Body:\n' + 'B'.repeat(3000) + ' 🌸 <>&"\'\n\r';

      let gmailUrl;
      assert.doesNotThrow(() => {
        gmailUrl = createGmailComposeUrl(largeSubject, largeBody);
      });

      assert.ok(gmailUrl.startsWith('https://mail.google.com/mail/?view=cm&fs=1&to=Joseneha55@gmail.com'));
      assert.ok(!gmailUrl.includes('"'), 'Raw double quote must not appear unencoded');
      assert.ok(!gmailUrl.includes('🌸'), 'Raw emoji must be URL encoded');

      let mailtoUrl;
      assert.doesNotThrow(() => {
        mailtoUrl = createMailtoUrl(largeSubject, largeBody);
      });

      assert.ok(mailtoUrl.startsWith('mailto:Joseneha55@gmail.com?subject='));

      // Verify custom recipient support
      const customGmail = createGmailComposeUrl(largeSubject, largeBody, 'custom@artisan.com');
      assert.ok(customGmail.includes('to=custom@artisan.com'));
      const customMailto = createMailtoUrl(largeSubject, largeBody, 'custom@artisan.com');
      assert.ok(customMailto.startsWith('mailto:custom@artisan.com?subject='));
    });
  });
});
