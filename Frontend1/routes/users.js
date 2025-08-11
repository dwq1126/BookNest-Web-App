import express from 'express';
const router = express.Router();

// Mock user data
const mockUser = {
    id: 'user123',
    username: 'BookLover2024',
    email: 'booklover@example.com',
    avatar: '/img/deepwork.jpg',
    joinDate: '2024-01-15',
    bio: 'Passionate reader and book collector. Always looking for the next great story!'
};

// Mock user reviews data
const mockUserReviews = [
    {
        id: 'review1',
        bookId: '1',
        bookTitle: 'Deep Work',
        bookCover: '/img/deepwork.jpg',
        rating: 5,
        comment: 'Excellent book on productivity and focus. Highly recommended for anyone looking to improve their work habits.',
        date: '2024-01-20',
        isEdited: false
    },
    {
        id: 'review2',
        bookId: '2',
        bookTitle: 'The Psychology of Money',
        bookCover: '/img/psychology-money.jpg',
        rating: 4,
        comment: 'Great insights into how people think about money. The author presents complex concepts in an easy-to-understand way.',
        date: '2024-01-18',
        isEdited: true
    },
    {
        id: 'review3',
        bookId: '3',
        bookTitle: 'Clean Code',
        bookCover: '/img/clean-code.jpg',
        rating: 5,
        comment: 'A must-read for any developer. Changed how I think about writing code.',
        date: '2024-01-15',
        isEdited: false
    }
];

// Mock user favorites data
const mockUserFavorites = [
    {
        id: '1',
        title: 'Deep Work',
        author: 'Cal Newport',
        coverUrl: '/img/deepwork.jpg',
        rating: 4.8,
        price: 29.99,
        category: 'Self-Help',
        addedDate: '2024-01-10'
    },
    {
        id: '2',
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        coverUrl: '/img/psychology-money.jpg',
        rating: 4.6,
        price: 24.99,
        category: 'Finance',
        addedDate: '2024-01-08'
    },
    {
        id: '3',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        coverUrl: '/img/clean-code.jpg',
        rating: 4.9,
        price: 39.99,
        category: 'Technology',
        addedDate: '2024-01-05'
    },
    {
        id: '4',
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        coverUrl: '/img/thinking.jpg',
        rating: 4.7,
        price: 34.99,
        category: 'Psychology',
        addedDate: '2024-01-03'
    }
];

// User profile page
router.get('/profile', (req, res) => {
    res.render('userProfile', {
        user: mockUser,
        reviews: mockUserReviews,
        favorites: mockUserFavorites
    });
});

// Get user reviews (for AJAX)
router.get('/reviews', (req, res) => {
    res.json(mockUserReviews);
});

// Get user favorites (for AJAX)
router.get('/favorites', (req, res) => {
    res.json(mockUserFavorites);
});

// Delete review
router.delete('/reviews/:reviewId', (req, res) => {
    const reviewId = req.params.reviewId;
    // In a real app, you would delete from database
    // For now, just return success
    res.json({ success: true, message: 'Review deleted successfully' });
});

// Update review
router.put('/reviews/:reviewId', (req, res) => {
    const reviewId = req.params.reviewId;
    const { rating, comment } = req.body;
    // In a real app, you would update in database
    // For now, just return success
    res.json({ success: true, message: 'Review updated successfully' });
});

// Remove from favorites
router.delete('/favorites/:bookId', (req, res) => {
    const bookId = req.params.bookId;
    // In a real app, you would remove from database
    // For now, just return success
    res.json({ success: true, message: 'Book removed from favorites' });
});

// Update user profile
router.put('/profile', (req, res) => {
    const { username, bio, avatar } = req.body;
    // In a real app, you would update in database
    // For now, just return success
    res.json({ success: true, message: 'Profile updated successfully' });
});

export default router;
