import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const SOURCE = String.raw`C:\Users\kylec\Downloads\online portfolio 26 - Copy\online portfolio 26 - Copy`;
const DEST = join(process.cwd(), 'public', 'images');
const GALLERY_PATH = join(process.cwd(), 'src', 'data', 'gallery.json');
const COMMISSIONS_PATH = join(process.cwd(), 'src', 'data', 'commissions.json');
const TATTOOS_PATH = join(process.cwd(), 'src', 'data', 'tattoos.json');

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

function copyImage(sourcePath, prefix, originalName) {
  const ext = extname(originalName).toLowerCase();
  const slug = slugify(originalName);
  let filename = `${prefix}-${slug}${ext}`;
  let counter = 2;

  while (existsSync(join(DEST, filename))) {
    filename = `${prefix}-${slug}-${counter}${ext}`;
    counter += 1;
  }

  copyFileSync(sourcePath, join(DEST, filename));
  return filename;
}

function listImages(folder) {
  return readdirSync(folder).filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file));
}

function importFolder(folderName, prefix, tags) {
  const folderPath = join(SOURCE, folderName);
  const files = listImages(folderPath).sort((a, b) => a.localeCompare(b));
  const date = '2026-01-01';

  return files.map((file) => {
    const sourcePath = join(folderPath, file);
    const filename = copyImage(sourcePath, prefix, file);
    return {
      sourcePath,
      filename,
      title: titleCase(file),
      tags,
      date,
    };
  });
}

if (!existsSync(SOURCE)) {
  console.error(`Source folder not found: ${SOURCE}`);
  process.exit(1);
}

mkdirSync(DEST, { recursive: true });

for (const file of readdirSync(DEST)) {
  if (/\.(jpe?g|png|webp|gif|svg)$/i.test(file)) {
    rmSync(join(DEST, file));
  }
}

const digital = importFolder('digital', 'digital', ['digital']);
const painting = importFolder('painting- trad art', 'painting', ['painting']);
const commissions = importFolder('commissions', 'commission', ['commission', 'digital']);
const tattoos = importFolder('tattoo', 'tattoo', ['tattoo']);

const allItems = [...digital, ...painting, ...commissions, ...tattoos];

const gallery = {
  items: allItems.map((item) => ({
    id: slugify(item.filename),
    title: item.title,
    date: item.date,
    category: 'gallery',
    tags: item.tags,
    image: `/images/${item.filename}`,
    caption: '',
    published: true,
  })),
};

writeFileSync(GALLERY_PATH, `${JSON.stringify(gallery, null, 2)}\n`);

const findImage = (predicate) => {
  const match = allItems.find(predicate);
  if (!match) throw new Error('Missing image for pricing tier');
  return `/images/${match.filename}`;
};

const chopper = allItems.find((item) => item.filename.includes('chopper-joy'));
const nami = allItems.find((item) => item.filename.includes('booty-nami') || item.filename.includes('nami'));
const aiko = allItems.find((item) => item.filename.includes('commission-aiko'));
const roken = allItems.find((item) => item.filename.includes('commission-roken'));

const tattooSimple = allItems.find((item) => item.filename.includes('tattoo-dittos') || item.filename.includes('tattoo-choppa'));
const tattooMedium = allItems.find((item) => item.filename.includes('tattoo-gojo') || item.filename.includes('tattoo-denji'));
const tattooComplex = allItems.find((item) => item.filename.includes('tattoo-moonlight-sword') || item.filename.includes('tattoo-artorias'));

const commissionsPricing = {
  intro:
    'Pick a tier that fits your budget and how detailed you want the piece to be. Examples below show the kind of result you can expect at each level.',
  tiers: [
    {
      tier: 1,
      name: 'Tier 1',
      summary: 'Quick and simple',
      exampleTitle: chopper?.title ?? 'Chopper Joy',
      exampleImage: chopper ? `/images/${chopper.filename}` : findImage((item) => item.tags.includes('digital')),
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
      exampleImage: nami ? `/images/${nami.filename}` : findImage((item) => item.tags.includes('commission')),
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
      exampleImage: aiko ? `/images/${aiko.filename}` : findImage((item) => item.filename.includes('commission')),
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
      exampleTitle: tattooSimple?.title ?? 'Simple flash',
      exampleImage: tattooSimple ? `/images/${tattooSimple.filename}` : '',
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
      exampleTitle: tattooMedium?.title ?? 'Character design',
      exampleImage: tattooMedium ? `/images/${tattooMedium.filename}` : '',
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
      exampleTitle: tattooComplex?.title ?? 'Large custom piece',
      exampleImage: tattooComplex ? `/images/${tattooComplex.filename}` : '',
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

writeFileSync(COMMISSIONS_PATH, `${JSON.stringify(commissionsPricing, null, 2)}\n`);
writeFileSync(TATTOOS_PATH, `${JSON.stringify(tattoosPricing, null, 2)}\n`);

console.log(`Imported ${allItems.length} images`);
console.log(`  digital: ${digital.length}`);
console.log(`  painting: ${painting.length}`);
console.log(`  commission: ${commissions.length}`);
console.log(`  tattoo: ${tattoos.length}`);
