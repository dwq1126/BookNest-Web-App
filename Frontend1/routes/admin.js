import express from 'express';
const router = express.Router();



// Mock books data for management
let mockBooksForManagement = [
    {
        _id: '1',
        title: 'Deep Work',
        author: 'Cal Newport',
        introduction: 'Rules for Focused Success in a Distracted World. Deep work is the ability to focus without distraction on a cognitively demanding task.',
        publication_date: '2016-01-05',
        ISBN: '978-1455586691',
        genres: ['Productivity', 'Self-Help'],
        rating: 4.6,
        coverUrl: '/img/deepwork.jpg',
        category: 'Productivity',
        price: 24.99,
        status: 'active'
    },
    {
        _id: '2',
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        introduction: 'Timeless lessons on wealth, greed, and happiness. Doing well with money is not necessarily about what you know. It is about how you behave.',
        publication_date: '2020-09-08',
        ISBN: '978-0857197689',
        genres: ['Finance', 'Psychology'],
        rating: 4.7,
        coverUrl: '/img/psychology-money.jpg',
        category: 'Finance',
        price: 22.99,
        status: 'active'
    }
];

// Book management page
router.get('/books', (req, res) => {
    res.render('adminBooks', {
        books: mockBooksForManagement
    });
});

// Add book page
router.get('/books/add', (req, res) => {
    res.render('adminAddBook', {
        book: null,
        isEdit: false
    });
});

// Edit book page
router.get('/books/edit/:id', (req, res) => {
    const bookId = req.params.id;
    const book = mockBooksForManagement.find(b => b._id === bookId);
    
    if (!book) {
        return res.status(404).render('404', { message: 'Book not found' });
    }
    
    res.render('adminAddBook', {
        book: book,
        isEdit: true
    });
});

// Add new book (POST)
router.post('/books/add', (req, res) => {
    const { title, author, introduction, publication_date, ISBN, genres, coverUrl, category, price } = req.body;
    
    // Validate required fields
    if (!title || !author || !introduction || !coverUrl || !category || !price) {
        return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }
    
    // Create new book
    const newBook = {
        _id: Date.now().toString(),
        title,
        author,
        introduction,
        publication_date: publication_date || new Date().toISOString().split('T')[0],
        ISBN: ISBN || '',
        genres: genres ? genres.split(',').map(g => g.trim()) : [],
        rating: 0,
        coverUrl,
        category,
        price: parseFloat(price),
        status: 'active',
        reviews: []
    };
    
    mockBooksForManagement.push(newBook);
    
    res.json({ success: true, message: 'Book added successfully', book: newBook });
});

// Update book (PUT)
router.put('/books/edit/:id', (req, res) => {
    const bookId = req.params.id;
    const bookIndex = mockBooksForManagement.findIndex(b => b._id === bookId);
    
    if (bookIndex === -1) {
        return res.status(404).json({ success: false, message: 'Book not found' });
    }
    
    const { title, author, introduction, publication_date, ISBN, genres, coverUrl, category, price } = req.body;
    
    // Validate required fields
    if (!title || !author || !introduction || !coverUrl || !category || !price) {
        return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }
    
    // Update book
    mockBooksForManagement[bookIndex] = {
        ...mockBooksForManagement[bookIndex],
        title,
        author,
        introduction,
        publication_date: publication_date || mockBooksForManagement[bookIndex].publication_date,
        ISBN: ISBN || '',
        genres: genres ? genres.split(',').map(g => g.trim()) : [],
        coverUrl,
        category,
        price: parseFloat(price)
    };
    
    res.json({ success: true, message: 'Book updated successfully', book: mockBooksForManagement[bookIndex] });
});

// Delete book
router.delete('/books/:id', (req, res) => {
    const bookId = req.params.id;
    const bookIndex = mockBooksForManagement.findIndex(b => b._id === bookId);
    
    if (bookIndex === -1) {
        return res.status(404).json({ success: false, message: 'Book not found' });
    }
    
    // Soft delete - change status to inactive
    mockBooksForManagement[bookIndex].status = 'inactive';
    
    res.json({ success: true, message: 'Book deleted successfully' });
});

// Get all books for management (JSON)
router.get('/api/books', (req, res) => {
    res.json(mockBooksForManagement);
});

export default router;
