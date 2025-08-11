import express from 'express';
import path from 'path';
import { create as createHbs } from 'express-handlebars';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';

import adminRoutes from './routes/admin.js';
import reviewRoutes from './routes/reviews.js';
import rankingRoutes from './routes/rankings.js';
import statusRoutes from './routes/status.js';
import homeRoutes from '../Frontend1/routes/home.js'; 
import bookRoutes from './routes/books.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.use(express.static(path.join(__dirname, '../Frontend1/public')));

const hbs = createHbs({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, '../Frontend1/views/layouts'), 
  partialsDir: path.join(__dirname, '../Frontend1/views/partials'),
  extname: '.handlebars',
  helpers: { eq: (a, b) => a === b }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../Frontend1/views'));
 
app.use('/admin', adminRoutes);
app.use('/api', reviewRoutes);
app.use('/rankings', rankingRoutes);
app.use('/status', statusRoutes);
app.use('/', homeRoutes);
app.use('/books', bookRoutes);
 
app.use((req, res) => {
  res.status(404).send('<h1>404 Not Found</h1>');
});
 
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  if (res.headersSent) return next(err);
  res.status(500).send('<h1>500 Internal Server Error</h1>');
});

const PORT = 3000;
try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
} catch (e) {
  console.error('Startup error:', e);
  process.exit(1);
}

export default app;
