import express from 'express';
import books from '../data/Book.js';
import authors from '../data/Author.js';
import { dbConnection } from '../config/mongoConnection.js';
import { ObjectId } from 'mongodb';
const adminRouter = express.Router();

export const requireAdmin = (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied: Admins only' });
  }
  next();
};

adminRouter.get('/books', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).send('Access denied');
  }

  try {
    const db = await dbConnection();
    const booksCollection = db.collection('books');
    const allBooks = await booksCollection.find({}).toArray();

    const formattedBooks = allBooks.map(book => ({
      ...book,
      _id: book._id.toString(),
      genres: Array.isArray(book.genres) ? book.genres.join(', ') : book.genres
    }));

    res.render('admin-books', { books: formattedBooks });
  } catch (error) {
    console.error('Admin books error:', error);
    res.status(500).send('Server error');
  }
});


adminRouter.put('/books/:id', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const bookId = req.params.id;
     if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID format' });
    }
    const { title, author, introduction, publication_date, ISBN, genres } = req.body;
    
    const genresArray = genres ? genres.split(',').map(g => g.trim()) : [];
    
    const result = await books.updateBook(
      bookId,
      title,
      author,
      introduction,
      publication_date,
      ISBN,
      genresArray
    );

    if (result) {
      return res.json({ success: true });
    }
  } catch (error) {
    console.error('Update book error:', error);
    return res.status(400).json({ error: error.message });
  }
});

adminRouter.get('/books/:id', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const bookId = req.params.id;
    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID format' });
    }
    const book = await books.getBookById(bookId);
    return res.json(book);
  } catch (error) {
    console.error('Fetch book details error:', error);
    return res.status(400).json({ error: error.message });
  }
});


adminRouter.delete('/books/:id', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const bookId = req.params.id;
    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID format' });
    }
    const result = await books.removebook(bookId);
    
    if (result.success) {
      return res.json({ success: true });
    }
  } catch (error) {
    console.error('Delete book error:', error);
    return res.status(400).json({ error: error.message });
  }
});

adminRouter.post('/books', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const { title, author, introduction, publication_date, ISBN, genres } = req.body;
    
    const genresArray = genres ? genres.split(',').map(g => g.trim()) : [];
    
    const result = await books.addBook(
      title,
      author,
      introduction,
      publication_date,
      ISBN,
      genresArray
    );

    if (result) {
      return res.json({ success: true });
    }
  } catch (error) {
    console.error('Add book error:', error);
    return res.status(400).json({ error: error.message });
  }
});

adminRouter.get('/authors', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).send('Access denied');
  }

  try {
    const db = await dbConnection();
    const authorsCollection = db.collection('authors');
    const allAuthors = await authorsCollection.find({}).toArray();

    const formattedAuthors = allAuthors.map(author => ({
      ...author,
      _id: author._id.toString(),
      works: Array.isArray(author.works) ? author.works.join(', ') : author.works,
      awards: Array.isArray(author.awards) ? author.awards.join(', ') : author.awards
    }));

    res.render('admin-authors', { authors: formattedAuthors });
  } catch (error) {
    console.error('Admin authors error:', error);
    res.status(500).send('Server error');
  }
});

adminRouter.get('/authors/:id', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const authorId = req.params.id;
    if (!ObjectId.isValid(authorId)) {
      return res.status(400).json({ error: 'Invalid author ID format' });
    }
    
    const author = await authors.getAuthorById(authorId);
    return res.json(author);
  } catch (error) {
    console.error('Fetch author details error:', error);
    return res.status(400).json({ error: error.message });
  }
});

adminRouter.post('/authors/:id', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const { name, birth_date, death_date, nationality, biography, works, awards } = req.body;
    
    const worksArray = works ? works.split(',').map(w => w.trim()) : [];
    const awardsArray = awards ? awards.split(',').map(a => a.trim()) : [];
    
    const result = await authors.addAuthor(
      name,
      birth_date,
      death_date || null,
      nationality,
      biography,
      worksArray,
      awardsArray
    );

    if (result) {
      return res.json({ success: true });
    }
  } catch (error) {
    console.error('Add author error:', error);
    return res.status(400).json({ error: error.message });
  }
});

adminRouter.put('/authors/:id', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const authorId = req.params.id;
    if (!ObjectId.isValid(authorId)) {
      return res.status(400).json({ error: 'Invalid author ID format' });
    }
    
    const { name, birth_date, death_date, nationality, biography, works, awards } = req.body;
    
    const worksArray = works ? works.split(',').map(w => w.trim()) : [];
    const awardsArray = awards ? awards.split(',').map(a => a.trim()) : [];
    
    const result = await authors.updateAuthor(
      authorId,
      name,
      birth_date,
      death_date || null,
      nationality,
      biography,
      worksArray,
      awardsArray
    );

    if (result) {
      return res.json({ success: true });
    }
  } catch (error) {
    console.error('Update author error:', error);
    return res.status(400).json({ error: error.message });
  }
});

adminRouter.delete('/authors/:id', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const authorId = req.params.id;
    if (!ObjectId.isValid(authorId)) {
      return res.status(400).json({ error: 'Invalid author ID format' });
    }
    
    const result = await authors.removeAuthor(authorId);
    
    if (result) {
      return res.json({ success: true });
    }
  } catch (error) {
    console.error('Delete author error:', error);
    return res.status(400).json({ error: error.message });
  }
});

export default adminRouter;