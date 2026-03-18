const express = require('express');
const cors = require('cors');
const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/search', searchRouter);

app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  supabase_url: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.slice(0, 30) + '...' : 'MISSING',
  key_length: process.env.SUPABASE_SERVICE_KEY ? process.env.SUPABASE_SERVICE_KEY.length : 0,
  key_prefix: process.env.SUPABASE_SERVICE_KEY ? process.env.SUPABASE_SERVICE_KEY.slice(0, 20) : 'MISSING',
}));

app.listen(PORT, () => {
  console.log(`FurniFind backend running on http://localhost:${PORT}`);
});
