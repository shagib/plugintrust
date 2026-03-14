import { Router } from 'express';
import { searchWordPressPlugins, getWordPressPlugin, getWordPressReviews } from '../services/wordpress';

const router = Router();

router.get('/search', async (req, res) => {
  const query = String(req.query.q || '');
  const page = Number(req.query.page || 1);
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  try {
    const result = await searchWordPressPlugins(query, page, category);
    res.json(result);
  } catch (err: any) {
    console.error('search error', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const plugin = await getWordPressPlugin(slug);
    if (!plugin) return res.status(404).json({ error: 'not found' });
    res.json(plugin);
  } catch (err: any) {
    console.error('plugin fetch error', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug/reviews', async (req, res) => {
  const slug = req.params.slug;
  try {
    const reviews = await getWordPressReviews(slug);
    res.json(reviews);
  } catch (err: any) {
    console.error('reviews fetch error', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
