/**
 * Test Utilities and Contract Simulators for Nia Knits
 * Authoritative implementations derived directly from PROJECT.md,
 * ORIGINAL_REQUEST.md, spec_showcase_basket.md, and spec_about_configurator.md.
 */

export const STORAGE_KEY = 'nia-knits-stitched-basket';
export const VIEW_MODE_KEY = 'nia-knits-view-mode';
export const INSTAGRAM_HANDLE = 'nia_knits_27';
export const CONTACT_EMAIL = 'Joseneha55@gmail.com';

/**
 * Derives dynamic category counts matching Showcase requirements
 */
export function computeCategoryCounts(works) {
  const counts = { All: works.length };
  for (const item of works) {
    if (item.category) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Contractual Basket Store Simulator
 * Implements the exact interface contract specified in PROJECT.md § Basket Context
 */
export class BasketStore {
  constructor(catalog = [], initialIds = []) {
    this.catalogMap = new Map(catalog.map(it => [it.id, it]));
    this.savedIds = new Set(initialIds);
    this.customItems = new Map();
    this.isDrawerOpen = false;
  }

  get savedPieceIds() {
    return Array.from(this.savedIds);
  }

  get basketItems() {
    return this.savedPieceIds.map(id => {
      if (this.customItems.has(id)) return this.customItems.get(id);
      if (this.catalogMap.has(id)) return this.catalogMap.get(id);
      return {
        id,
        title: 'Handcrafted Piece',
        category: 'Handmade',
        materials: '',
        images: [],
      };
    });
  }

  get savedWorks() {
    return this.basketItems;
  }

  get totalPieces() {
    return this.savedIds.size;
  }

  get totalCraftingHours() {
    const sum = this.basketItems.reduce((acc, item) => {
      return acc + (Number(item.estimatedCraftingHours) || 0);
    }, 0);
    return Math.round(sum * 10) / 10;
  }

  isInBasket(itemOrId) {
    if (!itemOrId) return false;
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id;
    return this.savedIds.has(id);
  }

  addToBasket(itemOrId) {
    if (!itemOrId) return;
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id;
    if (!id) return;
    if (typeof itemOrId === 'object' && itemOrId !== null) {
      this.customItems.set(id, itemOrId);
    }
    this.savedIds.add(id);
  }

  removeFromBasket(itemOrId) {
    if (!itemOrId) return;
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id;
    if (!id) return;
    this.savedIds.delete(id);
    this.customItems.delete(id);
  }

  toggleBasket(itemOrId) {
    if (!itemOrId) return;
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id;
    if (!id) return;
    if (this.savedIds.has(id)) {
      this.removeFromBasket(id);
    } else {
      this.addToBasket(itemOrId);
    }
  }

  clearBasket() {
    this.savedIds.clear();
    this.customItems.clear();
  }

  setIsDrawerOpen(open) {
    this.isDrawerOpen = Boolean(open);
  }
}

/**
 * Authoritative Craft Journey Timeline definition (R3)
 */
export const CRAFT_TIMELINE_STEPS = [
  {
    step: 1,
    title: 'Palette Curation',
    tagline: 'Color harmony & yarn sourcing',
    icon: 'palette',
    specs: 'Premium Cotton & Acrylics · Hand-swatched · Colorfast',
    quote: 'The right palette sets the mood before the first chain stitch is ever made.',
  },
  {
    step: 2,
    title: 'Meditative Stitching',
    tagline: 'Row by row, loop by loop',
    icon: 'crochet-hook',
    specs: '2.5mm – 5.0mm Hooks · 6–18 Crafting Hours · Zero Machinery',
    quote: 'Crochet cannot be automated. When you wear a Nia Knits piece, you wear hours of human dedication.',
  },
  {
    step: 3,
    title: 'Finishing & Lining',
    tagline: 'Weaving ends & reinforced seams',
    icon: 'shears',
    specs: '5-Pass Tail Locking · Wet/Steam Blocking · Hand-Sewn Linings',
    quote: 'The inside and back of your work should be just as neat and proud as the front.',
  },
  {
    step: 4,
    title: 'Gift Packaging',
    tagline: 'Packed for keeping & giving',
    icon: 'tied-parcel',
    specs: 'Recycled Craft Tissue · Handwritten Care Guide · Keepsake Bloom Included',
    quote: 'Packed with as much care as the stitches themselves, ready to gift immediately.',
  },
];

/**
 * Authoritative Maker Hobby Chips definition (R3)
 */
export const MAKER_HOBBY_CHIPS = [
  {
    id: 'crochet',
    name: 'Crochet',
    emoji: '🧶',
    accentColor: '--berry',
    hex: '#B94D68',
    anecdote: 'My anchor craft! What started with a single ball of yarn became Nia Knits.',
    fact: '50+ heirloom pieces crafted',
  },
  {
    id: 'guitar',
    name: 'Guitar',
    emoji: '🎸',
    accentColor: '--ochre',
    hex: '#D49A72',
    anecdote: 'Strumming acoustic melodies in the evening. Still learning — avoiding barre chords at all costs!',
    fact: 'Zero barre chords mastered so far',
  },
  {
    id: 'cooking',
    name: 'Cooking',
    emoji: '🍳',
    accentColor: '--moss',
    hex: '#74816C',
    anecdote: 'Mindful cooking and comforting bakes. Kneading dough and crocheting granny squares share the exact same rhythm.',
    fact: 'Sunday bakes + yarn = pure bliss',
  },
  {
    id: 'sewing',
    name: 'Sewing',
    emoji: '🧵',
    accentColor: '--plum',
    hex: '#806174',
    anecdote: 'Stitching neat linen linings, sewing hidden zipper closures, and edging tote bags.',
    fact: 'Precision hems meet soft yarn',
  },
  {
    id: 'singing',
    name: 'Singing',
    emoji: '🎤',
    accentColor: '--berry-deep',
    hex: '#963B54',
    anecdote: 'Humming melodies while counting stitches. Music keeps my hands moving when working on 18-hour wearable projects.',
    fact: 'Studio playlist always humming',
  },
];

/**
 * Authoritative Custom Commission Options definition (R4)
 */
export const COMMISSION_ITEM_TYPES = [
  { id: 'wearable', title: 'Cardigan / Wearable', leadTime: '2–3 weeks' },
  { id: 'headwear', title: 'Beanie / Headwear', leadTime: '5–7 days' },
  { id: 'bouquet', title: 'Everlasting Bouquet', leadTime: '1–2 weeks' },
  { id: 'amigurumi', title: 'Amigurumi / Plush', leadTime: '1–2 weeks' },
  { id: 'decor', title: 'Blanket / Home Decor', leadTime: '3–4 weeks' },
];

export const COMMISSION_PALETTES = [
  { id: 'berry', title: 'Berry Blossom', swatches: ['#B94D68', '#E8A598', '#FFF8F5'] },
  { id: 'forest', title: 'Forest & Sage', swatches: ['#74816C', '#A3B19B', '#E7E1D3'] },
  { id: 'sunset', title: 'Sunset Ochre', swatches: ['#D49A72', '#C46D4E', '#F6D8A8'] },
  { id: 'plum', title: 'Midnight Plum', swatches: ['#806174', '#302629', '#D9D2E9'] },
  { id: 'custom', title: 'Custom Palette', swatches: [] },
];

/**
 * Validates target date with minimum buffer (10 days)
 */
export function validateCommissionTargetDate(dateStr, minDaysBuffer = 10) {
  if (!dateStr || dateStr === 'no-rush' || dateStr === '3-weeks') {
    return { valid: true, error: null };
  }
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  const now = new Date();
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < minDaysBuffer) {
    return {
      valid: false,
      error: `Target date must be at least ${minDaysBuffer} days in advance (artisan slow-craft buffer).`,
    };
  }
  return { valid: true, error: null };
}
