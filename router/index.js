import homeRoutes from './home.js';
import searchRoutes from './search.js';
import bookRoutes from './book.js';
import authorRoutes from './author.js';
import router from './auth.js';
import UserRouter from './users.js';
import adminRouter from './admin.js';
import reviewRoutes from './reviews.js';

const constructorMethod = (app) => {
app.use('/', homeRoutes);
app.use('/search', searchRoutes);
app.use('/book', bookRoutes);
app.use('/author', authorRoutes);
app.use('/auth', router);
app.use('/users', UserRouter);
app.use('/admin', adminRouter);
app.use('/reviews', reviewRoutes);

  app.use('*', (req, res) => {
    console.log('404 handler triggered for path:', req.originalUrl);
    try {
      res.status(404).render('404', {
        title: 'Page Not Found',
        message: `The page "${req.originalUrl}" you are looking for does not exist.`
      });
    } catch (err) {
      console.error('Error rendering 404 page:', err);
      res
        .status(404)
        .send(`<h1>404 - Page Not Found</h1><p>Path: ${req.originalUrl}</p>`);
    }
  });
};

export default constructorMethod;
