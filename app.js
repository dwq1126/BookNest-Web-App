import express from 'express';
import exphbs from 'express-handlebars';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import helmet from 'helmet';

import constructorMethod from './router/index.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    json: (context) => JSON.stringify(context),
    join: (arr, sep) => (Array.isArray(arr) ? arr.join(sep) : arr),
    array: (value) => {
      if (Array.isArray(value)) return value;
      return value ? [value] : [];
    },
    isLogin: (value, options) => {
      return value ? options : '';
    },
    formatDate: function(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    times: function(n, block) {
      let accum = '';
      for(let i = 0; i < n; i++) {
        accum += block.fn(i);
      }
      return accum;
    },
    subtract: function(a, b) {
      return a - b;
    },
    eq: function(a, b) {
      return a === b;
    },
    encodeURIComponent: (value) => encodeURIComponent(value)
  }
});
const app = express();
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      connectSrc: ["'self'"],
      scriptSrcAttr: ["'unsafe-inline'"] 
    }
  },
  xssFilter: true,
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
}));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


constructorMethod(app); 
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server is now running on http://localhost:${PORT}`));