import express from 'express';
import { userhelper } from '../data/UserHelper.js';
import  UserFunctions  from '../data/UserLog.js';

const router = express.Router();

router.get('/login', (req, res) =>
  res.render('login', {
    layout: 'blank',
    title: 'Sign In',
    isLogin: true
  })
);

router.get('/register', (req, res) =>
  res.render('register', {
    layout: 'blank',
    title: 'Sign Up',
    isLogin: false
  })
);

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, userId, password, email, city, state, age } = req.body;
    const role = req.body.isAdmin ? 'admin' : 'user';

    const cleanFirst = await userhelper.VerifyFirstName(firstName);
    const cleanLast = await userhelper.VerifyLastName(lastName);
    const cleanUid = await userhelper.VerifyUseIdForRegister(userId);
    const cleanPwd = await userhelper.VerifyPassport(password);
    const cleanEmail = await userhelper.VerifyEmail(email);
    
    if (role === 'admin') {
      await UserFunctions.signUpUser(
        cleanFirst, cleanLast, cleanUid, cleanPwd, cleanEmail,
        '/static/profile/default.jpg', city, state, age, role
      );
    } else {
      await UserFunctions.signUpUser(
        cleanFirst, cleanLast, cleanUid, cleanPwd, cleanEmail,
        '/static/profile/default.jpg', city, state, age, role
      );
    }

    res.redirect('/auth/login');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).render('register', {
      layout: 'blank',
      title: 'Sign Up',
      isLogin: false,
      error: err.message || 'Registration failed'
    });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    const user = await UserFunctions.signInUser(userId, password);
    
    req.session.user = {
      id: user._id,
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.role === 'admin'
    };
    
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).render('login', {
      layout: 'blank',
      title: 'Sign In',
      isLogin: true,
      error: err.message || 'Login failed'
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    res.redirect('/');
  });
});

export default router;