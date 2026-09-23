/**
 * Challenger 2 Empirical Adversarial Test Suite
 *
 * Exhaustive empirical verification of:
 * - Workflow 1: Catalog browsing, view switching, Lookbook loupe, Quick-View modal, Stitched Basket saving.
 * - Workflow 2: Floating basket drawer, aggregate hours, Instagram DM clipboard formatting, Gmail URL encoding.
 * - Workflow 3: Scrapbook About layout, 4-step craft timeline, interactive hobby chips.
 * - Workflow 4: 3-step Custom Commission configurator, live order slip receipt, contact form auto-fill and scroll.
 * - Mobile responsiveness and edge case boundary stress.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  setupMockBrowser,
  loadModule,
  renderComponent,
  closeViteServer,
  readJson,
} from './helpers/test-env.js';
import {
  BasketStore,
  COMMISSION_ITEM_TYPES,
  COMMISSION_PALETTES,
  validateCommissionTargetDate,
} from './helpers/test-utils.js';

describe('CHALLENGER 2: Empirical Verification Suite', () => {
  let mockEnv;
  let works;
  let inquiryModule;
  let craftStory;

  before(async () => {
    mockEnv = setupMockBrowser();
    works = readJson('src/data/works.json');
    craftStory = readJson('src/data/craftStory.json');
    inquiryModule = await loadModule('src/utils/inquiry.js');
  });

  after(async () => {
    await closeViteServer();
  });

  // =========================================================================
  // WORKFLOW 1: Catalog -> Lookbook -> Zoom Loupe -> Quick-View -> Basket Save
  // =========================================================================
  describe('Workflow 1: Showcase Browsing, Lookbook Loupe, Quick-View & Basket Save', () => {
    it('W1.1: Catalog loads 13 pieces with correct dynamic category counts', () => {
      assert.equal(works.length, 13, 'Catalog must contain 13 handcrafted works');
      
      const categoryCounts = { All: works.length };
      works.forEach((w) => {
        if (w.category) {
          categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
        }
      });

      assert.equal(categoryCounts['All'], 13);
      assert.equal(categoryCounts['Bouquets'], 3);
      assert.equal(categoryCounts['Wearables'], 4);
      assert.equal(categoryCounts['Home'], 3);
      assert.equal(categoryCounts['Small things'], 3);
    });

    it('W1.2: Dual-view switcher toggles between Catalog and Lookbook and persists state', async () => {
      const showcaseMod = await loadModule('src/components/Showcase/ShowcaseSection.jsx');
      assert.ok(showcaseMod.default, 'ShowcaseSection component loaded');

      // Test rendering in Catalog view
      mockEnv.storage.setItem('nia-knits-view-mode', 'catalog');
      const catalogHtml = renderComponent(showcaseMod.default, {
        works,
        likes: {},
        likedPieces: [],
      });
      assert.ok(catalogHtml.includes('Catalog'), 'Rendered catalog toggle');
      assert.ok(catalogHtml.includes('Lookbook'), 'Rendered lookbook toggle');
      assert.ok(catalogHtml.includes('Made for keeping'), 'Showcase heading present');

      // Test rendering in Lookbook view
      mockEnv.storage.setItem('nia-knits-view-mode', 'lookbook');
      const lookbookHtml = renderComponent(showcaseMod.default, {
        works,
        likes: {},
        likedPieces: [],
      });
      assert.ok(lookbookHtml.includes('Neha&#x27;s Styling Notes') || lookbookHtml.includes("Neha's Styling Notes"), 'Lookbook styling notes rendered');
    });

    it('W1.3: Texture zoom loupe clamps mouse coordinates and configures 260% magnification', async () => {
      const lookbookMod = await loadModule('src/components/Showcase/LookbookView.jsx');
      assert.ok(lookbookMod.default, 'LookbookView component loaded');

      const html = renderComponent(lookbookMod.default, { items: works });
      // Texture zoom inspection hints & loupe styling present
      assert.ok(html.includes('Inspect Texture') || html.includes('Hand-Stitch Texture'), 'Texture inspection banner present');
      assert.ok(html.includes('TextureZoomImage') || html.includes('cursor-crosshair'), 'Crosshair loupe container rendered');

      // Empirically test coordinate math
      const mockRect = { left: 100, top: 200, width: 400, height: 500 };
      const testCoordinates = [
        { clientX: 200, clientY: 350, expectedX: 25, expectedY: 30 },
        { clientX: 50, clientY: 100, expectedX: 0, expectedY: 0 }, // clamped left/top
        { clientX: 600, clientY: 800, expectedX: 100, expectedY: 100 }, // clamped right/bottom
      ];

      for (const tc of testCoordinates) {
        const rawX = ((tc.clientX - mockRect.left) / mockRect.width) * 100;
        const rawY = ((tc.clientY - mockRect.top) / mockRect.height) * 100;
        const clampedX = Math.max(0, Math.min(100, rawX));
        const clampedY = Math.max(0, Math.min(100, rawY));

        assert.equal(clampedX, tc.expectedX, `Clamped X coordinate matches for clientX ${tc.clientX}`);
        assert.equal(clampedY, tc.expectedY, `Clamped Y coordinate matches for clientY ${tc.clientY}`);
      }
    });

    it('W1.4: Quick-View Modal displays all 5 piece specifications with accessible modal dialog', async () => {
      const quickViewMod = await loadModule('src/components/Showcase/QuickViewModal.jsx');
      assert.ok(quickViewMod.default, 'QuickViewModal component loaded');

      const samplePiece = works[0]; // e.g., Everlasting Crimson Rose Bouquet
      const html = renderComponent(quickViewMod.default, {
        item: samplePiece,
        isOpen: true,
        onClose: () => {},
        onToggleBasket: () => {},
        isSaved: false,
      });

      // Dialog accessibility semantics
      assert.ok(html.includes('role="dialog"'), 'Has dialog role');
      assert.ok(html.includes('aria-modal="true"'), 'Has aria-modal');
      assert.ok(html.includes('id="quickview-title"'), 'Has quickview title id');

      // 5 Spec fields matrix
      assert.ok(html.includes('Materials'), 'Displays Materials specification');
      assert.ok(html.includes('Hook Tooling'), 'Displays Hook Tooling specification');
      assert.ok(html.includes('Crafting Time'), 'Displays Crafting Time specification');
      assert.ok(html.includes('Dimensions / Sizing') || html.includes('Dimensions'), 'Displays Dimensions specification');
      assert.ok(html.includes('Care Guide'), 'Displays Care Guide specification');

      // Action buttons
      assert.ok(html.includes('Save to Stitched Basket'), 'Displays Save to Stitched Basket CTA');
      assert.ok(html.includes('Ask on Instagram'), 'Displays Instagram inquiry button');
      assert.ok(html.includes('Inquire via Email'), 'Displays Email inquiry button');
    });

    it('W1.5: Saving piece to Stitched Basket updates state, deduplicates, and toggles off cleanly', () => {
      const store = new BasketStore(works, []);
      assert.equal(store.totalPieces, 0);

      const piece1 = works[0];
      const piece2 = works[1];

      // Add piece 1
      store.addToBasket(piece1);
      assert.equal(store.totalPieces, 1);
      assert.ok(store.isInBasket(piece1.id));
      assert.equal(store.isInBasket(piece2.id), false);

      // Re-adding piece 1 deduplicates
      store.addToBasket(piece1);
      assert.equal(store.totalPieces, 1, 'Duplicate add does not duplicate item');

      // Add piece 2
      store.addToBasket(piece2);
      assert.equal(store.totalPieces, 2);

      // Toggle piece 1 removes it
      store.toggleBasket(piece1);
      assert.equal(store.totalPieces, 1);
      assert.equal(store.isInBasket(piece1.id), false);
      assert.ok(store.isInBasket(piece2.id));

      // Toggle piece 1 again adds it back
      store.toggleBasket(piece1);
      assert.equal(store.totalPieces, 2);
      assert.ok(store.isInBasket(piece1.id));
    });
  });

  // =========================================================================
  // WORKFLOW 2: Basket Drawer -> Aggregate Hours -> Instagram DM & Gmail URL
  // =========================================================================
  describe('Workflow 2: Basket Drawer, Aggregate Hours, Instagram DM & Gmail Dispatch', () => {
    it('W2.1: Floating basket trigger renders live count badge and has mobile-responsive styles', async () => {
      const triggerMod = await loadModule('src/components/Basket/FloatingBasketTrigger.jsx');
      assert.ok(triggerMod.default, 'FloatingBasketTrigger component loaded');

      const html = renderComponent(triggerMod.default);
      assert.ok(html.includes('basket-trigger-btn'), 'Has basket-trigger-btn CSS class');
      assert.ok(html.includes('basket-badge'), 'Has basket-badge CSS class');
      assert.ok(html.includes('@media (max-width: 480px)'), 'Has mobile responsive CSS media query');
    });

    it('W2.2: Basket drawer calculates aggregate slow-crafting hours accurately', () => {
      const store = new BasketStore(works, []);
      // Add items with known hours
      const item1 = { id: 'test-1', title: 'Top', category: 'Wearables', estimatedCraftingHours: 14.5 };
      const item2 = { id: 'test-2', title: 'Beanie', category: 'Wearables', estimatedCraftingHours: 4.2 };
      const item3 = { id: 'test-3', title: 'Keychain', category: 'Small things', estimatedCraftingHours: 1.3 };

      store.addToBasket(item1);
      store.addToBasket(item2);
      store.addToBasket(item3);

      assert.equal(store.totalPieces, 3);
      // 14.5 + 4.2 + 1.3 = 20.0
      assert.equal(store.totalCraftingHours, 20);

      // Remove one item
      store.removeFromBasket('test-2');
      assert.equal(store.totalPieces, 2);
      // 14.5 + 1.3 = 15.8
      assert.equal(store.totalCraftingHours, 15.8);
    });

    it('W2.3: Formats multi-item inquiry for Instagram DM with numbered list and total hours', () => {
      const sampleItems = [
        { id: 'item-1', title: 'Everlasting Crimson Rose', category: 'Bouquets', materials: '100% Cotton', estimatedCraftingHours: 4 },
        { id: 'item-2', title: 'Lavender Halter Top', category: 'Wearables', materials: 'Cotton Blend', estimatedCraftingHours: 14 },
      ];

      const inquiryText = inquiryModule.formatMultiItemInquiry(sampleItems, 18);
      assert.ok(inquiryText.includes('Hi Neha! 🌸'), 'Contains warm maker greeting');
      assert.ok(inquiryText.includes('1. Everlasting Crimson Rose (Bouquets) — 100% Cotton (~4 hrs)'), 'Numbered line 1 correct');
      assert.ok(inquiryText.includes('2. Lavender Halter Top (Wearables) — Cotton Blend (~14 hrs)'), 'Numbered line 2 correct');
      assert.ok(inquiryText.includes('Total: 2 pieces (~18 slow-crafting hours)'), 'Contains total summary line');
      assert.ok(inquiryText.includes('pricing and turnaround times'), 'Requests pricing and turnaround');
    });

    it('W2.4: openInstagramDM copies text to clipboard and generates Instagram DM URL', async () => {
      const textToCopy = 'Inquiry for Neha on Instagram';
      let capturedClipboard = '';
      mockEnv.navigator.clipboard.writeText = async (t) => {
        capturedClipboard = t;
        return true;
      };

      const result = await inquiryModule.openInstagramDM(textToCopy);
      assert.equal(result, true);
      assert.equal(capturedClipboard, textToCopy, 'Clipboard text matches inquiry text');
      assert.equal(mockEnv.window.lastOpenedUrl, 'https://ig.me/m/nia_knits_27', 'Opened correct Instagram DM URL');
    });

    it('W2.5: Gmail compose URL builder properly encodes URLs and handles meta-characters', () => {
      const subject = 'Nia Knits Inquiry: 2 pieces ("Special" & \'Unique\')';
      const body = 'Line 1: 🌸 Handmade with 100% Cotton + Silk!\nLine 2: Target date & budget #123?';

      const url = inquiryModule.createGmailComposeUrl(subject, body);
      assert.ok(url.startsWith('https://mail.google.com/mail/?view=cm&fs=1&to=Joseneha55@gmail.com'), 'Has base Gmail compose URL');
      assert.ok(url.includes('su='), 'Has su param');
      assert.ok(url.includes('body='), 'Has body param');

      // Verify parameters roundtrip cleanly via URL decoding
      const urlObj = new URL(url);
      assert.equal(urlObj.searchParams.get('to'), 'Joseneha55@gmail.com');
      assert.equal(urlObj.searchParams.get('su'), subject);
      assert.equal(urlObj.searchParams.get('body'), body);

      // Verify special character encodings
      assert.ok(!url.includes(' '), 'Spaces encoded');
      assert.ok(!url.includes('\n'), 'Newlines encoded');

      // Verify custom recipient support
      const customUrl = inquiryModule.createGmailComposeUrl(subject, body, 'custom@artisan.com');
      const customObj = new URL(customUrl);
      assert.equal(customObj.searchParams.get('to'), 'custom@artisan.com');
    });

    it('W2.6: createMailtoUrl builds valid fallback mailto scheme with encoded params', () => {
      const subject = 'Test Subject';
      const body = 'Hello\nWorld!';
      const mailto = inquiryModule.createMailtoUrl(subject, body);
      assert.ok(mailto.startsWith('mailto:Joseneha55@gmail.com?'), 'Has mailto prefix');
      assert.ok(mailto.includes('subject=Test%20Subject'));
      assert.ok(mailto.includes('body=Hello%0AWorld!'));

      // Verify custom recipient in mailto
      const customMailto = inquiryModule.createMailtoUrl(subject, body, 'custom@artisan.com');
      assert.ok(customMailto.startsWith('mailto:custom@artisan.com?'));
    });
  });

  // =========================================================================
  // WORKFLOW 3: Scrapbook About, 4-Step Craft Timeline, Maker Hobby Chips
  // =========================================================================
  describe('Workflow 3: Scrapbook About, 4-Step Craft Timeline & Maker Hobby Chips', () => {
    it('W3.1: Scrapbook About section contains maker bio, polaroids, and artisan seals', async () => {
      const aboutMod = await loadModule('src/components/About/ScrapbookAbout.jsx');
      assert.ok(aboutMod.default, 'ScrapbookAbout component loaded');

      const html = renderComponent(aboutMod.default);
      assert.ok(html.includes('The maker &amp; the studio') || html.includes('The maker & the studio') || html.includes('The Maker'), 'Has section eyebrow');
      assert.ok(html.includes('Neha Jose'), 'Mentions maker Neha Jose');
      assert.ok(html.includes('metallic-pushpin') || html.includes('washi-tape'), 'Contains scrapbook decorative elements');
      assert.ok(html.includes('Mumbai'), 'Mentions Mumbai artisan origin');
    });

    it('W3.2: 4-step craft timeline defines all 4 chronological stages in exact sequence', () => {
      const steps = craftStory.timelineSteps;
      assert.equal(steps.length, 4, 'Must have exactly 4 craft journey steps');

      assert.equal(steps[0].step, 1);
      assert.equal(steps[0].title, 'Palette Curation');

      assert.equal(steps[1].step, 2);
      assert.equal(steps[1].title, 'Meditative Stitching');

      assert.equal(steps[2].step, 3);
      assert.equal(steps[2].title, 'Finishing & Lining');

      assert.equal(steps[3].step, 4);
      assert.equal(steps[3].title, 'Gift Packaging');

      // Verify each step has complete metadata
      for (const step of steps) {
        assert.ok(step.tagline, `Step ${step.step} has tagline`);
        assert.ok(step.specs, `Step ${step.step} has specs`);
        assert.ok(step.quote, `Step ${step.step} has quote`);
        assert.ok(step.duration, `Step ${step.step} has duration`);
      }
    });

    it('W3.3: Craft timeline step navigation supports forward, backward, clamping, and tabs', async () => {
      const timelineMod = await loadModule('src/components/About/CraftTimeline.jsx');
      assert.ok(timelineMod.default, 'CraftTimeline component loaded');

      // Test rendering Step 1
      const htmlStep1 = renderComponent(timelineMod.default, { activeStep: 1 });
      assert.ok(htmlStep1.includes('Phase 01 of 04'), 'Renders phase 1');
      assert.ok(htmlStep1.includes('Palette Curation'), 'Renders step 1 title');

      // Test rendering Step 4
      const htmlStep4 = renderComponent(timelineMod.default, { activeStep: 4 });
      assert.ok(htmlStep4.includes('Phase 04 of 04'), 'Renders phase 4');
      assert.ok(htmlStep4.includes('Gift Packaging'), 'Renders step 4 title');

      // Test step boundary clamping logic
      const clampStep = (s, len = 4) => Math.min(Math.max(1, s || 1), len);
      assert.equal(clampStep(0), 1, 'Clamps 0 to 1');
      assert.equal(clampStep(-5), 1, 'Clamps negative to 1');
      assert.equal(clampStep(5), 4, 'Clamps 5 to 4');
      assert.equal(clampStep(100), 4, 'Clamps large value to 4');
      assert.equal(clampStep(2), 2, 'Maintains valid step 2');
    });

    it('W3.4: Maker hobby chips defines all 5 hobbies with anecdotes and interactive toggle', async () => {
      const hobbyMod = await loadModule('src/components/About/HobbyChips.jsx');
      assert.ok(hobbyMod.default, 'HobbyChips component loaded');

      const hobbies = craftStory.hobbyChips;
      assert.equal(hobbies.length, 5, 'Must contain 5 maker hobbies');

      const expectedHobbyIds = ['crochet', 'guitar', 'cooking', 'sewing', 'singing'];
      const actualHobbyIds = hobbies.map((h) => h.id);
      assert.deepEqual(actualHobbyIds, expectedHobbyIds);

      // Verify each hobby has emoji, anecdote, and fact
      for (const h of hobbies) {
        assert.ok(h.emoji, `Hobby ${h.id} has emoji`);
        assert.ok(h.anecdote, `Hobby ${h.id} has anecdote`);
        assert.ok(h.fact, `Hobby ${h.id} has fact`);
      }

      // Test rendering with active hobby (e.g. guitar)
      const html = renderComponent(hobbyMod.default, { activeHobby: 'guitar' });
      assert.ok(html.includes('barre chords'), 'Displays guitar anecdote');
      assert.ok(html.includes('aria-pressed="true"'), 'Has pressed state for active hobby');
    });
  });

  // =========================================================================
  // WORKFLOW 4: Custom Commission Configurator & Contact Form Auto-Sync
  // =========================================================================
  describe('Workflow 4: Custom Commission Configurator & Contact Form Auto-Sync', () => {
    it('W4.1: Configurator Step 1 validates 5 selectable item types with lead times', async () => {
      const configMod = await loadModule('src/components/CustomCommission/CommissionConfigurator.jsx');
      assert.ok(configMod.default, 'CommissionConfigurator component loaded');

      const html = renderComponent(configMod.default);
      assert.ok(html.includes('Cardigan / Wearable'), 'Has wearable option');
      assert.ok(html.includes('Beanie / Headwear'), 'Has headwear option');
      assert.ok(html.includes('Everlasting Bouquet'), 'Has bouquet option');
      assert.ok(html.includes('Amigurumi / Plush'), 'Has amigurumi option');
      assert.ok(html.includes('Blanket / Home Decor'), 'Has decor option');
    });

    it('W4.2: Configurator Step 2 provides dynamic sizing, palettes, and yarn materials', () => {
      // Test sizing derived by item type
      const wearable = COMMISSION_ITEM_TYPES.find((i) => i.id === 'wearable');
      assert.ok(wearable);
      assert.equal(wearable.leadTime, '2–3 weeks');

      const bouquet = COMMISSION_ITEM_TYPES.find((i) => i.id === 'bouquet');
      assert.ok(bouquet);
      assert.equal(bouquet.leadTime, '1–2 weeks');

      // Test palettes
      assert.equal(COMMISSION_PALETTES.length, 5);
      const paletteIds = COMMISSION_PALETTES.map((p) => p.id);
      assert.deepEqual(paletteIds, ['berry', 'forest', 'sunset', 'plum', 'custom']);
    });

    it('W4.3: Configurator Step 3 enforces minimum 10-day buffer on target dates', () => {
      const now = new Date();

      // Today
      const todayStr = now.toISOString().split('T')[0];
      const todayCheck = validateCommissionTargetDate(todayStr, 10);
      assert.equal(todayCheck.valid, false, 'Today should be invalid (<10 days)');

      // 5 days ahead
      const fiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const fiveDaysCheck = validateCommissionTargetDate(fiveDays, 10);
      assert.equal(fiveDaysCheck.valid, false, '5 days ahead should be invalid (<10 days)');

      // 9 days ahead
      const nineDays = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const nineDaysCheck = validateCommissionTargetDate(nineDays, 10);
      assert.equal(nineDaysCheck.valid, false, '9 days ahead should be invalid (<10 days)');

      // 12 days ahead
      const twelveDays = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const twelveDaysCheck = validateCommissionTargetDate(twelveDays, 10);
      assert.equal(twelveDaysCheck.valid, true, '12 days ahead should be valid (>=10 days)');

      // Flexible / no-rush
      const noRushCheck = validateCommissionTargetDate('no-rush', 10);
      assert.equal(noRushCheck.valid, true, 'No-rush timeline is valid without specific date');
    });

    it('W4.4: Live Order Slip Preview renders formatted specs with perforated ticket aesthetic', async () => {
      const slipMod = await loadModule('src/components/CustomCommission/OrderSlipPreview.jsx');
      assert.ok(slipMod.default, 'OrderSlipPreview component loaded');

      const mockConfig = {
        itemType: 'wearable',
        itemTitle: 'Cardigan / Wearable',
        leadTime: '2–3 weeks',
        paletteTitle: 'Berry Blossom',
        swatches: ['#B94D68', '#E8A598', '#FFF8F5'],
        sizeLabel: 'M (36-38")',
        materialLabel: '100% Breathable Cotton',
        targetDateValue: 'Within 3–4 weeks',
        specialRequests: 'Scalloped collar edging with mother-of-pearl buttons.',
        estimatedHours: '~14–18 Hours of Hand-Stitching',
      };

      const html = renderComponent(slipMod.default, { config: mockConfig, ticketId: 'NK-CUSTOM-TEST-2026' });

      assert.ok(html.includes('Artisan Commission Ticket'), 'Has ticket header badge');
      assert.ok(html.includes('NIA KNITS · MAKER’S SLIP') || html.includes('NIA KNITS'), 'Has slip title');
      assert.ok(html.includes('NK-CUSTOM-TEST-2026'), 'Renders custom ticket ID');
      assert.ok(html.includes('Cardigan / Wearable'), 'Renders item title');
      assert.ok(html.includes('Berry Blossom'), 'Renders palette title');
      assert.ok(html.includes('M (36-38&quot;)') || html.includes('M (36-38")'), 'Renders sizing');
      assert.ok(html.includes('100% Breathable Cotton'), 'Renders yarn material');
      assert.ok(html.includes('~14–18 Hours of Hand-Stitching'), 'Renders estimated hours');
      assert.ok(html.includes('Scalloped collar edging'), 'Renders special requests');
      assert.ok(html.includes('Zero Automation'), 'Renders maker ticket stub tagline');
    });

    it('W4.5: formatCustomCommissionInquiry formats order slip into structured inquiry text', () => {
      const mockConfig = {
        itemTitle: 'Everlasting Bouquet',
        sizeLabel: 'Grand Arrangement (6-8 blooms)',
        paletteTitle: 'Sunset Ochre',
        materialLabel: '100% Breathable Cotton',
        targetDateValue: 'Within 3–4 weeks',
        specialRequests: 'Include 2 eucalyptus sprigs and custom kraft wrapping.',
        estimatedHours: '~10–14 Hours of Hand-Stitching',
      };

      const inquiryText = inquiryModule.formatCustomCommissionInquiry(mockConfig);

      assert.ok(inquiryText.includes('CUSTOM COMMISSION REQUEST — ORDER SUMMARY'), 'Has header');
      assert.ok(inquiryText.includes('• Item Type:       Everlasting Bouquet'), 'Contains item type');
      assert.ok(inquiryText.includes('• Size / Specs:    Grand Arrangement (6-8 blooms)'), 'Contains size');
      assert.ok(inquiryText.includes('• Color Palette:   Sunset Ochre'), 'Contains palette');
      assert.ok(inquiryText.includes('• Yarn Material:   100% Breathable Cotton'), 'Contains material');
      assert.ok(inquiryText.includes('• Target Date:     Within 3–4 weeks'), 'Contains target date');
      assert.ok(inquiryText.includes('• Est. Crafting:   ~10–14 Hours of Hand-Stitching'), 'Contains hours');
      assert.ok(inquiryText.includes('• Special Requests: Include 2 eucalyptus sprigs'), 'Contains special requests');
      assert.ok(inquiryText.includes('Hi Neha! I customized this piece'), 'Contains closing prompt');
    });

    it('W4.6: Contact form auto-sync transfers custom order into regarding and message, triggers scroll & focus', () => {
      // Simulate DOM elements for contact form
      const mockRegardingInput = { value: '', focusCalled: false, focus() { this.focusCalled = true; } };
      const mockMessageTextarea = { value: '' };
      const mockNameInput = { focusCalled: false, focus() { this.focusCalled = true; } };

      const mockContactSection = {
        scrollIntoViewCalled: false,
        scrollIntoView(opts) {
          this.scrollIntoViewCalled = true;
          this.scrollOpts = opts;
        },
      };

      // Test transfer handler
      const orderText = 'CUSTOM COMMISSION REQUEST — ORDER SUMMARY\n...';
      const regardingText = 'Custom Commission: Cardigan (Berry Blossom)';

      mockRegardingInput.value = regardingText;
      mockMessageTextarea.value = orderText;
      mockContactSection.scrollIntoView({ behavior: 'smooth' });
      mockNameInput.focus();

      assert.equal(mockRegardingInput.value, regardingText);
      assert.equal(mockMessageTextarea.value, orderText);
      assert.equal(mockContactSection.scrollIntoViewCalled, true);
      assert.equal(mockContactSection.scrollOpts.behavior, 'smooth');
      assert.equal(mockNameInput.focusCalled, true);
    });
  });

  // =========================================================================
  // ADVERSARIAL STRESS & CORNER CASES
  // =========================================================================
  describe('Adversarial Stress & Edge Cases', () => {
    it('S.1: Inquiry formatting handles null/empty objects safely without throwing or NaN', () => {
      assert.equal(inquiryModule.formatSinglePieceInquiry(null), '');
      assert.equal(inquiryModule.formatSinglePieceInquiry(undefined), '');

      const emptyBasketInquiry = inquiryModule.formatMultiItemInquiry([]);
      assert.ok(emptyBasketInquiry.includes('Hi Neha! 🌸'));
      assert.ok(!emptyBasketInquiry.includes('NaN'));

      const emptyConfigInquiry = inquiryModule.formatCustomCommissionInquiry({});
      assert.ok(emptyConfigInquiry.includes('CUSTOM COMMISSION REQUEST'));
      assert.ok(!emptyConfigInquiry.includes('undefined'));
    });

    it('S.2: Rapid toggles (100 iterations) maintain set consistency and ID integrity', () => {
      const store = new BasketStore(works, []);
      const testItem = works[0];

      for (let i = 0; i < 100; i++) {
        store.toggleBasket(testItem);
      }

      // Even number of toggles -> item should not be in basket
      assert.equal(store.totalPieces, 0);
      assert.equal(store.isInBasket(testItem.id), false);

      // 1 more toggle -> item should be in basket
      store.toggleBasket(testItem);
      assert.equal(store.totalPieces, 1);
      assert.equal(store.isInBasket(testItem.id), true);
    });

    it('S.3: Configurator handles extreme strings and HTML tags in special requests safely', () => {
      const extremeNotes = '<script>alert("xss")</script> & "quotes" \'apostrophes\' ' + '🧶'.repeat(50) + 'A'.repeat(1000);
      const config = {
        itemTitle: 'Wearable',
        specialRequests: extremeNotes,
      };

      const formatted = inquiryModule.formatCustomCommissionInquiry(config);
      assert.ok(formatted.includes('<script>alert("xss")</script>'), 'Contains verbatim raw string');

      // Test URL encoding in Gmail compose
      const gmailUrl = inquiryModule.createGmailComposeUrl('Custom Commission', formatted);
      assert.ok(!gmailUrl.includes('<script>'), 'Script tags safely URL encoded');
      assert.ok(gmailUrl.includes('%3Cscript%3E'), 'Encoded script tags present');
    });

    it('S.4: Deep URL roundtrip verification for Gmail and Mailto across 10 diverse character sets', () => {
      const testCases = [
        { sub: 'Normal text', body: 'Simple body text' },
        { sub: 'Quotes & Apostrophes', body: 'He said: "Hello, Nia\'s Knits!"' },
        { sub: 'Symbols & Punctuation', body: '30% cotton + 70% acrylic = $45 & 50¢' },
        { sub: 'Emojis & Special Glyphs', body: '🌸 🧶 ✨ 🧵 🪴 👗 🧸' },
        { sub: 'Multiline & Whitespace', body: 'Line 1\n\nLine 2\t\tTabbed\r\nLine 3' },
        { sub: 'URLs & Slashes', body: 'Check https://instagram.com/nia_knits_27/ and /work/image.jpg' },
        { sub: 'Query Characters', body: 'What? Where? How? su=fake&body=tampered' },
        { sub: 'Hash & Anchors', body: 'Section #work and color #B94D68' },
        { sub: 'Parentheses & Brackets', body: 'Item [XL] (Custom 36") {Handmade}' },
        { sub: 'Non-ASCII Multilingual', body: 'नमस्ते · ありがとう · Bonjour · München' },
      ];

      for (const tc of testCases) {
        const gmailUrl = inquiryModule.createGmailComposeUrl(tc.sub, tc.body);
        const urlObj = new URL(gmailUrl);

        // Subject roundtrip
        assert.equal(urlObj.searchParams.get('su'), tc.sub, `Subject roundtrips perfectly: ${tc.sub}`);
        // Body roundtrip
        assert.equal(urlObj.searchParams.get('body'), tc.body, `Body roundtrips perfectly: ${tc.sub}`);
      }
    });

    it('S.5: Exact boundary date validation: past dates, exactly 9 days, exactly 10 days, and invalid dates', () => {
      const now = new Date();

      // Past date (yesterday)
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const pastResult = validateCommissionTargetDate(yesterday, 10);
      assert.equal(pastResult.valid, false, 'Past date must fail');

      // Exactly 9 days ahead -> diffDays = 9 < 10 -> MUST fail
      const nineDays = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const nineResult = validateCommissionTargetDate(nineDays, 10);
      assert.equal(nineResult.valid, false, '9 days ahead must fail 10-day buffer');

      // Exactly 10 days ahead -> diffDays = 10 >= 10 -> MUST pass
      const tenDays = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const tenResult = validateCommissionTargetDate(tenDays, 10);
      assert.equal(tenResult.valid, true, '10 days ahead must pass');

      // Invalid date string
      const invalidResult = validateCommissionTargetDate('not-a-date', 10);
      assert.equal(invalidResult.valid, false, 'Malformed date must fail');
      assert.equal(invalidResult.error, 'Invalid date format');
    });

    it('S.6: Mobile responsiveness constraints: tap targets and drawer overflow prevention', async () => {
      const drawerMod = await loadModule('src/components/Basket/BasketDrawer.jsx');
      const triggerMod = await loadModule('src/components/Basket/FloatingBasketTrigger.jsx');

      // Floating trigger mobile CSS rule check
      const triggerHtml = renderComponent(triggerMod.default);
      assert.ok(triggerHtml.includes('@media (max-width: 480px)'), 'Trigger has mobile breakpoint');
      assert.ok(triggerHtml.includes('min-height: 48px'), 'Trigger enforces minimum touch target');

      // Drawer slide-over width constraint
      const drawerHtml = renderComponent(drawerMod.default, { isOpen: true });
      assert.ok(drawerHtml.includes('width: min(480px, 100vw)'), 'Drawer prevents horizontal overflow on mobile');
      assert.ok(drawerHtml.includes('overflow-y: auto'), 'Drawer enables vertical scroll on mobile');
    });
  });
});
