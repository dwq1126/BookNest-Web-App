import express from 'express';
const router = express.Router();

// 共用 Mock 資料 - 更新以匹配图片中的图书属性
const mockBooks = [
  { 
    _id: '68948ef97f20aa00d0a34a9a', 
    title: 'The Silent Echo', 
    author: 'Emma Clarke', 
    introduction: 'A haunting tale of mystery and redemption set in a small coastal town. When Sarah returns to her childhood home after twenty years, she discovers that the past has a way of echoing through the present. As she unravels the secrets of her family and the town\'s dark history, Sarah must confront her own demons and find the courage to face the truth.',
    publication_date: '2023-06-15',
    ISBN: '978-1234567890',
    genres: ['Mystery', 'Thriller'],
    rating: 0,
    reviews: [],
    coverUrl: '/img/atomic.jpg',
    category: 'Mystery',
    price: 27.99
  },
  { 
    _id: '2', 
    title: 'Deep Work', 
    author: 'Cal Newport', 
    introduction: 'Rules for Focused Success in a Distracted World. Deep work is the ability to focus without distraction on a cognitively demanding task.',
    publication_date: '2016-01-05',
    ISBN: '978-1455586691',
    genres: ['Productivity', 'Self-Help'],
    rating: 4.6,
    reviews: [
      { id: 1, user: 'John Doe', comment: 'Excellent book on productivity!', rating: 5, date: '2023-01-15' },
      { id: 2, user: 'Jane Smith', comment: 'Very practical advice.', rating: 4, date: '2023-02-20' }
    ],
    coverUrl: '/img/deepwork.jpg',
    category: 'Productivity',
    price: 24.99
  },
  { 
    _id: '3', 
    title: 'The Psychology of Money', 
    author: 'Morgan Housel', 
    introduction: 'Timeless lessons on wealth, greed, and happiness. Doing well with money is not necessarily about what you know. It is about how you behave.',
    publication_date: '2020-09-08',
    ISBN: '978-0857197689',
    genres: ['Finance', 'Psychology'],
    rating: 4.7,
    reviews: [
      { id: 3, user: 'Mike Johnson', comment: 'Changed my perspective on money.', rating: 5, date: '2023-03-10' }
    ],
    coverUrl: '/img/psychology-money.jpg',
    category: 'Finance',
    price: 22.99
  },
  { 
    _id: '4', 
    title: 'Clean Code', 
    author: 'Robert C. Martin', 
    introduction: 'A Handbook of Agile Software Craftsmanship. Even bad code can function. But if code is not clean, it can bring a development organization to its knees.',
    publication_date: '2008-08-11',
    ISBN: '978-0132350884',
    genres: ['Programming', 'Software Engineering'],
    rating: 4.5,
    reviews: [
      { id: 4, user: 'Alex Chen', comment: 'Must-read for every developer.', rating: 5, date: '2023-04-05' },
      { id: 5, user: 'Sarah Wilson', comment: 'Great insights on code quality.', rating: 4, date: '2023-05-12' }
    ],
    coverUrl: '/img/clean-code.jpg',
    category: 'Programming',
    price: 45.99
  },
  { 
    _id: '5', 
    title: 'Thinking, Fast and Slow', 
    author: 'Daniel Kahneman', 
    introduction: 'In this groundbreaking book, Kahneman takes us on a tour of the mind and explains the two systems that drive the way we think.',
    publication_date: '2011-10-25',
    ISBN: '978-0374533557',
    genres: ['Psychology', 'Cognitive Science'],
    rating: 4.4,
    reviews: [
      { id: 6, user: 'David Brown', comment: 'Fascinating insights into human thinking.', rating: 4, date: '2023-06-18' }
    ],
    coverUrl: '/img/thinking.jpg',
    category: 'Psychology',
    price: 19.99
  },
  { 
    _id: '6', 
    title: 'The Lean Startup', 
    author: 'Eric Ries', 
    introduction: 'How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses.',
    publication_date: '2011-09-13',
    ISBN: '978-0307887894',
    genres: ['Business', 'Entrepreneurship'],
    rating: 4.3,
    reviews: [
      { id: 7, user: 'Lisa Garcia', comment: 'Essential reading for startups.', rating: 5, date: '2023-07-22' }
    ],
    coverUrl: '/img/lean-startup.jpg',
    category: 'Business',
    price: 26.99
  }
];

