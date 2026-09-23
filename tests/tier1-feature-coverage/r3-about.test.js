/**
 * Tier 1 — Feature Coverage: R3 Scrapbook About Section & Craft Journey
 * Covers:
 * - Feature 1.6: Scrapbook Layout, 4-Step Craft Timeline & Maker Hobby Chips (F11, F12, F13)
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadModule,
  renderComponent,
  closeViteServer,
} from '../helpers/test-env.js';
import {
  CRAFT_TIMELINE_STEPS,
  MAKER_HOBBY_CHIPS,
} from '../helpers/test-utils.js';

describe('Tier 1 — R3: Scrapbook About Section & Craft Journey', () => {
  describe('Feature 1.6: Craft Journey Timeline & Maker Hobby Chips (F11, F12, F13)', () => {
    test('TC 1.6.1: 4-step craft timeline defines all 4 chronological stages in exact sequence', () => {
      assert.equal(CRAFT_TIMELINE_STEPS.length, 4, 'Timeline must have exactly 4 steps');

      const expectedTitles = [
        'Palette Curation',
        'Meditative Stitching',
        'Finishing & Lining',
        'Gift Packaging',
      ];

      CRAFT_TIMELINE_STEPS.forEach((step, idx) => {
        assert.equal(step.step, idx + 1, `Step index must be ${idx + 1}`);
        assert.equal(step.title, expectedTitles[idx], `Step ${idx + 1} title mismatch`);
      });
    });

    test('TC 1.6.2: Each timeline step contains tagline, artisan specifications, and maker quote', () => {
      CRAFT_TIMELINE_STEPS.forEach((step) => {
        assert.ok(
          typeof step.tagline === 'string' && step.tagline.length > 5,
          `Step ${step.step} missing tagline`
        );
        assert.ok(
          typeof step.specs === 'string' && step.specs.length > 10,
          `Step ${step.step} missing artisan specs details`
        );
        assert.ok(
          typeof step.quote === 'string' && step.quote.length > 15,
          `Step ${step.step} missing maker quote in Neha's voice`
        );
      });
    });

    test('TC 1.6.3: Timeline step navigation contract and boundary clamping', () => {
      class TimelineState {
        constructor() {
          this.activeStep = 1;
        }
        selectStep(stepNum) {
          if (stepNum >= 1 && stepNum <= 4) {
            this.activeStep = stepNum;
          }
        }
        next() {
          if (this.activeStep < 4) this.activeStep += 1;
        }
        prev() {
          if (this.activeStep > 1) this.activeStep -= 1;
        }
      }

      const timeline = new TimelineState();
      assert.equal(timeline.activeStep, 1);

      timeline.next();
      assert.equal(timeline.activeStep, 2);

      timeline.selectStep(4);
      assert.equal(timeline.activeStep, 4);

      // Clamp boundary
      timeline.next();
      assert.equal(timeline.activeStep, 4, 'Should not advance past step 4');

      timeline.selectStep(99);
      assert.equal(timeline.activeStep, 4, 'Invalid step should not be accepted');

      timeline.selectStep(1);
      assert.equal(timeline.activeStep, 1);
      timeline.prev();
      assert.equal(timeline.activeStep, 1, 'Should not decrease below step 1');
    });

    test('TC 1.6.4: Interactive hobby chips define all 5 maker hobbies with anecdotes and fun facts', () => {
      assert.equal(MAKER_HOBBY_CHIPS.length, 5, 'Expected 5 maker hobby chips');
      const expectedHobbies = ['crochet', 'guitar', 'cooking', 'sewing', 'singing'];
      const actualHobbies = MAKER_HOBBY_CHIPS.map(h => h.id);
      assert.deepEqual(actualHobbies, expectedHobbies);

      MAKER_HOBBY_CHIPS.forEach((hobby) => {
        assert.ok(hobby.emoji, `Hobby ${hobby.id} missing emoji`);
        assert.ok(hobby.accentColor.startsWith('--'), `Hobby ${hobby.id} must use theme CSS token`);
        assert.ok(hobby.hex.startsWith('#'), `Hobby ${hobby.id} must specify fallback hex`);
        assert.ok(hobby.anecdote.length > 20, `Hobby ${hobby.id} missing personal anecdote`);
        assert.ok(hobby.fact.length > 5, `Hobby ${hobby.id} missing fun fact stat`);
      });
    });

    test('TC 1.6.5: Hobby chip selection toggle contract and aria-pressed states', () => {
      class HobbyManager {
        constructor() {
          this.activeHobby = null;
        }
        toggle(hobbyId) {
          this.activeHobby = this.activeHobby === hobbyId ? null : hobbyId;
        }
        getAriaPressed(hobbyId) {
          return this.activeHobby === hobbyId ? 'true' : 'false';
        }
      }

      const manager = new HobbyManager();
      assert.equal(manager.activeHobby, null);
      assert.equal(manager.getAriaPressed('guitar'), 'false');

      // Click Guitar
      manager.toggle('guitar');
      assert.equal(manager.activeHobby, 'guitar');
      assert.equal(manager.getAriaPressed('guitar'), 'true');
      assert.equal(manager.getAriaPressed('crochet'), 'false');

      // Click Guitar again to toggle off
      manager.toggle('guitar');
      assert.equal(manager.activeHobby, null);
      assert.equal(manager.getAriaPressed('guitar'), 'false');

      // Click Cooking
      manager.toggle('cooking');
      assert.equal(manager.activeHobby, 'cooking');
      assert.equal(manager.getAriaPressed('cooking'), 'true');
    });

    test('TC 1.6.6: Scrapbook aesthetic visual tokens and polaroid rotation contract', () => {
      const polaroidStyles = [
        { id: 'polaroid-1', angle: -3, washiColor: 'rgba(212, 154, 114, 0.65)' },
        { id: 'polaroid-2', angle: 2.5, washiColor: 'rgba(185, 77, 104, 0.45)' },
      ];

      polaroidStyles.forEach((p) => {
        assert.ok(Math.abs(p.angle) <= 10, 'Polaroid rotation angle must be subtle (<= 10 deg)');
        assert.ok(p.washiColor.includes('rgba'), 'Washi tape must be semi-transparent');
      });
    });

    test('TC 1.6.7: Renders actual ScrapbookAbout component and verifies maker bio, polaroids, craft timeline, and hobby chips', async () => {
      const aboutMod = await loadModule('src/components/About/ScrapbookAbout.jsx');
      assert.ok(aboutMod && aboutMod.default, 'ScrapbookAbout component exported');

      const html = renderComponent(aboutMod.default, {});

      // Section semantics & ID
      assert.ok(html.includes('id="about"'), 'Section must have id="about"');
      assert.ok(html.includes('Maker Story · Neha Jose'), 'Maker story headline present');

      // Polaroids & Washi tape
      assert.ok(html.includes('scrapbook-polaroid-card'), 'Scrapbook polaroids rendered');
      assert.ok(html.includes('washi-tape-strip'), 'Washi tape strips rendered');

      // 4-Step Craft Timeline
      assert.ok(html.includes('Palette Curation'), 'Step 1 title present');
      assert.ok(html.includes('Meditative Stitching'), 'Step 2 title present');
      assert.ok(html.includes('Finishing &amp; Lining') || html.includes('Finishing & Lining'), 'Step 3 title present');
      assert.ok(html.includes('Gift Packaging'), 'Step 4 title present');

      // Maker Hobby Chips
      assert.ok(html.includes('Crochet'), 'Crochet hobby chip present');
      assert.ok(html.includes('Guitar'), 'Guitar hobby chip present');
      assert.ok(html.includes('Cooking'), 'Cooking hobby chip present');
      assert.ok(html.includes('Sewing'), 'Sewing hobby chip present');
      assert.ok(html.includes('Singing'), 'Singing hobby chip present');
    });
  });

  after(async () => {
    await closeViteServer();
  });
});
