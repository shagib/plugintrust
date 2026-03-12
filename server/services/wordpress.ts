import fetch from 'node-fetch';

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
  num_ratings: number;
  installed: boolean;
  homepage: string;
  tags: Record<string, string>;
  versions: Record<string, string>;
  donation_link: string;
  banners: { high: string; low: string };
  icons: { '1x': string; '2x': string };
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
  url.searchParams.set('request[fields][num_ratings]', 'true');
  url.searchParams.set('request[fields][downloaded]', 'true');
  url.searchParams.set('request[fields][last_updated]', 'true');

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  return data.error ? null : data;
}