// 作者信息 Mock 数据
const mockAuthors = [
  {
    id: 'emma-clarke',
    name: 'Emma Clarke',
    bio: 'Emma Clarke is an award-winning author known for her atmospheric mystery novels. Born in a small coastal town, she draws inspiration from the rugged landscapes and complex human relationships that define her stories. Her debut novel "The Silent Echo" has been praised for its haunting prose and intricate plotting.',
    books: ['68948ef97f20aa00d0a34a9a'],
    photo: '/img/atomic.jpg'
  },
  {
    id: 'cal-newport',
    name: 'Cal Newport',
    bio: 'Cal Newport is a computer science professor at Georgetown University and a New York Times bestselling author. He writes about the intersection of digital technology and culture, with a focus on our struggles to deploy these tools in ways that support rather than subvert the things we care about.',
    books: ['2'],
    photo: '/img/deepwork.jpg'
  },
  {
    id: 'morgan-housel',
    name: 'Morgan Housel',
    bio: 'Morgan Housel is a partner at The Collaborative Fund and a former columnist at The Motley Fool and The Wall Street Journal. He is a two-time winner of the Best in Business Award from the Society of American Business Editors and Writers.',
    books: ['3'],
    photo: '/img/psychology-money.jpg'
  },
  {
    id: 'robert-martin',
    name: 'Robert C. Martin',
    bio: 'Robert C. Martin, also known as "Uncle Bob", is an American software engineer and instructor. He is a co-author of the Agile Manifesto and has written several books on software development and design.',
    books: ['4'],
    photo: '/img/clean-code.jpg'
  },
  {
    id: 'daniel-kahneman',
    name: 'Daniel Kahneman',
    bio: 'Daniel Kahneman is an Israeli-American psychologist and economist notable for his work on the psychology of judgment and decision-making, as well as behavioral economics, for which he was awarded the 2002 Nobel Memorial Prize in Economic Sciences.',
    books: ['5'],
    photo: '/img/thinking.jpg'
  },
  {
    id: 'eric-ries',
    name: 'Eric Ries',
    bio: 'Eric Ries is an American entrepreneur, blogger, and author of The Lean Startup, a book on the lean startup movement. He is also the creator of the Long-term Stock Exchange.',
    books: ['6'],
    photo: '/img/lean-startup.jpg'
  }
];

// 搜尋書籍（支援關鍵字搜尋）
router.get('/search', (req, res) => {
  const keyword = req.query.q || '';
  let filteredBooks = mockBooks;
  
  if (keyword) {
    const searchTerm = keyword.toLowerCase();
    filteredBooks = mockBooks.filter(book => 
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.category.toLowerCase().includes(searchTerm)
    );
  }
  
  res.render('bookList', { 
    books: filteredBooks,
    keyword,
    resultCount: filteredBooks.length
  });
});

// 顯示書籍詳細資訊
router.get('/details', (req, res) => {
  const bookId = req.query.id;
  const book = mockBooks.find(b => b._id === bookId);
  
  if (!book) {
    return res.status(404).render('404', { 
      message: 'Book not found' 
    });
  }
  
  // 找出相关书籍（同类别或同作者的其他书）
  const relatedBooks = mockBooks
    .filter(b => (b.category === book.category || b.author === book.author) && b._id !== book._id)
    .slice(0, 3);
  
  res.render('bookDetails', { 
    book,
    relatedBooks
  });
});

// 新增：作者页面路由
router.get('/author/:authorId', (req, res) => {
  const authorId = req.params.authorId;
  const author = mockAuthors.find(a => a.id === authorId);
  
  if (!author) {
    return res.status(404).render('404', { 
      message: 'Author not found' 
    });
  }
  
  // 获取该作者的所有作品
  const authorBooks = mockBooks.filter(book => author.books.includes(book._id));
  
  // 计算平均评分
  let avgRating = 0;
  if (authorBooks.length > 0) {
    const totalRating = authorBooks.reduce((sum, book) => sum + (book.rating || 0), 0);
    avgRating = Math.round((totalRating / authorBooks.length) * 10) / 10;
  }
  
  // 创建包含平均评分的作者对象
  const authorWithStats = {
    ...author,
    avgRating: avgRating
  };
  
  res.render('author', { 
    author: authorWithStats,
    books: authorBooks
  });
});

// API 路由：取得所有書籍（JSON格式）
router.get('/api/all', (req, res) => {
  res.json(mockBooks);
});

// API 路由：取得排行榜
router.get('/api/ranking', (req, res) => {
  const rankings = mockBooks
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
    .map(book => ({
      title: book.title,
      author: book.author,
      avgRating: book.rating
    }));
  
  res.json(rankings);
});

export default router;