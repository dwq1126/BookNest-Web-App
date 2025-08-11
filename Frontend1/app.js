import express from 'express';
import { create } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import homeRouter from './routes/home.js';
import bookRouter from './routes/books.js';
import userRouter from './routes/users.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars 設定 - 重要！
const hbs = create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    extname: '.handlebars',
    helpers: {
        // 相等比较
        eq: function(a, b) {
            return a === b;
        },
        // 大于比较
        gt: function(a, b) {
            return a > b;
        },
        // 重复输出
        times: function(n, block) {
            let accum = '';
            for (let i = 0; i < n; i++) {
                accum += block.fn(i);
            }
            return accum;
        },
        // 减法
        subtract: function(a, b) {
            return a - b;
        },
        // 求和
        sum: function(array, property) {
            if (!Array.isArray(array)) return 0;
            return array.reduce((sum, item) => {
                return sum + (item[property] || 0);
            }, 0);
        },
        // 除法
        divide: function(a, b) {
            return b !== 0 ? Math.round((a / b) * 10) / 10 : 0;
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', homeRouter);
app.use('/books', bookRouter);
app.use('/users', userRouter);

// 404
app.use((req, res) => {
    res.status(404).send('<h1>404 Not Found</h1>');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

export default app;
