/**
 * Tier 1 — Feature Coverage: R2 "Stitched Basket" Wishlist & Multi-Inquiry Drawer
 * Covers:
 * - Feature 1.4: Stitched Basket State Store & Persistence (F03, F08, F09)
 * - Feature 1.5: Multi-Item Formatted Inquiry Generation (F02, F10)
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {
  readJson,
  setupMockBrowser,
  loadModule,
  renderComponent,
  closeViteServer,
} from '../helpers/test-env.js';
import { BasketStore, STORAGE_KEY } from '../helpers/test-utils.js';
import {
  createGmailComposeUrl,
  createMailtoUrl,
  formatMultiItemInquiry,
  formatSinglePieceInquiry,
  openInstagramDM,
} from '../../src/utils/inquiry.js';

describe('Tier 1 — R2: "Stitched Basket" Wishlist & Multi-Inquiry Drawer', () => {
  const works = readJson('src/data/works.json');

  describe('Feature 1.4: Stitched Basket Wishlist State Store & Persistence (F03, F08, F09)', () => {
    test('TC 1.4.1: Adding items updates basket items, count, and saved IDs set', () => {
      const store = new BasketStore(works);
      assert.equal(store.totalPieces, 0);

      store.addToBasket('bouquet-placeholder-01');
      assert.equal(store.totalPieces, 1);
      assert.equal(store.isInBasket('bouquet-placeholder-01'), true);
      assert.equal(store.basketItems[0].title, 'The Everlasting Crimson Rose');

      store.addToBasket('wearable-placeholder-01');
      assert.equal(store.totalPieces, 2);
      assert.equal(store.isInBasket('wearable-placeholder-01'), true);
    });

    test('TC 1.4.2: Toggling item in basket adds when missing and removes when present', () => {
      const store = new BasketStore(works);
      const pieceId = 'home-placeholder-01';

      // Toggle ON
      store.toggleBasket(pieceId);
      assert.equal(store.isInBasket(pieceId), true);
      assert.equal(store.totalPieces, 1);

      // Toggle OFF
      store.toggleBasket(pieceId);
      assert.equal(store.isInBasket(pieceId), false);
      assert.equal(store.totalPieces, 0);
    });

    test('TC 1.4.3: Item removal flow cleanly purges item and updates total crafting hours', () => {
      const store = new BasketStore(works, ['bouquet-placeholder-01', 'bouquet-placeholder-02']);
      assert.equal(store.totalPieces, 2);
      // Crimson Rose = 6 hrs, Ivory Rose Trio = 14 hrs -> Total = 20 hrs
      assert.equal(store.totalCraftingHours, 20);

      store.removeFromBasket('bouquet-placeholder-01');
      assert.equal(store.totalPieces, 1);
      assert.equal(store.isInBasket('bouquet-placeholder-01'), false);
      assert.equal(store.isInBasket('bouquet-placeholder-02'), true);
      assert.equal(store.totalCraftingHours, 14);
    });

    test('TC 1.4.4: Total slow-crafting hours accurately aggregates fractional and multiple hours', () => {
      // Fuchsia Blossom Headband = 3.5 hrs, Friendly Frog Appliqués = 2.5 hrs
      const store = new BasketStore(works, ['wearable-placeholder-02', 'small-thing-placeholder-01']);
      assert.equal(store.totalCraftingHours, 6.0);
    });

    test('TC 1.4.5: Basket drawer state toggle and clear basket functionality', () => {
      const store = new BasketStore(works, ['bouquet-placeholder-01', 'wearable-placeholder-01']);
      assert.equal(store.isDrawerOpen, false);

      store.setIsDrawerOpen(true);
      assert.equal(store.isDrawerOpen, true);

      store.clearBasket();
      assert.equal(store.totalPieces, 0);
      assert.equal(store.totalCraftingHours, 0);
      assert.equal(store.savedPieceIds.length, 0);

      store.setIsDrawerOpen(false);
      assert.equal(store.isDrawerOpen, false);
    });

    test('TC 1.4.6: LocalStorage persistence roundtrip', () => {
      const { storage } = setupMockBrowser();
      const initialIds = ['bouquet-placeholder-01', 'home-placeholder-02'];
      storage.setItem(STORAGE_KEY, JSON.stringify(initialIds));

      const raw = storage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(raw);
      assert.deepEqual(parsed, initialIds);

      // Mutate storage
      parsed.push('small-thing-placeholder-03');
      storage.setItem(STORAGE_KEY, JSON.stringify(parsed));

      const updated = JSON.parse(storage.getItem(STORAGE_KEY));
      assert.equal(updated.length, 3);
      assert.ok(updated.includes('small-thing-placeholder-03'));
    });

    test('TC 1.4.7: Renders actual BasketProvider context component with children', async () => {
      const basketMod = await loadModule('src/context/BasketContext.jsx');
      assert.ok(basketMod.BasketProvider, 'BasketProvider exported');

      const html = renderComponent(
        basketMod.BasketProvider,
        null,
        React.createElement('div', { id: 'test-child' }, 'Stitched Basket Context Active')
      );

      assert.ok(html.includes('Stitched Basket Context Active'), 'Renders child content within BasketProvider');
    });
  });

  describe('Feature 1.5: Multi-Item Formatted Inquiry Generation (F02, F10)', () => {
    test('TC 1.5.1: formatSinglePieceInquiry contains piece title, category, materials, and crafting hours', () => {
      const piece = works[0]; // The Everlasting Crimson Rose (Bouquets, 6 hrs)
      const text = formatSinglePieceInquiry(piece);

      assert.ok(text.includes('The Everlasting Crimson Rose'), 'Expected title in inquiry text');
      assert.ok(text.includes('Bouquets'), 'Expected category in inquiry text');
      assert.ok(text.includes('6 hrs'), 'Expected crafting hours in inquiry text');
      assert.ok(text.includes('Hi Neha!'), 'Expected warm artisan greeting');
      assert.ok(text.includes('open for orders'), 'Expected call to action');
    });

    test('TC 1.5.2: formatMultiItemInquiry produces numbered list and total hours for multiple pieces', () => {
      const items = [works[0], works[3], works[12]]; // 6 hrs + 18 hrs + 5 hrs = 29 hrs
      const text = formatMultiItemInquiry(items);

      assert.ok(text.includes('1. The Everlasting Crimson Rose'), 'Expected item 1 numbered');
      assert.ok(text.includes('2. Lavender Haze Ruffle Top'), 'Expected item 2 numbered');
      assert.ok(text.includes('3. Friendly Neighborhood Web-Slinger'), 'Expected item 3 numbered');
      assert.ok(text.includes('Total: 3 pieces (~29 slow-crafting hours)'), 'Expected total pieces and hours');
      assert.ok(text.includes('Stitched Basket'), 'Expected Stitched Basket reference');
    });

    test('TC 1.5.3: openInstagramDM copies text to clipboard and opens Instagram DM URL', async () => {
      const { window, getClipboardText } = setupMockBrowser();
      const message = 'Hi Neha! Inquiry test from Stitched Basket';

      const success = await openInstagramDM(message);
      assert.equal(success, true, 'openInstagramDM should return true');
      assert.equal(getClipboardText(), message, 'Message must be copied to clipboard');
      assert.equal(window.lastOpenedUrl, 'https://ig.me/m/nia_knits_27');
      assert.equal(window.lastOpenedTarget, '_blank');
    });

    test('TC 1.5.4: createGmailComposeUrl generates valid Gmail URL with encoded subject and body', () => {
      const subject = 'Nia Knits Inquiry: Stitched Basket (2 pieces)';
      const body = 'Hi Neha, I loved your pieces!';
      const url = createGmailComposeUrl(subject, body);

      assert.ok(url.startsWith('https://mail.google.com/mail/?view=cm&fs=1'), 'URL must target Gmail web compose');
      assert.ok(url.includes('to=Joseneha55@gmail.com'), 'URL must default to Joseneha55@gmail.com');
      assert.ok(url.includes(encodeURIComponent(subject)), 'Subject must be URL-encoded');
      assert.ok(url.includes(encodeURIComponent(body)), 'Body must be URL-encoded');

      // Verify custom recipient support
      const customUrl = createGmailComposeUrl(subject, body, 'custom@test.com');
      assert.ok(customUrl.includes('to=custom@test.com'), 'Must support custom recipient');
    });

    test('TC 1.5.5: createMailtoUrl builds fallback mailto: scheme with encoded parameters', () => {
      const subject = 'Order Inquiry';
      const body = 'Details here';
      const mailto = createMailtoUrl({ subject, body });

      assert.ok(mailto.startsWith('mailto:Joseneha55@gmail.com?'), 'Expected mailto: scheme with Joseneha55@gmail.com');
      assert.ok(mailto.includes('subject=Order%20Inquiry'), 'Subject encoded in query string');
      assert.ok(mailto.includes('body=Details%20here'), 'Body encoded in query string');

      // Verify custom recipient support
      const customMailto = createMailtoUrl({ subject, body, to: 'custom@test.com' });
      assert.ok(customMailto.startsWith('mailto:custom@test.com?'), 'Must support custom recipient in mailto');
    });

    test('TC 1.5.6: Website contact form auto-fill summary text generation', () => {
      const items = [works[0], works[1]];
      const regarding = `Stitched Basket: ${items.map(i => i.title).join(', ')} (${items.length} pieces)`;
      const body = formatMultiItemInquiry(items);

      assert.equal(regarding, 'Stitched Basket: The Everlasting Crimson Rose, The Ivory Rose Trio (2 pieces)');
      assert.ok(body.includes('Total: 2 pieces (~20 slow-crafting hours)'));
    });

    test('TC 1.5.7: Renders actual BasketDrawer component and verifies slide-over semantics', async () => {
      const drawerMod = await loadModule('src/components/Basket/BasketDrawer.jsx');
      assert.ok(drawerMod.BasketDrawer, 'BasketDrawer component exported');

      // Render open drawer
      const html = renderComponent(drawerMod.BasketDrawer, {
        isOpen: true,
        onClose: () => {},
      });

      assert.ok(html.includes('role="dialog"'), 'BasketDrawer must render with role="dialog"');
      assert.ok(html.includes('aria-modal="true"'), 'BasketDrawer must have aria-modal="true"');
      assert.ok(html.includes('Stitched Basket'), 'BasketDrawer must display title');
      assert.ok(html.includes('basket-drawer-close-btn'), 'BasketDrawer must have close button');
      assert.ok(html.includes('Your basket is empty'), 'Empty state must be displayed when items list is empty');
    });
  });

  after(async () => {
    await closeViteServer();
  });
});
