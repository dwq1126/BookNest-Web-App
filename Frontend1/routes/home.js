import { Router } from 'express';
const router = Router();

// 統一的 Mock 資料庫 - 修正所有字串轉義問題
const mockBooks = [
  { 
    _id: '1', 
    title: 'Atomic Habits', 
    author: 'James Clear', 
    rating: 4.8, 
    coverUrl: '/img/atomic.jpg',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. This breakthrough book from James Clear is the most comprehensive guide on how to change your habits and get 1% better every day.',
    category: 'Self-Help',
    price: 27.99
  },
  { 
    _id: '2', 
    title: 'Deep Work', 
    author: 'Cal Newport', 
    rating: 4.6, 
    coverUrl: '/img/deepwork.jpg',
    description: 'Rules for Focused Success in a Distracted World. Deep work is the ability to focus without distraction on a cognitively demanding task.',
    category: 'Productivity',
    price: 24.99
  },
  { 
    _id: '3', 
    title: 'The Psychology of Money', 
    author: 'Morgan Housel', 
    rating: 4.7, 
    coverUrl: '/img/psychology-money.jpg',
    description: 'Timeless lessons on wealth, greed, and happiness. Doing well with money is not necessarily about what you know. It is about how you behave.',
    category: 'Finance',
    price: 22.99
  },
  { 
    _id: '4', 
    title: 'Clean Code', 
    author: 'Robert C. Martin', 
    rating: 4.5, 
    coverUrl: '/img/clean-code.jpg',
    description: 'A Handbook of Agile Software Craftsmanship. Even bad code can function. But if code is not clean, it can bring a development organization to its knees.',
    category: 'Programming',
    price: 45.99
  },
  { 
    _id: '5', 
    title: 'Thinking, Fast and Slow', 
    author: 'Daniel Kahneman', 
    rating: 4.4, 
    coverUrl: '/img/thinking.jpg',
    description: 'In this groundbreaking book, Kahneman takes us on a tour of the mind and explains the two systems that drive the way we think.',
    category: 'Psychology',
    price: 19.99
  },
  { 
    _id: '6', 
    title: 'The Lean Startup', 
    author: 'Eric Ries', 
    rating: 4.3, 
    coverUrl: '/img/lean-startup.jpg',
    description: 'How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses.',
    category: 'Business',
    price: 26.99
  }
];

// 首頁路由
router.get('/', (req, res) => {
  // 取得新書（最後3本）和熱門書籍（評分最高的3本）
  const newBooks = mockBooks.slice(-3).reverse();
  const popularBooks = [...mockBooks].sort((a, b) => b.rating - a.rating).slice(0, 3);
  
  res.render('homepage', { 
    newBooks,
    popularBooks,
    allBooks: mockBooks
  });
});

export default router;