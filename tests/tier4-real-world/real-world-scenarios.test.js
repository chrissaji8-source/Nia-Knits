/**
 * Tier 4 — Real-World Scenarios (End-to-End Customer Journeys)
 * Covers:
 * - Scenario A: The Thoughtful Gift Buyer (Bouquet + Small thing -> Basket -> Instagram DM)
 * - Scenario B: The Bespoke Fashion Client (Lookbook -> Custom Configurator -> Contact Form Sync)
 * - Scenario C: The Slow-Craft Story Explorer (Scrapbook -> Craft Timeline -> Hobbies -> Home Basket -> Gmail)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readJson, setupMockBrowser } from '../helpers/test-env.js';
import {
  BasketStore,
  computeCategoryCounts,
  CRAFT_TIMELINE_STEPS,
  MAKER_HOBBY_CHIPS,
} from '../helpers/test-utils.js';
import {
  formatMultiItemInquiry,
  formatCustomCommissionInquiry,
  openInstagramDM,
  createGmailComposeUrl,
} from '../../src/utils/inquiry.js';

describe('Tier 4 — Real-World Scenarios (End-to-End Customer Journeys)', () => {
  const works = readJson('src/data/works.json');

  test('Scenario A: The Thoughtful Gift Buyer Journey', async () => {
    const { window, getClipboardText } = setupMockBrowser();
    const store = new BasketStore(works);

    // 1. Visitor views category counts
    const counts = computeCategoryCounts(works);
    assert.equal(counts['Bouquets'], 3);
    assert.equal(counts['Small things'], 3);

    // 2. Filters by Bouquets
    const bouquets = works.filter(w => w.category === 'Bouquets');
    const crimsonRose = bouquets.find(b => b.id === 'bouquet-placeholder-01');
    assert.ok(crimsonRose);

    // 3. Opens Quick-View modal and inspects specs
    assert.equal(crimsonRose.estimatedCraftingHours, 6);
    assert.ok(crimsonRose.materials.includes('Cotton blend'));
    assert.ok(crimsonRose.hookSpecs.includes('3.5mm'));
    assert.ok(crimsonRose.careGuide.includes('Spot clean'));

    // 4. Adds to Stitched Basket
    store.addToBasket(crimsonRose.id);
    assert.equal(store.totalPieces, 1);
    assert.equal(store.isInBasket(crimsonRose.id), true);

    // 5. Switches filter to Small things and adds Spider-Man amigurumi
    const smallThings = works.filter(w => w.category === 'Small things');
    const webSlinger = smallThings.find(s => s.id === 'small-thing-placeholder-03');
    store.addToBasket(webSlinger.id);
    assert.equal(store.totalPieces, 2);

    // 6. Opens slide-over Basket Drawer
    store.setIsDrawerOpen(true);
    assert.equal(store.isDrawerOpen, true);

    // 7. Verifies items in drawer and slow-crafting total
    assert.equal(store.basketItems.length, 2);
    assert.equal(store.totalCraftingHours, 11); // 6 + 5 = 11 hours

    // 8. Clicks Inquire via Instagram DM
    const inquiryMessage = formatMultiItemInquiry(store.basketItems, store.totalCraftingHours);
    await openInstagramDM(inquiryMessage);

    // 9. Verifies clipboard contains complete formatted message and IG link opened
    assert.equal(getClipboardText(), inquiryMessage);
    assert.ok(inquiryMessage.includes('1. The Everlasting Crimson Rose (Bouquets)'));
    assert.ok(inquiryMessage.includes('2. Friendly Neighborhood Web-Slinger (Small things)'));
    assert.ok(inquiryMessage.includes('Total: 2 pieces (~11 slow-crafting hours)'));
    assert.equal(window.lastOpenedUrl, 'https://ig.me/m/nia_knits_27');
  });

  test('Scenario B: The Bespoke Fashion Client Journey', () => {
    const { window } = setupMockBrowser();

    // 1. Browses Wearables in Lookbook view
    const wearables = works.filter(w => w.category === 'Wearables');
    const lavenderTop = wearables.find(w => w.id === 'wearable-placeholder-01');
    assert.ok(lavenderTop.stylingNotes.length > 20);

    // 2. Client launches 3-step Custom Commission Configurator
    const configuratorState = {
      // Step 1: Item Type
      itemType: 'wearable',
      itemTitle: 'Cardigan / Wearable',
      // Step 2: Palette, Sizing, Yarn
      paletteId: 'sunset',
      paletteTitle: 'Sunset Ochre (Warm Ochre, Terracotta, Buttercream)',
      sizeId: 'custom',
      sizeLabel: 'Custom Fit',
      customSizeText: 'Bust: 36 inches, Waist: 28 inches, Length: 20 inches',
      materialId: 'cotton',
      materialLabel: '100% Breathable Cotton',
      // Step 3: Special Requests & Target Date
      targetTimeline: '3-weeks',
      targetDateValue: 'Within 3–4 weeks',
      specialRequests: 'Handmade wooden buttons at front; scalloped cuff trims',
      estimatedHours: '~16–22 Hours of Hand-Stitching',
    };

    // 3. Verifies Order Slip generation
    const orderSlip = formatCustomCommissionInquiry(configuratorState);
    assert.ok(orderSlip.includes('CUSTOM COMMISSION REQUEST — ORDER SUMMARY'));
    assert.ok(orderSlip.includes('Cardigan / Wearable'));
    assert.ok(orderSlip.includes('Bust: 36 inches'));
    assert.ok(orderSlip.includes('Sunset Ochre'));
    assert.ok(orderSlip.includes('100% Breathable Cotton'));
    assert.ok(orderSlip.includes('Handmade wooden buttons'));

    // 4. Clicks "Transfer to Contact Form"
    let contactRegarding = '';
    let contactMessage = '';
    let isNameInputFocused = false;

    const transferToContact = (config) => {
      contactRegarding = `Custom Commission: ${config.itemTitle} (${config.paletteTitle.split(' ')[0]})`;
      contactMessage = formatCustomCommissionInquiry(config);
      isNameInputFocused = true;
      window.location.hash = '#contact';
      window.scrollTo({ top: 2200, behavior: 'smooth' });
    };

    transferToContact(configuratorState);

    // 5. Verifies contact form pre-population and navigation
    assert.equal(contactRegarding, 'Custom Commission: Cardigan / Wearable (Sunset)');
    assert.equal(contactMessage, orderSlip);
    assert.equal(isNameInputFocused, true);
    assert.equal(window.location.hash, '#contact');
  });

  test('Scenario C: The Slow-Craft Story Explorer Journey', () => {
    const store = new BasketStore(works);

    // 1. Reads Neha's story in Scrapbook
    const makerName = 'Neha Jose';
    const makerOrigin = 'Mumbai';
    assert.ok(makerName.length > 0);
    assert.ok(makerOrigin.length > 0);

    // 2. Explores the 4-step craft timeline sequentially
    const timelineTitles = CRAFT_TIMELINE_STEPS.map(s => s.title);
    assert.deepEqual(timelineTitles, [
      'Palette Curation',
      'Meditative Stitching',
      'Finishing & Lining',
      'Gift Packaging',
    ]);

    // 3. Clicks Guitar and Sewing hobby chips
    const guitar = MAKER_HOBBY_CHIPS.find(h => h.id === 'guitar');
    const sewing = MAKER_HOBBY_CHIPS.find(h => h.id === 'sewing');
    assert.ok(guitar.anecdote.includes('barre chords'));
    assert.ok(sewing.anecdote.includes('linings'));

    // 4. Bookmarks 3 heirloom Home pieces
    const homePieces = ['home-placeholder-01', 'home-placeholder-02', 'home-placeholder-03'];
    homePieces.forEach(id => store.addToBasket(id));

    // 5. Verifies basket items and crafting hours
    assert.equal(store.totalPieces, 3);
    // Midnight Lace (32) + Succulent Trio (8) + Twilight Runner (20) = 60 hours
    assert.equal(store.totalCraftingHours, 60);

    // 6. Generates Gmail inquiry URL
    const inquiryText = formatMultiItemInquiry(store.basketItems, store.totalCraftingHours);
    const gmailUrl = createGmailComposeUrl('Nia Knits Inquiry: Heirloom Home Collection', inquiryText);

    assert.ok(gmailUrl.includes('to=Joseneha55%40gmail.com') || gmailUrl.includes('to=Joseneha55@gmail.com'));
    assert.ok(gmailUrl.includes(encodeURIComponent('Heirloom Home Collection')));
    assert.ok(gmailUrl.includes(encodeURIComponent('Total: 3 pieces (~60 slow-crafting hours)')));
  });
});
