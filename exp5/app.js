const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const { csrfSync } = require('csrf-sync');

const app = express();
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'secure_node_app',
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(session({
  secret: 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false },
}));

app.use(csrfSync().csrfSynchronisedProtection);

const loginRequired = (req, res, next) =>
  req.session.user ? next() : res.redirect('/login');
const show = (res, page, data) => res.render('index', { page, ...data });

app.get('/login', (req, res) => {
  show(res, 'login', { csrfToken: req.csrfToken(), error: '' });
});

app.post('/login',
  body('username').trim().isLength({ min: 3, max: 50 }),
  body('password').isLength({ min: 8 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send('Invalid input');
    }

    db.execute(
      'SELECT id, username FROM users WHERE username = ? AND password = ?',
      [req.body.username, req.body.password],
      (error, users) => {
        if (error) return res.status(500).send('Database error');
        if (!users[0]) {
          return res.status(401).send('Invalid login');
        }
        req.session.user = users[0];
        res.redirect('/dashboard');
      }
    );
  }
);

app.get('/dashboard', loginRequired, (req, res) => {
  show(res, 'dashboard', {
    csrfToken: req.csrfToken(), username: req.session.user.username,
  });
});

app.post('/logout', loginRequired, (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.use((error, req, res, next) => {
  if (error.code === 'EBADCSRFTOKEN') return res.status(403).send('Invalid CSRF token');
  next(error);
});

db.connect((error) => {
  if (error) throw error;
  app.listen(3000, () => console.log('http://localhost:3000'));
});
