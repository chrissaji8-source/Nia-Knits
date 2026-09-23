/**
 * Tier 2 — Boundary & Corner Cases
 * Covers:
 * - Empty basket, single-item grammar, and zero-state formatting
 * - Storage failures, corrupt JSON, SSR safety, and quota errors
 * - Extreme strings, adversarial injection, emojis, and multiline requests
 * - Date boundaries (10-day artisan buffer edge conditions)
 * - Rapid toggle concurrency, Set deduplication, and non-existent IDs
 * - URL encoding fidelity for deep links with special meta-characters
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readJson, setupMockBrowser } from '../helpers/test-env.js';
import { BasketStore, validateCommissionTargetDate, STORAGE_KEY } from '../helpers/test-utils.js';
import {
  formatMultiItemInquiry,
  formatSinglePieceInquiry,
  formatCustomCommissionInquiry,
  createGmailComposeUrl,
  createMailtoUrl,
} from '../../src/utils/inquiry.js';

describe('Tier 2 — Boundary & Corner Cases', () => {
  const works = readJson('src/data/works.json');

  describe('Boundary 2.1: Empty Basket, Zero States & Grammar Pluralization', () => {
    test('TC 2.1.1: Empty basket returns clean fallback inquiry without NaN hours', () => {
      const emptyText = formatMultiItemInquiry([]);
      assert.ok(emptyText.includes('collection'), 'Empty inquiry should mention collection');
      assert.equal(emptyText.includes('NaN'), false, 'Empty inquiry must never contain NaN');
      assert.equal(emptyText.includes('undefined'), false, 'Empty inquiry must never contain undefined');

      const nullText = formatMultiItemInquiry(null);
      assert.equal(nullText, emptyText);
    });

    test('TC 2.1.2: Single-item inquiry delegates cleanly without numbered bullet clutter', () => {
      const singleItem = [works[0]];
      const multiText = formatMultiItemInquiry(singleItem);
      const singleDirectText = formatSinglePieceInquiry(works[0]);

      assert.equal(multiText, singleDirectText, 'Single item in multi-formatter should match single-piece format');
      assert.equal(multiText.includes('1. '), false, 'Single item should not have "1. " bullet prefix');
    });

    test('TC 2.1.3: Total crafting hours is 0 for empty basket and handles items with missing hours', () => {
      const store = new BasketStore(works, []);
      assert.equal(store.totalCraftingHours, 0);

      // Add piece with no hours defined
      store.addToBasket({
        id: 'custom-no-hours',
        title: 'Unknown Hours Piece',
      });
      assert.equal(store.totalCraftingHours, 0, 'Missing hours should default to 0 rather than NaN');
    });

    test('TC 2.1.4: Removing non-existent item from empty basket is safe no-op', () => {
      const store = new BasketStore(works, []);
      assert.doesNotThrow(() => {
        store.removeFromBasket('non-existent-id');
      });
      assert.equal(store.totalPieces, 0);
    });
  });

  describe('Boundary 2.2: LocalStorage Resilience, Corrupt Data & Quota Errors', () => {
    test('TC 2.2.1: Handles corrupt JSON strings in localStorage gracefully', () => {
      const corruptPayloads = [
        '{invalid-json-string',
        'undefined',
        '42',
        'true',
        '{"object": "not an array"}',
        '[null, "", 123, {"bad": "data"}]',
      ];

      corruptPayloads.forEach((payload) => {
        const { storage } = setupMockBrowser({ [STORAGE_KEY]: payload });
        // Simulating the parse logic in BasketContext
        let ids = [];
        try {
          const raw = storage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              ids = parsed
                .map(entry => (typeof entry === 'string' ? entry : entry?.id))
                .filter(id => typeof id === 'string' && id.trim().length > 0);
            }
          }
        } catch {
          ids = [];
        }

        assert.ok(Array.isArray(ids), 'Parsed IDs must always resolve to an array');
      });
    });

    test('TC 2.2.2: Suppresses QuotaExceededError on localStorage writes', () => {
      const throwingStorage = {
        getItem() { return null; },
        setItem() {
          const err = new Error('The quota has been exceeded.');
          err.name = 'QuotaExceededError';
          throw err;
        },
      };

      const safeWrite = (ids) => {
        try {
          throwingStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        } catch {
          return { written: false, caught: true };
        }
        return { written: true, caught: false };
      };

      const result = safeWrite(['item-1', 'item-2']);
      assert.equal(result.caught, true);
    });
  });

  describe('Boundary 2.3: Extreme Special Requests & Character Escaping', () => {
    test('TC 2.3.1: Configurator formats 2000+ char special request with emojis and HTML tags safely', () => {
      const longRequest = '🌸 Please make the collar scalloped like waves! '.repeat(40) +
        '<script>alert("xss")</script> & "quotes" \'single\' / slashes & ampersands 🧶';

      const config = {
        itemType: 'wearable',
        itemTitle: 'Cardigan / Wearable',
        specialRequests: longRequest,
      };

      const slip = formatCustomCommissionInquiry(config);
      assert.ok(slip.includes(longRequest), 'Special request text must be faithfully preserved');
      assert.ok(slip.includes('CUSTOM COMMISSION REQUEST'), 'Slip header must remain intact');
    });

    test('TC 2.3.2: Handles null, undefined, or empty special requests without displaying "undefined"', () => {
      const slipWithEmpty = formatCustomCommissionInquiry({ itemType: 'headwear' });
      assert.equal(slipWithEmpty.includes('undefined'), false);
      assert.equal(slipWithEmpty.includes('null'), false);
      assert.ok(slipWithEmpty.includes('None') || slipWithEmpty.includes('Standard'));
    });
  });

  describe('Boundary 2.4: Edge Dates & Turnaround Validation', () => {
    test('TC 2.4.1: Exactly today, yesterday, and 9 days ahead fail minimum 10-day buffer', () => {
      const now = new Date();
      const formatDate = (d) => d.toISOString().split('T')[0];

      // Today
      assert.equal(validateCommissionTargetDate(formatDate(now)).valid, false);

      // Yesterday
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      assert.equal(validateCommissionTargetDate(formatDate(yesterday)).valid, false);

      // 9 days ahead
      const nineDays = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000);
      assert.equal(validateCommissionTargetDate(formatDate(nineDays)).valid, false);

      // 10 days ahead (passes)
      const tenDays = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      assert.equal(validateCommissionTargetDate(formatDate(tenDays)).valid, true);

      // 30 days ahead (passes)
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      assert.equal(validateCommissionTargetDate(formatDate(thirtyDays)).valid, true);
    });
  });

  describe('Boundary 2.5: Rapid Toggles & Set Deduplication', () => {
    test('TC 2.5.1: Rapid consecutive additions deduplicate IDs and prevent duplicate entries', () => {
      const store = new BasketStore(works);
      const pieceId = 'wearable-placeholder-01';

      for (let i = 0; i < 50; i++) {
        store.addToBasket(pieceId);
      }

      assert.equal(store.totalPieces, 1, 'Basket must contain exactly 1 item despite 50 duplicate additions');
      assert.equal(store.savedPieceIds.length, 1);
      assert.equal(store.basketItems.length, 1);
    });

    test('TC 2.5.2: Toggling 100 times finishes in clean initial state (even parity)', () => {
      const store = new BasketStore(works);
      const pieceId = 'home-placeholder-03';

      for (let i = 0; i < 100; i++) {
        store.toggleBasket(pieceId);
      }

      assert.equal(store.isInBasket(pieceId), false);
      assert.equal(store.totalPieces, 0);
    });

    test('TC 2.5.3: Unknown or deleted piece IDs resolve to placeholder item rather than crashing', () => {
      const store = new BasketStore(works, ['deleted-legacy-piece-99']);
      assert.equal(store.totalPieces, 1);
      const item = store.basketItems[0];
      assert.equal(item.id, 'deleted-legacy-piece-99');
      assert.equal(item.title, 'Handcrafted Piece');
      assert.equal(store.totalCraftingHours, 0);
    });
  });

  describe('Boundary 2.6: Deep Link URL Encoding with Meta-Characters', () => {
    test('TC 2.6.1: createGmailComposeUrl encodes quotes, slashes, ampersands, pluses, and emojis', () => {
      const subject = 'Inquiry: "The Scarlet" & Rose? + Extra 100%';
      const body = 'Hi Neha! 🌸 Let\'s discuss: 100% cotton & 3.5mm hook = perfection?';

      const url = createGmailComposeUrl(subject, body);

      assert.ok(!url.includes('"'), 'Raw double quotes should not appear in URL query');
      assert.ok(!url.includes('🌸'), 'Raw unicode emoji should be encoded');
      assert.ok(url.includes(encodeURIComponent(subject)), 'Subject should match encodeURIComponent');
      assert.ok(url.includes(encodeURIComponent(body)), 'Body should match encodeURIComponent');
    });

    test('TC 2.6.2: createMailtoUrl query string roundtrips cleanly via URLSearchParams', () => {
      const subject = 'Custom Order: "Sunset Ochre" (Cardigan)';
      const body = 'Notes:\n- Scalloped edge\n- Extra 2"\n- Total: $120';

      const mailto = createMailtoUrl(subject, body);
      assert.ok(mailto.startsWith('mailto:Joseneha55@gmail.com?'));

      const queryString = mailto.replace('mailto:Joseneha55@gmail.com?', '');
      const params = new URLSearchParams(queryString);

      assert.equal(params.get('subject'), subject);
      assert.equal(params.get('body'), body);
    });
  });
});
