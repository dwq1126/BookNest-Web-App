import express from 'express';
import { ObjectId } from 'mongodb';
import authors from '../data/Author.js';

const authorRoutes = express.Router();

authorRoutes.get('/:id', async (req, res) => {
  try {
    const authorId = req.params.id?.trim();
    if (!authorId || !ObjectId.isValid(authorId)) {
      return res.status(400).send('Invalid author ID');
    }
 
    const author = await authors.getAuthorById(authorId).catch(() => null);
    if (!author) {
      return res.status(404).render('404', { message: 'Author not found' });
    }
 
    let authorBooks = [];
    try {
      authorBooks = await authors.getAuthorBooks(authorId);
    } catch {
      authorBooks = [];
    }
 
    const avgRatingForView =
      authorBooks.length > 0
        ? (
            authorBooks.reduce((sum, b) => sum + (Number(b.rating) || 0), 0) /
            authorBooks.length
          ).toFixed(1)
        : 0;

    const safeAuthor = { ...author, _id: author._id?.toString?.() ?? authorId };
    const safeBooks = authorBooks.map(b => ({
      ...b,
      _id: b._id?.toString?.() ?? '',
      authorId: b.authorId?.toString?.() ?? authorId,
      rating: Number(b.rating) || 0
    }));

    return res.render('author', {
      name: safeAuthor.name ?? 'Unknown',
      author: safeAuthor,
      books: safeBooks,
      avgRatingForView,
      user: req.session?.user ?? null
    });
  } catch (err) {
    console.error('Author details error:', err);
    return res.status(500).render('error', { message: 'Server error' });
  }
});

export default authorRoutes;
