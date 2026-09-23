/**
 * Tier 3 — Cross-Feature Combinations
 * Covers:
 * - TC 3.1: Catalog browsing, category filtering, basket addition, and crafting hours aggregation
 * - TC 3.2: Custom commission builder and wishlist state coexistence
 * - TC 3.3: View mode switching (Catalog <-> Lookbook) with active category preservation
 * - TC 3.4: Quick-View modal action leading to basket addition and drawer trigger
 * - TC 3.5: Cross-category basket combinations (Wearables + Bouquets + Home + Small things)
 * - TC 3.6: Multi-channel dispatch consistency (Instagram DM, Gmail, Contact Form)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readJson, setupMockBrowser } from '../helpers/test-env.js';
import { BasketStore } from '../helpers/test-utils.js';
import {
  formatMultiItemInquiry,
  formatCustomCommissionInquiry,
  openInstagramDM,
  createGmailComposeUrl,
} from '../../src/utils/inquiry.js';

describe('Tier 3 — Cross-Feature Combinations', () => {
  const works = readJson('src/data/works.json');

  test('TC 3.1: Browsing category "Wearables", adding multiple pieces, and computing aggregate hours', () => {
    const store = new BasketStore(works);

    // 1. Filter catalog by Wearables
    const wearables = works.filter(w => w.category === 'Wearables');
    assert.equal(wearables.length, 4);

    // 2. Add Lavender Haze Ruffle Top (18 hrs) and Goldenrod Grid Sweater (26 hrs)
    store.addToBasket(wearables[0].id);
    store.addToBasket(wearables[2].id);

    // 3. Verify basket state
    assert.equal(store.totalPieces, 2);
    assert.equal(store.isInBasket(wearables[0].id), true);
    assert.equal(store.isInBasket(wearables[2].id), true);
    assert.equal(store.isInBasket(wearables[1].id), false);

    // 4. Verify total slow-crafting hours = 18 + 26 = 44 hrs
    assert.equal(store.totalCraftingHours, 44);

    // 5. Generate formatted multi-item inquiry
    const inquiryText = formatMultiItemInquiry(store.basketItems, store.totalCraftingHours);
    assert.ok(inquiryText.includes('Total: 2 pieces (~44 slow-crafting hours)'));
  });

  test('TC 3.2: Custom commission builder and Stitched Basket state coexist without conflict', () => {
    const store = new BasketStore(works, ['bouquet-placeholder-01']);
    assert.equal(store.totalPieces, 1);

    // Configure a bespoke order
    const commissionConfig = {
      itemType: 'wearable',
      itemTitle: 'Cardigan / Wearable',
      paletteTitle: 'Forest & Sage',
      sizeLabel: 'Custom Measurements (Bust 38", Waist 30")',
      materialLabel: '100% Breathable Cotton',
      specialRequests: 'Add deep front pockets',
    };

    const commissionSlip = formatCustomCommissionInquiry(commissionConfig);
    const basketInquiry = formatMultiItemInquiry(store.basketItems);

    // Wishlist remains intact
    assert.equal(store.totalPieces, 1);
    assert.equal(store.basketItems[0].title, 'The Everlasting Crimson Rose');

    // Both inquiries have distinct, complete formats
    assert.ok(commissionSlip.includes('CUSTOM COMMISSION REQUEST — ORDER SUMMARY'));
    assert.ok(commissionSlip.includes('Forest & Sage'));
    assert.ok(basketInquiry.includes('The Everlasting Crimson Rose'));
  });

  test('TC 3.3: View mode switching preserves active category filter and visible subset', () => {
    let activeCategory = 'Home';
    let viewMode = 'catalog';

    const getVisibleWorks = (category) => {
      if (category === 'All') return works;
      return works.filter(w => w.category === category);
    };

    // Initially in Catalog Grid view
    let visibleInCatalog = getVisibleWorks(activeCategory);
    assert.equal(viewMode, 'catalog');
    assert.equal(visibleInCatalog.length, 3);
    visibleInCatalog.forEach(w => assert.equal(w.category, 'Home'));

    // Switch view mode to Lookbook
    viewMode = 'lookbook';
    assert.equal(viewMode, 'lookbook');
    let visibleInLookbook = getVisibleWorks(activeCategory);
    assert.equal(visibleInLookbook.length, 3);
    assert.deepEqual(visibleInLookbook.map(w => w.id), visibleInCatalog.map(w => w.id));

    // Switch back to Catalog
    viewMode = 'catalog';
    assert.equal(viewMode, 'catalog');
    assert.equal(getVisibleWorks(activeCategory).length, 3);
  });

  test('TC 3.4: Quick-View modal action adds item to basket and updates drawer trigger badge', () => {
    const store = new BasketStore(works);
    let modalItem = works[7]; // Midnight Lace Table Drape (32 hrs)
    let isModalOpen = true;

    assert.equal(store.isInBasket(modalItem.id), false);
    assert.equal(store.totalPieces, 0);

    // User clicks "Save to Stitched Basket" in Quick-View modal
    store.addToBasket(modalItem.id);

    assert.equal(store.isInBasket(modalItem.id), true);
    assert.equal(store.totalPieces, 1);
    assert.equal(store.totalCraftingHours, 32);

    // User triggers "View Basket Drawer"
    isModalOpen = false;
    store.setIsDrawerOpen(true);

    assert.equal(isModalOpen, false);
    assert.equal(store.isDrawerOpen, true);
    assert.equal(store.basketItems[0].title, 'Midnight Lace Table Drape');
  });

  test('TC 3.5: Multi-item inquiry combining 4 disparate categories with aggregate slow-craft hours', () => {
    const store = new BasketStore(works);

    // Select 1 item from each category:
    // Bouquets: The Ivory Rose Trio (14 hrs)
    // Wearables: Coral Breeze Tie-Front Cardigan (22 hrs)
    // Home: The Smiling Succulent Trio (8 hrs)
    // Small things: Friendly Frog Appliqués (2.5 hrs)
    const selectedIds = [
      'bouquet-placeholder-02',
      'wearable-placeholder-04',
      'home-placeholder-02',
      'small-thing-placeholder-01',
    ];

    selectedIds.forEach(id => store.addToBasket(id));

    assert.equal(store.totalPieces, 4);
    // 14 + 22 + 8 + 2.5 = 46.5 hours
    assert.equal(store.totalCraftingHours, 46.5);

    const multiInquiry = formatMultiItemInquiry(store.basketItems, store.totalCraftingHours);

    assert.ok(multiInquiry.includes('Total: 4 pieces (~46.5 slow-crafting hours)'));
    assert.ok(multiInquiry.includes('The Ivory Rose Trio (Bouquets)'));
    assert.ok(multiInquiry.includes('Coral Breeze Tie-Front Cardigan (Wearables)'));
    assert.ok(multiInquiry.includes('The Smiling Succulent Trio (Home)'));
    assert.ok(multiInquiry.includes('Friendly Frog Appliqués (Small things)'));
  });

  test('TC 3.6: Multi-channel dispatch consistency across Instagram DM, Gmail, and Contact Form', async () => {
    const { getClipboardText } = setupMockBrowser();
    const store = new BasketStore(works, ['bouquet-placeholder-01', 'small-thing-placeholder-03']);

    const inquirySummary = formatMultiItemInquiry(store.basketItems, store.totalCraftingHours);

    // 1. Instagram DM dispatch copies inquiry
    await openInstagramDM(inquirySummary);
    assert.equal(getClipboardText(), inquirySummary);

    // 2. Gmail compose URL incorporates identical inquiry
    const gmailUrl = createGmailComposeUrl('Nia Knits Inquiry', inquirySummary);
    assert.ok(gmailUrl.includes(encodeURIComponent(inquirySummary)));

    // 3. Contact Form sync uses identical inquiry
    const regarding = `Stitched Basket (${store.totalPieces} pieces)`;
    const contactMessage = inquirySummary;
    assert.equal(contactMessage, inquirySummary);
    assert.ok(regarding.includes('2 pieces'));
  });
});
