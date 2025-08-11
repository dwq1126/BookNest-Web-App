import express from 'express';
import Book from '../models/Book.js';
import mongoose from 'mongoose';

const router = express.Router();
 
router.get('/', async (req, res, next) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ ok: false, message: 'ID 格式无效' });
    }
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ ok: false, message: '未找到图书' });
    }
    res.json(book);
  } catch (err) {
    next(err);
  }
});

 
router.post('/', async (req, res, next) => {
  try {
    const { title, author, description, category, publishedDate, isbn, coverImage } = req.body;

    if (!title || !author) {
      return res.status(400).json({ ok: false, message: '标题和作者必填' });
    }

    const newBook = new Book({
      title,
      author,
      description,
      category,
      publishedDate,
      isbn,
      coverImage
    });

    await newBook.save();
    res.status(201).json({ ok: true, data: newBook });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ ok: false, message: 'ID 格式无效' });
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBook) {
      return res.status(404).json({ ok: false, message: '未找到图书' });
    }

    res.json({ ok: true, data: updatedBook });
  } catch (err) {
    next(err);
  }
});

 
router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ ok: false, message: 'ID 格式无效' });
    }

    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ ok: false, message: '未找到图书' });
    }

    res.json({ ok: true, message: '图书已删除' });
  } catch (err) {
    next(err);
  }
});

export default router;
