import express from 'express';
const router = express.Router();

// Mock users database
let mockUsers = [
    {
        id: '1',
        username: 'demo',
        email: 'demo@booknest.com',
        password: 'demo123', // In real app, this should be hashed
        firstName: 'Demo',
        lastName: 'User',
        city: 'New York',
        state: 'NY',
        age: '25',
        profilePicture: '/img/deepwork.jpg',
        avatar: '/img/deepwork.jpg',
        bio: 'Demo user for testing',
        createdAt: '2024-01-01',
        reviewIds: [],
        commentIds: []
    }
];

// Mock sessions (in real app, use proper session management)
let mockSessions = {};

// Registration page
router.get('/register', (req, res) => {
    res.render('auth', { 
        mode: 'register',
        error: null,
        success: null
    });
});

// Login page
router.get('/login', (req, res) => {
    res.render('auth', { 
        mode: 'login',
        error: null,
        success: null
    });
});

// Handle registration
router.post('/register', (req, res) => {
    const { 
        username, 
        email, 
        password, 
        confirmPassword,
        firstName,
        lastName,
        city,
        state,
        age,
        profilePicture
    } = req.body;
    
    // Validation
    if (!username || !email || !password || !confirmPassword || !firstName || !lastName) {
        return res.status(400).json({ 
            success: false, 
            message: 'Required fields: Username, Email, Password, First Name, Last Name' 
        });
    }
    
    if (password !== confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Passwords do not match' 
        });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password must be at least 6 characters long' 
        });
    }
    
    // Check if username or email already exists
    const existingUser = mockUsers.find(user => 
        user.username === username || user.email === email
    );
    
    if (existingUser) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username or email already exists' 
        });
    }
    
    // Create new user with all fields
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // In real app, hash this password
        firstName,
        lastName,
        city: city || '',
        state: state || '',
        age: age || '',
        profilePicture: profilePicture || '/img/deepwork.jpg', // Default avatar if not provided
        avatar: profilePicture || '/img/deepwork.jpg', // For backward compatibility
        bio: '',
        createdAt: new Date().toISOString().split('T')[0],
        reviewIds: [],
        commentIds: []
    };
    
    mockUsers.push(newUser);
    
    res.json({ 
        success: true, 
        message: 'Registration successful! Please log in.',
        user: { 
            id: newUser.id, 
            username: newUser.username, 
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName
        }
    });
});

// Handle login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username and password are required' 
        });
    }
    
    // Find user
    const user = mockUsers.find(u => 
        u.username === username || u.email === username
    );
    
    if (!user || user.password !== password) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid username or password' 
        });
    }
    
    // Create session (in real app, use proper session management)
    const sessionId = Date.now().toString();
    mockSessions[sessionId] = {
        userId: user.id,
        username: user.username,
        email: user.email,
        createdAt: new Date()
    };
    
    // Set session cookie
    res.cookie('sessionId', sessionId, { 
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ 
        success: true, 
        message: 'Login successful!',
        user: { id: user.id, username: user.username, email: user.email }
    });
});

// Handle logout
router.post('/logout', (req, res) => {
    const sessionId = req.cookies.sessionId;
    
    if (sessionId && mockSessions[sessionId]) {
        delete mockSessions[sessionId];
    }
    
    res.clearCookie('sessionId');
    res.json({ success: true, message: 'Logged out successfully' });
});

// Check authentication status
router.get('/status', (req, res) => {
    const sessionId = req.cookies.sessionId;
    
    if (sessionId && mockSessions[sessionId]) {
        const session = mockSessions[sessionId];
        const user = mockUsers.find(u => u.id === session.userId);
        
        if (user) {
            return res.json({ 
                authenticated: true, 
                user: { 
                    id: user.id, 
                    username: user.username, 
                    email: user.email,
                    avatar: user.avatar 
                } 
            });
        }
    }
    
    res.json({ authenticated: false, user: null });
});

export default router;
