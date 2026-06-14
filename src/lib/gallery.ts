import galleryData from '../data/gallery.json';
import siteData from '../data/site.json';

export type GalleryCategory = 'gallery' | 'tattoo' | 'commission';

export const FILTER_TAGS = ['tattoo', 'commission', 'painting', 'digital'] as const;

export type GalleryItem = {
  id: string;
  title: string;
  date: string;
  category: GalleryCategory;
  tags: string[];
  image: string;
  caption: string;
  published: boolean;
};

export type SiteConfig = typeof siteData;

export function getSiteConfig(): SiteConfig {
  return siteData;
}

export function getPublishedItems(): GalleryItem[] {
  return galleryData.items
    .filter((item) => item.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getItemsByCategory(category: GalleryCategory): GalleryItem[] {
  return getPublishedItems().filter((item) => item.category === category);
}

export function getCommissionItems(): GalleryItem[] {
  return getPublishedItems().filter(
    (item) => item.category === 'commission' || item.tags.includes('commission'),
  );
}

export function getItemById(id: string): GalleryItem | undefined {
  return getPublishedItems().find((item) => item.id === id);
}

export function getAllTags(category?: GalleryCategory): string[] {
  const items = category ? getItemsByCategory(category) : getPublishedItems();
  const tags = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort();
}
