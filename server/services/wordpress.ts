import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const BASE = 'https://api.wordpress.org/plugins/info/1.2/';

export interface WPPlugin {
  id: number;
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

export async function searchWordPressPlugins(query = '', page = 1, category?: string): Promise<WPSearchResult> {
  const url = new URL(BASE);
  url.searchParams.set('action', 'query_plugins');
  if (query) {
    url.searchParams.set('request[search]', query);
  }
  if (category) {
    url.searchParams.set('request[browse]', category);
  }
  url.searchParams.set('request[page]', String(page));
  url.searchParams.set('request[per_page]', '30');
  url.searchParams.set('request[fields][description]', 'true');
  url.searchParams.set('request[fields][short_description]', 'true');
  url.searchParams.set('request[fields][versions]', 'true');
  url.searchParams.set('request[fields][banners]', 'true');
  url.searchParams.set('request[fields][icons]', 'true');
  url.searchParams.set('request[fields][tags]', 'true');
  url.searchParams.set('request[fields][rating]', 'true');
  url.searchParams.set('request[fields][num_ratings]', 'true');
  url.searchParams.set('request[fields][downloaded]', 'true');
  url.searchParams.set('request[fields][last_updated]', 'true');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`WordPress API error: ${res.status}`);
  return res.json();
}

export async function getWordPressReviews(slug: string, page = 1): Promise<any[]> {
  try {
    const url = `https://wordpress.org/support/plugin/${slug}/reviews/feed/`;
    const response = await fetch(url);
    if (!response.ok) return [];

    const xml = await response.text();
    console.log('Fetched XML length:', xml.length);
    const $ = cheerio.load(xml, { xmlMode: true });
    
    const reviews: any[] = [];
    console.log('Items found:', $('item').length);
    
    $('item').each((i, element) => {
      const $el = $(element);
      const title = $el.find('title').text().trim();
      const description = $el.find('description').text().trim();
      const creator = $el.find('dc\\:creator').text().trim() || $el.find('creator').text().trim();
      const pubDate = $el.find('pubDate').text().trim();
      
      console.log('Item:', i, 'title:', title, 'creator:', creator);
      
      // Extract rating from title, e.g., "It's ok (5 stars)"
      const ratingMatch = title.match(/\((\d+) stars?\)/i);
      const rating = ratingMatch ? parseInt(ratingMatch[1]) : 5;
      
      // Extract content from description, remove "Replies: X" and "Rating: X stars"
      let content = description.replace(/<p>Replies: \d+<\/p>/i, '').replace(/<p>Rating: \d+ stars?<\/p>/i, '').trim();
      // Remove HTML tags
      content = content.replace(/<[^>]*>/g, '').trim();
      
      if (content && creator) {
        reviews.push({
          id: `review-${i}`,
          author: creator,
          content,
          rating,
          date: pubDate,
          verified: true
        });
      }
    });
    
    console.log('Reviews extracted:', reviews.length);
    return reviews.slice(0, 10); // Limit to 10 reviews
  } catch (error) {
    console.error('Error scraping reviews:', error);
    return [];
  }
}

export async function getWordPressPlugin(slug: string): Promise<WPPlugin | null> {
  const url = new URL(BASE);
  url.searchParams.set('action', 'plugin_information');
  url.searchParams.set('request[slug]', slug);
  url.searchParams.set('request[fields][description]', 'true');
  url.searchParams.set('request[fields][short_description]', 'true');
  url.searchParams.set('request[fields][versions]', 'true');
  url.searchParams.set('request[fields][banners]', 'true');
  url.searchParams.set('request[fields][icons]', 'true');
  url.searchParams.set('request[fields][tags]', 'true');
  url.searchParams.set('request[fields][rating]', 'true');
  url.searchParams.set('request[fields][ratings]', 'true');
  url.searchParams.set('request[fields][num_ratings]', 'true');
  url.searchParams.set('request[fields][downloaded]', 'true');
  url.searchParams.set('request[fields][last_updated]', 'true');
  url.searchParams.set('request[fields][requires]', 'true');
  url.searchParams.set('request[fields][tested]', 'true');
  url.searchParams.set('request[fields][requires_php]', 'true');
  url.searchParams.set('request[fields][support_url]', 'true');
  url.searchParams.set('request[fields][screenshots]', 'true');

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  return data.error ? null : data;
}
