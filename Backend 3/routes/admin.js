import express from 'express';
import Book from '../models/Book.js';
import AdminLog from '../models/AdminLog.js';

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: '123456'
};

const router = express.Router();
 
function requireAdmin(req, res, next) {
  const token = req.headers.authorization;
  if (token === 'Bearer fake-admin-token') {
    return next();
  }
  res.status(403).json({ ok: false, message: '无权限，请先登录管理员账号' });
}
 
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return res.json({ ok: true, message: '登录成功', token: 'fake-admin-token' });
  }
  res.status(401).json({ ok: false, message: '账号或密码错误' });
});
 
router.post('/books', requireAdmin, async (req, res, next) => {
  try {
    const { title, author, description, category, publishedDate, isbn, coverImage } = req.body;

    if (!title || !author) {
      return res.status(400).json({ ok: false, message: '书名和作者必填' });
    }

    const newBook = await Book.create({
      title,
      author,
      description,
      category,
      publishedDate,
      isbn,
      coverImage
    });

    await AdminLog.create({
      adminName: ADMIN_CREDENTIALS.username,
      action: '添加图书',
      targetId: newBook._id
    });

    res.json({ ok: true, message: '添加成功', data: newBook });
  } catch (err) {
    next(err);
  }
});
 
router.put('/books/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedBook) {
      return res.status(404).json({ ok: false, message: '未找到图书' });
    }

    await AdminLog.create({
      adminName: ADMIN_CREDENTIALS.username,
      action: '编辑图书',
      targetId: updatedBook._id
    });

    res.json({ ok: true, message: '更新成功', data: updatedBook });
  } catch (err) {
    next(err);
  }
});

export default router;
