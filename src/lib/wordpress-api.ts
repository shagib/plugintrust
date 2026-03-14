// WordPress Plugin API Service
// API Documentation: https://codex.wordpress.org/WordPress.org_API#Plugins

export interface WPPlugin {
  slug: string;
  name: string;
  short_description: string;
  description: string;
  version: string;
  author: string;
  author_profile: string;
  downloaded: number;
  last_updated: string;
  rating: number;
  ratings?: Record<string, number>;
  num_ratings: number;
  installed: boolean;
  homepage: string;
  tags: Record<string, string>;
  versions: Record<string, string>;
  donation_link: string;
  banners: { high: string; low: string };
  icons: { '1x': string; '2x': string };
  screenshots?: Record<string, string>;
  requires?: string;
  tested?: string;
  requires_php?: string;
  support_url?: string;
}
export interface WPSearchResult {
  info: {
    page: number;
    pages: number;
    results: number;
    query: string;
  };
  plugins: WPPlugin[];
}

// Convert WP plugin to our internal format
export function transformWPPlugin(wp: WPPlugin) {
  return {
    id: `wp-${wp.slug}`,
    slug: wp.slug,
    name: wp.name.replace(/<[^>]*>/g, ''), // Strip HTML
    description: wp.short_description?.replace(/<[^>]*>/g, '') || wp.description?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
    fullDescription: wp.description?.replace(/<[^>]*>/g, '') || '',
    developer: wp.author.replace(/<[^>]*>/g, ''),
    website: wp.homepage,
    lastUpdated: wp.last_updated,
    rating: wp.rating / 20 || 0, // WP ratings are out of 100
    ratingBreakdown: wp.ratings
      ? Object.entries(wp.ratings).map(([stars, count]) => ({ stars: Number(stars), count }))
      : [],
    reviewCount: wp.num_ratings || 0,
    activeInstalls: wp.downloaded || 0,
    version: wp.version,
    price: 'Free',
    icon: wp.icons?.['2x'] || wp.icons?.['1x'] || '',
    banner: wp.banners?.high || wp.banners?.low || '',
    tags: Object.values(wp.tags || {}),
    features: [...new Set(Object.values(wp.tags || {}))], // Unique tags as features
    verifiedReviews: Math.floor((wp.num_ratings || 0) * 0.6), // Estimate 60% verified
    category: guessCategory(wp.tags, wp.short_description || ''),
    requires: wp.requires,
    tested: wp.tested,
    requiresPHP: wp.requires_php,
    supportUrl: wp.support_url,
    screenshots: wp.screenshots ? Object.values(wp.screenshots) : [],
  };
}

function guessCategory(tags: Record<string, string> = {}, description: string = ''): string {
  const tagStr = Object.values(tags).join(' ').toLowerCase();
  const desc = description.toLowerCase();
  
  if (tagStr.includes('seo') || desc.includes('seo') || desc.includes('search engine')) return 'seo';
  if (tagStr.includes('security') || desc.includes('security') || desc.includes('firewall')) return 'security';
  if (tagStr.includes('page builder') || desc.includes('page builder') || desc.includes('drag and drop')) return 'page-builders';
  if (tagStr.includes('performance') || desc.includes('cache') || desc.includes('speed') || desc.includes('optimization')) return 'performance';
  if (tagStr.includes('ecommerce') || desc.includes('woocommerce') || desc.includes('shop') || desc.includes('store')) return 'ecommerce';
  if (tagStr.includes('analytics') || desc.includes('analytics') || desc.includes('google')) return 'analytics';
  if (tagStr.includes('contact form') || desc.includes('form')) return 'forms';
  if (tagStr.includes('social') || desc.includes('facebook') || desc.includes('twitter') || desc.includes('sharing')) return 'social';
  if (tagStr.includes('backup') || desc.includes('backup')) return 'backup';
  if (tagStr.includes('email') || desc.includes('newsletter') || desc.includes('mail')) return 'email';
  
  return 'other';
}

// Search WordPress plugins via the backend proxy
export async function searchWordPressPlugins(query: string, page = 1): Promise<WPSearchResult> {
  const params = new URLSearchParams();
  params.set('q', query);
  params.set('page', String(page));
  const response = await fetch(`/api/plugins/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

// Get single plugin details via backend proxy
export async function getWordPressPlugin(slug: string): Promise<WPPlugin | null> {
  const response = await fetch(`/api/plugins/${encodeURIComponent(slug)}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

// Get popular plugins by category via backend proxy
export async function getPopularPlugins(category?: string, page = 1): Promise<WPSearchResult> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  params.set('page', String(page));
  const response = await fetch(`/api/plugins/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

// Fetch reviews for a plugin from WordPress.org
export async function getWordPressReviews(slug: string, page = 1): Promise<any[]> {
  const response = await fetch(`/api/plugins/${encodeURIComponent(slug)}/reviews`);
  if (!response.ok) {
    return [];
  }
  return response.json();
}
