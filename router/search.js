import express from 'express';
import books from '../data/Book.js';
const searchRoutes = express.Router();

searchRoutes.get('/', async (req,res) => {
   const q = (req.query.q || '').trim();
  let results = [];
  if (q) {
    results = await books.findBook(q);
    results = results.map(book => ({...book, searchKeyword: q}));
  }
  res.render('search', { q, results, resultCount: results.length });
});
export default searchRoutes;