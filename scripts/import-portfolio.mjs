import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { extname, join } from 'node:path';

const SOURCE = String.raw`C:\Users\kylec\Downloads\online portfolio 26 - Copy\online portfolio 26 - Copy`;
const DEST = join(process.cwd(), 'public', 'images');
const GALLERY_PATH = join(process.cwd(), 'src', 'data', 'gallery.json');
const COMMISSIONS_PATH = join(process.cwd(), 'src', 'data', 'commissions.json');
const TATTOOS_PATH = join(process.cwd(), 'src', 'data', 'tattoos.json');

const SKIP_IMPORT_FILES = new Set(['nami.png']);

const LEGACY_IMAGES = [
  {
    source: String.raw`C:\Users\kylec\art-portfolio\public\images\fox.jpg`,
    filename: 'painting-fox.jpg',
    title: 'Fox',
    tags: ['painting'],
  },
  {
    source: String.raw`C:\Users\kylec\art-portfolio\public\images\laboon.png`,
    filename: 'digital-laboon.png',
    title: 'Laboon',
    tags: ['digital'],
  },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleCase(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function fileDate(sourcePath) {
  return statSync(sourcePath).mtime.toISOString().slice(0, 10);
}

function copyImageIfNeeded(sourcePath, filename) {
  const destPath = join(DEST, filename);
  if (existsSync(destPath)) {
    return { filename, copied: false, date: fileDate(destPath) };
  }

  copyFileSync(sourcePath, destPath);
  return { filename, copied: true, date: fileDate(sourcePath) };
}

function listImages(folder) {
  return readdirSync(folder).filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file));
}

function loadExistingGallery() {
  if (!existsSync(GALLERY_PATH)) return [];
  try {
    return JSON.parse(readFileSync(GALLERY_PATH, 'utf8')).items ?? [];
  } catch {
    return [];
  }
}

function importFolder(folderName, prefix, tags) {
  const folderPath = join(SOURCE, folderName);
  if (!existsSync(folderPath)) return [];

  const files = listImages(folderPath).sort((a, b) => a.localeCompare(b));

  return files
    .filter((file) => !SKIP_IMPORT_FILES.has(file.toLowerCase()))
    .map((file) => {
      const ext = extname(file).toLowerCase();
      const slug = slugify(file);
      const filename = `${prefix}-${slug}${ext}`;
      const sourcePath = join(folderPath, file);
      const result = copyImageIfNeeded(sourcePath, filename);

      return {
        id: slugify(filename),
        title: titleCase(file),
        date: result.date,
        category: 'gallery',
        tags,
        image: `/images/${result.filename}`,
        caption: '',
        published: true,
      };
    });
}

function importLegacyImages() {
  return LEGACY_IMAGES.map((item) => {
    if (!existsSync(item.source)) {
      console.warn(`Legacy image not found: ${item.source}`);
      return null;
    }

    const result = copyImageIfNeeded(item.source, item.filename);
    return {
      id: slugify(item.filename),
      title: item.title,
      date: result.date,
      category: 'gallery',
      tags: item.tags,
      image: `/images/${result.filename}`,
      caption: '',
      published: true,
    };
  }).filter(Boolean);
}

