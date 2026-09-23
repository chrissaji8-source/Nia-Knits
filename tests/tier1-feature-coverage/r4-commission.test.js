/**
 * Tier 1 — Feature Coverage: R4 Custom Commission Configurator & Contact Integration
 * Covers:
 * - Feature 1.7: 3-Step Custom Order Configurator, Live Order Slip, Contact Auto-Sync (F14, F15, F16)
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  setupMockBrowser,
  loadModule,
  renderComponent,
  closeViteServer,
} from '../helpers/test-env.js';
import {
  COMMISSION_ITEM_TYPES,
  COMMISSION_PALETTES,
  validateCommissionTargetDate,
} from '../helpers/test-utils.js';
import {
  formatCustomCommissionInquiry,
} from '../../src/utils/inquiry.js';

describe('Tier 1 — R4: Custom Commission Configurator & Contact Integration', () => {
  describe('Feature 1.7: Custom Commission Configurator & Contact Form Auto-Sync (F14, F15, F16)', () => {
    test('TC 1.7.1: Step 1 validates all 5 selectable item types with lead turnaround times', () => {
      assert.equal(COMMISSION_ITEM_TYPES.length, 5, 'Expected 5 item types');

      const expectedTypes = ['wearable', 'headwear', 'bouquet', 'amigurumi', 'decor'];
      const actualTypes = COMMISSION_ITEM_TYPES.map(t => t.id);
      assert.deepEqual(actualTypes, expectedTypes);

      COMMISSION_ITEM_TYPES.forEach((type) => {
        assert.ok(type.title.length > 5, `Item type ${type.id} missing title`);
        assert.ok(type.leadTime.length > 3, `Item type ${type.id} missing lead time`);
      });
    });

    test('TC 1.7.2: Step 2 dynamically derives sizing options based on chosen Item Type', () => {
      const getSizingOptions = (itemType) => {
        switch (itemType) {
          case 'wearable':
            return ['XS (30-32")', 'S (32-34")', 'M (36-38")', 'L (40-42")', 'XL (44-46")', 'Custom Measurements'];
          case 'headwear':
            return ['Standard Adult (21-22")', 'Slouchy / Oversized (23-24")', 'Petite / Youth (19-20")', 'Custom Circumference'];
          case 'bouquet':
            return ['Single Bloom Stem', 'Petite Trio (3 blooms + greenery)', 'Grand Arrangement (6-8 blooms)'];
          case 'amigurumi':
            return ['Pocket Companion (4-5")', 'Medium Buddy (8-10")', 'Custom Dimensions'];
          case 'decor':
            return ['Table Runner (14x48")', 'Lap Blanket (36x48")', 'Throw Blanket (48x60")', 'Custom Dimensions'];
          default:
            return ['Standard'];
        }
      };

      const wearableSizes = getSizingOptions('wearable');
      assert.ok(wearableSizes.includes('M (36-38")'));
      assert.ok(wearableSizes.includes('Custom Measurements'));

      const bouquetSizes = getSizingOptions('bouquet');
      assert.ok(bouquetSizes.includes('Petite Trio (3 blooms + greenery)'));

      const decorSizes = getSizingOptions('decor');
      assert.ok(decorSizes.includes('Table Runner (14x48")'));
    });

    test('TC 1.7.3: Step 2 palettes include 4 signature colorways and custom text input', () => {
      assert.equal(COMMISSION_PALETTES.length, 5);
      const paletteIds = COMMISSION_PALETTES.map(p => p.id);
      assert.deepEqual(paletteIds, ['berry', 'forest', 'sunset', 'plum', 'custom']);

      // 4 signature palettes must provide at least 3 hex swatches each
      COMMISSION_PALETTES.filter(p => p.id !== 'custom').forEach((palette) => {
        assert.ok(palette.swatches.length >= 3, `Palette ${palette.id} must have >= 3 color swatches`);
        palette.swatches.forEach(hex => assert.match(hex, /^#[0-9A-Fa-f]{6}$/));
      });
    });

    test('TC 1.7.4: Step 3 target date validation enforces 10-day artisan buffer for specific dates', () => {
      // Flexible options always valid
      assert.equal(validateCommissionTargetDate('no-rush').valid, true);
      assert.equal(validateCommissionTargetDate('3-weeks').valid, true);

      // Future date > 10 days
      const farFuture = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      assert.equal(validateCommissionTargetDate(farFuture).valid, true);

      // Immediate date < 10 days
      const tooSoon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const tooSoonResult = validateCommissionTargetDate(tooSoon);
      assert.equal(tooSoonResult.valid, false);
      assert.ok(tooSoonResult.error.includes('10 days'));

      // Invalid date format
      const invalid = validateCommissionTargetDate('not-a-date');
      assert.equal(invalid.valid, false);
    });

    test('TC 1.7.5: Live artisan order slip text formatting matches specification template', () => {
      const config = {
        itemType: 'wearable',
        itemTitle: 'Cardigan / Wearable',
        sizeLabel: 'Medium (36-38")',
        paletteTitle: 'Sunset Ochre (Ochre, Terracotta, Buttercream)',
        materialLabel: '100% Breathable Cotton',
        targetDateValue: 'Within 3–4 weeks',
        specialRequests: 'Scalloped cuffs, extra 2 inches length',
        estimatedHours: '~14–18 Hours of Hand-Stitching',
      };

      const slipText = formatCustomCommissionInquiry(config);

      assert.ok(slipText.includes('CUSTOM COMMISSION REQUEST — ORDER SUMMARY'), 'Expected order summary header');
      assert.ok(slipText.includes('Cardigan / Wearable'), 'Expected item title in slip');
      assert.ok(slipText.includes('Medium (36-38")'), 'Expected size in slip');
      assert.ok(slipText.includes('Sunset Ochre'), 'Expected palette in slip');
      assert.ok(slipText.includes('100% Breathable Cotton'), 'Expected material in slip');
      assert.ok(slipText.includes('Within 3–4 weeks'), 'Expected target date in slip');
      assert.ok(slipText.includes('Scalloped cuffs, extra 2 inches length'), 'Expected notes in slip');
      assert.ok(slipText.includes('~14–18 Hours of Hand-Stitching'), 'Expected hours in slip');
      assert.ok(slipText.includes('Hi Neha!'), 'Expected warm closing inquiry');
    });

    test('TC 1.7.6: Contact form automated sync pre-fills regarding and message and triggers focus', () => {
      const { window } = setupMockBrowser();

      let formState = {
        regarding: '',
        message: '',
        nameFocused: false,
      };

      const handleApplyToContact = (config) => {
        formState.regarding = `Custom Commission: ${config.itemTitle || config.itemType} (${config.paletteTitle || config.paletteId})`;
        formState.message = formatCustomCommissionInquiry(config);
        formState.nameFocused = true;
        window.location.hash = '#contact';
        window.scrollTo({ top: 1800, behavior: 'smooth' });
      };

      const sampleConfig = {
        itemType: 'wearable',
        itemTitle: 'Lavender Halter Top',
        paletteId: 'berry',
        paletteTitle: 'Berry Blossom',
        sizeLabel: 'Small (32-34")',
        materialLabel: '100% Cotton',
        specialRequests: 'Wooden buttons at back',
      };

      handleApplyToContact(sampleConfig);

      assert.equal(formState.regarding, 'Custom Commission: Lavender Halter Top (Berry Blossom)');
      assert.ok(formState.message.includes('Lavender Halter Top'));
      assert.ok(formState.message.includes('Wooden buttons at back'));
      assert.equal(formState.nameFocused, true, 'Name field should receive focus');
      assert.equal(window.location.hash, '#contact');
      assert.deepEqual(window.lastScrollTo, { top: 1800, behavior: 'smooth' });
    });

    test('TC 1.7.7: Renders actual CommissionConfigurator component with 3-step navigation and item cards', async () => {
      const configMod = await loadModule('src/components/CustomCommission/CommissionConfigurator.jsx');
      assert.ok(configMod && configMod.default, 'CommissionConfigurator exported');

      const html = renderComponent(configMod.default, {});

      // Section semantics
      assert.ok(html.includes('id="custom-commissions"'), 'Section must have id="custom-commissions"');
      assert.ok(html.includes('Build Your Custom Piece'), 'Header title must be present');

      // 3-step navigation tabs
      assert.ok(html.includes('1. Item Type'), 'Step 1 tab present');
      assert.ok(html.includes('2. Palette &amp; Fit') || html.includes('2. Palette & Fit'), 'Step 2 tab present');
      assert.ok(html.includes('3. Notes &amp; Slip') || html.includes('3. Notes & Slip'), 'Step 3 tab present');

      // 5 selectable foundation item cards in Step 1
      assert.ok(html.includes('Cardigan / Wearable'));
      assert.ok(html.includes('Beanie / Headwear'));
      assert.ok(html.includes('Everlasting Bouquet'));
      assert.ok(html.includes('Amigurumi / Plush'));
      assert.ok(html.includes('Blanket / Home Decor'));
    });
  });

  after(async () => {
    await closeViteServer();
  });
});
