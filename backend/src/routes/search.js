const express = require('express');
const { supabase } = require('../db/schema');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {
      q, categories, conditions, styles, colors, materials, sources,
      min_price, max_price,
      min_width, max_width, min_height, max_height, min_depth, max_depth,
      city,
      page = 1, limit = 24,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase.from('products').select('*', { count: 'exact' });

    // Full-text search
    if (q && q.trim()) {
      query = query.textSearch('title', q.trim(), { type: 'websearch', config: 'english' });
    }

    // Category
    if (categories) {
      query = query.in('category', categories.split(','));
    }

    // Condition
    if (conditions) {
      query = query.in('condition', conditions.split(','));
    }

    // Style (array contains any)
    if (styles) {
      query = query.overlaps('styles', styles.split(','));
    }

    // Color
    if (colors) {
      query = query.overlaps('colors', colors.split(','));
    }

    // Material
    if (materials) {
      query = query.overlaps('materials', materials.split(','));
    }

    // Source
    if (sources) {
      query = query.in('source', sources.split(','));
    }

    // Price
    if (min_price) query = query.gte('price', parseFloat(min_price));
    if (max_price) query = query.lte('price', parseFloat(max_price));

    // Dimensions
    if (min_width) query = query.gte('width_cm', parseFloat(min_width));
    if (max_width) query = query.lte('width_cm', parseFloat(max_width));
    if (min_height) query = query.gte('height_cm', parseFloat(min_height));
    if (max_height) query = query.lte('height_cm', parseFloat(max_height));
    if (min_depth) query = query.gte('depth_cm', parseFloat(min_depth));
    if (max_depth) query = query.lte('depth_cm', parseFloat(max_depth));

    // City (include Online results always)
    if (city && city.trim()) {
      query = query.or(`shop_city.ilike.%${city.trim()}%,shop_city.eq.Online`);
    }

    // Pagination + order
    query = query.order('created_at', { ascending: false }).range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    res.json({
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil((count || 0) / limitNum),
      products: data || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/filters', (req, res) => {
  res.json({
    categories: ['sofa','chair','table','bed','storage','desk','other'],
    conditions: ['new','used','vintage'],
    styles: ['scandinavian','modern','industrial','vintage','mid-century modern','classic','minimalist','rustic','glam','bauhaus','danish design','retro'],
    colors: ['white','black','grey','brown','beige','oak','teak','blue','green','pink','red','yellow','gold','silver'],
    materials: ['fabric','leather','velvet','wood','solid wood','teak','metal','steel','chrome','marble','glass','rattan'],
    sources: ['ikea','wayfair','willhaben','ebay','local','2dehands','vinted'],
  });
});

module.exports = router;