function mergeGallery(existingItems, importedItems) {
  const byId = new Map();

  for (const item of existingItems) {
    const imagePath = join(process.cwd(), 'public', item.image.replace(/^\//, ''));
    if (existsSync(imagePath)) {
      byId.set(item.id, item);
    }
  }

  for (const item of importedItems) {
    byId.set(item.id, item);
  }

  return [...byId.values()].sort((a, b) => b.date.localeCompare(a.date));
}

function buildPricing(allItems) {
  const byFilename = (part) => allItems.find((item) => item.image.includes(part));

  const chopper = byFilename('digital-chopper-joy');
  const nami = byFilename('digital-booty-nami');
  const aiko = byFilename('commission-aiko');
  const tattooSimple = byFilename('tattoo-choppa') ?? byFilename('tattoo-dittos');
  const tattooMedium = byFilename('tattoo-denji') ?? byFilename('tattoo-gojo');
  const tattooComplex = byFilename('tattoo-artorias-1') ?? byFilename('tattoo-moonlight-sword');

  const commissionsPricing = {
    intro:
      'Pick a tier that fits your budget and how detailed you want the piece to be. Examples below show the kind of result you can expect at each level.',
    tiers: [
      {
        tier: 1,
        name: 'Tier 1',
        summary: 'Quick and simple',
        exampleTitle: chopper?.title ?? 'Chopper Joy',
        exampleImage: chopper?.image ?? '/images/digital-chopper-joy.png',
        price: 'From £15',
        detail: 'Low',
        complexity: 'Simple shapes, minimal shading',
        background: 'Plain or none',
        revisions: '1 small revision',
        turnaround: '1–2 weeks',
        bestFor: 'Fun sketches, memes, and simple character ideas',
      },
      {
        tier: 2,
        name: 'Tier 2',
        summary: 'Balanced quality',
        exampleTitle: nami?.title ?? 'Nami',
        exampleImage: nami?.image ?? '/images/digital-booty-nami.jpg',
        price: 'From £45',
        detail: 'Medium',
        complexity: 'Cleaner lines and moderate shading',
        background: 'Simple background included',
        revisions: '2 revisions',
        turnaround: '2–3 weeks',
        bestFor: 'Character portraits and polished fan art',
      },
      {
        tier: 3,
        name: 'Tier 3',
        summary: 'Full illustration',
        exampleTitle: aiko?.title ?? 'Aiko',
        exampleImage: aiko?.image ?? '/images/commission-aiko.jpg',
        price: 'From £90',
        detail: 'High',
        complexity: 'Detailed rendering, lighting, and effects',
        background: 'Full scene or detailed backdrop',
        revisions: '3 revisions',
        turnaround: '3–5 weeks',
        bestFor: 'Showpiece commissions and complex character art',
      },
    ],
    footer:
      'Prices are a starting point — final quotes depend on character complexity, number of characters, and usage.\nMessage Kirsty to discuss your idea.',
  };

  const tattoosPricing = {
    intro:
      'Tattoo design tiers for different sizes and detail levels. Examples below show the kind of linework and composition you can expect at each tier.',
    tiers: [
      {
        tier: 1,
        name: 'Tier 1',
        summary: 'Small & simple',
        exampleTitle: tattooSimple?.title ?? 'Choppa',
        exampleImage: tattooSimple?.image ?? '',
        price: 'From £25',
        detail: 'Low',
        complexity: 'Basic linework, minimal detail',
        background: 'No background elements',
        revisions: '1 revision',
        turnaround: '1–2 weeks',
        bestFor: 'Small flash-style designs',
      },
      {
        tier: 2,
        name: 'Tier 2',
        summary: 'Medium detail',
        exampleTitle: tattooMedium?.title ?? 'Denji',
        exampleImage: tattooMedium?.image ?? '',
        price: 'From £55',
        detail: 'Medium',
        complexity: 'More shading and texture',
        background: 'Optional accents',
        revisions: '2 revisions',
        turnaround: '2–3 weeks',
        bestFor: 'Forearm / calf sized pieces',
      },
      {
        tier: 3,
        name: 'Tier 3',
        summary: 'Large & detailed',
        exampleTitle: tattooComplex?.title ?? 'Artorias',
        exampleImage: tattooComplex?.image ?? '',
        price: 'From £100',
        detail: 'High',
        complexity: 'Full detail and custom elements',
        background: 'Integrated composition',
        revisions: '3 revisions',
        turnaround: '3–5 weeks',
        bestFor: 'Larger custom tattoo designs',
      },
    ],
    footer:
      'Tattoo pricing depends on size, placement, and detail.\nMessage Kirsty to discuss your design idea.',
  };

  return { commissionsPricing, tattoosPricing };
}

mkdirSync(DEST, { recursive: true });

const existingItems = loadExistingGallery();

const importedItems = [
  ...importFolder('digital', 'digital', ['digital']),
  ...importFolder('painting- trad art', 'painting', ['painting']),
  ...importFolder('commissions', 'commission', ['commission', 'digital']),
  ...importFolder('tattoo', 'tattoo', ['tattoo']),
  ...importLegacyImages(),
];

const mergedItems = mergeGallery(existingItems, importedItems);

writeFileSync(GALLERY_PATH, `${JSON.stringify({ items: mergedItems }, null, 2)}\n`);

const { commissionsPricing, tattoosPricing } = buildPricing(mergedItems);
writeFileSync(COMMISSIONS_PATH, `${JSON.stringify(commissionsPricing, null, 2)}\n`);
writeFileSync(TATTOOS_PATH, `${JSON.stringify(tattoosPricing, null, 2)}\n`);

console.log(`Gallery total: ${mergedItems.length} items (merged, not wiped)`);
console.log(`  imported/updated this run: ${importedItems.length}`);
