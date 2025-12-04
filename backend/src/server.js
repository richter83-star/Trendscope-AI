import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { v4 as uuid } from 'uuid';
import { loadConfig } from './config.js';

const { allowedOrigins, port: PORT, trendLimits: TREND_LIMITS, mockProductCount: MOCK_PRODUCT_COUNT } = loadConfig();

const app = express();
if (allowedOrigins?.length) {
  app.use(cors({ origin: allowedOrigins }));
} else {
  app.use(cors());
}
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

const products = [];
const watchlists = new Map();

const mockProduct = (idx) => ({
  id: `asin-${idx + 1}`,
  title: `Sample Product ${idx + 1}`,
  imageUrl: 'https://placehold.co/200x200',
  currentPrice: 19.99 + idx,
  salesRank: 1000 + idx * 5,
  rating: 4.3,
  reviewCount: 120 + idx,
  trendScore: 70 - idx,
  trendLabel: idx % 2 === 0 ? 'Rising' : 'Stable',
  marketplace: 'amazon.com'
});

for (let i = 0; i < MOCK_PRODUCT_COUNT; i += 1) {
  products.push(mockProduct(i));
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/signup', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  const token = uuid();
  return res.status(201).json({ user: { id: uuid(), email, tier: 'free' }, token });
});

app.post('/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  const token = uuid();
  return res.json({ user: { id: uuid(), email, tier: 'free' }, token });
});

app.get('/subscriptions/tiers', (_req, res) => {
  res.json([
    { id: 'free', name: 'Free', price: 0, limit: TREND_LIMITS.free },
    { id: 'starter', name: 'Starter', price: 29, limit: TREND_LIMITS.starter },
    { id: 'pro', name: 'Pro', price: 99, limit: TREND_LIMITS.pro }
  ]);
});

app.post('/watchlist/:userId', (req, res) => {
  const { userId } = req.params;
  const { productIds, tier = 'free' } = req.body;
  const limit = TREND_LIMITS[tier] ?? TREND_LIMITS.free;
  if (!Array.isArray(productIds)) return res.status(400).json({ error: 'productIds array required' });

  const existing = watchlists.get(userId) ?? new Set();
  for (const id of productIds) {
    if (existing.size >= limit) break;
    existing.add(id);
  }
  watchlists.set(userId, existing);
  return res.json({ userId, count: existing.size, limit, items: Array.from(existing) });
});

app.get('/watchlist/:userId', (req, res) => {
  const { userId } = req.params;
  const items = Array.from(watchlists.get(userId) ?? []);
  const data = items.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  res.json({ userId, items: data });
});

app.post('/products/search', (req, res) => {
  const { query, filters = {}, page = 1 } = req.body;
  const pageSize = 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  let results = products;

  if (query) {
    results = results.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.id === query);
  }
  if (filters.category) results = results.filter((p) => p.category === filters.category);
  if (filters.marketplace) results = results.filter((p) => p.marketplace === filters.marketplace);

  const paginated = results.slice(start, end);
  res.json({ total: results.length, page, pageSize, results: paginated });
});

app.get('/products/:id', (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'not found' });
  const history = Array.from({ length: 30 }, (_, i) => ({ day: i, price: product.currentPrice - i * 0.2 }));
  const rank = Array.from({ length: 30 }, (_, i) => ({ day: i, value: product.salesRank - i * 2 }));
  const reviewGrowth = Array.from({ length: 30 }, (_, i) => ({ day: i, value: product.reviewCount + i }));
  return res.json({ ...product, history, rank, reviewGrowth });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on ${PORT}`);
});
